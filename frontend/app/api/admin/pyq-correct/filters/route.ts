import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service key — never exposed to frontend
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BATCH_SIZE = 1000;

export async function GET() {
  try {
    const subjects = new Set<string>();
    const years = new Set<number>();
    const groups = new Set<string>();

    // Supabase/PostgREST caps a single request at 1000 rows. With ~4,000
    // PYQ rows, a single unpaginated select silently truncates the result
    // — page through in batches so every year/group/subject is counted.
    let from = 0;
    for (;;) {
      const { data, error } = await supabase
        .from("questions")
        .select("subject, pyq_years, pyq_groups")
        .eq("source_type", "pyq")
        .range(from, from + BATCH_SIZE - 1);

      if (error) {
        console.error("Filters fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch filters" }, { status: 500 });
      }

      for (const row of data ?? []) {
        if (row.subject) subjects.add(row.subject);
        for (const y of row.pyq_years ?? []) years.add(y);
        for (const g of row.pyq_groups ?? []) groups.add(g);
      }

      if (!data || data.length < BATCH_SIZE) break;
      from += BATCH_SIZE;
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
