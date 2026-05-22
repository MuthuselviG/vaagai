// app/api/cron/current-affairs/route.ts
// Vercel cron: runs daily at 2am IST (8:30pm UTC)
// Add to vercel.json: { "crons": [{ "path": "/api/cron/current-affairs", "schedule": "30 20 * * *" }] }

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const MODEL = "gemini-3.5-flash";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

const SYSTEM_PROMPT = `You are an expert TNPSC content creator and data engine specializing in bilingual question generation. Your sole task is to generate a daily set of exactly 20 high-yield Current Affairs Multiple Choice Questions (MCQs) for TNPSC Group 1, 2, and 4 exams.

### Output Format Specification
You must output ONLY a valid JSON array containing exactly 20 objects. Do not include markdown code fences, markdown headers, or any introductory/trailing conversational text. The output must be raw, valid JSON ready to be parsed directly by an automated script.

### JSON Schema Architecture
Each object must strictly follow this structure:
{
  "question_en": "String text of the question in clear English",
  "question_ta": "String text of the question accurately translated into Tamil",
  "options_en": ["Option A", "Option B", "Option C", "Option D"],
  "options_ta": ["ஆப்ஷன் A", "ஆப்ஷன் B", "ஆப்ஷன் C", "ஆப்ஷன் D"],
  "correct_option_en": "String value matching EXACTLY one of the strings inside options_en",
  "correct_option_ta": "String value matching EXACTLY one of the strings inside options_ta",
  "explanation_en": "1-2 sentences of contextual explanation in English.",
  "explanation_ta": "1-2 sentences of contextual explanation in Tamil.",
  "subject": "String category (e.g., Administration, Polity, Science, Economy)",
  "topic": "String sub-topic (e.g., Welfare Schemes, Space, Macroeconomics)",
  "difficulty": "easy | medium | hard",
  "priority_order": integer 1 to 20,
  "is_group4": boolean,
  "is_group2": boolean,
  "is_tnusrb": boolean,
  "is_tet": boolean
}

### Topic Distribution (70/30 Split)
1. TAMIL NADU AFFAIRS — 6 questions, priority_order 1-6
   - State welfare schemes, governance, budget, archaeology, environment, GI tags

2. NATIONAL GOVERNANCE & POLITY — 5 questions, priority_order 7-11
   - Union budget, appointments, bills, Supreme Court judgments

3. SCIENCE, TECHNOLOGY & ENVIRONMENT — 5 questions, priority_order 12-16
   - ISRO missions, DRDO, Ramsar sites, wildlife census

4. ECONOMY, AWARDS & SPORTS — 4 questions, priority_order 17-20
   - GDP, RBI rates, Padma/Sahitya awards, sports milestones

### Rules
- Content must reflect real events from the last 12 months up to 2026
- correct_option_en must exactly match one value in options_en (character-for-character)
- correct_option_ta must exactly match one value in options_ta
- source_type and status are injected by the script, do not include them
- published_date is injected by the script, do not include it`;

// ── helpers ──────────────────────────────────────────────

function getTodayIST(): string {
  // Returns YYYY-MM-DD in IST (UTC+5:30)
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().split("T")[0];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini(retryCount = 0): Promise<any[]> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Strip any accidental markdown fences
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    if (!Array.isArray(parsed) || parsed.length !== 20) {
      throw new Error(`Expected 20 questions, got ${parsed?.length}`);
    }

    return parsed;
  } catch (err) {
    if (retryCount < MAX_RETRIES) {
      console.warn(`Gemini call failed (attempt ${retryCount + 1}), retrying in ${RETRY_DELAY_MS}ms...`, err);
      await sleep(RETRY_DELAY_MS);
      return callGemini(retryCount + 1);
    }
    throw err;
  }
}

function buildRows(questions: any[], publishedDate: string) {
  const rows: any[] = [];

  for (const q of questions) {
    // English row
    rows.push({
      question: q.question_en,
      lang: "en",
      options: q.options_en,
      correct_option: q.correct_option_en,
      explanation: q.explanation_en,
      subject: q.subject,
      topic: q.topic,
      difficulty: q.difficulty,
      priority_order: q.priority_order,
      is_group4: q.is_group4 ?? true,
      is_group2: q.is_group2 ?? true,
      is_tnusrb: q.is_tnusrb ?? false,
      is_tet: q.is_tet ?? false,
      source_type: "current_affairs",
      status: "approved",
      published_date: publishedDate,
    });

    // Tamil row
    rows.push({
      question: q.question_ta,
      lang: "ta",
      options: q.options_ta,
      correct_option: q.correct_option_ta,
      explanation: q.explanation_ta,
      subject: q.subject,
      topic: q.topic,
      difficulty: q.difficulty,
      priority_order: q.priority_order,
      is_group4: q.is_group4 ?? true,
      is_group2: q.is_group2 ?? true,
      is_tnusrb: q.is_tnusrb ?? false,
      is_tet: q.is_tet ?? false,
      source_type: "current_affairs",
      status: "approved",
      published_date: publishedDate,
    });
  }

  return rows;
}

async function insertRows(rows: any[], retryCount = 0): Promise<void> {
  const { error } = await supabase.from("questions").insert(rows);

  if (error) {
    if (retryCount < MAX_RETRIES) {
      console.warn(`Supabase insert failed (attempt ${retryCount + 1}), retrying...`, error);
      await sleep(RETRY_DELAY_MS);
      return insertRows(rows, retryCount + 1);
    }
    throw new Error(`Supabase insert failed: ${error.message}`);
  }
}

// ── route handler ─────────────────────────────────────────

export async function GET(request: Request) {
  // Verify Vercel cron secret to prevent unauthorized calls
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const publishedDate = getTodayIST();
  console.log(`[current-affairs-cron] Running for ${publishedDate}`);

  try {
    // 1. Check if already generated today (avoid duplicates)
    const { data: existing } = await supabase
      .from("questions")
      .select("id")
      .eq("source_type", "current_affairs")
      .eq("published_date", publishedDate)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`[current-affairs-cron] Already generated for ${publishedDate}, skipping.`);
      return NextResponse.json({ message: "Already generated today", date: publishedDate });
    }

    // 2. Call Gemini with retries
    console.log(`[current-affairs-cron] Calling Gemini ${MODEL}...`);
    const questions = await callGemini();
    console.log(`[current-affairs-cron] Got ${questions.length} questions from Gemini`);

    // 3. Build EN + TA rows
    const rows = buildRows(questions, publishedDate);
    console.log(`[current-affairs-cron] Inserting ${rows.length} rows into Supabase...`);

    // 4. Insert with retries
    await insertRows(rows);
    console.log(`[current-affairs-cron] Done. ${rows.length} rows inserted for ${publishedDate}`);

    return NextResponse.json({
      success: true,
      date: publishedDate,
      questions_inserted: rows.length,
    });
  } catch (err: any) {
    console.error(`[current-affairs-cron] Fatal error:`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
