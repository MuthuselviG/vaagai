"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type CreatorType = "individual" | "academy";
type SectionType = "teachers" | "buddies";

interface Creator {
  id: number;
  type: CreatorType;
  section: SectionType;
  name: string;
  tagline?: string;
  description?: string;
  initials?: string;
  logoEmoji?: string;
  verified?: boolean;
  accentColor: string;
  headerBg?: string;
  subjects: string[];
  exams: string[];
  packCount: number;
  questionCount: number;
  socials?: {
    youtube?: string;
    instagram?: string;
    telegram?: string;
  };
}

const creators: Creator[] = [
  {
    id: 1,
    type: "academy",
    section: "teachers",
    name: "Wisdom Academy",
    tagline: "Full TNPSC syllabus · Class 6–10",
    logoEmoji: "🏛️",
    accentColor: "#1E3A8A",
    headerBg: "#EEF2FF",
    exams: ["Group 4", "Group 2", "TET"],
    subjects: ["History", "Polity", "Geography", "Science"],
    packCount: 24,
    questionCount: 1200,
  },
  {
    id: 2,
    type: "academy",
    section: "teachers",
    name: "TNPSC Kalvi",
    tagline: "Make Learning Easier",
    logoEmoji: "📚",
    accentColor: "#0F766E",
    headerBg: "#E6FFFB",
    exams: ["Group 4", "Group 2"],
    subjects: ["Tamil", "Polity", "Economy"],
    packCount: 10,
    questionCount: 480,
  },
  {
    id: 3,
    type: "individual",
    section: "teachers",
    name: "Gomathi Devi",
    description: "8 yrs teaching",
    verified: true,
    initials: "GD",
    accentColor: "#F4B400",
    exams: ["Group 4", "TET"],
    subjects: ["History"],
    packCount: 6,
    questionCount: 320,
    socials: { youtube: "#", instagram: "#", telegram: "#" },
  },
  {
    id: 4,
    type: "individual",
    section: "teachers",
    name: "Rajesh Kumar",
    description: "Ex-Group 4 ranker",
    verified: true,
    initials: "RK",
    accentColor: "#7B61FF",
    exams: ["Group 2", "Group 4"],
    subjects: ["Polity"],
    packCount: 4,
    questionCount: 180,
    socials: { youtube: "#", instagram: "#", telegram: "#" },
  },
  {
    id: 5,
    type: "individual",
    section: "teachers",
    name: "Saraswathi",
    description: "TET Qualified",
    initials: "SA",
    verified: false,
    accentColor: "#0091FF",
    exams: ["TET"],
    subjects: ["Science"],
    packCount: 3,
    questionCount: 150,
    socials: { youtube: "#", instagram: "#" },
  },
];

const S = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(160deg, #F0F4FF 0%, #F8F9FF 50%, #EEF2FF 100%)",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    margin: 0,
    padding: 0,
  } as React.CSSProperties,

  container: {
    maxWidth: 520,
    margin: "0 auto",
    padding: "24px 16px",
  } as React.CSSProperties,

  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#ffffff",
    borderRadius: 16,
    border: "1.5px solid #E8EDFF",
    padding: "13px 16px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    marginBottom: 18,
  } as React.CSSProperties,

  searchInput: {
    border: "none",
    outline: "none",
    fontSize: 15,
    color: "#334155",
    width: "100%",
    background: "transparent",
    fontFamily: "inherit",
  } as React.CSSProperties,

  tabsWrap: {
    display: "flex",
    background: "#F1F5F9",
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  } as React.CSSProperties,

  sectionLabel: {
    margin: "0 0 12px",
    fontSize: 10,
    fontWeight: 800,
    textTransform: "uppercase" as const,
    letterSpacing: "1.5px",
    color: "#94A3B8",
  } as React.CSSProperties,

  card: {
    background: "#ffffff",
    borderRadius: 22,
    border: "1.5px solid #EEF2FF",
    marginBottom: 14,
    overflow: "hidden",
  } as React.CSSProperties,

  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "18px 18px 14px",
  } as React.CSSProperties,

  academyBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    background: "#EEF2FF",
    color: "#3B5BDB",
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: "1px",
    textTransform: "uppercase" as const,
    padding: "3px 8px",
    borderRadius: 6,
    marginBottom: 5,
  } as React.CSSProperties,

  verifiedBadge: {
    background: "#DCFCE7",
    color: "#16A34A",
    fontSize: 9,
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: 5,
  } as React.CSSProperties,

  tagsRow: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 6,
    padding: "0 18px 14px",
  } as React.CSSProperties,

  examTag: {
    background: "#0F172A",
    color: "#ffffff",
    fontSize: 11,
    fontWeight: 700,
    padding: "5px 11px",
    borderRadius: 8,
    letterSpacing: "0.3px",
    textTransform: "uppercase" as const,
  } as React.CSSProperties,

  subjectTag: {
    background: "#EEF2FF",
    color: "#3B5BDB",
    fontSize: 11,
    fontWeight: 700,
    padding: "5px 11px",
    borderRadius: 8,
    letterSpacing: "0.3px",
    textTransform: "uppercase" as const,
  } as React.CSSProperties,

  divider: {
    height: 1,
    background: "#F1F5F9",
    margin: "0 18px",
  } as React.CSSProperties,

  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 18px",
  } as React.CSSProperties,

  statNum: {
    margin: 0,
    fontSize: 20,
    fontWeight: 900,
    color: "#0F172A",
    lineHeight: 1,
  } as React.CSSProperties,

  statLabel: {
    margin: "3px 0 0",
    fontSize: 10,
    fontWeight: 600,
    color: "#94A3B8",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  } as React.CSSProperties,

  viewBtn: {
    background: "#0F172A",
    color: "#ffffff",
    border: "none",
    borderRadius: 12,
    padding: "11px 22px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  } as React.CSSProperties,
};

