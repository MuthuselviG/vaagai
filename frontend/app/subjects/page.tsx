"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LangToggle from "../../components/LangToggle";
import { T, shadow } from "../../lib/tokens";
import { fetchChapterCounts, type ChapterCount } from "../../lib/supabase";
import { getUnlockedLevel } from "../../lib/session";

const LEVEL_SIZE = 10;
const MIN_LEVEL_SIZE = 6;

const ALL_SUBJECTS = [
  { key: "Polity", ta: "அரசியல்", icon: "⚖️" },
  { key: "History", ta: "வரலாறு", icon: "📜" },
  { key: "Geography", ta: "புவியியல்", icon: "🗺️" },
  { key: "Economy", ta: "பொருளாதாரம்", icon: "💹" },
  { key: "Science", ta: "அறிவியல்", icon: "🔬" },
  { key: "Tamil", ta: "தமிழ்", icon: "📖" },
];

// Subjects that have questions — hardcoded for now, will be dynamic later
const ACTIVE_SUBJECTS = ["Polity", "History","Tamil"];

function generateLevels(total: number): { levelNum: number; questions: number; offset: number }[] {
  const levels = [];
  let remaining = total;
  let n = 1;
  let offset = 0;
  while (remaining > 0) {
    const next = remaining - LEVEL_SIZE;
    if (next > 0 && next < MIN_LEVEL_SIZE) {
      // merge last small chunk into this level
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

export default function SubjectsPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "ta">("en");
  const [chapterData, setChapterData] = useState<Record<string, ChapterCount[]>>({});
  const [loading, setLoading] = useState(true);
  const [openSubject, setOpenSubject] = useState<string | null>(null);
  const [openChapter, setOpenChapter] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const results: Record<string, ChapterCount[]> = {};
      for (const subject of ACTIVE_SUBJECTS) {
        try {
          results[subject] = await fetchChapterCounts(subject, subject === "Tamil" ? "ta" : lang);
        } catch {
          results[subject] = [];
        }
      }
      setChapterData(results);
      setLoading(false);
    }
    load();
  }, [lang]);

  const totalChapters = Object.values(chapterData).reduce((s, v) => s + v.length, 0);
  const totalQ = Object.values(chapterData).reduce((s, v) => s + v.reduce((a, c) => a + c.count, 0), 0);

  const activeSubjects = ALL_SUBJECTS.filter(s => ACTIVE_SUBJECTS.includes(s.key));
  const comingSoonSubjects = ALL_SUBJECTS.filter(s => !ACTIVE_SUBJECTS.includes(s.key));

  return (
    <div style={{ background: T.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "16px 18px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ background: T.indigoLight, border: `1px solid ${T.indigoMid}`, borderRadius: 10, padding: "5px 12px", color: T.indigo, fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>
            TNPSC GROUP 4
          </div>
          <LangToggle lang={lang} setLang={(l) => { setLang(l); setOpenChapter(null); }} />
        </div>
        <h2 style={{ color: T.text, fontSize: 20, fontWeight: 800, marginTop: 14, letterSpacing: -0.4 }}>
          {lang === "ta" ? "பாடங்கள்" : "Subjects"}
        </h2>
        <p style={{ color: T.textSec, fontSize: 12, marginTop: 3 }}>
          {loading ? "Loading…" : `${ALL_SUBJECTS.length} subjects · ${totalChapters} chapters · ${totalQ} questions`}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px 100px" }}>
        {/* Active subjects */}
        {activeSubjects.map(sub => {
          const chapters = chapterData[sub.key] ?? [];
          const isOpen = openSubject === sub.key;
          const totalQSub = chapters.reduce((s, c) => s + c.count, 0);

          return (
            <div key={sub.key} style={{ marginBottom: 10 }}>
              <button
                onClick={() => { setOpenSubject(isOpen ? null : sub.key); setOpenChapter(null); }}
                style={{
                  width: "100%", background: isOpen ? T.indigoLight : T.surface,
                  border: `1.5px solid ${isOpen ? T.indigoMid : T.border}`,
                  borderRadius: isOpen ? "14px 14px 0 0" : 14,
                  padding: "13px 14px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 10,
                  boxShadow: isOpen ? "none" : shadow.sm, transition: "all 0.2s",
                }}>
                <span style={{ fontSize: 22 }}>{sub.icon}</span>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ color: T.text, fontWeight: 700, fontSize: 14 }}>{lang === "ta" ? sub.ta : sub.key}</div>
                  <div style={{ color: T.textSec, fontSize: 11, marginTop: 2 }}>
                    {loading ? "Loading…" : `${chapters.length} chapters · ${totalQSub} questions`}
                  </div>
                </div>
                <div style={{ background: isOpen ? T.indigo : T.bg, color: isOpen ? "#fff" : T.textSec, borderRadius: 8, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                  {chapters.length}
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "none", flexShrink: 0 }}>
                  <path d="M4 6l4 4 4-4" stroke={isOpen ? T.indigo : T.textSec} strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              {isOpen && (
                <div style={{ background: T.surface, border: `1.5px solid ${T.indigoMid}`, borderTop: "none", borderRadius: "0 0 14px 14px", overflow: "hidden" }}>
                  {chapters.map((ch, i) => {
                    const isChOpen = openChapter === ch.chapter;
                    const levels = generateLevels(ch.count);
                    const unlockedLevel = getUnlockedLevel(sub.key, ch.chapter);

                    return (
                      <div key={ch.chapter} style={{ borderTop: i > 0 ? `1px solid ${T.border}` : "none" }}>
                        <div
                          onClick={() => setOpenChapter(isChOpen ? null : ch.chapter)}
                          style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", cursor: "pointer" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{ch.chapter}</div>
                            <div style={{ display: "flex", gap: 8, marginTop: 5, alignItems: "center" }}>
                              <span style={{ color: T.textTer, fontSize: 11, fontWeight: 600 }}>{ch.count} questions</span>
                              <span style={{ background: T.indigoLight, borderRadius: 6, padding: "2px 7px", color: T.indigo, fontSize: 11, fontWeight: 700 }}>
                                {levels.length} levels
                              </span>
                            </div>
                          </div>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transition: "transform 0.2s", transform: isChOpen ? "rotate(180deg)" : "none", flexShrink: 0 }}>
                            <path d="M3 5l4 4 4-4" stroke={isChOpen ? T.indigo : T.textTer} strokeWidth="1.8" strokeLinecap="round" />
                          </svg>
                        </div>

                        {isChOpen && (
                          <div style={{ background: T.bg, padding: "10px 14px 12px", borderTop: `1px solid ${T.border}` }}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: T.textTer, letterSpacing: 0.7, marginBottom: 8 }}>SELECT LEVEL</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                              {levels.map(l => {
                                const locked = l.levelNum > unlockedLevel;
                                return (
                                  <button
                                    key={l.levelNum}
                                    onClick={() => {
                                      if (locked) return;
                                      router.push(
                                        `/practice/${encodeURIComponent(sub.key)}/${encodeURIComponent(ch.chapter)}?level=${l.levelNum}&offset=${l.offset}&limit=${l.questions}&label=${encodeURIComponent(ch.chapter)}`
                                      );
                                    }}
                                    style={{
                                      display: "flex", flexDirection: "column", alignItems: "center",
                                      background: locked ? T.bg : T.surface,
                                      border: `1.5px solid ${locked ? T.border : T.indigoMid}`,
                                      borderRadius: 12, padding: "9px 12px",
                                      cursor: locked ? "not-allowed" : "pointer",
                                      minWidth: 58, opacity: locked ? 0.4 : 1,
                                      transition: "all 0.15s",
                                    }}>
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

        {/* Divider */}
        <div style={{ height: 1, background: T.border, margin: "8px 0 12px" }} />

        {/* Coming soon subjects */}
        {comingSoonSubjects.map(sub => (
          <div key={sub.key} style={{ marginBottom: 10, opacity: 0.5 }}>
            <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: "13px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>{sub.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: T.text, fontWeight: 700, fontSize: 14 }}>{lang === "ta" ? sub.ta : sub.key}</div>
                <div style={{ color: T.textSec, fontSize: 11, marginTop: 2 }}>Coming soon</div>
              </div>
              <span style={{ background: "#F3F4F6", color: "#9CA3AF", borderRadius: 8, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>Soon</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
