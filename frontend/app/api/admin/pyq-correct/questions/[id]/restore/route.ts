import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SNAPSHOT_FIELDS } from "../route";

// Service key — never exposed to frontend
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: current, error: fetchError } = await supabase
      .from("questions")
      .select("original_version")
      .eq("id", id)
      .eq("source_type", "pyq")
      .single();

    if (fetchError || !current) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    if (!current.original_version) {
      return NextResponse.json(
        { error: "No original version stored for this question" },
        { status: 400 }
      );
    }

    const original = current.original_version as Record<string, unknown>;
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const field of SNAPSHOT_FIELDS) updates[field] = original[field];

    const { data, error } = await supabase
      .from("questions")
      .update(updates)
      .eq("id", id)
      .eq("source_type", "pyq")
      .select()
      .single();

    if (error || !data) {
      console.error("Question restore error:", error);
      return NextResponse.json({ error: "Failed to restore question" }, { status: 500 });
    }

    return NextResponse.json({ question: data });
  } catch (err) {
    console.error("Question restore error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
