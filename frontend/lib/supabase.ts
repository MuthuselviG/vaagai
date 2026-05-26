import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── TYPES ───────────────────────────────────────────────

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
  pack_id?: string | null;
  pack_order?: number | null;
  creator_id?: string | null;
};

export type ChapterCount = {
  chapter: string;
  count: number;
};

export type Creator = {
  id: string;
  user_id: string | null;
  name: string;
  bio: string | null;
  photo_url: string | null;
  slug: string | null;
  type: "individual" | "academy";
  verified: boolean;
  section: "vazhikatti" | "buddies";
  accent_color: string;
  tagline: string | null;
  social_youtube: string | null;
  social_instagram: string | null;
  social_telegram: string | null;
  created_at: string;
};

export type Pack = {
  id: string;
  creator_id: string;
  name: string;
  description: string | null;
  subject: string | null;
  exams: string[] | null;
  lang: "en" | "ta" | "both";
  question_count: number;
  avg_rating: number;
  rating_count: number;
  is_published: boolean;
  is_free: boolean;
  created_at: string;
};

// ─── QUESTION FETCHES ─────────────────────────────────────

export async function fetchChapterCounts(subject: string, lang: "en" | "ta"): Promise<ChapterCount[]> {
  const effectiveLang = subject === "Tamil" ? "ta" : lang;
  const { data, error } = await supabase.rpc("get_chapter_counts", {
    p_subject: subject,
    p_lang: effectiveLang,
  });
  if (error) throw error;
  return (data as ChapterCount[]).sort((a, b) => a.chapter.localeCompare(b.chapter));
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
  let query = supabase
    .from("questions")
    .select("id, question, lang, options, correct_option, explanation, class, subject, chapter, topic, difficulty, source_type")
    .contains("pyq_years", [year])
    .contains("pyq_groups", [group])
    .eq("source_type", "pyq")
    .limit(100);

  if (paper === "tamil") {
    // Tamil eligibility paper — Tamil language, subject = General Tamil
    query = query.eq("lang", "ta").eq("subject", "General Tamil");
  } else {
    // General Studies paper — English language, exclude General Tamil
    query = query.eq("lang", "en").neq("subject", "General Tamil");
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as Question[]) ?? [];
}

export async function fetchQuestionsForPack(packId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("id, question, lang, options, correct_option, explanation, class, subject, chapter, topic, difficulty, source_type, pack_id, pack_order")
    .eq("pack_id", packId)
    .order("pack_order", { ascending: true });
  if (error) throw error;
  return (data as Question[]) ?? [];
}

// Fetch current affairs for a specific date (daily practice)
export async function fetchQuestionsForCADaily(date: string, lang: "en" | "ta"): Promise<Question[]> {
  const { data, error } = await supabase
    .from("current_affairs")
    .select("id, question, options, correct_option, explanation, topic")
    .eq("published_date", date)
    .eq("lang", lang)
    .order("created_at", { ascending: true });
  if (error) throw error;
  // Map to Question type
  return (data ?? []).map((r: any) => ({
    id: r.id,
    question: r.question,
    lang,
    options: r.options,
    correct_option: r.correct_option,
    explanation: r.explanation,
    class: null,
    subject: "Current Affairs",
    chapter: date,
    topic: r.topic,
    difficulty: null,
    source_type: "current_affairs",
  }));
}

// Fetch current affairs for a full month (monthly practice)
export async function fetchQuestionsForCAMonthly(month: string, lang: "en" | "ta"): Promise<Question[]> {
  const start = month + "-01";
  const end = month + "-31";
  const { data, error } = await supabase
    .from("current_affairs")
    .select("id, question, options, correct_option, explanation, topic, published_date")
    .gte("published_date", start)
    .lte("published_date", end)
    .eq("lang", lang)
    .order("published_date", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.id,
    question: r.question,
    lang,
    options: r.options,
    correct_option: r.correct_option,
    explanation: r.explanation,
    class: null,
    subject: "Current Affairs",
    chapter: r.published_date,
    topic: r.topic,
    difficulty: null,
    source_type: "current_affairs",
  }));
}

