"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

type LocalResponse = {
  question_id: string;
  selected_option: string;
  is_correct: boolean;
  time_spent_seconds: number;
};

type LocalSession = {
  id: string;
  subject: string;
  chapter: string;
  level: number;
  offset: number;
  limit: number;
  started_at: string;
  completed_at: string | null;
  total_questions: number;
  correct_count: number;
  responses: LocalResponse[];
};

const STORAGE_KEY = "vaagai_sessions";
const LANG_KEY = "vaagai_lang";

function getSessions(): LocalSession[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function pct(correct: number, total: number) {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

function relativeTime(iso: string, lang: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1
    ? (lang === "ta" ? "இப்பொழுதுதான்" : "Just now")
    : mins + (lang === "ta" ? " நிமிடம் முன்பு" : "m ago");
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + (lang === "ta" ? " மணி முன்பு" : "h ago");
  const days = Math.floor(hrs / 24);
  if (days === 1) return lang === "ta" ? "நேற்று" : "Yesterday";
  return days + (lang === "ta" ? " நாட்களுக்கு முன்பு" : " days ago");
}

const T = {
  en: {
    title: "My Progress",
    sessions: "Sessions",
    avgScore: "Avg Score",
    questions: "Questions",
    insights: "Your insights",
    subjectBreakdown: "Subject breakdown",
    recentSessions: "Recent sessions",
    continueOff: "Continue where you left off",
    practiceAgain: "Practice again",
    noSessions: "No sessions yet",
    noSessionsSub: "Complete a practice session to see your progress here.",
    startPracticing: "Start Practicing",
    weak: "Weak",
    allAbove: "All topics above average",
    perfect: "Perfect score!",
    easyMistakes: "easy mistakes",
    conceptGaps: "concept gaps",
    review: "Review",
    level: "Level",
    needsAttention: " needs attention -- scoring below average",
    strongIn: "Strong in ",
    keepGoing: " -- keep going",
    sessionsCompleted: " sessions completed -- great consistency!",
  },
  ta: {
    title: "என் முன்னேற்றம்",
    sessions: "பதிவுகள்",
    avgScore: "சராசரி மதிப்பெண்",
    questions: "கேள்விகள்",
    insights: "உங்கள் பகுப்பாய்வு",
    subjectBreakdown: "பாட வாரியான பகுப்பு",
    recentSessions: "சமீபத்திய பதிவுகள்",
    continueOff: "நிறுத்திய இடத்திலிருந்து தொடரவும்",
    practiceAgain: "மீண்டும் பயிற்சி செய்யவும்",
    noSessions: "இன்னும் பதிவுகள் இல்லை",
    noSessionsSub: "உங்கள் முன்னேற்றத்தை காண ஒரு பயிற்சியை முடிக்கவும்.",
    startPracticing: "பயிற்சியை தொடங்கவும்",
    weak: "பலவீனம்",
    allAbove: "அனைத்து தலைப்புகளும் சராசரிக்கு மேல்",
    perfect: "முழு மதிப்பெண்!",
    easyMistakes: "எளிய தவறுகள்",
    conceptGaps: "கருத்து குறைபாடுகள்",
    review: "மீளாய்வு",
    level: "நிலை",
    needsAttention: " கவனம் தேவை -- சராசரிக்கு கீழே உள்ளது",
    strongIn: "வலிமையானது: ",
    keepGoing: " -- தொடர்ந்து செல்லுங்கள்",
    sessionsCompleted: " பதிவுகள் முடிந்தன -- சிறந்த தொடர்ச்சி!",
  },
};

const SUBJECT_ICONS: Record<string, { bg: string; color: string }> = {
  History:   { bg: "#D1FAE5", color: "#059669" },
  Polity:    { bg: "#FEF3C7", color: "#D97706" },
  Tamil:     { bg: "#EDE9FE", color: "#7C3AED" },
  Geography: { bg: "#DBEAFE", color: "#2563EB" },
  Science:   { bg: "#FCE7F3", color: "#DB2777" },
  Economy:   { bg: "#D1FAE5", color: "#10B981" },
};

function scoreColor(p: number) {
  if (p >= 70) return "#059669";
  if (p >= 50) return "#D97706";
  return "#DC2626";
}
function ringColor(p: number) {
  if (p >= 70) return "#10B981";
  if (p >= 50) return "#F59E0B";
  return "#EF4444";
}
function barColor(p: number) {
  if (p >= 70) return "#10B981";
  if (p >= 50) return "#F59E0B";
  return "#EF4444";
}

const CIRC = 2 * Math.PI * 19;

export default function ScorePage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<LocalSession[]>([]);
  const [filter, setFilter] = useState("All");
  const [lang, setLang] = useState("en");

  useEffect(() => {
    setSessions(getSessions());
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "ta" || saved === "en") setLang(saved);
  }, []);

  const t = T[lang as "en" | "ta"];

  const completed = useMemo(
    () => sessions.filter((s) => s.completed_at !== null),
    [sessions]
  );

  const subjects = useMemo(() => {
    const set = new Set(completed.map((s) => s.subject));
    return ["All", ...Array.from(set)];
  }, [completed]);

  const filtered = useMemo(
    () => filter === "All" ? completed : completed.filter((s) => s.subject === filter),
    [completed, filter]
  );

  const totalSessions = completed.length;
  const totalQuestions = completed.reduce((a, s) => a + s.total_questions, 0);
  const avgScore = totalSessions
    ? Math.round(completed.reduce((a, s) => a + pct(s.correct_count, s.total_questions), 0) / totalSessions)
    : 0;

  const subjectStats = useMemo(() => {
    const map: Record<string, { correct: number; total: number; chapters: Record<string, { correct: number; total: number }> }> = {};
    completed.forEach((s) => {
      if (!map[s.subject]) map[s.subject] = { correct: 0, total: 0, chapters: {} };
      map[s.subject].correct += s.correct_count;
      map[s.subject].total += s.total_questions;
      if (!map[s.subject].chapters[s.chapter])
        map[s.subject].chapters[s.chapter] = { correct: 0, total: 0 };
      map[s.subject].chapters[s.chapter].correct += s.correct_count;
      map[s.subject].chapters[s.chapter].total += s.total_questions;
    });
    return Object.entries(map).map(([subject, data]) => {
      const accuracy = pct(data.correct, data.total);
      const chapters = Object.entries(data.chapters).map(([ch, d]) => ({
        chapter: ch,
        accuracy: pct(d.correct, d.total),
      }));
      chapters.sort((a, b) => a.accuracy - b.accuracy);
      return { subject, accuracy, weakest: chapters[0] };
    });
  }, [completed]);

  const insights = useMemo(() => {
    const out: { highlight: string; text: string }[] = [];
    if (!subjectStats.length) return out;
    const sorted = [...subjectStats].sort((a, b) => a.accuracy - b.accuracy);
    const worst = sorted[0];
    const best = sorted[sorted.length - 1];
    if (worst && worst.accuracy < 70)
      out.push({ highlight: worst.subject, text: t.needsAttention });
    if (best && best.accuracy >= 70)
      out.push({ highlight: "", text: t.strongIn + best.subject + t.keepGoing });
    if (totalSessions >= 3)
      out.push({ highlight: "", text: totalSessions + t.sessionsCompleted });
    return out.slice(0, 3);
  }, [subjectStats, totalSessions, t]);

  const lastIncomplete = useMemo(
    () => sessions.filter((s) => !s.completed_at).pop() ?? null,
    [sessions]
  );
  const lastSession = completed[completed.length - 1] ?? null;
  const ctaSession = lastIncomplete ?? lastSession;
  const recent = useMemo(() => [...filtered].reverse().slice(0, 10), [filtered]);
  const isEmpty = completed.length === 0;

  function toggleLang(l: string) {
    setLang(l);
    localStorage.setItem(LANG_KEY, l);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "#EDEEF4", overflow: "hidden" }}>

      <div style={{ background: "#fff", padding: "20px 18px 0", flexShrink: 0, borderBottom: "2px solid #E0E2ED" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0A0A14", letterSpacing: -0.5 }}>{t.title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#444", background: "#EDEEF4", padding: "6px 12px", borderRadius: 10 }}>
              {totalSessions} {t.sessions}
            </div>
            <div style={{ display: "flex", background: "#EDEEF4", borderRadius: 20, padding: 3, gap: 2 }}>
              {["en", "ta"].map((l) => (
                <button key={l} onClick={() => toggleLang(l)} style={{
                  padding: "5px 12px", borderRadius: 16, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer",
                  background: lang === l ? "#3D3B8E" : "transparent",
                  color: lang === l ? "#fff" : "#444",
                }}>
                  {l === "en" ? "EN" : "தமிழ்"}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 14, scrollbarWidth: "none" }}>
          {subjects.map((s) => (
            <button key={s} onClick={() => setFilter(s)} style={{
              flexShrink: 0, padding: "8px 16px", borderRadius: 20, fontSize: 13, fontWeight: 700,
              border: "2px solid", borderColor: filter === s ? "#3D3B8E" : "#D0D3E0",
              background: filter === s ? "#3D3B8E" : "#fff", color: filter === s ? "#fff" : "#444", cursor: "pointer",
            }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", overscrollBehavior: "none", padding: "14px 14px 160px", display: "flex", flexDirection: "column", gap: 12 }}>

        {isEmpty ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0A0A14", marginBottom: 8 }}>{t.noSessions}</div>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>{t.noSessionsSub}</div>
            <button onClick={() => router.push("/subjects")} style={{
              background: "#3D3B8E", color: "#fff", border: "none", borderRadius: 14,
              padding: "14px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer"
            }}>
              {t.startPracticing}
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { value: String(totalSessions), label: t.sessions, color: "#3D3B8E" },
                { value: avgScore + "%", label: t.avgScore, color: scoreColor(avgScore) },
                { value: String(totalQuestions), label: t.questions, color: "#D97706" },
              ].map((c) => (
                <div key={c.label} style={{ background: "#fff", borderRadius: 14, padding: "14px 8px", textAlign: "center", border: "2px solid #E0E2ED" }}>
                  <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -1, lineHeight: 1, marginBottom: 5, color: c.color }}>{c.value}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: 0.3 }}>{c.label}</div>
                </div>
              ))}
            </div>

            {insights.length > 0 && (
              <div style={{ background: "#3D3B8E", borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 0.8 }}>{t.insights}</div>
                {insights.map((ins, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 40, height: 40, background: "rgba(255,255,255,0.15)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#FFD97D", fontWeight: 800, fontSize: 18 }}>
                      !
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1.4 }}>
                      {ins.highlight && <span style={{ color: "#FFD97D", fontWeight: 800 }}>{ins.highlight}</span>}
                      {ins.text}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {subjectStats.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{t.subjectBreakdown}</div>
                <div style={{ background: "#fff", borderRadius: 18, overflow: "hidden", border: "2px solid #E0E2ED" }}>
                  {subjectStats.map((s, i) => {
                    const meta = SUBJECT_ICONS[s.subject] ?? { bg: "#F3F4F6", color: "#374151" };
                    return (
                      <div key={s.subject} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: i < subjectStats.length - 1 ? "1px solid #EDEEF4" : "none" }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: meta.color, flexShrink: 0 }}>
                          {s.subject === "Tamil" ? "அ" : s.subject.slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "#0A0A14" }}>{s.subject}</div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: scoreColor(s.accuracy) }}>{s.accuracy}%</div>
                          </div>
                          <div style={{ height: 7, background: "#EDEEF4", borderRadius: 10, overflow: "hidden", marginBottom: 5 }}>
                            <div style={{ height: "100%", width: s.accuracy + "%", background: barColor(s.accuracy), borderRadius: 10 }} />
                          </div>
                          {s.weakest && s.accuracy < 100 ? (
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>
                              {t.weak}: <span style={{ color: "#DC2626", fontWeight: 800 }}>{s.weakest.chapter}</span>
                            </div>
                          ) : (
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#059669" }}>{t.allAbove}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {recent.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{t.recentSessions}</div>
                <div style={{ background: "#fff", borderRadius: 18, overflow: "hidden", border: "2px solid #E0E2ED" }}>
                  {recent.map((s, i) => {
                    const score = pct(s.correct_count, s.total_questions);
                    const dashOffset = CIRC - (CIRC * score) / 100;
                    const subjectMeta = SUBJECT_ICONS[s.subject] ?? { bg: "#F3F4F6", color: "#374151" };
                    const wrongCount = s.total_questions - s.correct_count;
                    const mistakeLabel = wrongCount === 0 ? t.perfect : wrongCount <= 2 ? wrongCount + " " + t.easyMistakes : wrongCount + " " + t.conceptGaps;
                    const mistakeStyle = wrongCount === 0
                      ? { background: "#D1FAE5", color: "#064E3B" }
                      : wrongCount <= 2
                      ? { background: "#FEF3C7", color: "#78350F" }
                      : { background: "#FEE2E2", color: "#7F1D1D" };
                    return (
                      <div key={s.id} style={{ padding: "14px 16px", borderBottom: i < recent.length - 1 ? "1px solid #EDEEF4" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                          <div style={{ width: 48, height: 48, flexShrink: 0, position: "relative" }}>
                            <svg viewBox="0 0 48 48" width={48} height={48} style={{ transform: "rotate(-90deg)" }}>
                              <circle cx="24" cy="24" r="19" fill="none" stroke="#EDEEF4" strokeWidth={5} />
                              <circle cx="24" cy="24" r="19" fill="none" stroke={ringColor(score)} strokeWidth={5} strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={dashOffset} />
                            </svg>
                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#0A0A14" }}>
                              {score}%
                            </div>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "#0A0A14", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 5 }}>
                              {s.chapter}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: subjectMeta.bg, color: subjectMeta.color }}>
                                {s.subject}
                              </div>
                              <div style={{ fontSize: 11, color: "#666", fontWeight: 600 }}>
                                {s.completed_at ? relativeTime(s.completed_at, lang) : relativeTime(s.started_at, lang)}
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: "#0A0A14" }}>{s.correct_count}/{s.total_questions}</div>
                            <div style={{ fontSize: 11, color: "#666", fontWeight: 600 }}>{t.level} {s.level}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ fontSize: 12, fontWeight: 700, padding: "5px 10px", borderRadius: 8, ...mistakeStyle }}>
                            {mistakeLabel}
                          </div>
                          <button
                            onClick={() => router.push("/practice/" + encodeURIComponent(s.subject) + "/" + encodeURIComponent(s.chapter) + "?level=" + s.level + "&offset=" + s.offset + "&limit=" + s.limit)}
                            style={{ fontSize: 13, fontWeight: 700, color: "#3D3B8E", background: "#EDEEFF", padding: "7px 14px", borderRadius: 10, border: "none", cursor: "pointer", minHeight: 36, display: "flex", alignItems: "center" }}
                          >
                            {t.review}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {ctaSession && !isEmpty && (
        <div
          onClick={() => router.push("/practice/" + encodeURIComponent(ctaSession.subject) + "/" + encodeURIComponent(ctaSession.chapter) + "?level=" + ctaSession.level + "&offset=" + ctaSession.offset + "&limit=" + ctaSession.limit)}
          style={{
            position: "fixed", bottom: 68, left: 14, right: 14, background: "#3D3B8E",
            borderRadius: 16, padding: "16px 18px", display: "flex", alignItems: "center",
            justifyContent: "space-between", boxShadow: "0 8px 28px rgba(61,59,142,0.4)", cursor: "pointer", zIndex: 10,
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.65)", marginBottom: 3 }}>
              {lastIncomplete ? t.continueOff : t.practiceAgain}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>
              {ctaSession.chapter} {t.level} {ctaSession.level}
            </div>
          </div>
          <div style={{ width: 40, height: 40, background: "rgba(255,255,255,0.18)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff", flexShrink: 0, fontWeight: 800 }}>
            &gt;
          </div>
        </div>
      )}
    </div>
  );
}
