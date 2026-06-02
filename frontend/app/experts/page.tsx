"use client";

import { createClient } from "@supabase/supabase-js";
import { useMemo, useState, useEffect } from "react";
import LangToggle from "../../components/LangToggle";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);


interface Creator {
  id: string;
  type: "academy" | "individual";
  name: string;
  tagline?: string;
  bio?: string;
  logoEmoji?: string;
  accentColor: string;
  headerBg?: string;
  logoBg?: string;
  verified?: boolean;
  exams: string[];
  subjects: string[];
  slug: string;
  youtubeUrl?: string;
  instagramUrl?: string;
  telegramUrl?: string;
  packCount?: number;
  questionCount?: number;
  section?: string;
}

const SECTION_vazhikaati = "vazhikaati";
const SECTION_BUDDIES = "study_buddy";

const ACCENT_MAP: Record<string, string> = {
  yellow: "#F59E0B",
  coral: "#F43F5E",
  blue: "#0284C7",
  green: "#10B981",
  purple: "#7C3AED",
  red: "#EF4444",
  orange: "#F97316",
  pink: "#EC4899",
};

function resolveAccent(color: string): string {
  return ACCENT_MAP[color] ?? color;
}

function isDark(hex: string): boolean {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 0.5;
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
}


function mapRowToCreator(row: Record<string, unknown>): Creator {
  const rawType = (row.type as string | null) ?? "";
  const resolvedType: "academy" | "individual" =
    rawType === "academy" ? "academy" : "individual";

  const packs = (row.packs as Array<{ id: string; question_count: number; is_published: boolean }> | null) ?? [];
  const publishedPacks = packs.filter((p) => p.is_published);

  return {
    id: (row.id as string) ?? "",
    type: resolvedType,
    name: (row.name as string) ?? "",
    tagline: (row.tagline as string | null) ?? undefined,
    bio: (row.bio as string | null) ?? undefined,
    logoEmoji: (row.logo_emoji as string | null) ?? undefined,
    accentColor: resolveAccent((row.accent_color as string) ?? "blue"),
    headerBg: (row.header_bg as string | null) ?? undefined,
    logoBg: (row.logo_bg as string | null) ?? undefined,
    verified: (row.verified as boolean | null) ?? false,
    exams: (row.exams as string[] | null) ?? [],
    subjects: (row.subjects as string[] | null) ?? [],
    slug: (row.slug as string) ?? "",
    youtubeUrl: (row.social_youtube as string | null) ?? undefined,
    instagramUrl: (row.social_instagram as string | null) ?? undefined,
    telegramUrl: (row.social_telegram as string | null) ?? undefined,
    packCount: publishedPacks.length,
    questionCount: publishedPacks.reduce((sum, p) => sum + (p.question_count || 0), 0),
    section: (row.section as string | null) ?? undefined,
  };
}

/* ─────────────────────────── Icons ─────────────────────────── */

const YtIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const IgIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const TgIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);


function SocialButtons({
  youtubeUrl,
  instagramUrl,
  telegramUrl,
  dark = false,
}: {
  youtubeUrl?: string;
  instagramUrl?: string;
  telegramUrl?: string;
  dark?: boolean;
}) {
  const btn = (
    bg: string,
    color: string,
    border?: string
  ): React.CSSProperties => ({
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: dark ? hexToRgba("#ffffff", 0.2) : bg,
    color: dark ? "#fff" : color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    border: dark ? "none" : border ?? "none",
    flexShrink: 0,
  });
  return (
    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
      {youtubeUrl && (
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={btn("#FFF0F0", "#FF0000", "1px solid rgba(255,0,0,0.15)")}
        >
          <YtIcon />
        </a>
      )}
      {instagramUrl && (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={btn("#FFF0F5", "#E1306C", "1px solid rgba(225,48,108,0.15)")}
        >
          <IgIcon />
        </a>
      )}
      {telegramUrl && (
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={btn("#F0F8FF", "#0088cc", "1px solid rgba(0,136,204,0.15)")}
        >
          <TgIcon />
        </a>
      )}
    </div>
  );
}


