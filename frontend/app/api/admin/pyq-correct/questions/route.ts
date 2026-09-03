import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service key — never exposed to frontend
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const paper = searchParams.get("paper"); // "tamil" | "gs"
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1") || 1);

    let query = supabase
      .from("questions")
      .select(
        "id, question, subject, topic, pyq_years, lang, status, report_count",
        { count: "exact" }
      )
      .eq("source_type", "pyq");

    if (year) {
      const yearNum = parseInt(year);
      if (!isNaN(yearNum)) query = query.contains("pyq_years", [yearNum]);
    }
    if (paper === "tamil") query = query.eq("subject", "General Tamil");
    if (paper === "gs") query = query.neq("subject", "General Tamil");

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Questions list error:", error);
      return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
    }

    return NextResponse.json({
      questions: data ?? [],
      total: count ?? 0,
      page,
      pageSize: PAGE_SIZE,
    });
  } catch (err) {
    console.error("Questions list error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      question,
      options,
      correct_option,
      explanation,
      subject,
      topic,
      lang,
      pyq_years,
      pyq_groups,
    } = body;

    if (
      !question ||
      !Array.isArray(options) ||
      options.length !== 4 ||
      options.some((o: unknown) => typeof o !== "string" || !o.trim()) ||
      !correct_option ||
      !subject ||
      !lang
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!options.includes(correct_option)) {
      return NextResponse.json(
        { error: "correct_option must match one of the options" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("questions")
      .insert({
        question,
        options,
        correct_option,
        explanation: explanation ?? null,
        subject,
        topic: topic ?? null,
        lang,
        pyq_years: pyq_years ?? null,
        pyq_groups: pyq_groups ?? null,
        source_type: "pyq",
        status: "approved",
      })
      .select()
      .single();

    if (error) {
      console.error("Question create error:", error);
      return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
    }

    return NextResponse.json({ question: data }, { status: 201 });
  } catch (err) {
    console.error("Question create error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
