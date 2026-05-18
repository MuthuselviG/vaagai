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
  explanation: string | null;
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

export async function fetchChapterCounts(subject: string, lang: "en" | "ta"): Promise<ChapterCount[]> {
  const effectiveLang = subject === "Tamil" ? "ta" : lang;

  const { data, error } = await supabase.rpc("get_chapter_counts", {
    p_subject: subject,
    p_lang: effectiveLang,
  });

  if (error) throw error;

  return (data as ChapterCount[])
    .sort((a, b) => a.chapter.localeCompare(b.chapter));
}

export async function fetchQuestionsForLevel(
  subject: string,
  chapter: string,
  lang: "en" | "ta",
  offset: number,
  limit: number
): Promise<Question[]> {
  const effectiveLang = subject === "Tamil" ? "ta" : lang;

  const { data, error } = await supabase
    .from("questions")
    .select("id, question, lang, options, correct_option, explanation, class, subject, chapter, topic, difficulty, source_type")
    .eq("subject", subject)
    .eq("chapter", chapter)
    .eq("lang", effectiveLang)
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return (data as Question[]) ?? [];
}

export async function fetchQuestionsForPYQ(
  year: number,
  group: string,
  paper: "tamil" | "general"
): Promise<Question[]> {
  const lang = paper === "tamil" ? "ta" : "en";

  const { data, error } = await supabase
    .from("questions")
    .select("id, question, lang, options, correct_option, explanation, class, subject, chapter, topic, difficulty, source_type")
    .contains("pyq_years", [year])
    .eq("lang", lang)
    .eq("source_type", "pyq")
    .limit(100);

  if (error) throw error;
  return (data as Question[]) ?? [];
}

// NEW — fetch questions for a creator pack
export async function fetchQuestionsForPack(packId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("id, question, lang, options, correct_option, explanation, class, subject, chapter, topic, difficulty, source_type")
    .eq("pack_id", packId)
    .order("pack_order", { ascending: true });

  if (error) throw error;
  return (data as Question[]) ?? [];
}
