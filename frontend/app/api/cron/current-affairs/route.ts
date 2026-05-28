import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface GeminiBilingualQuestion {
  topic: string;
  question_en: string;
  question_ta: string;
  options_en: string[];
  options_ta: string[];
  correct_option_en: string;
  correct_option_ta: string;
  explanation_en: string;
  explanation_ta: string;
}

const tnpscKeywords = [
  "Makkalai Thedi Maruthuvam", "Kalaignar Medical Insurance",
  "Chief Minister's Breakfast Scheme", "Illam Thedi Kalvi",
  "Pudhumai Penn", "Kalaignar Magalir Urimai Thogai",
  "Naan Mudhalvan", "Moovalur Ramamirtham Ammaiyar Scheme",
  "Dr. Muthulakshmi Reddy Maternity Benefit Scheme",
  "Kalaignar Kanavu Illam", "TNUHDB", "CMDA",
  "SIPCOT", "TIDCO", "TIDEL Park", "ELCOT",
  "Tamil Nadu Industrial Development Corporation",
  "Global Investors Meet", "TN Startup Mission",
  "TNeGA", "e-Sevai", "TACTV", "TANGEDCO", "TWAD Board",
  "Tamil Nadu e-Governance Agency",
  "Uzhavar Sandhai", "Nivar", "Tamil Nadu Farmer Protection Scheme",
  "Cauvery Delta Protected Zone",
  "Ennum Ezhuthum", "Adi Dravidar Welfare Schemes",
  "Tamil Nadu Dr. Ambedkar Law University",
  "Keezhadi", "Adichanallur", "Sivagalai excavation",
  "Tamil Virtual Academy", "Classical Tamil",
];

async function getPIBArticlePRIDs(): Promise<number[]> {
  try {
    console.log("[PIB] Fetching all releases page...");
    const res = await fetch("https://www.pib.gov.in/Allrel.aspx?reg=3&lang=1", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      }
    });
    console.log(`[PIB] Status: ${res.status} OK: ${res.ok}`);
    const html = await res.text();
    console.log(`[PIB] HTML length: ${html.length}`);
    const matches = html.matchAll(/PRID=(\d+)/g);
    const prids = Array.from(new Set(Array.from(matches).map(m => parseInt(m[1]))));
    console.log(`[PIB] PRIDs found: ${prids.length} — ${prids.slice(0, 5).join(", ")}...`);
    return prids.slice(0, 10);
  } catch (err) {
    console.error("[PIB] Failed to fetch releases page:", err);
    return [];
  }
}

