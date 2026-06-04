// scripts/current-affairs.ts
// Run via GitHub Actions daily at 2am IST
// npx ts-node --esm scripts/current-affairs.ts

import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY_CRON });

// Exactly 6 allowed subject values — no exceptions
const VALID_SUBJECTS = [
  "General Science",
  "Geography",
  "History",
  "Indian Polity",
  "Economy",
  "General Tamil",
] as const;

type ValidSubject = typeof VALID_SUBJECTS[number];

interface GeminiBilingualQuestion {
  subject: ValidSubject;
  topic: string;
  slug_en: string;
  slug_ta: string;
  source_ministry: string | null;
  question_en: string;
  question_ta: string;
  options_en: string[];
  options_ta: string[];
  correct_option_en: string;
  correct_option_ta: string;
  explanation_en: string;
  explanation_ta: string;
}

// Tamil stop words
const tamilStopWords = new Set([
  "என்ன", "எது", "எந்த", "எங்கு", "எவ்வாறு", "யார்", "எவர்",
  "ஒரு", "இந்த", "அந்த", "இல்", "உள்ள", "மற்றும்", "ஆகும்",
  "என்று", "கீழ்க்கண்ட", "கீழே", "பற்றி", "தொடர்பான",
  "கண்டறி", "கண்டு", "பின்வரும்", "சரியான", "தவறான",
  "கூற்றுகளில்", "கூற்று", "சரியானது", "விடை", "தேர்ந்தெடு",
]);

// English stop words
const englishStopWords = new Set([
  "what", "which", "who", "where", "when", "how", "why",
  "is", "are", "was", "were", "the", "a", "an", "of", "in",
  "to", "and", "or", "for", "on", "at", "by", "with", "from",
  "that", "this", "these", "those", "has", "have", "had",
  "following", "correct", "incorrect", "statement", "statements",
  "consider", "given", "below", "above", "about", "regarding",
  "choose", "select", "option", "options", "answer",
]);

