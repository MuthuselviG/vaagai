import { createClient } from "@supabase/supabase-js";
import ExpertsClient, { type CreatorRow } from "./ExpertsClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TNPSC Experts & Guides | MCQ Palagu",
  description: "Learn from verified TNPSC coaches, academy teachers, and study buddies. Browse question packs curated by top scorers and educators.",
  alternates: { canonical: "https://mcqpalagu.in/experts" },
  openGraph: {
    title: "TNPSC Experts & Guides | MCQ Palagu",
    description: "Learn from verified TNPSC coaches, academy teachers, and study buddies.",
    url: "https://mcqpalagu.in/experts",
  },
};

async function getCreators(): Promise<CreatorRow[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("creators")
    .select("*, packs(id, question_count, is_published)");
  return (data ?? []) as CreatorRow[];
}

export default async function ExpertsPage() {
  const rows = await getCreators();
  return <ExpertsClient initialRows={rows} />;
}