export default function ValigaatiPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] =
    useState<SectionType>("teachers");

  const filteredCreators = useMemo(() => {
    return creators.filter((c) => {
      const text =
        `${c.name} ${c.tagline ?? ""} ${c.description ?? ""} ${c.subjects.join(
          " "
        )} ${c.exams.join(" ")}`.toLowerCase();

      return text.includes(search.toLowerCase());
    });
  }, [search]);

  const teachers = filteredCreators
    .filter((c) => c.section === "teachers")
    .sort((a, b) =>
      a.type === "academy" && b.type !== "academy"
        ? -1
        : a.type !== "academy" && b.type === "academy"
        ? 1
        : 0
    );

  const buddies = filteredCreators.filter(
    (c) => c.section === "buddies"
  );

  const academies = teachers.filter(
    (c) => c.type === "academy"
  );

  const individuals = teachers.filter(
    (c) => c.type === "individual"
  );

  return (
    <main style={S.page}>
      <div style={S.container}>
        <h1
          style={{
            color: "#173d98",
            fontSize: "32px",
            fontWeight: 900,
            margin: "0 0 20px",
            letterSpacing: "-0.5px",
          }}
        >
          நிபுணர்கள்
        </h1>

        <p>Learn from the best🔥</p>

        {/* SEARCH BAR */}
        <div style={S.searchBar}>
          <svg
            width="18"
            height="18"
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
            style={S.searchInput}
            placeholder="Search creators or packs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* TABS */}
        <div style={S.tabsWrap}>
          <TabButton
            active={activeTab === "teachers"}
            onClick={() => setActiveTab("teachers")}
            tamil="வழிகாட்டி"
            english="Teachers & Experts"
          />

          <TabButton
            active={activeTab === "buddies"}
            onClick={() => setActiveTab("buddies")}
            tamil="சேர்ந்து படிப்போம்"
            english="Study Buddies"
          />
        </div>

        {/* TEACHERS TAB */}
        {activeTab === "teachers" && (
          <>
            {academies.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <p style={S.sectionLabel}>Academies</p>

                {academies.map((c) => (
                  <CreatorCard key={c.id} creator={c} />
                ))}
              </div>
            )}

            {individuals.length > 0 && (
              <div>
                <p style={S.sectionLabel}>
                  Individual Teachers
                </p>

                {individuals.map((c) => (
                  <CreatorCard key={c.id} creator={c} />
                ))}
              </div>
            )}

            {teachers.length === 0 && <EmptyState />}
          </>
        )}

        {/* BUDDIES TAB */}
        {activeTab === "buddies" && (
          <>
            <p style={S.sectionLabel}>Study Buddies</p>

            {buddies.map((c) => (
              <CreatorCard key={c.id} creator={c} />
            ))}

            {buddies.length === 0 && <EmptyState />}
          </>
        )}
      </div>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  tamil,
  english,
}: {
  active: boolean;
  onClick: () => void;
  tamil: string;
  english: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        border: "none",
        cursor: "pointer",
        borderRadius: 12,
        padding: "10px 8px",
        textAlign: "center",
        background: active ? "#ffffff" : "transparent",
        boxShadow: active
          ? "0 2px 8px rgba(0,0,0,0.08)"
          : "none",
        transition: "all 0.2s",
        fontFamily: "inherit",
      }}
    >
      <p
        style={{
          margin: 0,
          fontWeight: 700,
          fontSize: 13,
          color: active ? "#3B5BDB" : "#64748B",
        }}
      >
        {tamil}
      </p>

      <p
        style={{
          margin: "2px 0 0",
          fontSize: 10,
          fontWeight: 500,
          color: active ? "#64748B" : "#94A3B8",
        }}
      >
        {english}
      </p>

      {active && (
        <div
          style={{
            height: 2,
            background: "#3B5BDB",
            borderRadius: 2,
            marginTop: 6,
            width: "40%",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      )}
    </button>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        padding: "48px 0",
        textAlign: "center",
        color: "#94A3B8",
        fontSize: 14,
      }}
    >
      No creators found.
    </div>
  );
}

