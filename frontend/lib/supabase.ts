import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Question = {
  id: string;
  question: string;
  lang: "en" | "ta";
  options: string[];
  correct_option: string;
  class: number | null;
  subject: string;
  chapter: string | null;
  topic: string | null;
  difficulty: "easy" | "medium" | "hard" | null;
  source_type: string | null;
};

export type ChapterCount = {
  chapter: string;
  count: number;
};

// Fetch chapter counts for a subject — used by subjects page
export async function fetchChapterCounts(subject: string, lang: "en" | "ta"): Promise<ChapterCount[]> {
  // Fetch just chapter column — lightweight, no question content
  const { data, error } = await supabase
    .from("questions")
    .select("chapter")
    .eq("subject", subject)
    .eq("lang", lang)
    .not("chapter", "is", null);

  if (error) throw error;

  const counts: Record<string, number> = {};
  for (const row of (data ?? [])) {
    const ch = row.chapter as string;
    counts[ch] = (counts[ch] ?? 0) + 1;
  }

  return Object.entries(counts)
    .map(([chapter, count]) => ({ chapter, count }))
    .sort((a, b) => a.chapter.localeCompare(b.chapter));
}

// Fetch questions for a specific level (offset + limit)
export async function fetchQuestionsForLevel(
  subject: string,
  chapter: string,
  lang: "en" | "ta",
  offset: number,
  limit: number
): Promise<Question[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("id, question, lang, options, correct_option, class, subject, chapter, topic, difficulty, source_type")
    .eq("subject", subject)
    .eq("chapter", chapter)
    .eq("lang", lang)
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return (data as Question[]) ?? [];
}
