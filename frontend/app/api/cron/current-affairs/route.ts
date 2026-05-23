// app/api/cron/current-affairs/route.ts
// Vercel cron: runs daily at 2am IST (8:30pm UTC)
// vercel.json: { "crons": [{ "path": "/api/cron/current-affairs", "schedule": "30 20 * * *" }] }

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

// Two prompts — batch A (Tamil Nadu + National) and batch B (Science + Economy/Awards/Sports)
const PROMPT_A = `You are an expert TNPSC content creator. Generate exactly 10 bilingual MCQs for TNPSC exams.

Output ONLY a raw valid JSON array of exactly 10 objects. No markdown, no explanation, no extra text.

Each object:
{
  "question_en": "question in English",
  "question_ta": "question in Tamil",
  "options_en": ["A", "B", "C", "D"],
  "options_ta": ["A", "B", "C", "D"],
  "correct_option_en": "must match exactly one value in options_en",
  "correct_option_ta": "must match exactly one value in options_ta",
  "explanation_en": "1 sentence explanation",
  "explanation_ta": "1 sentence explanation in Tamil",
  "topic": "sub-topic string"
}

Distribution:
- 6 questions: Tamil Nadu affairs (welfare schemes, governance, archaeology, environment, GI tags, budget)
- 4 questions: National Governance & Polity (appointments, bills, Supreme Court, Union budget)

Events from last 12 months up to 2026. correct_option must exactly match one option string.`;

const PROMPT_B = `You are an expert TNPSC content creator. Generate exactly 10 bilingual MCQs for TNPSC exams.

Output ONLY a raw valid JSON array of exactly 10 objects. No markdown, no explanation, no extra text.

Each object:
{
  "question_en": "question in English",
  "question_ta": "question in Tamil",
  "options_en": ["A", "B", "C", "D"],
  "options_ta": ["A", "B", "C", "D"],
  "correct_option_en": "must match exactly one value in options_en",
  "correct_option_ta": "must match exactly one value in options_ta",
  "explanation_en": "1 sentence explanation",
  "explanation_ta": "1 sentence explanation in Tamil",
  "topic": "sub-topic string"
}

Distribution:
- 5 questions: Science, Technology & Environment (ISRO, DRDO, Ramsar sites, wildlife census)
- 5 questions: Economy, Awards & Sports (GDP, RBI rates, Padma awards, sports milestones)

Events from last 12 months up to 2026. correct_option must exactly match one option string.`;

// ── helpers ──────────────────────────────────────────────

function getTodayIST(): string {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().split("T")[0];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini(prompt: string, retryCount = 0): Promise<any[]> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
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
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    if (!Array.isArray(parsed) || parsed.length !== 10) {
      throw new Error(`Expected 10 questions, got ${parsed?.length}`);
    }

    return parsed;
  } catch (err) {
    if (retryCount < MAX_RETRIES) {
      console.warn(`Gemini call failed (attempt ${retryCount + 1}), retrying in ${RETRY_DELAY_MS}ms...`, err);
      await sleep(RETRY_DELAY_MS);
      return callGemini(prompt, retryCount + 1);
    }
    throw err;
  }
}

function buildRows(questions: any[], publishedDate: string) {
  const rows: any[] = [];
  for (const q of questions) {
    rows.push({
      question: q.question_en,
      lang: "en",
      options: q.options_en,
      correct_option: q.correct_option_en,
      explanation: q.explanation_en,
      topic: q.topic,
      status: "approved",
      published_date: publishedDate,
    });
    rows.push({
      question: q.question_ta,
      lang: "ta",
      options: q.options_ta,
      correct_option: q.correct_option_ta,
      explanation: q.explanation_ta,
      topic: q.topic,
      status: "approved",
      published_date: publishedDate,
    });
  }
  return rows;
}

async function insertRows(rows: any[], retryCount = 0): Promise<void> {
  const { error } = await supabase.from("current_affairs").insert(rows);
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
  // Auth check — skipped in local dev
  if (process.env.NODE_ENV === "production") {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const publishedDate = getTodayIST();
  console.log(`[current-affairs-cron] Running for ${publishedDate}`);

  try {
    // 1. Duplicate check
    const { data: existing } = await supabase
      .from("current_affairs")
      .select("id")
      .eq("published_date", publishedDate)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`[current-affairs-cron] Already generated for ${publishedDate}, skipping.`);
      return NextResponse.json({ message: "Already generated today", date: publishedDate });
    }

    // 2. Two Gemini calls — batch A and batch B
    console.log(`[current-affairs-cron] Calling Gemini batch A...`);
    const batchA = await callGemini(PROMPT_A);
    console.log(`[current-affairs-cron] Batch A done. Calling batch B...`);
    const batchB = await callGemini(PROMPT_B);
    console.log(`[current-affairs-cron] Both batches done. Total: ${batchA.length + batchB.length} questions`);

    // 3. Build rows
    const rows = buildRows([...batchA, ...batchB], publishedDate);
    console.log(`[current-affairs-cron] Inserting ${rows.length} rows...`);

    // 4. Insert
    await insertRows(rows);
    console.log(`[current-affairs-cron] Done. ${rows.length} rows inserted for ${publishedDate}`);

    return NextResponse.json({
      success: true,
      date: publishedDate,
      rows_inserted: rows.length,
    });
  } catch (err: any) {
    console.error(`[current-affairs-cron] Fatal error:`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
