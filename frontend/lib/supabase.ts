import { createClient } from "@supabase/supabase-js";
import { slugify } from "./slugify";

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
  "indian-history":      ["History", "Indian National Movement", "Indian History"],
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

export async function fetchQuestionsForPack(packId: string, lang: "en" | "ta" = "en"): Promise<Question[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("id, question, lang, options, correct_option, explanation, class, subject, chapter, topic, difficulty, source_type, pack_id, pack_order")
    .eq("pack_id", packId)
    .order("pack_order", { ascending: true });
  if (error) throw error;
  const rows = (data as Question[]) ?? [];

  // Packs may have questions in only one language (older packs) or both
  // (e.g. TVK). Prefer the requested language per question, falling back
  // to whichever language is available for that question.
  const byOrder = new Map<number, Question[]>();
  for (const row of rows) {
    const order = row.pack_order ?? 0;
    const group = byOrder.get(order);
    if (group) group.push(row);
    else byOrder.set(order, [row]);
  }

  return Array.from(byOrder.entries())
    .sort(([a], [b]) => a - b)
    .map(([, group]) => group.find((r) => r.lang === lang) ?? group[0]);
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

export async function fetchQuestionsForCAMonthly(month: string, lang: "en" | "ta", unitSlug?: string): Promise<Question[]> {
  const subjects = unitSlug ? CA_UNIT_SUBJECTS[unitSlug] : undefined;
  if (unitSlug && !subjects) return [];
  const { start, endExclusive } = monthRange(month);
  let query = supabase
    .from("current_affairs")
    .select("id, question, options, correct_option, explanation, topic, published_date")
    .gte("published_date", start)
    .lt("published_date", endExclusive)
    .eq("lang", lang);
  if (subjects) query = query.in("subject", subjects);
  const { data, error } = await query
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

export async function fetchVerifiedCreatorSlugs(): Promise<string[]> {
  const { data, error } = await supabase.from("creators").select("slug").eq("verified", true).not("slug", "is", null);
  if (error) throw error;
  return (data ?? []).map((row) => row.slug as string);
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

export async function fetchCAAvailableMonths(): Promise<string[]> {
  // We only need the date range, not the rows themselves: fetch the single
  // earliest and single latest published_date, then derive every month in
  // between in JS. Avoids Supabase's 1000-row-per-request cap entirely (a
  // plain unbounded select would only ever see the most recent month once
  // it alone exceeds that cap, hiding older months).
  const [
    { data: earliest, error: earliestError },
    { data: latest, error: latestError },
  ] = await Promise.all([
    supabase.from("current_affairs").select("published_date").order("published_date", { ascending: true }).limit(1),
    supabase.from("current_affairs").select("published_date").order("published_date", { ascending: false }).limit(1),
  ]);
  if (earliestError) throw earliestError;
  if (latestError) throw latestError;
  if (!earliest?.length || !latest?.length) return [];

  const MONTH_NAMES: Record<string, string> = {
    "01": "january", "02": "february", "03": "march",
    "04": "april", "05": "may", "06": "june",
    "07": "july", "08": "august", "09": "september",
    "10": "october", "11": "november", "12": "december",
  };

  const [minYear, minMonth] = earliest[0].published_date.slice(0, 7).split("-").map(Number);
  let [year, month] = latest[0].published_date.slice(0, 7).split("-").map(Number);

  const months: string[] = [];
  while (year > minYear || (year === minYear && month >= minMonth)) {
    months.push(`${MONTH_NAMES[String(month).padStart(2, "0")]}-${year}`);
    month -= 1;
    if (month === 0) {
      month = 12;
      year -= 1;
    }
  }
  return months;
}

// ─── ROHIT KALAI: CLASS 6 HISTORY (SAMACHEER KALVI) ────

export type ReadingQA = { id: string; question: string; explanation: string };
export type ReadingUnit = { topic: string; slug: string; questions: ReadingQA[] };

const ROHIT_KALAI_HISTORY_T1_PACK_ID = "a84ca4fc-efe7-45c8-b84d-47647d15cce8";
const ROHIT_KALAI_HISTORY_T2_PACK_ID = "7fd3ce12-6147-40cb-8b64-9cef49236935";

// Reading-only Q&A packs (no real MCQ options) — kept out of any generic
// practice/MCQ surface (homepage carousel, creator profile, pack detail).
// They're reachable only through the dedicated reading-list pages.
export const READING_ONLY_PACK_IDS = [ROHIT_KALAI_HISTORY_T1_PACK_ID, ROHIT_KALAI_HISTORY_T2_PACK_ID];

// pack_order is unpopulated for this pack; this list captures the original
// insertion sequence (matches the source textbook order) via ctid so the
// reading page stays in order even though individual rows may be edited later.
const ROHIT_KALAI_HISTORY_T1_ORDER: string[] = [
  "17f1c3a5-340d-434b-aaca-a8b22d3253c4", "c8d37c1e-8c34-468d-a794-5f4339f4f7fe",
  "c70036d7-9aa3-4c5b-818c-b45fd9aa12ca", "324d3216-3f77-4b4c-a7b5-6530c4a31445",
  "7bc8524d-12d1-4a5a-a308-2e539ca6b8df", "97e6626e-3398-424f-b199-ac13c55248ad",
  "57ae0427-15db-4592-976f-6628c12da6bd", "c38cc0a8-c08f-4bc0-ba60-1b6afe52debc",
  "3820a19c-3231-4512-bb15-ad8bb11b0578", "820a1651-89f8-4abf-acb0-3da3601dbd67",
  "e1a61754-fadc-4a44-9b81-a689b57793cb", "771e3575-5b15-47f1-8a72-246152fc47b4",
  "6358df20-33a0-424e-a0ac-1cdda68ff0f6", "bb7e13fe-8c78-44bf-86b9-9f401bfc1acb",
  "e96047b8-8076-4473-8e7f-8cf8a6008170", "f283537f-3b0f-4d50-a47d-0c246d21633d",
  "8ca87926-a41e-4cbc-9345-b8ea82399e64", "650ad706-0ea6-4fcc-be86-99af48597b97",
  "50bd5e6e-23ff-4e9f-b124-65c556cee2a0", "6698b83b-b952-44fe-aa27-3702fd053386",
  "5ed95abb-fbcc-4f1e-937a-a7b86bd04c1f", "ded07487-4a97-4063-8076-a2151d80e069",
  "35603519-4be7-4a67-9ae0-21815c4dd54f", "dbc613e6-ed80-405c-8671-428f93835789",
  "c131ae84-7a89-4a0b-9615-b15628eb9a13", "1ff0bf3f-1c7c-4388-8a2e-6def0313f702",
  "aa7cc4b2-4db6-4d31-ab33-e5a79cea71b4", "0dd6ca47-4820-4a23-aa8b-cdad28e3a612",
  "503c6cc2-3e66-44e5-958d-551b07d112cf", "5170613d-c1cf-400d-89be-8bd97da1da93",
  "9e6ff2d4-4af5-46f8-a828-1b040270e1f9", "502b20ae-6002-454a-b079-f107110f1d47",
  "f6b364ae-8650-4d35-8c32-35eaaf18bc19", "828fb15a-ab9a-458e-a09a-4aca71acca07",
  "b6d7b8ef-66ca-45b5-a37c-4647a743f145", "78f4243d-e762-42c9-ab87-21dd1aebe99f",
  "a13a4ed0-3d48-4440-952f-bb48152ae8ef", "98fb206d-c003-4793-b5d8-fe7e58306dd6",
  "369d5bcc-f114-4851-92c9-704dc3e28f3d", "d0eb6fb5-2a49-45ff-b09b-e2a3e781390b",
  "2c945135-a8f8-465d-a58b-17983e47c933", "fa599a14-c9bd-44cf-9073-ad0b2db0686e",
  "e29b6917-8117-4b69-b3d9-6c9f268d7861", "2b38392a-48ba-4bb2-8ad9-4dd6452d8206",
  "01f6ed42-4bb3-4ecf-9668-ce1177fcce6e", "15fb8d3e-da2a-45e4-b084-e79612a0ba20",
  "960a86d1-ca2d-4158-82f5-9b55337e6dbc", "d1794574-2614-40d9-b962-c2919ed80881",
  "84fc7411-37f6-46b1-9ed9-e6aff455fe38", "ce948671-375f-494d-a9ef-e122ae36c4da",
  "28e96f2a-72b4-4656-92d0-4dbd824ab68a", "d0a8197b-2397-48b3-a3ca-5d1d5ddca4eb",
  "2430f5e9-60bc-4907-84f6-1377fb07e08b", "6ecac944-7832-4e16-86e4-006910262ed6",
  "3369b2e2-b475-44ec-a681-cbaf927adcda", "fdc2a12b-78f0-437c-a362-759094fe14c7",
  "c7706f36-dd0a-4107-93a5-50012d01333e", "f0358fd8-4d79-4998-8397-753faf00c6b8",
  "dcc5e743-d0e2-4fde-96d2-9c425b179eb0", "8d8cded5-23ca-42d1-836f-c973ed75d8c5",
  "9982158b-8957-4d1c-9849-d5559576d8b0", "5d8cb87b-3051-44bc-876b-868403f6243c",
  "825e713f-9daf-4286-99f9-ad54a4b5640a", "1115e802-1860-4059-b672-a651ba302fab",
  "d4e829a9-dc21-4957-99c5-7c8e47416ae0", "355f40f3-6224-4dd3-ab21-354dcbedf30e",
  "af50028a-5dcd-418d-b7d2-1542d40cadc0", "d9c6ea46-dac7-40f7-ae48-4e8c4e557e8e",
  "f1c6a9dd-446c-4472-9980-f11acb896c74", "e0183802-d9fe-4e98-a4f9-438d3144d5b9",
  "347dd5c5-7ad2-4b7b-b624-961c8de5f49d", "ac397f4c-1891-4784-9d6b-257484695228",
  "44f5d3ed-cd31-4752-9817-61af510b7825", "0f170588-cbd0-48cf-9c06-791deeefa69a",
  "125ed4da-19d5-4b19-944d-c336b33b116c", "7b7147a5-e2e9-48b9-b8f3-0ebb48bed4bd",
  "b10b04a2-b3d2-479d-bc56-193003f1b29e", "822404f5-b8e7-4b7b-a3d1-b99467268837",
  "17b7028e-f052-4a7f-b208-ea207008d373", "ef6956ab-346e-4e34-8ead-77952cb1c3d4",
  "bc603282-de9e-4645-b6cb-fb9337c08598", "85c837fa-dc78-417e-9f58-974022ccca0b",
  "3914717c-4410-4f5e-813d-52e80c91352f", "e62d813f-dc51-4206-9d55-2cbf5a407392",
  "47d95fe6-b522-4e02-b2e2-bb96703bc0bf", "ac3e42db-f232-495d-a9fc-edcb578c3710",
  "1ec70d7c-30ac-4a7f-8df0-0b1a4ce24acb", "d2c1b056-f85e-4816-b9d0-8dc6d4a64358",
  "caf8bba9-5cb1-4981-9077-814d8db62cab", "461b9082-33c2-42f1-81ea-dbfb045815dd",
  "6c088303-aab8-4bb5-b9a4-0eafe3868a50", "e3b81a09-a1fb-45cc-83d9-6f49517db4b8",
  "51b82e07-2003-4f0c-940c-90a5db7751d5", "7ee2d3cd-3e25-4299-958d-ff9db97e8bab",
  "9651fee1-a477-4afe-930f-f0d801cfb09d", "6373f8b8-4267-415f-82dc-e249ee9e41cd",
  "69231232-0032-4ca1-8392-3f8b4806937e", "13da72f1-c639-4b3e-9585-f959d7212b4c",
  "e4b34c73-fb4e-4c14-8777-ca424de1d7c6", "2aa913a2-334f-4837-8914-cb5a8769f259",
  "059a38cc-bfcf-4a3d-b95b-a701320328f6", "268176d1-90a5-41f8-b0c1-bec6f71435b3",
  "ec65af0c-876c-431a-b5a2-85b7258eef07", "4a4b9b91-6772-4562-94f4-83a5530197af",
  "b7a64706-2c1a-4bf2-99a4-4f1194686d53", "419aee13-d752-411f-a4ac-a8367a1de5db",
  "23c0a870-c4de-41d5-82f8-c23ab676f7b1", "715ed237-b08b-4821-bca3-fd41b8c7bf8f",
  "a8d4f160-16d0-413b-bea0-237d24a7cec3", "8acfe9e6-8f72-46dc-9f69-1a74aa8cb0e3",
  "b9f45e3d-1ce0-4e41-8843-696767366ae2", "c56140d3-4825-47b4-b80a-1c60b93cd461",
  "64c0c214-a10c-4882-884f-9f02cba7f662", "f46e1331-a4ec-4dc7-a5dc-7da5ffcac524",
  "03ee345a-ff49-4ebe-8307-237a0b9c4129", "033a35a8-f231-4e00-891d-bce991e17b68",
  "c63d3787-800c-4a25-bf03-a8c69bd49a86", "c5bbc40d-f19d-4c61-bf45-4b30c9581bfc",
  "3f3997d4-bd1e-46aa-a7a0-b5cf183c23f5", "db739dfb-d8fa-4d37-857e-cadbdffe7e58",
  "e280fa32-74bf-42cc-a01f-c0ffda48dbf5", "d9bba6e5-d282-496e-acbf-35b5a38b84a4",
  "ef4ccb5f-3883-49d9-8983-d8e801de7af3", "399f2ec0-d78e-4b07-88b9-f7dd15acded8",
  "9e747663-af6a-4604-96cc-682b8ef532b0", "23dd6ba9-bb7c-4fde-84d8-a742939d7818",
  "c232103b-875d-4710-88a1-5c4c2613fe70", "fa1834ca-64a6-46c1-bef3-6883809f772b",
  "a426c072-d2dc-495f-98c5-eadc894b67ae", "728c5061-54f3-461f-a4ad-dd937c168a89",
  "9ff4d927-8502-4c43-90e9-8cf0020701fa", "a4a9af1c-b110-4e5d-9c4f-2d0590acc7aa",
  "af97949f-fab2-43af-9599-7af4110df9c1", "3621ccfe-0198-403b-a501-6cbca3eda388",
  "9e8ea1ff-0c8d-4723-8b74-557178ae36b1", "38c2ef85-8e78-4091-9b27-33ee8213a5ad",
  "b02c855d-83b3-4540-94cf-2301678fd6cd", "f0c86f06-55ac-4b6e-96c8-993d2ddb1227",
  "37d1e9bf-494e-4584-96ec-2e5d4043135f", "5988a554-3110-451e-a76a-e7bebe241a0d",
  "ac600108-98b5-4b30-853b-9dffd827506b", "fbc6e78f-34e9-420d-8e6e-6a6656c0ea76",
  "253e8fae-a2f0-45bf-add0-1b72f60eef08", "2dfd7bd0-1eaa-4acf-ac46-6223bd2dadce",
  "3f957f53-acc9-4f8a-850e-dd183f54e5f3", "2dac085e-8fe7-420e-9bc6-39a1d8b1a9d5",
  "5ba74ce0-f54c-4a87-a02f-2c90214ac10d", "086fabb4-53e3-4710-8f07-165decf023a8",
  "da81075f-43d1-41a4-a174-366062eca533", "a1de5b11-b952-4f75-b2dc-6655a408c2fb",
  "a64f7e82-88eb-42f2-8612-a2da849de761", "b948fffd-1079-4b91-8b47-3478879e9813",
  "98306798-a31a-495d-8412-fc2126781932", "3eb6a41a-20cd-4458-bd35-e7f855bb3a5f",
  "5b8cdc62-42f4-490c-bdbd-197e1ffa0716", "b10788c5-619e-44d5-9b38-c3efb8aa7e5c",
  "437b52a7-658f-4d16-9ad9-f013cfa7608f", "8ba5cba1-687d-448b-a219-feefccb94d09",
  "082aa7df-22d5-4eab-855a-ca401c3feb48", "0cfa3561-2839-4397-917e-5eca0f5b1483",
  "88bb4003-c5c1-4d3e-82ce-1acb380868a3", "e85def5a-a1c5-44f7-86d6-82c59e45e3c5",
  "d5e99ec5-aa14-4a32-a05b-23dae51d0e0a", "81678173-b41d-48d2-aa7e-3394dc05dcf0",
  "5c8721d2-928f-44da-ab88-a8b1aa45e82c", "4795754c-cf7c-4455-b6dd-db1228fee798",
];

export function sortByIdOrder<T extends { id: string }>(rows: T[], order: string[]): T[] {
  const index = new Map(order.map((id, i) => [id, i]));
  return [...rows].sort((a, b) => {
    const ai = index.get(a.id) ?? Infinity;
    const bi = index.get(b.id) ?? Infinity;
    return ai - bi;
  });
}

export async function fetchRohitKalaiClass6HistoryTerm1(): Promise<ReadingQA[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("id, question, explanation")
    .eq("pack_id", ROHIT_KALAI_HISTORY_T1_PACK_ID)
    .eq("lang", "ta")
    .eq("status", "approved");
  if (error) throw error;
  return sortByIdOrder((data ?? []) as ReadingQA[], ROHIT_KALAI_HISTORY_T1_ORDER);
}

// Groups already-ordered rows by their `topic` column, preserving first-seen
// order. Rows with no topic are dropped — a unit only exists once it's tagged.
function groupByTopic(rows: (ReadingQA & { topic: string | null })[]): ReadingUnit[] {
  const order: string[] = [];
  const groups = new Map<string, ReadingQA[]>();
  for (const { topic, ...q } of rows) {
    if (!topic) continue;
    if (!groups.has(topic)) {
      order.push(topic);
      groups.set(topic, []);
    }
    groups.get(topic)!.push(q);
  }
  return order.map((topic) => ({ topic, slug: slugify(topic), questions: groups.get(topic)! }));
}

// Next.js passes dynamic route params percent-encoded, unlike URLSearchParams —
// decode before comparing against a slug derived straight from `topic` text.
export function findUnitBySlug(units: ReadingUnit[], rawSlug: string): ReadingUnit | undefined {
  return units.find((u) => u.slug === decodeURIComponent(rawSlug));
}

export async function fetchRohitKalaiClass6HistoryTerm1Units(): Promise<ReadingUnit[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("id, question, explanation, topic")
    .eq("pack_id", ROHIT_KALAI_HISTORY_T1_PACK_ID)
    .eq("lang", "ta")
    .eq("status", "approved");
  if (error) throw error;
  const sorted = sortByIdOrder(
    (data ?? []) as (ReadingQA & { topic: string | null })[],
    ROHIT_KALAI_HISTORY_T1_ORDER
  );
  return groupByTopic(sorted);
}

export async function fetchRohitKalaiClass6HistoryTerm2Units(): Promise<ReadingUnit[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("id, question, explanation, topic")
    .eq("pack_id", ROHIT_KALAI_HISTORY_T2_PACK_ID)
    .eq("lang", "ta")
    .eq("status", "approved")
    .order("pack_order", { ascending: true });
  if (error) throw error;
  return groupByTopic((data ?? []) as (ReadingQA & { topic: string | null })[]);
}