export async function fetchQuestionsForMock(year: number): Promise<Question[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("id, question, lang, options, correct_option, explanation, class, subject, chapter, topic, difficulty, source_type")
    .contains("pyq_years", [year])
    .contains("pyq_groups", ["group4"])
    .eq("lang", "ta")
    .eq("source_type", "pyq")
    .limit(200);
  if (error) throw error;
  return (data as Question[]) ?? [];
}

// ─── CREATOR FUNCTIONS ────────────────────────────────────

export async function fetchMyCreatorProfile(): Promise<Creator | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("creators")
    .select("*")
    .eq("user_id", user.id)
    .single();
  if (error || !data) return null;
  return data as Creator;
}

export async function createCreatorRow(
  userId: string,
  name: string,
  section: "vazhikatti" | "buddies"
): Promise<void> {
  const { data: slugData, error: slugError } = await supabase
    .rpc("generate_creator_slug", { base_name: name });
  if (slugError) throw slugError;
  const { error } = await supabase.from("creators").insert({
    user_id: userId,
    name: name,
    slug: slugData as string,
    section: section,
    type: "individual",
    verified: false,
  });
  if (error) throw error;
}

// ─── PACK FUNCTIONS ───────────────────────────────────────

export async function fetchMyPacks(creatorId: string): Promise<Pack[]> {
  const { data, error } = await supabase
    .from("packs")
    .select("*")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Pack[]) ?? [];
}

export async function createPack(pack: {
  creator_id: string;
  name: string;
  description: string;
  subject: string;
  exams: string[];
  lang: "en" | "ta" | "both";
}): Promise<Pack> {
  const { data, error } = await supabase
    .from("packs")
    .insert({ ...pack, is_published: false, is_free: true, question_count: 0 })
    .select()
    .single();
  if (error) throw error;
  return data as Pack;
}

export async function unpublishPack(packId: string): Promise<void> {
  const { error } = await supabase.from("packs").update({ is_published: false }).eq("id", packId);
  if (error) throw error;
}

export async function publishPack(packId: string): Promise<void> {
  const { error } = await supabase.from("packs").update({ is_published: true }).eq("id", packId);
  if (error) throw error;
}

export async function updatePackQuestionCount(packId: string, count: number): Promise<void> {
  const { error } = await supabase.from("packs").update({ question_count: count }).eq("id", packId);
  if (error) throw error;
}

export async function insertPackQuestions(questions: Omit<Question, "id">[]): Promise<void> {
  const { error } = await supabase.from("questions").insert(questions);
  if (error) throw error;
}

export async function updateQuestion(
  questionId: string,
  updates: Partial<Pick<Question, "question" | "options" | "correct_option" | "explanation">>
): Promise<void> {
  const { error } = await supabase.from("questions").update(updates).eq("id", questionId);
  if (error) throw error;
}

export async function deleteQuestion(questionId: string): Promise<void> {
  const { error } = await supabase.from("questions").delete().eq("id", questionId);
  if (error) throw error;
}

// ─── ADMIN FUNCTIONS ──────────────────────────────────────

export async function fetchAllCreators(): Promise<Creator[]> {
  const { data, error } = await supabase.from("creators").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Creator[]) ?? [];
}

export async function fetchAllPacks(): Promise<(Pack & { creator_name: string })[]> {
  const { data, error } = await supabase.from("packs").select("*, creators(name)").order("created_at", { ascending: false });
  if (error) throw error;
  return (data as (Pack & { creator_name: string })[]) ?? [];
}

export async function verifyCreator(creatorId: string): Promise<void> {
  const { error } = await supabase.from("creators").update({ verified: true }).eq("id", creatorId);
  if (error) throw error;
}
