import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service key — never exposed to frontend
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select("subject, pyq_years, pyq_groups")
      .eq("source_type", "pyq");

    if (error) {
      console.error("Filters fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch filters" }, { status: 500 });
    }

    const subjects = new Set<string>();
    const years = new Set<number>();
    const groups = new Set<string>();

    for (const row of data ?? []) {
      if (row.subject) subjects.add(row.subject);
      for (const y of row.pyq_years ?? []) years.add(y);
      for (const g of row.pyq_groups ?? []) groups.add(g);
    }

    return NextResponse.json({
      subjects: Array.from(subjects).sort(),
      years: Array.from(years).sort((a, b) => b - a),
      groups: Array.from(groups).sort(),
    });
  } catch (err) {
    console.error("Filters error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