function CreatorCard({
  creator,
}: {
  creator: Creator;
}) {
  const router = useRouter();

  const isAcademy = creator.type === "academy";

  const handleView = () => {
    router.push("/profile pack");
  };

  return (
    <div
      style={{
        ...S.card,
        boxShadow: `0 -5px 0 ${creator.accentColor},
                    0 6px 18px rgba(15, 23, 42, 0.08)`,
      }}
    >
      {/* HEADER */}
      <div style={S.cardHeader}>
        {/* Avatar */}
        {isAcademy ? (
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              flexShrink: 0,
              background:
                creator.headerBg ?? "#EEF2FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
            }}
          >
            {creator.logoEmoji}
          </div>
        ) : (
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              flexShrink: 0,
              background: creator.accentColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 800,
              color: "#ffffff",
            }}
          >
            {creator.initials}
          </div>
        )}

        {/* Title area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {isAcademy && (
            <div style={S.academyBadge}>
              ✦ Academy
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 800,
                color: "#0F172A",
                lineHeight: 1.2,
              }}
            >
              {creator.name}
            </p>

            {creator.verified && (
              <span style={S.verifiedBadge}>
                ✓ Verified
              </span>
            )}
          </div>

          <p
            style={{
              margin: "3px 0 0",
              fontSize: 12,
              color: "#64748B",
            }}
          >
            {creator.description ??
              creator.tagline}
          </p>

          {/* Socials */}
          {creator.socials && (
            <div
              style={{
                display: "flex",
                gap: 6,
                marginTop: 6,
              }}
            >
              {creator.socials.youtube && (
                <SocialDot label="YT" />
              )}

              {creator.socials.instagram && (
                <SocialDot label="IG" />
              )}

              {creator.socials.telegram && (
                <SocialDot label="TG" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* TAGS */}
      <div style={S.tagsRow}>
        {creator.exams.map((e) => (
          <span key={e} style={S.examTag}>
            {e}
          </span>
        ))}

        {creator.subjects.map((s) => (
          <span key={s} style={S.subjectTag}>
            {s}
          </span>
        ))}
      </div>

      {/* DIVIDER */}
      <div style={S.divider} />

      {/* FOOTER */}
      <div style={S.cardFooter}>
        <div style={{ display: "flex", gap: 24 }}>
          <div>
            <p style={S.statNum}>
              {creator.packCount}
            </p>

            <p style={S.statLabel}>Packs</p>
          </div>

          <div>
            <p style={S.statNum}>
              {creator.questionCount.toLocaleString()}
            </p>

            <p style={S.statLabel}>Questions</p>
          </div>
        </div>

        <button
          style={S.viewBtn}
          onClick={handleView}
        >
          View →
        </button>
      </div>
    </div>
  );
}

function SocialDot({
  label,
}: {
  label: string;
}) {
  return (
    <div
      style={{
        width: 26,
        height: 26,
        borderRadius: 7,
        background: "#F1F5F9",
        color: "#64748B",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {label}
    </div>
  );
}