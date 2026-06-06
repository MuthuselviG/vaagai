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
  is_archived: boolean;
  was_published: boolean;
  created_at: string;
};

export type CAQuestion = {
  id: string;
  question: string;
  lang: "en" | "ta";
  options: string[];
  correct_option: string;
  explanation: string | null;
  topic: string | null;
  subject: string | null;
  published_date: string;
  source_url: string | null;
  slug: string | null;
};

export type CAUnitMeta = {
  subject: string;
  count: number;
};

const CA_QUESTION_SELECT =
  "id, question, lang, options, correct_option, explanation, topic, subject, published_date, source_url, slug";

// ─── CURRENT AFFAIRS CONSTANTS ────────────────────────────

export const CA_UNIT_SUBJECTS: Record<string, string[]> = {
  "general-science":     ["General Science"],
  "geography":           ["Geography"],
  "indian-history":      ["History", "Indian National Movement"],
  "indian-polity":       ["Indian Polity"],
  "welfare-schemes":     ["Economy"],
  "archaeology-updates": ["Tamil Nadu History"],
};

export const CA_UNIT_LABELS: Record<string, { en: string; ta: string; icon: string }> = {
  "general-science":     { en: "General Science",          ta: "பொது அறிவியல்",                      icon: "🔬" },
  "geography":           { en: "Geography",                ta: "நிலவியல்",                           icon: "🌍" },
  "indian-history":      { en: "Indian History",           ta: "இந்திய வரலாறு",                      icon: "🏛️" },
  "indian-polity":       { en: "Indian Polity",            ta: "இந்திய அரசியல்",                     icon: "⚖️" },
  "welfare-schemes":     { en: "Welfare Schemes",          ta: "நலத்திட்டங்கள்",                     icon: "💰" },
  "archaeology-updates": { en: "TN History & Archaeology", ta: "தமிழ்நாடு வரலாறு & அகழ்வாராய்ச்சி", icon: "🏺" },
};

export const CA_UNIT_ORDER = [
  "general-science",
  "geography",
  "indian-history",
  "indian-polity",
  "welfare-schemes",
  "archaeology-updates",
];

// ─── HELPERS ──────────────────────────────────────────────

// Returns [firstDayOfMonth, firstDayOfNextMonth] for a "YYYY-MM" string.
// Used for date-range filtering (published_date is a DATE column, so LIKE won't work).
export function monthRange(month: string): { start: string; endExclusive: string } {
  const [y, m] = month.split("-").map(Number);
  const start = `${month}-01`;
  const nextMonth = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
  const endExclusive = `${nextMonth}-01`;
  return { start, endExclusive };
}

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
  paper: "tamil" | "general",
  lang: "en" | "ta" = "en"
): Promise<Question[]> {
  let query = supabase
    .from("questions")
    .select("id, question, lang, options, correct_option, explanation, class, subject, chapter, topic, difficulty, source_type")
    .contains("pyq_years", [year])
    .contains("pyq_groups", [group])
    .eq("source_type", "pyq")
    .limit(100);

  if (paper === "tamil") {
    query = query.eq("lang", "ta").eq("subject", "General Tamil");
  } else {
    query = query.eq("lang", lang).neq("subject", "General Tamil");
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

export async function fetchQuestionsForCADaily(date: string, lang: "en" | "ta"): Promise<Question[]> {
  const { data, error } = await supabase
    .from("current_affairs")
    .select("id, question, options, correct_option, explanation, topic")
    .eq("published_date", date)
    .eq("lang", lang)
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
    chapter: date,
    topic: r.topic,
    difficulty: null,
    source_type: "current_affairs",
  }));
}

export async function fetchQuestionsForCAMonthly(month: string, lang: "en" | "ta"): Promise<Question[]> {
  const { start, endExclusive } = monthRange(month);
  const { data, error } = await supabase
    .from("current_affairs")
    .select("id, question, options, correct_option, explanation, topic, published_date")
    .gte("published_date", start)
    .lt("published_date", endExclusive)
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

// ─── CURRENT AFFAIRS SEO FETCHES ─────────────────────────

export async function fetchCAForUnit(
  month: string,
  unitSlug: string,
  lang: "en" | "ta"
): Promise<CAQuestion[]> {
  const subjects = CA_UNIT_SUBJECTS[unitSlug];
  if (!subjects) return [];
  const { start, endExclusive } = monthRange(month);
  const { data, error } = await supabase
    .from("current_affairs")
    .select(CA_QUESTION_SELECT)
    .gte("published_date", start)
    .lt("published_date", endExclusive)
    .eq("lang", lang)
    .in("subject", subjects)
    .order("published_date", { ascending: true });
  if (error) {
    console.error(`[fetchCAForUnit] error:`, error);
    throw error;
  }
  console.log(`[fetchCAForUnit] month=${month} unit=${unitSlug} lang=${lang} count=${data?.length ?? 0}`);
  return (data ?? []) as CAQuestion[];
}

export async function fetchCAMonthlyUnitCounts(
  month: string,
  lang: "en" | "ta"
): Promise<CAUnitMeta[]> {
  const { start, endExclusive } = monthRange(month);
  const { data, error } = await supabase
    .from("current_affairs")
    .select("subject")
    .gte("published_date", start)
    .lt("published_date", endExclusive)
    .eq("lang", lang);
  if (error) {
    console.error(`[fetchCAMonthlyUnitCounts] error:`, error);
    throw error;
  }
  const counts: Record<string, number> = {};
  (data ?? []).forEach((r: any) => {
    if (r.subject) counts[r.subject] = (counts[r.subject] || 0) + 1;
  });
  console.log(`[fetchCAMonthlyUnitCounts] month=${month} counts=${JSON.stringify(counts)}`);
  return Object.entries(counts).map(([subject, count]) => ({ subject, count }));
}

export async function fetchCAMonthlyPreview(
  month: string,
  unitSlug: string,
  lang: "en" | "ta"
): Promise<CAQuestion[]> {
  const subjects = CA_UNIT_SUBJECTS[unitSlug];
  if (!subjects) return [];
  const { start, endExclusive } = monthRange(month);
  const { data, error } = await supabase
    .from("current_affairs")
    .select(CA_QUESTION_SELECT)
    .gte("published_date", start)
    .lt("published_date", endExclusive)
    .eq("lang", lang)
    .in("subject", subjects)
    .order("published_date", { ascending: true })
    .limit(2);
  if (error) throw error;
  return (data ?? []) as CAQuestion[];
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
    .eq("is_archived", false)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Pack[]) ?? [];
}

export async function fetchMyArchivedPacks(creatorId: string): Promise<Pack[]> {
  const { data, error } = await supabase
    .from("packs")
    .select("*")
    .eq("creator_id", creatorId)
    .eq("is_archived", true)
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

export async function archivePack(packId: string, wasPublished: boolean): Promise<void> {
  const { error } = await supabase
    .from("packs")
    .update({ is_archived: true, is_published: false })
    .eq("id", packId);
  if (error) throw error;
}

export async function unarchivePack(packId: string): Promise<void> {
  const { error } = await supabase
    .from("packs")
    .update({ is_archived: false })
    .eq("id", packId);
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