function generateSlug(text: string, lang: "en" | "ta"): string {
  if (lang === "en") {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 2 && !englishStopWords.has(w))
      .slice(0, 8)
      .join("-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  } else {
    return text
      .replace(/[^\u0B80-\u0BFF\s]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 1 && !tamilStopWords.has(w))
      .slice(0, 6)
      .join("-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
}

function sanitizeSubject(subject: string): ValidSubject {
  if (VALID_SUBJECTS.includes(subject as ValidSubject)) return subject as ValidSubject;
  // Fallback mapping for any Gemini drift
  const map: Record<string, ValidSubject> = {
    "Science": "General Science",
    "Polity": "Indian Polity",
    "History": "History",
    "Tamil Nadu History": "History",
    "Current Affairs": "History",
    "Economy": "Economy",
    "Geography": "Geography",
    "General Tamil": "General Tamil",
  };
  const fallback = map[subject] ?? "History";
  console.warn(`[Sanitize] Invalid subject "${subject}" → fallback "${fallback}"`);
  return fallback;
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

async function fetchPIBArticle(prid: number): Promise<{ text: string; ministry: string | null; date: string | null }> {
  try {
    console.log(`[PIB] Fetching article PRID=${prid}...`);
    const res = await fetch(`https://www.pib.gov.in/PressReleasePage.aspx?PRID=${prid}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      }
    });
    console.log(`[PIB] Article PRID=${prid} status: ${res.status}`);
    const html = await res.text();
    const ministryMatch = html.match(/Ministry of ([^<\n]+)/i) || html.match(/Department of ([^<\n]+)/i);
    const ministry = ministryMatch ? ministryMatch[0].replace(/<[^>]+>/g, "").trim().substring(0, 100) : null;
    const dateMatch = html.match(/(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i);
    const date = dateMatch ? dateMatch[0] : null;
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    console.log(`[PIB] Article PRID=${prid} text length: ${text.length} ministry: ${ministry} date: ${date}`);
    return { text: text.substring(0, 1500), ministry, date };
  } catch (err) {
    console.error(`[PIB] Failed to fetch article PRID=${prid}:`, err);
    return { text: "", ministry: null, date: null };
  }
}

interface PIBArticle {
  prid: number;
  text: string;
  ministry: string | null;
  date: string | null;
  url: string;
}

async function getFreshNewsContext(): Promise<PIBArticle[]> {
  const prids = await getPIBArticlePRIDs();
  console.log(`[PIB] Total PRIDs to fetch: ${prids.length}`);
  if (prids.length === 0) {
    console.warn("[PIB] No PRIDs found.");
    return [];
  }
  const articles: PIBArticle[] = [];
  for (const prid of prids) {
    const { text, ministry, date } = await fetchPIBArticle(prid);
    if (text) {
      articles.push({ prid, text, ministry, date, url: `https://www.pib.gov.in/PressReleasePage.aspx?PRID=${prid}` });
    }
  }
  console.log(`[PIB] Successfully fetched ${articles.length} articles`);
  return articles;
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
      config: { systemInstruction, responseMimeType: "application/json", temperature: 0.15 }
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

async function main() {
  console.log("Initializing TNPSC current affairs pipeline...");
  const todayStr = process.argv[2] ?? new Date().toLocaleString("en-CA", { timeZone: "Asia/Kolkata" }).split(",")[0];
  const currentMonthYear = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  console.log(`[Pipeline] Target date: ${todayStr}`);

  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
  const { data: recentRecords, error: recentError } = await supabase
    .from("current_affairs")
    .select("topic, subject")
    .gte("published_date", fiveDaysAgo.toISOString().split("T")[0]);
  if (recentError) console.error("[DB] Error fetching recent topics:", recentError);
  console.log(`[DB] Recent records fetched: ${recentRecords?.length ?? 0}`);

  const excludedTopics = recentRecords
    ? Array.from(new Set(recentRecords.map(r => r.topic).filter(Boolean)))
    : [];
  console.log(`[DB] Excluded topics: ${excludedTopics.join(", ")}`);

  console.log("[Pipeline] Fetching PIB articles...");
  const pibArticles = await getFreshNewsContext();
  console.log(`[Pipeline] ${pibArticles.length} PIB articles ready`);

  const systemInstruction = `
You are an expert paper setter for the TNPSC (Tamil Nadu Public Service Commission) Group 1 and Group 4 exams.

SUBJECT CLASSIFICATION — YOU MUST PICK EXACTLY ONE FROM THIS LIST. NO OTHER VALUES ALLOWED:
- "General Science" → Defence, Space, Health, Environment, Technology
- "Geography" → Rivers, Wildlife, GI Tags, Coastal, Climate
- "History" → National Leaders, Freedom Movement, Excavations, Keezhadi, Sports, Awards, Eminent Persons, Current Events
- "Indian Polity" → Constitution, Elections, Courts, Welfare Schemes, State Admin, Government Policies
- "Economy" → Budget, GDP, RBI, Trade, Infrastructure, Industrial Policy
- "General Tamil" → Tamil Literature, Classical Tamil, Tamil Grammar

TOPIC SLUG RULES:
- Always in English, lowercase, hyphenated
- Must be specific to the article/event, not generic
- Good: "pudhumai-penn-scheme-2026", "keezhadi-phase7-findings", "isro-spadex-docking-mission"
- Bad: "welfare-schemes", "science", "current-affairs"

ANTI-DUPLICATION: Avoid topics similar to: [${excludedTopics.join(", ")}]
TN SAMPLE TOPICS (not restricted to): ${tnpscKeywords.join(", ")}

QUESTION RULES:
- At least 3 of every 5 questions must target Tamil Nadu specifically
- Vary formats: factual, Statement I/II verification, Assertion & Reason
- Distractors must be real Tamil Nadu entities or Indian government bodies
- correct_option must exactly match one string in options array
- Return raw JSON array only, no markdown
  `;

  let allQuestions: Array<GeminiBilingualQuestion & { source_url?: string; source_date?: string }> = [];

  // PIB-grounded questions (20 questions, 4 batches of 5)
  const pibBatchCount = 4;
  const chunkSize = Math.ceil(pibArticles.length / pibBatchCount);

  for (let i = 0; i < pibBatchCount; i++) {
    const batchArticles = pibArticles.slice(i * chunkSize, (i + 1) * chunkSize);
    const batchText = batchArticles.length > 0
      ? batchArticles.map(a => `[PIB PRID:${a.prid} | Ministry: ${a.ministry ?? "Government of India"} | Date: ${a.date ?? "2026"}]\n${a.text}`).join("\n---\n")
      : "No PIB articles available. Use your verified 2026 knowledge.";

    const userPrompt = `
Using the PIB news articles below, generate exactly 5 distinct TNPSC current affairs MCQs.

Live News Articles:
${batchText}

Return a raw JSON array of exactly 5 objects:
[{
  "subject": "MUST be one of: General Science|Geography|History|Indian Polity|Economy|General Tamil",
  "topic": "specific-english-slug-not-generic",
  "source_ministry": "Ministry name from article or null",
  "question_en": "question in English",
  "question_ta": "question in Tamil",
  "options_en": ["A", "B", "C", "D"],
  "options_ta": ["A", "B", "C", "D"],
  "correct_option_en": "exactly matching string from options_en",
  "correct_option_ta": "exactly matching string from options_ta",
  "explanation_en": "1-2 sentence explanation",
  "explanation_ta": "1-2 sentence explanation in Tamil"
}]
    `;

    const batch = await generateQuestions(systemInstruction, userPrompt, `PIB batch [${i + 1}/${pibBatchCount}]`);
    batch.forEach((q, idx) => {
      const article = batchArticles[idx % batchArticles.length];
      (q as any).source_url = article?.url ?? null;
      (q as any).source_date = article?.date ?? null;
    });
    allQuestions = allQuestions.concat(batch as any);
  }

  console.log(`[Pipeline] PIB questions generated: ${allQuestions.length}`);

  // Pure Gemini questions (10 questions, 2 batches of 5)
  for (let i = 0; i < 2; i++) {
    const coveredTopics = allQuestions.map(q => q.topic).join(", ");
    const userPrompt = `
Generate exactly 5 high-quality TNPSC current affairs MCQs based on major events in ${currentMonthYear}.
Focus on: national governance, science & technology, economy, awards, sports milestones, international affairs.
Avoid topics already covered: [${coveredTopics}].

Return a raw JSON array of exactly 5 objects:
[{
  "subject": "MUST be one of: General Science|Geography|History|Indian Polity|Economy|General Tamil",
  "topic": "specific-english-slug-not-generic",
  "source_ministry": null,
  "question_en": "question in English",
  "question_ta": "question in Tamil",
  "options_en": ["A", "B", "C", "D"],
  "options_ta": ["A", "B", "C", "D"],
  "correct_option_en": "exactly matching string from options_en",
  "correct_option_ta": "exactly matching string from options_ta",
  "explanation_en": "1-2 sentence explanation",
  "explanation_ta": "1-2 sentence explanation in Tamil"
}]
    `;

    const batch = await generateQuestions(systemInstruction, userPrompt, `Gemini batch [${i + 1}/2]`);
    allQuestions = allQuestions.concat(batch as any);
  }

  console.log(`[Pipeline] Total questions generated: ${allQuestions.length}`);

  // Deduplicate
  const seen = new Set<string>();
  const unique = allQuestions.filter(q => {
    const key = q.question_en.substring(0, 80).toLowerCase();
    if (seen.has(key)) { console.log(`[Dedup] Dropped duplicate: ${key}`); return false; }
    seen.add(key);
    return true;
  });
  console.log(`[Dedup] After dedup: ${unique.length} questions`);

  // Track used slugs for uniqueness within this batch
  const usedSlugs = new Set<string>();

  function makeUniqueSlug(base: string): string {
    let slug = base;
    let counter = 2;
    while (usedSlugs.has(slug)) {
      slug = `${base}-${counter}`;
      counter++;
    }
    usedSlugs.add(slug);
    return slug;
  }

  // Build rows
  const compiledRowsToInsert: any[] = [];
  unique.forEach(q => {
    const sanitizedSubject = sanitizeSubject(q.subject);

    const slugEn = makeUniqueSlug(generateSlug(q.question_en, "en"));
    const slugTa = makeUniqueSlug(generateSlug(q.question_ta, "ta"));

    const base = {
      subject: sanitizedSubject,
      topic: q.topic,
      source_ministry: q.source_ministry ?? null,
      source_url: (q as any).source_url ?? null,
      source_date: (q as any).source_date ?? null,
      published_date: todayStr,
    };

    compiledRowsToInsert.push({
      ...base,
      question: q.question_en,
      options: q.options_en,
      correct_option: q.correct_option_en,
      explanation: q.explanation_en,
      lang: "en",
      slug: slugEn,
    });
    compiledRowsToInsert.push({
      ...base,
      question: q.question_ta,
      options: q.options_ta,
      correct_option: q.correct_option_ta,
      explanation: q.explanation_ta,
      lang: "ta",
      slug: slugTa,
    });
  });

  console.log(`[DB] Total rows to insert: ${compiledRowsToInsert.length}`);
  console.log(`[DB] Sample slugs — EN: ${compiledRowsToInsert[0]?.slug} | TA: ${compiledRowsToInsert[1]?.slug}`);

  if (compiledRowsToInsert.length > 0) {
    const { error } = await supabase
      .from("current_affairs")
      .upsert(compiledRowsToInsert, { onConflict: "question,lang", ignoreDuplicates: true });
    if (error) {
      console.error("[DB] Supabase upsert error:", error);
      process.exit(1);
    } else {
      console.log(`[DB] Pipeline complete. ${compiledRowsToInsert.length} rows upserted for ${todayStr}`);
    }
  } else {
    console.warn("[DB] No rows to insert.");
  }
}

main().catch(err => {
  console.error("[Fatal]", err);
  process.exit(1);
});
