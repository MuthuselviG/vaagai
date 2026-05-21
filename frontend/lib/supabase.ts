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

export async function fetchQuestionsForPack(packId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("id, question, lang, options, correct_option, explanation, class, subject, chapter, topic, difficulty, source_type, pack_id, pack_order")
    .eq("pack_id", packId)
    .order("pack_order", { ascending: true });
  if (error) throw error;
  return (data as Question[]) ?? [];
}

// ─── CREATOR FUNCTIONS ────────────────────────────────────

// Get creator row for the logged-in user
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

// Create creator row during onboarding (unverified)
export async function createCreatorRow(
  userId: string,
  name: string,
  section: "vazhikatti" | "buddies"
): Promise<void> {
  // Generate slug via DB function
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

// Get all packs for the logged-in creator
export async function fetchMyPacks(creatorId: string): Promise<Pack[]> {
  const { data, error } = await supabase
    .from("packs")
    .select("*")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Pack[]) ?? [];
}

// Create a new pack
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

// Unpublish a pack (creator side)
export async function unpublishPack(packId: string): Promise<void> {
  const { error } = await supabase
    .from("packs")
    .update({ is_published: false })
    .eq("id", packId);
  if (error) throw error;
}

// Publish a pack
export async function publishPack(packId: string): Promise<void> {
  const { error } = await supabase
    .from("packs")
    .update({ is_published: true })
    .eq("id", packId);
  if (error) throw error;
}

// Update pack question_count after upload
export async function updatePackQuestionCount(packId: string, count: number): Promise<void> {
  const { error } = await supabase
    .from("packs")
    .update({ question_count: count })
    .eq("id", packId);
  if (error) throw error;
}

// Bulk insert questions for a pack
export async function insertPackQuestions(questions: Omit<Question, "id">[]): Promise<void> {
  const { error } = await supabase.from("questions").insert(questions);
  if (error) throw error;
}

// Update a single question
export async function updateQuestion(
  questionId: string,
  updates: Partial<Pick<Question, "question" | "options" | "correct_option" | "explanation">>
): Promise<void> {
  const { error } = await supabase
    .from("questions")
    .update(updates)
    .eq("id", questionId);
  if (error) throw error;
}

// Delete a single question
export async function deleteQuestion(questionId: string): Promise<void> {
  const { error } = await supabase
    .from("questions")
    .delete()
    .eq("id", questionId);
  if (error) throw error;
}

// ─── ADMIN FUNCTIONS ──────────────────────────────────────

// Get all creators (admin only)
export async function fetchAllCreators(): Promise<Creator[]> {
  const { data, error } = await supabase
    .from("creators")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Creator[]) ?? [];
}

// Get all packs with creator name (admin only)
export async function fetchAllPacks(): Promise<(Pack & { creator_name: string })[]> {
  const { data, error } = await supabase
    .from("packs")
    .select("*, creators(name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as (Pack & { creator_name: string })[]) ?? [];
}

// Verify a creator (admin only — requires service role in real impl)
export async function verifyCreator(creatorId: string): Promise<void> {
  const { error } = await supabase
    .from("creators")
    .update({ verified: true })
    .eq("id", creatorId);
  if (error) throw error;
}