function TagsRow({ tags, accent }: { tags: string[]; accent: string }) {
  if (tags.length === 0) return null;
  const accentIdx = tags.length - 1;
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap" as const,
        gap: 7,
        padding: "10px 14px 0 14px",
      }}
    >
      {tags.map((t, i) => (
        <span
          key={t}
          style={{
            background: i === accentIdx ? accent : "#F1F5F9",
            color: i === accentIdx ? "#fff" : "#475569",
            fontSize: 11,
            fontWeight: 700,
            padding: "4px 11px",
            borderRadius: 6,
            border: i === accentIdx ? "none" : "1px solid #E2E8F0",
            letterSpacing: "0.5px",
            textTransform: "uppercase" as const,
          }}
        >
          {t}
        </span>
      ))}
    </div>
  );
}


function StatsRow({
  packCount,
  questionCount,
  slug,
  isBuddiesTab,
  lang,
}: {
  packCount?: number;
  questionCount?: number;
  slug: string;
  isBuddiesTab: boolean;
  lang: "en" | "ta";
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 14px 14px",
      }}
    >
      <div style={{ display: "flex", gap: 22 }}>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 800,
              color: "#0F172A",
              lineHeight: 1,
            }}
          >
            {packCount ?? 0}
          </p>
          <p
            style={{
              margin: "3px 0 0",
              fontSize: 10,
              fontWeight: 700,
              color: "#94A3B8",
              letterSpacing: "0.6px",
              textTransform: "uppercase" as const,
            }}
          >
            {lang === "ta" ? "தொகுப்புகள்" : "PACKS"}
          </p>
        </div>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 800,
              color: "#0F172A",
              lineHeight: 1,
            }}
          >
            {questionCount ?? 0}
          </p>
          <p
            style={{
              margin: "3px 0 0",
              fontSize: 10,
              fontWeight: 700,
              color: "#94A3B8",
              letterSpacing: "0.6px",
              textTransform: "uppercase" as const,
            }}
          >
            {lang === "ta" ? "கேள்விகள்" : "QUESTIONS"}
          </p>
        </div>
      </div>
      <a
        href={"/experts/" + slug}
        style={{
          background: "#1B2E4B",
          color: "#fff",
          borderRadius: 12,
          padding: "11px 22px",
          fontSize: 14,
          fontWeight: 700,
          textDecoration: "none",
          display: "inline-block",
          letterSpacing: "-0.1px",
        }}
      >
        {lang === "ta" ? "காண்க →" : "View →"}
      </a>
    </div>
  );
}


function VerifiedBadge() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: -3,
        right: -3,
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: "#22C55E",
        border: "2.5px solid #fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
        <path
          d="M2 6l3 3 5-5"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}


const cardShell: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  border: "1px solid #E8ECF4",
  overflow: "hidden",
  marginBottom: 14,
  boxShadow:
    "0 1px 6px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)",
  fontFamily: "'Inter', -apple-system, sans-serif",
};

const dividerStyle: React.CSSProperties = {
  height: 1,
  background: "#F1F5F9",
  margin: "12px 14px 0",
};