async function fetchPIBArticle(prid: number): Promise<string> {
  try {
    console.log(`[PIB] Fetching article PRID=${prid}...`);
    const res = await fetch(`https://www.pib.gov.in/PressReleasePage.aspx?PRID=${prid}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      }
    });
    console.log(`[PIB] Article PRID=${prid} status: ${res.status}`);
    const html = await res.text();
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    console.log(`[PIB] Article PRID=${prid} text length: ${text.length}`);
    return text.substring(0, 1500);
  } catch (err) {
    console.error(`[PIB] Failed to fetch article PRID=${prid}:`, err);
    return "";
  }
}

async function getFreshNewsContext(): Promise<string> {
  const prids = await getPIBArticlePRIDs();
  console.log(`[PIB] Total PRIDs to fetch: ${prids.length}`);
  if (prids.length === 0) {
    console.warn("[PIB] No PRIDs found. Using fallback.");
    return "";
  }
  const articles: string[] = [];
  for (const prid of prids) {
    const text = await fetchPIBArticle(prid);
    if (text) articles.push(`[PIB Article PRID:${prid}]\n${text}\n---`);
  }
  console.log(`[PIB] Successfully fetched ${articles.length} articles`);
  return articles.join("\n");
}

async function generateQuestions(
  systemInstruction: string,
  userPrompt: string,
  batchLabel: string
): Promise<GeminiBilingualQuestion[]> {
  try {
    console.log(`[Gemini] Processing ${batchLabel}...`);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.15,
      }
    });
    if (!response.text) throw new Error("Empty response from Gemini.");
    console.log(`[Gemini] ${batchLabel} response length: ${response.text.length}`);
    const parsed: GeminiBilingualQuestion[] = JSON.parse(response.text);
    console.log(`[Gemini] ${batchLabel} parsed ${parsed.length} questions`);
    return parsed;
  } catch (err) {
    console.error(`[Gemini] Error in ${batchLabel}:`, err);
    return [];
  }
}

async function runDailyTNPSCCron(overrideDate?: string) {
  console.log("Initializing TNPSC current affairs pipeline...");
  const todayStr = overrideDate ?? new Date().toISOString().split("T")[0];
  const currentMonthYear = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  console.log(`[Pipeline] Target date: ${todayStr}`);

  // Fetch recent topics for dedup
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
  const { data: recentRecords, error: recentError } = await supabase
    .from("current_affairs")
    .select("topic")
    .gte("published_date", fiveDaysAgo.toISOString().split("T")[0]);
  if (recentError) console.error("[DB] Error fetching recent topics:", recentError);
  console.log(`[DB] Recent records fetched: ${recentRecords?.length ?? 0}`);

  const excludedTopics = recentRecords
    ? Array.from(new Set(recentRecords.map(r => r.topic).filter(Boolean)))
    : [];
  console.log(`[DB] Excluded topics: ${excludedTopics.join(", ")}`);

  // Fetch PIB articles
  console.log("[Pipeline] Fetching PIB articles...");
  const liveNewsContext = await getFreshNewsContext();
  const articleChunks = liveNewsContext.split("---").filter(Boolean);
  console.log(`[Pipeline] ${articleChunks.length} PIB articles ready`);

  const systemInstruction = `
    You are an expert paper setter for the TNPSC (Tamil Nadu Public Service Commission) Group 1 and Group 4 exams.
    Generate high-quality current affairs MCQs matching these official syllabus units:
    1. "Latest Diary of Events"
    2. "Eminent Persons & Places in News"
    3. "Polity & Welfare Schemes" (TN schemes like — but not limited to: ${tnpscKeywords.join(", ")})
    4. "Science & Technology"
    5. "Socio-Economic Issues"

    CRITICAL RULES:
    - Target Date: For PIB-grounded questions, focus on events from ${currentMonthYear}. For Gemini-generated questions, cover recent noteworthy events from the last 3 months — do not force month mentions in question text.
    - Ratio: At least 3 out of every 5 questions must target Tamil Nadu specifically.
    - Anti-Duplication: Avoid topics similar to: [${excludedTopics.join(", ")}].
    - Question formats (vary within each batch):
      * Single factual statement questions
      * Multi-statement verification (Statement I, Statement II)
      * Assertion & Reason [A/R] format
    - Distractors: All wrong options must be real Tamil Nadu entities or Indian government bodies. No fabricated names.
    - Options: Exactly 4 per question. correct_option must exactly match one string in options array.
    - Return raw JSON array only. No markdown.
  `;

  let allQuestions: GeminiBilingualQuestion[] = [];

  // ── PART 1: PIB-grounded questions (20 questions, 4 batches of 5) ──
  const pibBatchCount = 4;
  const chunkSize = Math.ceil(articleChunks.length / pibBatchCount);

  for (let i = 0; i < pibBatchCount; i++) {
    const batchArticles = articleChunks.length > 0
      ? articleChunks.slice(i * chunkSize, (i + 1) * chunkSize).join("\n---\n")
      : "No PIB articles available. Use your verified 2026 knowledge.";

    const userPrompt = `
      Using the PIB news articles below, generate exactly 5 distinct TNPSC current affairs MCQs.
      
      Live News Articles:
      ${batchArticles}

      Return a raw JSON array of exactly 5 objects:
      [{ "topic", "question_en", "question_ta", "options_en", "options_ta", "correct_option_en", "correct_option_ta", "explanation_en", "explanation_ta" }]
    `;

    const batch = await generateQuestions(systemInstruction, userPrompt, `PIB batch [${i + 1}/${pibBatchCount}]`);
    allQuestions = allQuestions.concat(batch);
  }

  console.log(`[Pipeline] PIB questions generated: ${allQuestions.length}`);

  // ── PART 2: Pure Gemini questions (10 questions, 2 batches of 5) ──
  for (let i = 0; i < 2; i++) {
    const userPrompt = `
      Generate exactly 5 high-quality TNPSC current affairs MCQs based on your knowledge of major events in ${currentMonthYear}.
      Focus on: national governance, science & technology, economy, awards, sports milestones.
      Avoid topics already covered: [${allQuestions.map(q => q.topic).join(", ")}].

      Return a raw JSON array of exactly 5 objects:
      [{ "topic", "question_en", "question_ta", "options_en", "options_ta", "correct_option_en", "correct_option_ta", "explanation_en", "explanation_ta" }]
    `;

    const batch = await generateQuestions(systemInstruction, userPrompt, `Gemini batch [${i + 1}/2]`);
    allQuestions = allQuestions.concat(batch);
  }

  console.log(`[Pipeline] Total questions generated: ${allQuestions.length}`);

  // ── Deduplicate by question_en ──
  const seen = new Set<string>();
  const unique = allQuestions.filter(q => {
    const key = q.question_en.substring(0, 80).toLowerCase();
    if (seen.has(key)) { console.log(`[Dedup] Dropped duplicate: ${key}`); return false; }
    seen.add(key);
    return true;
  });
  console.log(`[Dedup] After dedup: ${unique.length} questions`);

  // ── Build rows ──
  const compiledRowsToInsert: any[] = [];
  unique.forEach(q => {
    compiledRowsToInsert.push({
      question: q.question_en, options: q.options_en,
      correct_option: q.correct_option_en, explanation: q.explanation_en,
      topic: q.topic, published_date: todayStr, lang: "en"
    });
    compiledRowsToInsert.push({
      question: q.question_ta, options: q.options_ta,
      correct_option: q.correct_option_ta, explanation: q.explanation_ta,
      topic: q.topic, published_date: todayStr, lang: "ta"
    });
  });

  console.log(`[DB] Total rows to insert: ${compiledRowsToInsert.length}`);

  if (compiledRowsToInsert.length > 0) {
    const { error } = await supabase
      .from("current_affairs")
      .upsert(compiledRowsToInsert, { onConflict: "question,lang", ignoreDuplicates: true });
    if (error) {
      console.error("[DB] Supabase upsert error:", error);
    } else {
      console.log(`[DB] Pipeline complete. ${compiledRowsToInsert.length} rows upserted for ${todayStr}`);
    }
  } else {
    console.warn("[DB] No rows to insert.");
  }
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // To generate for a specific date, pass ?date=YYYY-MM-DD
  const url = new URL(request.url);
  const overrideDate = url.searchParams.get("date") ?? undefined;
  if (overrideDate) console.log(`[Pipeline] Override date: ${overrideDate}`);

  await runDailyTNPSCCron(overrideDate);
  return Response.json({ success: true });
}
