"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LangToggle from "../../components/LangToggle";
import { T, shadow } from "../../lib/tokens";
import { fetchChapterCounts, supabase, type ChapterCount } from "../../lib/supabase";
import { getUnlockedLevel } from "../../lib/session";

const LEVEL_SIZE = 10;
const MIN_LEVEL_SIZE = 6;

const TAMIL_CHAPTER_NAMES: Record<string, string> = {
  "General": "பொது",
  "Grammar": "இலக்கணம்",
  "Literature": "இலக்கியம்",
  "Vocabulary": "சொல்லகராதி",
  "Usage": "பயன்பாடு",
  "Comprehension": "புரிதல்",
};

const ALL_SUBJECTS = [
  { key: "Polity",    ta: "அரசியல்",      icon: "⚖️" },
  { key: "History",   ta: "வரலாறு",       icon: "📜" },
  { key: "Geography", ta: "புவியியல்",     icon: "🗺️" },
  { key: "Economy",   ta: "பொருளாதாரம்",  icon: "💹" },
  { key: "Science",   ta: "அறிவியல்",     icon: "🔬" },
  { key: "Tamil",     ta: "தமிழ்",        icon: "📖" },
];

const SUBJECT_COLORS: Record<string, { bg: string; border: string; iconBg: string }> = {
  Polity:    { bg: "#FFF8E1", border: "#FFE082", iconBg: "#FFF3CD" },
  History:   { bg: "#E8F5E9", border: "#A5D6A7", iconBg: "#D1FAE5" },
  Tamil:     { bg: "#EDE9FE", border: "#C4B5FD", iconBg: "#DDD6FE" },
  Geography: { bg: "#E3F2FD", border: "#90CAF9", iconBg: "#DBEAFE" },
  Science:   { bg: "#FCE4EC", border: "#F48FB1", iconBg: "#FCE7F3" },
  Economy:   { bg: "#E0F2F1", border: "#80CBC4", iconBg: "#CCFBF1" },
};

const ACTIVE_SUBJECTS = ["Polity", "History", "Tamil"];

const PYQ_YEARS = [
  { year: 2025, bg: "#EEF1FA", border: "#C5CEF0", color: "#3D52A0" },
  { year: 2024, bg: "#E8F8F0", border: "#A8DBBE", color: "#057A55" },
  { year: 2022, bg: "#FFF5EE", border: "#FFD8B8", color: "#C2410C" },
  { year: 2019, bg: "#FEFCE8", border: "#FDE68A", color: "#A16207" },
  { year: 2018, bg: "#EFF6FF", border: "#93C5FD", color: "#1D4ED8" },
  { year: 2016, bg: "#FDECEC", border: "#F5BFBB", color: "#C0392B" },
  { year: 2014, bg: "#E8F8F0", border: "#A8DBBE", color: "#057A55" },
  { year: 2013, bg: "#F5F3FF", border: "#C4B5FD", color: "#6D28D9" },
  { year: 2012, bg: "#F7F8FC", border: "#E4E7F0", color: "#6B7280" },
];

function generateLevels(total: number): { levelNum: number; questions: number; offset: number }[] {
  const levels = [];
  let remaining = total;
  let n = 1;
  let offset = 0;
  while (remaining > 0) {
    const next = remaining - LEVEL_SIZE;
    if (next > 0 && next < MIN_LEVEL_SIZE) {
      levels.push({ levelNum: n++, questions: remaining, offset });
      remaining = 0;
    } else {
      const qs = Math.min(LEVEL_SIZE, remaining);
      levels.push({ levelNum: n++, questions: qs, offset });
      offset += qs;
      remaining -= qs;
    }
  }
  return levels;
}

type PyqChapterCount = { chapter: string; count: number; pyq_years: number[] };