function IndividualCard({ creator, lang }: { creator: Creator; lang: "en" | "ta" }) {
  const accent = creator.accentColor;

  const initials = creator.name
    .split(" ")
    .map((w: string) => w[0] ?? "")
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const tags = [...creator.exams, ...creator.subjects];
  const baseText = creator.bio ?? creator.tagline;
  const guideLabel = lang === "ta" ? "வழிகாட்டி" : "Guide";
  const subtitle = baseText ? baseText + " · " + guideLabel : guideLabel;

  return (
    <div style={{ ...cardShell, borderTop: "3.5px solid " + accent }}>
      {/* Header row */}
      <div
        style={{
          padding: "14px 14px 0 14px",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        {/* Avatar */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              background: accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: creator.logoEmoji ? 26 : 20,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.5px",
            }}
          >
            {creator.logoEmoji ? (
              <span>{creator.logoEmoji}</span>
            ) : (
              initials
            )}
          </div>
          {creator.verified && <VerifiedBadge />}
        </div>

        {/* Name + subtitle */}
        <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
          <p
            style={{
              margin: 0,
              fontSize: 15.5,
              fontWeight: 800,
              color: "#0F172A",
              lineHeight: 1.2,
              letterSpacing: "-0.2px",
            }}
          >
            {creator.name}
          </p>
          <p
            style={{
              margin: "3px 0 0",
              fontSize: 12.5,
              color: "#64748B",
              lineHeight: 1.4,
              fontWeight: 500,
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* Social buttons */}
        <div style={{ paddingTop: 4, flexShrink: 0 }}>
          <SocialButtons
            youtubeUrl={creator.youtubeUrl}
            instagramUrl={creator.instagramUrl}
            telegramUrl={creator.telegramUrl}
          />
        </div>
      </div>

      <TagsRow tags={tags} accent={accent} />
      <div style={dividerStyle} />
      <StatsRow packCount={creator.packCount} questionCount={creator.questionCount} slug={creator.slug} isBuddiesTab={false} lang={lang} />
    </div>
  );
}

function AcademyCard({ creator, lang }: { creator: Creator; lang: "en" | "ta" }) {
  const accent = creator.accentColor;
  const headerBg = creator.headerBg ?? accent;
  const onDark = isDark(headerBg);
  const tags = [...creator.exams, ...creator.subjects];

  return (
    <div style={{ ...cardShell, borderTop: "3.5px solid " + accent }}>
      <div
        style={{
          background: headerBg,
          padding: "14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 14,
            flexShrink: 0,
            background: creator.logoBg ?? hexToRgba("#ffffff", 0.22),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          {creator.logoEmoji ?? creator.name[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 800,
              lineHeight: 1.2,
              color: onDark ? "#fff" : "#0F172A",
            }}
          >
            {creator.name}
          </p>
          {creator.tagline && (
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 12,
                color: onDark
                  ? hexToRgba("#ffffff", 0.78)
                  : "#475569",
              }}
            >
              {creator.tagline}
            </p>
          )}
        </div>
        <SocialButtons
          youtubeUrl={creator.youtubeUrl}
          instagramUrl={creator.instagramUrl}
          telegramUrl={creator.telegramUrl}
          dark
        />
      </div>

      {creator.bio && (
        <div style={{ padding: "11px 14px 0 14px" }}>
          <p
            style={{
              margin: 0,
              fontSize: 12.5,
              color: "#475569",
              lineHeight: 1.6,
              borderLeft: "3px solid " + hexToRgba(accent, 0.35),
              paddingLeft: 9,
            }}
          >
            {creator.bio}
          </p>
        </div>
      )}

      <TagsRow tags={tags} accent={accent} />
      <div style={dividerStyle} />
      <StatsRow packCount={creator.packCount} questionCount={creator.questionCount} slug={creator.slug} isBuddiesTab={false} lang={lang} />
    </div>
  );
}


function StudyBuddyCard({ creator, lang }: { creator: Creator; lang: "en" | "ta" }) {
  const accent = creator.accentColor;
  const initials = creator.name
    .split(" ")
    .map((w: string) => w[0] ?? "")
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const tags = [...creator.exams, ...creator.subjects];
  const baseText = creator.bio ?? creator.tagline;

  return (
    <div style={{ ...cardShell, borderTop: "3.5px solid " + accent }}>
      <div
        style={{
          padding: "14px 14px 0 14px",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        {/* Tinted avatar */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              background: hexToRgba(accent, 0.13),
              border: "2px solid " + hexToRgba(accent, 0.45),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: creator.logoEmoji ? 26 : 20,
              fontWeight: 800,
              color: accent,
              letterSpacing: "-0.5px",
            }}
          >
            {creator.logoEmoji ? (
              <span>{creator.logoEmoji}</span>
            ) : (
              initials
            )}
          </div>
          {creator.verified && <VerifiedBadge />}
        </div>

        <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexWrap: "wrap" as const,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 15.5,
                fontWeight: 800,
                color: "#0F172A",
                lineHeight: 1.2,
                letterSpacing: "-0.2px",
              }}
            >
              {creator.name}
            </p>
            <span
              style={{
                background: hexToRgba(accent, 0.12),
                color: accent,
                fontSize: 9,
                fontWeight: 800,
                padding: "2px 7px",
                borderRadius: 5,
                letterSpacing: "0.5px",
                textTransform: "uppercase" as const,
                flexShrink: 0,
              }}
            >
              {lang === "ta" ? "படிப்பு தோழர்" : "Study Buddy"}
            </span>
          </div>
          {baseText && (
            <p
              style={{
                margin: "3px 0 0",
                fontSize: 12.5,
                color: "#64748B",
                lineHeight: 1.4,
                fontWeight: 500,
              }}
            >
              {baseText}
            </p>
          )}
        </div>

        <div style={{ paddingTop: 4, flexShrink: 0 }}>
          <SocialButtons
            youtubeUrl={creator.youtubeUrl}
            instagramUrl={creator.instagramUrl}
            telegramUrl={creator.telegramUrl}
          />
        </div>
      </div>

      <TagsRow tags={tags} accent={accent} />
      <div style={dividerStyle} />
      <StatsRow packCount={creator.packCount} questionCount={creator.questionCount} slug={creator.slug} isBuddiesTab={true} lang={lang} />
    </div>
  );
}

function CreatorCard({
  creator,
  isBuddiesTab,
  lang,
}: {
  creator: Creator;
  isBuddiesTab: boolean;
  lang: "en" | "ta";
}) {
  if (isBuddiesTab) return <StudyBuddyCard creator={creator} lang={lang} />;
  if (creator.type === "academy") return <AcademyCard creator={creator} lang={lang} />;
  return <IndividualCard creator={creator} lang={lang} />;
}

/* ─────────────────────────── Empty / Loading / Error states ─────────────────────────── */

function EmptyState({ message }: { message?: string }) {
  return (
    <div
      style={{
        padding: "48px 0",
        textAlign: "center",
        color: "#94A3B8",
        fontSize: 14,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {message ?? "யாரும் கிடைக்கவில்லை."}
    </div>
  );
}

function LoadingState() {
  return (
    <p
      style={{
        color: "#94A3B8",
        fontSize: 14,
        textAlign: "center",
        padding: "48px 0",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      ஏற்றுகிறது...
    </p>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <p
      style={{
        color: "#EF4444",
        fontSize: 14,
        textAlign: "center",
        padding: "48px 0",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {message}
    </p>
  );
}


type TabKey = "vazhikaati" | "buddies";

export default function ExpertsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("vazhikaati");
  const [search, setSearch] = useState("");
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "ta">("ta");

  useEffect(() => {
    const stored = localStorage.getItem("mcqpalagu_lang");
    if (stored === "en" || stored === "ta") setLang(stored);
  }, []);

  function handleLangChange(l: "en" | "ta") {
    setLang(l);
    localStorage.setItem("mcqpalagu_lang", l);
  }

  useEffect(() => {
    async function fetchCreators() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from("creators")
          .select("*, packs(id, question_count, is_published)");
        if (fetchError) {
          setError(fetchError.message);
          return;
        }
        setCreators((data ?? []).map(mapRowToCreator));
      } catch (err) {
        setError("தரவு ஏற்றுவதில் பிழை ஏற்பட்டது.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCreators();
  }, []);

  // Filter by active tab section + search query
  const filteredCreators = useMemo(() => {
    const sectionValue =
      activeTab === "vazhikaati" ? SECTION_vazhikaati : SECTION_BUDDIES;
    const q = search.toLowerCase().trim();
    return creators.filter((c) => {
      if ((c.section ?? "").trim() !== sectionValue) return false;
      // Match search query
      if (q) {
        const haystack = [
          c.name,
          c.tagline ?? "",
          c.bio ?? "",
          ...c.subjects,
          ...c.exams,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      }
      return true;
    });
  }, [creators, activeTab, search]);

  // Split vazhikaati tab into academies and individuals
  const academies = useMemo(
    () => filteredCreators.filter((c) => c.type === "academy"),
    [filteredCreators]
  );
  const individuals = useMemo(
    () => filteredCreators.filter((c) => c.type === "individual"),
    [filteredCreators]
  );

  const tabBase: React.CSSProperties = {
    flex: 1,
    textAlign: "center",
    cursor: "pointer",
    border: "none",
    background: "transparent",
    fontFamily: "'Inter', -apple-system, sans-serif",
    padding: "14px 0 0 0",
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 800,
    color: "#94A3B8",
    letterSpacing: "1.6px",
    textTransform: "uppercase",
    margin: "0 0 10px 0",
    fontFamily: "'Inter', sans-serif",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#EEEEF6",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 2 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px" }}>
            {lang === "ta" ? "நிபுணர்கள்" : "Experts"}
          </h1>
          <LangToggle lang={lang} setLang={handleLangChange} />
        </div>
        <p style={{ margin: "0 0 20px", fontSize: 14, color: "#64748B" }}>
          {lang === "ta" ? "சிறந்தவர்களிடம் கற்றுக்கொள்ளுங்கள் 🔥" : "Learn from the best 🔥"}
        </p>

        {/* Search bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#fff",
            borderRadius: 14,
            border: "1px solid #E2E8F0",
            padding: "11px 15px",
            marginBottom: 20,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="2"
            viewBox="0 0 24 24"
            style={{ flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            style={{
              border: "none",
              outline: "none",
              fontSize: 14,
              color: "#334155",
              width: "100%",
              background: "transparent",
              fontFamily: "inherit",
            }}
            placeholder={
              activeTab === "vazhikaati"
                ? (lang === "ta" ? "படைப்பாளர்கள் அல்லது தொகுப்பைத் தேடுங்கள்" : "Search creators or packs...")
                : (lang === "ta" ? "படிப்பு நண்பரை தேடுங்கள்..." : "Search study buddies...")
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Tab switcher */}
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            border: "1px solid #E2E8F0",
            marginBottom: 24,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex" }}>
            <button
              onClick={() => {
                setActiveTab("vazhikaati");
                setSearch("");
              }}
              style={{
                ...tabBase,
                color: activeTab === "vazhikaati" ? "#0F172A" : "#94A3B8",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: "-0.2px",
                  marginBottom: 1,
                }}
              >
                {lang === "ta" ? "வழிகாட்டி" : "Guides"}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  marginBottom: 11,
                  color:
                    activeTab === "vazhikaati" ? "#475569" : "#CBD5E1",
                }}
              >
                {lang === "ta" ? "ஆசிரியர்கள் & நிபுணர்கள்" : "Teachers & Experts"}
              </div>
              <div
                style={{
                  height: 2.5,
                  background:
                    activeTab === "vazhikaati" ? "#0F172A" : "transparent",
                  borderRadius: "2px 2px 0 0",
                }}
              />
            </button>

            <div
              style={{
                width: 1,
                background: "#F1F5F9",
                alignSelf: "stretch",
                margin: "10px 0",
              }}
            />

            <button
              onClick={() => {
                setActiveTab("buddies");
                setSearch("");
              }}
              style={{
                ...tabBase,
                color: activeTab === "buddies" ? "#0F172A" : "#94A3B8",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: "-0.2px",
                  marginBottom: 1,
                }}
              >
                {lang === "ta" ? "சேர்ந்து படிப்போம்" : "Study Together"}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  marginBottom: 11,
                  color: activeTab === "buddies" ? "#475569" : "#CBD5E1",
                }}
              >
                {lang === "ta" ? "படிப்பு நண்பர்கள்" : "Study Buddies"}
              </div>
              <div
                style={{
                  height: 2.5,
                  background:
                    activeTab === "buddies" ? "#0F172A" : "transparent",
                  borderRadius: "2px 2px 0 0",
                }}
              />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} />}

        {/* vazhikaati tab: Academies section → Individuals section */}
        {!loading && !error && activeTab === "vazhikaati" && (
          filteredCreators.length > 0 ? (
            <div>
              {academies.length > 0 && (
                <>
                  <p style={sectionLabelStyle}>{lang === "ta" ? "அகாடமிகள்" : "ACADEMIES"}</p>
                  {academies.map((c) => (
                    <CreatorCard key={c.id} creator={c} isBuddiesTab={false} lang={lang} />
                  ))}
                </>
              )}
              {individuals.length > 0 && (
                <div style={{ marginTop: academies.length > 0 ? 20 : 0 }}>
                  <p style={sectionLabelStyle}>INDIVIDUALS</p>
                  {individuals.map((c) => (
                    <CreatorCard key={c.id} creator={c} isBuddiesTab={false} lang={lang} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <EmptyState message={lang === "ta" ? "யாரும் கிடைக்கவில்லை." : "No creators found."} />
          )
        )}

        {/* Buddies tab */}
        {!loading && !error && activeTab === "buddies" && (
          filteredCreators.length > 0 ? (
            <div>
              {filteredCreators.map((c) => (
                <CreatorCard key={c.id} creator={c} isBuddiesTab={true} lang={lang} />
              ))}
            </div>
          ) : (
            <EmptyState message={lang === "ta" ? "இன்னும் யாரும் இல்லை. விரைவில் வருகிறது!" : "No study buddies yet. Coming soon!"} />
          )
        )}
      </div>
    </main>
  );
}