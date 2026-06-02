import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service key — never exposed to frontend
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year") ?? "");
    const group = searchParams.get("group") ?? "group4";
    const lang = (searchParams.get("lang") ?? "ta") as "en" | "ta";

    if (!year || isNaN(year)) {
      return NextResponse.json({ error: "Missing or invalid year" }, { status: 400 });
    }

    // Tamil paper: subject = 'General Tamil' (always Tamil lang)
    // GS paper: subject != 'General Tamil', lang = user toggle
    const [tamilResult, gsResult] = await Promise.all([
      supabase
        .from("questions")
        .select("id, question, lang, options, correct_option, explanation, subject, chapter, topic, difficulty")
        .contains("pyq_years", [year])
        .contains("pyq_groups", [group])
        .eq("subject", "General Tamil")
        .eq("source_type", "pyq")
        .limit(100),

      supabase
        .from("questions")
        .select("id, question, lang, options, correct_option, explanation, subject, chapter, topic, difficulty")
        .contains("pyq_years", [year])
        .contains("pyq_groups", [group])
        .neq("subject", "General Tamil")
        .eq("lang", lang)
        .eq("source_type", "pyq")
        .limit(100),
    ]);

    if (tamilResult.error) {
      console.error("Tamil fetch error:", tamilResult.error);
      return NextResponse.json({ error: "Failed to fetch Tamil questions" }, { status: 500 });
    }
    if (gsResult.error) {
      console.error("GS fetch error:", gsResult.error);
      return NextResponse.json({ error: "Failed to fetch GS questions" }, { status: 500 });
    }

    const tamilQuestions = tamilResult.data ?? [];
    const gsQuestions = gsResult.data ?? [];

    // Tamil paper first (1-100), GS next (101-200)
    const questions = [...tamilQuestions, ...gsQuestions];

    return NextResponse.json({
      questions,
      tamil_count: tamilQuestions.length,
      gs_count: gsQuestions.length,
      total: questions.length,
    });

  } catch (err) {
    console.error("Mock questions error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
