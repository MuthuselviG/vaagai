"use client";

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

import { useMemo, useState } from "react";

interface Creator {
  id: string;
  type: "academy" | "individual";
  section: "teachers" | "buddies";
  name: string;
  tagline?: string;
  description?: string;
  logoEmoji?: string;
  initials?: string;
  accentColor: string;
  headerBg?: string;
  logoBg?: string;
  verified?: boolean;
  exams: string[];
  subjects: string[];
  slug: string;
}

const ACCENT_MAP: Record<string, string> = {
  yellow: "#F59E0B",
  coral: "#F43F5E",
  blue: "#0284C7",
  green: "#10B981",
  purple: "#7C3AED",
};

function resolveAccent(color: string): string {
  return ACCENT_MAP[color] ?? color;
}

const creators: Creator[] = [
  {
    id: "80aa5b32-908a-4b8f-a9d8-3d79938bbdc6",
    type: "individual",
    section: "buddies",
    name: "Daily GK Thoughts",
    description:
      "Digital creator sharing daily GK facts. Facts | Knowledge | Curiosity — simple and quick learning for everyone.",
    verified: true,
    initials: "DG",
    accentColor: resolveAccent("yellow"),
    exams: [],
    subjects: ["GK", "Current Affairs"],
    slug: "daily-gk-thoughts",
  },
  {
    id: "4652c5db-b16b-4335-9e02-cefed8ee2efc",
    type: "individual",
    section: "buddies",
    name: "Tipps Academy",
    description: "Verified study buddy",
    verified: true,
    initials: "TA",
    accentColor: resolveAccent("yellow"),
    exams: [],
    subjects: [],
    slug: "tipps-academy",
  },
  {
    id: "f1e3c0bc-299c-4186-ab99-87c3c16ca774",
    type: "individual",
    section: "buddies",
    name: "Sandy",
    description:
      "TNPSC Group 4 aspirant. Sharing my Tamil prep journey. வாங்க சேர்ந்து படிப்போம்!",
    verified: true,
    initials: "SA",
    accentColor: resolveAccent("coral"),
    exams: ["Group 4"],
    subjects: ["Tamil"],
    slug: "tnpsc-sandy",
  },
  {
    id: "42b943f3-7caf-4ed0-8be2-14ca6842139a",
    type: "individual",
    section: "buddies",
    name: "Gomathi Devi",
    description: "Samacheer History specialist. 8 yrs teaching.",
    verified: true,
    initials: "GD",
    accentColor: resolveAccent("yellow"),
    exams: ["Group 4", "TET"],
    subjects: ["History"],
    slug: "gomathi",
  },
];

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
  return `rgba(${r},${g},${b},${alpha})`;
}

