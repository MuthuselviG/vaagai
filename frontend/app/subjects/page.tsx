"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LangToggle from "../../components/LangToggle";
import { T, shadow } from "../../lib/tokens";

const subjectIcons: Record<string, string> = {
  History: "📜",
  Geography: "🗺️",
  Polity: "⚖️",
  Economy: "💹",
  Science: "🔬",
  Tamil: "📖",
};

const subjectData: {
  en: string;
  ta: string;
  icon: string;
  chapters: { en: string; ta: string }[];
}[] = [
  {
    en: "History", ta: "வரலாறு", icon: "📜",
    chapters: [
      { en: "Ancient Tamil History", ta: "பழைய தமிழ் வரலாறு" },
      { en: "Medieval India", ta: "இடைகால இந்தியா" },
      { en: "Modern India", ta: "நவீன இந்தியா" },
    ],
  },
  {
    en: "Geography", ta: "புவியியல்", icon: "🗺️",
    chapters: [
      { en: "Physical Geography", ta: "இயற்கை புவியியல்" },
      { en: "Tamil Nadu Districts", ta: "மாவட்டங்கள்" },
    ],
  },
  {
    en: "Polity", ta: "அரசியல்", icon: "⚖️",
    chapters: [
      { en: "Indian Constitution", ta: "அரசமைப்பு" },
      { en: "Preamble & Rights", ta: "முன்னுரை" },
    ],
  },
  {
    en: "Economy", ta: "பொருளாதாரம்", icon: "💹",
    chapters: [
      { en: "National Income", ta: "தேசிய வருமானம்" },
    ],
  },
];

export default function SubjectsPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "ta">("en");
  const [open, setOpen] = useState<Record<string, boolean>>({ History: true });

  const totalChapters = subjectData.reduce((s, sub) => s + sub.chapters.length, 0);

  return (
    <div style={{ background: T.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "16px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{
            background: T.indigoLight, border: `1px solid ${T.indigoMid}`,
            borderRadius: 10, padding: "5px 12px",
            color: T.indigo, fontSize: 12, fontWeight: 800, letterSpacing: 0.3,
          }}>TNPSC GROUP 4</div>
          <LangToggle lang={lang} setLang={setLang} />
        </div>
        <h2 style={{ color: T.text, fontSize: 20, fontWeight: 800, marginTop: 14, letterSpacing: -0.4 }}>
          {lang === "ta" ? "பாடங்கள்" : "Subjects"}
        </h2>
        <p style={{ color: T.textSec, fontSize: 12, marginTop: 2 }}>
          {subjectData.length} subjects · {totalChapters} chapters
        </p>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px 100px" }}>
        {subjectData.map((sub) => {
          const isOpen = open[sub.en];
          return (
            <div key={sub.en} style={{ marginBottom: 10 }}>
              <button
                onClick={() => setOpen((o) => ({ ...o, [sub.en]: !o[sub.en] }))}
                style={{
                  width: "100%",
                  background: isOpen ? T.indigoLight : T.surface,
                  border: `1.5px solid ${isOpen ? T.indigoMid : T.border}`,
                  borderRadius: isOpen ? "14px 14px 0 0" : 14,
                  padding: "13px 14px",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 10,
                  boxShadow: isOpen ? "none" : shadow.sm,
                  transition: "all 0.2s ease",
                }}
              >
                <span style={{ fontSize: 22, lineHeight: 1 }}>{sub.icon}</span>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ color: T.text, fontWeight: 700, fontSize: 14 }}>
                    {lang === "ta" ? sub.ta : sub.en}
                  </div>
                  <div style={{ color: T.textSec, fontSize: 11, marginTop: 1 }}>
                    {sub.chapters.length} chapters
                  </div>
                </div>
                <div style={{
                  background: isOpen ? T.indigo : T.bg,
                  color: isOpen ? "#fff" : T.textSec,
                  borderRadius: 8, padding: "2px 8px",
                  fontSize: 11, fontWeight: 700,
                }}>
                  {sub.chapters.length}
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                  style={{ transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "none" }}>
                  <path d="M4 6l4 4 4-4" stroke={isOpen ? T.indigo : T.textSec} strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              {isOpen && (
                <div style={{
                  background: T.surface,
                  border: `1.5px solid ${T.indigoMid}`,
                  borderTop: "none",
                  borderRadius: "0 0 14px 14px",
                  overflow: "hidden",
                }}>
                  {sub.chapters.map((ch, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 14px",
                      borderTop: i > 0 ? `1px solid ${T.border}` : "none",
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: T.text, fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>
                          {lang === "ta" ? ch.ta : ch.en}
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/practice/${encodeURIComponent(sub.en)}/${encodeURIComponent(ch.en)}?label=${encodeURIComponent(lang === "ta" ? ch.ta : ch.en)}`)}
                        style={{
                          background: T.indigo, border: "none", borderRadius: 10,
                          padding: "7px 14px", cursor: "pointer",
                          color: "#fff", fontSize: 12, fontWeight: 700,
                          boxShadow: "0 2px 8px rgba(61,82,160,0.3)",
                          flexShrink: 0,
                        }}>
                        {lang === "ta" ? "தொடங்கு" : "Start →"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
