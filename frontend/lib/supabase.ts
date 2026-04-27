import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Question = {
  id: string;
  question: string;
  lang: "en" | "ta";
  options: string[];           // array: ["option1", "option2", "option3", "option4"]
  correct_option: string;      // full text of correct option
  class: number | null;
  subject: string;
  chapter: string | null;
  topic: string | null;
  difficulty: "easy" | "medium" | "hard";
  source_type: string | null;
};

export async function fetchQuestions(subject: string, lang: "en" | "ta", limit = 10): Promise<Question[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("id, question, lang, options, correct_option, class, subject, chapter, topic, difficulty, source_type")
    .eq("subject", subject)
    .eq("lang", lang)
    .limit(limit);

  if (error) throw error;
  return (data as Question[]) ?? [];
}