export default function SubjectsPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "ta">("ta");
  const [chapterData, setChapterData] = useState<Record<string, ChapterCount[]>>({});
  const [pyqChapterData, setPyqChapterData] = useState<Record<string, PyqChapterCount[]>>({});
  const [pyqCount, setPyqCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openSubject, setOpenSubject] = useState<string | null>(null);
  const [openChapter, setOpenChapter] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("mcqpalagu_lang");
    if (saved === "en" || saved === "ta") setLang(saved as "en" | "ta");
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Samacheer chapter counts
      const results: Record<string, ChapterCount[]> = {};
      for (const subject of ACTIVE_SUBJECTS) {
        try {
          results[subject] = await fetchChapterCounts(subject, subject === "Tamil" ? "ta" : lang);
        } catch {
          results[subject] = [];
        }
      }
      setChapterData(results);

      // PYQ total count for top header - tamil only, group4
      try {
        const { count } = await supabase
          .from("questions")
          .select("*", { count: "exact", head: true })
          .eq("source_type", "pyq")
          .contains("pyq_groups", ["group4"])
          .eq("lang", "ta");
        setPyqCount(count ?? 0);
      } catch {
        setPyqCount(0);
      }

      // PYQ per subject+chapter with year tags
      try {
        const { data } = await supabase
          .from("questions")
          .select("subject, chapter, pyq_years")
          .eq("source_type", "pyq")
          .contains("pyq_groups", ["group4"])
          .eq("lang", "ta");

        if (data) {
          const grouped: Record<string, Record<string, { count: number; years: Set<number> }>> = {};
          for (const row of data) {
            if (!row.subject || !row.chapter) continue;
            if (!grouped[row.subject]) grouped[row.subject] = {};
            if (!grouped[row.subject][row.chapter]) grouped[row.subject][row.chapter] = { count: 0, years: new Set() };
            grouped[row.subject][row.chapter].count++;
            (row.pyq_years ?? []).forEach((y: number) => grouped[row.subject][row.chapter].years.add(y));
          }
          const pyqResult: Record<string, PyqChapterCount[]> = {};
          for (const [subj, chapters] of Object.entries(grouped)) {
            pyqResult[subj] = Object.entries(chapters).map(([ch, v]) => ({
              chapter: ch,
              count: v.count,
              pyq_years: Array.from(v.years).sort(),
            }));
          }
          setPyqChapterData(pyqResult);
        }
      } catch {
        setPyqChapterData({});
      }

      setLoading(false);
    }
    load();
  }, [lang]);

  const totalChapters = Object.values(chapterData).reduce((s, v) => s + v.length, 0);
  const samacheerQ = Object.values(chapterData).reduce((s, v) => s + v.reduce((a, c) => a + c.count, 0), 0);
  const totalQ = samacheerQ + pyqCount;
  const activeSubjects = ALL_SUBJECTS.filter(s => ACTIVE_SUBJECTS.includes(s.key));
  const comingSoonSubjects = ALL_SUBJECTS.filter(s => !ACTIVE_SUBJECTS.includes(s.key));

  return (
    <div style={{ background: T.bg, height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden", maxWidth: 600, margin: "0 auto", width: "100%" }}>

      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "16px 18px 14px", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ background: T.indigoLight, border: `1px solid ${T.indigoMid}`, borderRadius: 10, padding: "5px 12px", color: T.indigo, fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>
            TNPSC Exam Prep
          </div>
          <LangToggle lang={lang} setLang={(l) => { setLang(l); setOpenChapter(null); }} />
        </div>
        <h2 style={{ color: T.text, fontSize: 20, fontWeight: 800, marginTop: 14, letterSpacing: -0.4 }}>
          {lang === "ta" ? "பாடங்கள்" : "Subjects"}
        </h2>
        <p style={{ color: T.textSec, fontSize: 12, marginTop: 3 }}>
          {loading ? "Loading…" : `${ALL_SUBJECTS.length} subjects · ${totalChapters} chapters · ${totalQ.toLocaleString()} questions`}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", overscrollBehavior: "none", WebkitOverflowScrolling: "touch" as any, padding: "14px 16px 100px" }}>

        <div style={{ fontSize: 11, fontWeight: 800, color: T.textTer, letterSpacing: 0.8, marginBottom: 10 }}>
          {lang === "ta" ? "கடந்த ஆண்டு வினாத்தாள்கள்" : "PREVIOUS YEAR PAPERS"}
        </div>

        <div style={{ background: T.surface, borderRadius: 20, padding: 16, marginBottom: 14, border: `1px solid ${T.border}`, boxShadow: shadow.sm }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: T.indigoLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>📋</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{lang === "ta" ? "குரூப் 4" : "Group 4"}</div>
              <div style={{ fontSize: 11, color: T.textSec, marginTop: 1 }}>
                {lang === "ta" ? `9 ஆண்டுகள் · 900 வினாக்கள்` : `9 years · 900 questions`}
              </div>
              <div style={{ fontSize: 11, color: T.indigo, fontWeight: 700, marginTop: 3 }}>
                {lang === "ta" ? "பயிற்சி செய்ய ஆண்டை தேர்வு செய்யுங்கள்" : "Select a year to start practising"}
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
            {PYQ_YEARS.map(({ year, bg, border, color }) => (
              <button
                key={year}
                onClick={() => router.push(`/pyq/group4/${year}`)}
                style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 14, padding: "16px 8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.1s" }}
                onTouchStart={e => (e.currentTarget.style.transform = "scale(0.95)")}
                onTouchEnd={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                <span style={{ fontSize: 19, fontWeight: 900, color, letterSpacing: -0.5 }}>{year}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 800, color: T.textTer, letterSpacing: 0.8, marginBottom: 10, marginTop: 6 }}>
          {lang === "ta" ? "குரூப் 4 — முக்கிய வினாக்கள்" : "GROUP 4 — IMPORTANT QUESTIONS"}
        </div>

        <div style={{ background: T.surface, borderRadius: 20, padding: 12, marginBottom: 12, border: `1px solid ${T.border}`, boxShadow: shadow.sm }}>
          {activeSubjects.map((sub, idx) => {
            const chapters = chapterData[sub.key] ?? [];
            const pyqChapters = pyqChapterData[sub.key] ?? [];

            // Merge samacheer + pyq chapters
            const mergedMap: Record<string, { count: number; pyq_years: number[] }> = {};
            for (const ch of chapters) mergedMap[ch.chapter] = { count: ch.count, pyq_years: [] };
            for (const pc of pyqChapters) {
              if (mergedMap[pc.chapter]) {
                mergedMap[pc.chapter].count += pc.count;
                mergedMap[pc.chapter].pyq_years = pc.pyq_years;
              } else {
                mergedMap[pc.chapter] = { count: pc.count, pyq_years: pc.pyq_years };
              }
            }
            const allChapters = Object.entries(mergedMap).map(([chapter, v]) => ({ chapter, ...v }));

            const isOpen = openSubject === sub.key;
            // If pyqChapters didn't merge (empty), add pyqCount directly to Tamil total
            const totalQSub = allChapters.reduce((s, c) => s + c.count, 0) + (sub.key === "Tamil" && pyqChapters.length === 0 ? pyqCount : 0);
            const colors = SUBJECT_COLORS[sub.key] ?? { bg: T.indigoLight, border: T.indigoMid, iconBg: T.indigoLight };

            return (
              <div key={sub.key}>
                {idx > 0 && <div style={{ height: 8 }} />}
                <button
                  onClick={() => { setOpenSubject(isOpen ? null : sub.key); setOpenChapter(null); }}
                  style={{ width: "100%", background: colors.bg, border: `1.5px solid ${colors.border}`, borderRadius: isOpen ? "14px 14px 0 0" : 14, padding: "13px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: colors.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{sub.icon}</div>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ color: T.text, fontWeight: 800, fontSize: 16 }}>
                      {sub.key === "Tamil" ? sub.ta : (lang === "ta" ? sub.ta : sub.key)}
                    </div>
                    <div style={{ color: T.textSec, fontSize: 12, marginTop: 2 }}>
                      {loading ? "Loading…" : (lang === "ta" ? `${allChapters.length} அத்தியாயங்கள் · ${totalQSub.toLocaleString()} வினாக்கள்` : `${allChapters.length} chapters · ${totalQSub.toLocaleString()} questions`)}
                    </div>
                  </div>
                  <div style={{ background: isOpen ? T.indigo : "rgba(0,0,0,0.06)", color: isOpen ? "#fff" : T.textSec, borderRadius: 8, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{allChapters.length}</div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "none", flexShrink: 0 }}>
                    <path d="M4 6l4 4 4-4" stroke={isOpen ? T.indigo : T.textSec} strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>

                {isOpen && (
                  <div style={{ background: T.surface, border: `1.5px solid ${T.indigoMid}`, borderTop: "none", borderRadius: "0 0 14px 14px", overflow: "hidden" }}>
                    {allChapters.map((ch, i) => {
                      const isChOpen = openChapter === ch.chapter;
                      const samacheerCount = chapters.find(c => c.chapter === ch.chapter)?.count ?? 0;
                      const levels = generateLevels(samacheerCount > 0 ? samacheerCount : ch.count);
                      const unlockedLevel = getUnlockedLevel(sub.key, ch.chapter);

                      return (
                        <div key={ch.chapter} style={{ borderTop: i > 0 ? `1px solid ${T.border}` : "none" }}>
                          <div onClick={() => setOpenChapter(isChOpen ? null : ch.chapter)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", cursor: "pointer" }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                <span style={{ color: T.text, fontSize: 15, fontWeight: 600 }}>
                                  {sub.key === "Tamil" ? (TAMIL_CHAPTER_NAMES[ch.chapter] ?? ch.chapter) : ch.chapter}
                                </span>
                                {ch.pyq_years.slice(0, 3).map(y => (
                                  <span key={y} style={{ background: "#FFF3E0", border: "1px solid #FFD180", borderRadius: 6, padding: "1px 6px", fontSize: 10, fontWeight: 800, color: "#E65100" }}>{y}</span>
                                ))}
                                {ch.pyq_years.length > 3 && (
                                  <span style={{ background: "#FFF3E0", border: "1px solid #FFD180", borderRadius: 6, padding: "1px 6px", fontSize: 10, fontWeight: 800, color: "#E65100" }}>+{ch.pyq_years.length - 3}</span>
                                )}
                              </div>
                              <div style={{ display: "flex", gap: 8, marginTop: 5, alignItems: "center" }}>
                                <span style={{ color: T.textTer, fontSize: 12, fontWeight: 600 }}>{lang === "ta" ? `${ch.count} வினாக்கள்` : `${ch.count} questions`}</span>
                                {samacheerCount > 0 && (
                                  <span style={{ background: T.indigoLight, borderRadius: 6, padding: "2px 7px", color: T.indigo, fontSize: 12, fontWeight: 700 }}>
                                    {lang === "ta" ? `${levels.length} நிலைகள்` : `${levels.length} levels`}
                                  </span>
                                )}
                              </div>
                            </div>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transition: "transform 0.2s", transform: isChOpen ? "rotate(180deg)" : "none", flexShrink: 0 }}>
                              <path d="M3 5l4 4 4-4" stroke={isChOpen ? T.indigo : T.textTer} strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                          </div>

                          {isChOpen && samacheerCount > 0 && (
                            <div style={{ background: T.bg, padding: "10px 14px 12px", borderTop: `1px solid ${T.border}` }}>
                              <div style={{ fontSize: 10, fontWeight: 800, color: T.textTer, letterSpacing: 0.7, marginBottom: 8 }}>
                                {lang === "ta" ? "நிலையை தேர்வு செய்யுங்கள்" : "SELECT LEVEL"}
                              </div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                                {levels.map(l => {
                                  const locked = l.levelNum > unlockedLevel;
                                  return (
                                    <button key={l.levelNum} onClick={() => { if (locked) return; router.push(`/practice/${encodeURIComponent(sub.key)}/${encodeURIComponent(ch.chapter)}?level=${l.levelNum}&offset=${l.offset}&limit=${l.questions}&label=${encodeURIComponent(ch.chapter)}`); }}
                                      style={{ display: "flex", flexDirection: "column", alignItems: "center", background: locked ? T.bg : T.surface, border: `1.5px solid ${locked ? T.border : T.indigoMid}`, borderRadius: 12, padding: "9px 12px", cursor: locked ? "not-allowed" : "pointer", minWidth: 58, opacity: locked ? 0.4 : 1, transition: "all 0.15s" }}>
                                      <span style={{ fontSize: 14, fontWeight: 900, color: locked ? T.textTer : T.indigo }}>L{l.levelNum}</span>
                                      <span style={{ fontSize: 10, color: T.textTer, fontWeight: 600, marginTop: 2 }}>{l.questions}q</span>
                                      {locked && <span style={{ fontSize: 10, marginTop: 1 }}>🔒</span>}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {comingSoonSubjects.map(sub => {
          const colors = SUBJECT_COLORS[sub.key] ?? { bg: T.bg, border: T.border, iconBg: T.bg };
          return (
            <div key={sub.key} style={{ marginBottom: 8 }}>
              <div style={{ width: "100%", background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: "13px 14px", display: "flex", alignItems: "center", gap: 10, opacity: 0.45 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: colors.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{sub.icon}</div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ color: T.textSec, fontWeight: 800, fontSize: 16 }}>{lang === "ta" ? sub.ta : sub.key}</div>
                  <div style={{ color: T.indigo, fontSize: 12, marginTop: 2, fontWeight: 600 }}>{lang === "ta" ? "விரைவில் வருகிறது" : "Coming soon"}</div>
                </div>
                <span style={{ fontSize: 16 }}>🔒</span>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}