function ViewBtn({ slug }: { slug: string }) {
  return (
    <a
      href={`/experts/${slug}`}
      style={{
        background: "#2048a5",
        color: "#fff",
        border: "none",
        borderRadius: 12,
        padding: "12px 24px",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "inherit",
        textDecoration: "none",
        display: "inline-block",
      }}
    >
      View →
    </a>
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

function CardShell({
  children,
  accentColor,
}: {
  children: React.ReactNode;
  accentColor: string;
}) {
  return (
    <div style={{ position: "relative", marginBottom: 24 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 20,
          background: accentColor,
          transform: "translate(5px, 7px)",
          zIndex: 0,
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: "#fff",
          borderRadius: 20,
          border: `1.5px solid ${hexToRgba(accentColor, 0.25)}`,
          overflow: "hidden",
          boxShadow: `0 4px 24px ${hexToRgba(accentColor, 0.13)}`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function TagsRow({ exams, subjects }: { exams: string[]; subjects: string[] }) {
  const tags = [...exams, ...subjects];
  if (tags.length === 0) return null;
  return (
    <div
      style={{ display: "flex", flexWrap: "wrap", gap: 7, padding: "14px 18px 0" }}
    >
      {tags.map((t) => (
        <span
          key={t}
          style={{
            background: "#F1F5F9",
            color: "#334155",
            fontSize: 11,
            fontWeight: 700,
            padding: "6px 13px",
            borderRadius: 8,
            border: "1px solid #E2E8F0",
          }}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

function AcademyCard({ creator }: { creator: Creator }) {
  const dark = isDark(creator.headerBg ?? "#ffffff");
  const badgeBg = dark ? hexToRgba("#ffffff", 0.22) : creator.accentColor;
  const nameColor = dark ? "#ffffff" : "#0F172A";
  const taglineColor = dark ? hexToRgba("#ffffff", 0.72) : creator.accentColor;

  return (
    <CardShell accentColor={creator.accentColor}>
      <div
        style={{
          background: creator.headerBg ?? creator.accentColor,
          padding: "16px 18px 18px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              flexShrink: 0,
              background: creator.logoBg ?? creator.accentColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              boxShadow: "0 2px 10px rgba(0,0,0,0.22)",
            }}
          >
            {creator.logoEmoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: badgeBg,
                color: "#ffffff",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                padding: "3px 10px",
                borderRadius: 20,
                marginBottom: 5,
              }}
            >
              <span>✦</span> Academy
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 800,
                lineHeight: 1.2,
                color: nameColor,
              }}
            >
              {creator.name}
            </p>
            <p
              style={{
                margin: "3px 0 0",
                fontSize: 12.5,
                color: taglineColor,
              }}
            >
              {creator.tagline}
            </p>
          </div>
        </div>
      </div>
      <TagsRow exams={creator.exams} subjects={creator.subjects} />
      <div style={{ padding: "14px 18px 18px", textAlign: "right" }}>
        <ViewBtn slug={creator.slug} />
      </div>
    </CardShell>
  );
}

function IndividualCard({ creator }: { creator: Creator }) {
  return (
    <CardShell accentColor={creator.accentColor}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
          padding: "18px 18px 12px",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            flexShrink: 0,
            background: creator.accentColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 800,
            color: "#ffffff",
            boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
          }}
        >
          {creator.initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
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
                lineHeight: 1.25,
              }}
            >
              {creator.name}
            </p>
            {creator.verified === true && (
              <span
                style={{
                  background: "#DCFCE7",
                  color: "#16A34A",
                  fontSize: 9,
                  fontWeight: 700,
                  padding: "2px 7px",
                  borderRadius: 5,
                }}
              >
                ✓ Verified
              </span>
            )}
          </div>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 12.5,
              color: "#64748B",
            }}
          >
            {creator.description}
          </p>
        </div>
      </div>
      <TagsRow exams={creator.exams} subjects={creator.subjects} />
      <div style={{ padding: "14px 18px 18px", textAlign: "right" }}>
        <ViewBtn slug={creator.slug} />
      </div>
    </CardShell>
  );
}

export default function ExpertsPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"teachers" | "buddies">("buddies");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return creators.filter((c) => {
      const text = [
        c.name,
        c.tagline ?? "",
        c.description ?? "",
        ...c.subjects,
        ...c.exams,
      ]
        .join(" ")
        .toLowerCase();
      return text.includes(q);
    });
  }, [search]);

  const teachers = filtered
    .filter((c) => c.section === "teachers")
    .sort((a, b) => {
      if (a.type === "academy" && b.type !== "academy") return -1;
      if (a.type !== "academy" && b.type === "academy") return 1;
      return 0;
    });

  const buddies = filtered.filter((c) => c.section === "buddies");
  const academies = teachers.filter((c) => c.type === "academy");
  const individuals = teachers.filter((c) => c.type === "individual");

  const sectionLabel: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    color: "#94A3B8",
    margin: "0 0 14px",
  };

  const tabs: { key: "teachers" | "buddies"; tamil: string; english: string }[] =
    [
      {
        key: "buddies",
        tamil: "சேர்ந்து படிப்போம்",
        english: "Study Buddies",
      },
      {
        key: "teachers",
        tamil: "வழிகாட்டி",
        english: "Teachers & Experts",
      },
    ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#EEEEF6",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 16px" }}>
        <h1
          style={{
            margin: "0 0 2px",
            fontSize: 24,
            fontWeight: 800,
            color: "#0F172A",
          }}
        >
          நிபுணர்கள்
        </h1>
        <p style={{ margin: "0 0 20px", fontSize: 14, color: "#64748B" }}>
          Learn from the best 🔥
        </p>

        {/* Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#fff",
            borderRadius: 14,
            border: "1.5px solid #E2E8F0",
            padding: "12px 16px",
            marginBottom: 16,
          }}
        >
          <svg
            width="17"
            height="17"
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
              fontSize: 15,
              color: "#334155",
              width: "100%",
              background: "transparent",
              fontFamily: "inherit",
            }}
            placeholder="Search creators or packs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            background: "#D9E1F8",
            borderRadius: 14,
            padding: 4,
            marginBottom: 28,
          }}
        >
          {tabs.map(({ key, tamil, english }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  flex: 1,
                  border: "none",
                  cursor: "pointer",
                  borderRadius: 11,
                  padding: "10px 8px",
                  textAlign: "center",
                  background: active ? "#fff" : "transparent",
                  boxShadow: active ? "0 2px 8px rgba(0,0,0,0.09)" : "none",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontWeight: 700,
                    fontSize: 13,
                    color: active ? "#1E3A8A" : "#64748B",
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
                      background: "#8a1e20",
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
          })}
        </div>

        {/* Teachers tab */}
        {activeTab === "teachers" && (
          <div>
            {academies.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <p style={sectionLabel}>Academies</p>
                {academies.map((c) => (
                  <AcademyCard key={c.id} creator={c} />
                ))}
              </div>
            )}
            {individuals.length > 0 && (
              <div>
                <p style={sectionLabel}>Individuals</p>
                {individuals.map((c) => (
                  <IndividualCard key={c.id} creator={c} />
                ))}
              </div>
            )}
            {teachers.length === 0 && <EmptyState />}
          </div>
        )}

        {/* Buddies tab */}
        {activeTab === "buddies" && (
          <div>
            <p style={sectionLabel}>Study Buddies</p>
            {buddies.map((c) => (
              <IndividualCard key={c.id} creator={c} />
            ))}
            {buddies.length === 0 && <EmptyState />}
          </div>
        )}
      </div>
    </main>
  );
}
