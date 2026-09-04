import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service key — never exposed to frontend
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Fields snapshotted into original_version on a question's first edit.
export const SNAPSHOT_FIELDS = [
  "question",
  "options",
  "correct_option",
  "explanation",
  "subject",
  "topic",
  "lang",
  "pyq_years",
  "pyq_groups",
  "status",
] as const;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("id", id)
      .eq("source_type", "pyq")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({ question: data });
  } catch (err) {
    console.error("Question fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      status,
    } = body;

    if (options !== undefined && correct_option !== undefined && !options.includes(correct_option)) {
      return NextResponse.json(
        { error: "correct_option must match one of the options" },
        { status: 400 }
      );
    }

    const { data: current, error: fetchError } = await supabase
      .from("questions")
      .select(
        "question, options, correct_option, explanation, subject, topic, lang, pyq_years, pyq_groups, status, original_version"
      )
      .eq("id", id)
      .eq("source_type", "pyq")
      .single();

    if (fetchError || !current) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (question !== undefined) updates.question = question;
    if (options !== undefined) updates.options = options;
    if (correct_option !== undefined) updates.correct_option = correct_option;
    if (explanation !== undefined) updates.explanation = explanation;
    if (subject !== undefined) updates.subject = subject;
    if (topic !== undefined) updates.topic = topic;
    if (lang !== undefined) updates.lang = lang;
    if (pyq_years !== undefined) updates.pyq_years = pyq_years;
    if (pyq_groups !== undefined) updates.pyq_groups = pyq_groups;
    if (status !== undefined) updates.status = status;

    // Capture the pre-edit values once, on the first edit only -- never
    // overwritten on later edits, so it always reflects the row as it
    // originally existed before any admin correction.
    if (current.original_version == null) {
      const snapshot: Record<string, unknown> = {};
      for (const field of SNAPSHOT_FIELDS) snapshot[field] = current[field];
      updates.original_version = snapshot;
    }

    const { data, error } = await supabase
      .from("questions")
      .update(updates)
      .eq("id", id)
      .eq("source_type", "pyq")
      .select()
      .single();

    if (error || !data) {
      console.error("Question update error:", error);
      return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
    }

    return NextResponse.json({ question: data });
  } catch (err) {
    console.error("Question update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
