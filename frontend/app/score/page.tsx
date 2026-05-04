“use client”;

import { useEffect, useState, useMemo } from “react”;
import { useRouter } from “next/navigation”;

// ── Types (mirrors lib/session.ts) ──────────────────────────────────────────
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

// ── Helpers ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = “vaagai_sessions”;

function getSessions(): LocalSession[] {
try {
return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? “[]”);
} catch {
return [];
}
}

function pct(correct: number, total: number) {
if (!total) return 0;
return Math.round((correct / total) * 100);
}

function relativeTime(iso: string): string {
const diff = Date.now() - new Date(iso).getTime();
const mins = Math.floor(diff / 60000);
if (mins < 60) return mins <= 1 ? “Just now” : `${mins}m ago`;
const hrs = Math.floor(mins / 60);
if (hrs < 24) return `${hrs}h ago`;
const days = Math.floor(hrs / 24);
if (days === 1) return “Yesterday”;
return `${days} days ago`;
}

const SUBJECT_ICONS: Record<string, { icon: string; bg: string; color: string }> = {
History:   { icon: “📜”, bg: “#D1FAE5”, color: “#059669” },
Polity:    { icon: “⚖️”, bg: “#FEF3C7”, color: “#D97706” },
Tamil:     { icon: “அ”,  bg: “#EDE9FE”, color: “#7C3AED” },
Geography: { icon: “🌏”, bg: “#DBEAFE”, color: “#2563EB” },
Science:   { icon: “🔬”, bg: “#FCE7F3”, color: “#DB2777” },
Economy:   { icon: “📈”, bg: “#D1FAE5”, color: “#10B981” },
};

function scoreColor(p: number) {
if (p >= 70) return “#059669”;
if (p >= 50) return “#D97706”;
return “#DC2626”;
}
function ringColor(p: number) {
if (p >= 70) return “#10B981”;
if (p >= 50) return “#F59E0B”;
return “#EF4444”;
}
function barClass(p: number) {
if (p >= 70) return “#10B981”;
if (p >= 50) return “#F59E0B”;
return “#EF4444”;
}

// circumference for r=19 circle ≈ 119.4
const CIRC = 2 * Math.PI * 19;

// ── Component ────────────────────────────────────────────────────────────────
export default function ScoresPage() {
const router = useRouter();
const [sessions, setSessions] = useState<LocalSession[]>([]);
const [filter, setFilter] = useState(“All”);

useEffect(() => {
setSessions(getSessions());
}, []);

const completed = useMemo(
() => sessions.filter((s) => s.completed_at !== null),
[sessions]
);

// Subjects available in completed sessions
const subjects = useMemo(() => {
const s = new Set(completed.map((s) => s.subject));
return [“All”, …Array.from(s)];
}, [completed]);

// Filtered sessions for recent list
const filtered = useMemo(
() =>
filter === “All”
? completed
: completed.filter((s) => s.subject === filter),
[completed, filter]
);

// Global stats
const totalSessions = completed.length;
const totalQuestions = completed.reduce((a, s) => a + s.total_questions, 0);
const avgScore = totalSessions
? Math.round(
completed.reduce((a, s) => a + pct(s.correct_count, s.total_questions), 0) /
totalSessions
)
: 0;

// Per-subject breakdown
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
// Weakest chapter
const chapters = Object.entries(data.chapters).map(([ch, d]) => ({
chapter: ch,
accuracy: pct(d.correct, d.total),
}));
chapters.sort((a, b) => a.accuracy - b.accuracy);
const weakest = chapters[0];
return { subject, accuracy, weakest };
});
}, [completed]);

// Insights
const insights = useMemo(() => {
const out: { icon: string; text: JSX.Element }[] = [];
if (!subjectStats.length) return out;
const sorted = […subjectStats].sort((a, b) => a.accuracy - b.accuracy);
const worst = sorted[0];
const best = sorted[sorted.length - 1];
if (worst && worst.accuracy < 70)
out.push({
icon: “⚠️”,
text: (
<>
<span style={{ color: “#FFD97D”, fontWeight: 800 }}>{worst.subject} needs attention</span> — scoring below average
</>
),
});
if (best && best.accuracy >= 70)
out.push({
icon: “🔥”,
text: (
<>
Strong in {best.subject} — <span style={{ color: “#FFD97D”, fontWeight: 800 }}>keep going</span>
</>
),
});
if (totalSessions >= 3)
out.push({
icon: “📈”,
text: (
<>
<span style={{ color: “#FFD97D”, fontWeight: 800 }}>{totalSessions} sessions</span> completed — great consistency!
</>
),
});
return out.slice(0, 3);
}, [subjectStats, totalSessions]);

// Last incomplete session (sticky CTA)
const lastIncomplete = useMemo(
() => sessions.filter((s) => !s.completed_at).pop() ?? null,
[sessions]
);
// Or last completed session
const lastSession = completed[completed.length - 1] ?? null;
const ctaSession = lastIncomplete ?? lastSession;

const recent = useMemo(() => […filtered].reverse().slice(0, 10), [filtered]);

const isEmpty = completed.length === 0;

return (
<div style={{ display: “flex”, flexDirection: “column”, height: “100dvh”, background: “#EDEEF4”, overflowY: “auto”, overscrollBehavior: “none”, WebkitOverflowScrolling: “touch” as never }}>

```
  {/* HEADER */}
  <div style={{ background: "#fff", padding: "20px 18px 0", flexShrink: 0, borderBottom: "2px solid #E0E2ED" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: "#0A0A14", letterSpacing: -0.5 }}>My Progress</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#444", background: "#EDEEF4", padding: "6px 12px", borderRadius: 10 }}>
        {totalSessions} sessions
      </div>
    </div>
    {/* Filter pills */}
    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 14, scrollbarWidth: "none" }}>
      {subjects.map((s) => (
        <button
          key={s}
          onClick={() => setFilter(s)}
          style={{
            flexShrink: 0,
            padding: "8px 16px",
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 700,
            border: "2px solid",
            borderColor: filter === s ? "#3D3B8E" : "#D0D3E0",
            background: filter === s ? "#3D3B8E" : "#fff",
            color: filter === s ? "#fff" : "#444",
            cursor: "pointer",
          }}
        >
          {s}
        </button>
      ))}
    </div>
  </div>

  {/* BODY */}
  <div style={{ flex: 1, overflowY: "auto", overscrollBehavior: "none", padding: "14px 14px 140px", display: "flex", flexDirection: "column", gap: 12 }}>

    {isEmpty ? (
      <div style={{ textAlign: "center", padding: "60px 20px", color: "#888" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#0A0A14", marginBottom: 8 }}>No sessions yet</div>
        <div style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>Complete a practice session to see your progress here.</div>
        <button
          onClick={() => router.push("/subjects")}
          style={{ background: "#3D3B8E", color: "#fff", border: "none", borderRadius: 14, padding: "14px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
        >
          Start Practicing →
        </button>
      </div>
    ) : (
      <>
        {/* STATS ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { value: totalSessions, label: "Sessions", color: "#3D3B8E" },
            { value: `${avgScore}%`, label: "Avg Score", color: scoreColor(avgScore) },
            { value: totalQuestions, label: "Questions", color: "#D97706" },
          ].map((c) => (
            <div key={c.label} style={{ background: "#fff", borderRadius: 14, padding: "14px 8px", textAlign: "center", border: "2px solid #E0E2ED" }}>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -1, lineHeight: 1, marginBottom: 5, fontVariantNumeric: "tabular-nums", color: c.color }}>
                {c.value}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: 0.3 }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* INSIGHTS */}
        {insights.length > 0 && (
          <div style={{ background: "#3D3B8E", borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 0.8 }}>💡 Your insights</div>
            {insights.map((ins, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 20, width: 40, height: 40, background: "rgba(255,255,255,0.15)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {ins.icon}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1.4 }}>{ins.text}</div>
              </div>
            ))}
          </div>
        )}

        {/* SUBJECT BREAKDOWN */}
        {subjectStats.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Subject breakdown</div>
            <div style={{ background: "#fff", borderRadius: 18, overflow: "hidden", border: "2px solid #E0E2ED" }}>
              {subjectStats.map((s, i) => {
                const meta = SUBJECT_ICONS[s.subject] ?? { icon: "📚", bg: "#F3F4F6", color: "#374151" };
                return (
                  <div key={s.subject} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: i < subjectStats.length - 1 ? "1px solid #EDEEF4" : "none" }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: s.subject === "Tamil" ? 16 : 20, fontWeight: 800, color: meta.color, flexShrink: 0 }}>
                      {meta.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#0A0A14" }}>{s.subject}</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: scoreColor(s.accuracy) }}>{s.accuracy}%</div>
                      </div>
                      <div style={{ height: 7, background: "#EDEEF4", borderRadius: 10, overflow: "hidden", marginBottom: 5 }}>
                        <div style={{ height: "100%", width: `${s.accuracy}%`, background: barClass(s.accuracy), borderRadius: 10, transition: "width 0.6s ease" }} />
                      </div>
                      {s.weakest && s.accuracy < 100 ? (
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>
                          Weak: <span style={{ color: "#DC2626", fontWeight: 800 }}>{s.weakest.chapter}</span>
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#059669" }}>All topics above average ✓</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RECENT SESSIONS */}
        {recent.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Recent sessions</div>
            <div style={{ background: "#fff", borderRadius: 18, overflow: "hidden", border: "2px solid #E0E2ED" }}>
              {recent.map((s, i) => {
                const score = pct(s.correct_count, s.total_questions);
                const dashOffset = CIRC - (CIRC * score) / 100;
                const subjectMeta = SUBJECT_ICONS[s.subject] ?? { icon: "📚", bg: "#F3F4F6", color: "#374151" };
                const wrongCount = s.total_questions - s.correct_count;
                const mistakeLabel = wrongCount === 0 ? "Perfect score! 🎉" : wrongCount <= 2 ? `${wrongCount} easy mistake${wrongCount > 1 ? "s" : ""}` : `${wrongCount} concept gaps`;
                const mistakeStyle = wrongCount === 0
                  ? { background: "#D1FAE5", color: "#064E3B" }
                  : wrongCount <= 2
                  ? { background: "#FEF3C7", color: "#78350F" }
                  : { background: "#FEE2E2", color: "#7F1D1D" };

                return (
                  <div key={s.id} style={{ padding: "14px 16px", borderBottom: i < recent.length - 1 ? "1px solid #EDEEF4" : "none" }}>
                    {/* Top row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      {/* Ring */}
                      <div style={{ width: 48, height: 48, flexShrink: 0, position: "relative" }}>
                        <svg viewBox="0 0 48 48" width={48} height={48} style={{ transform: "rotate(-90deg)" }}>
                          <circle cx="24" cy="24" r="19" fill="none" stroke="#EDEEF4" strokeWidth={5} />
                          <circle cx="24" cy="24" r="19" fill="none" stroke={ringColor(score)} strokeWidth={5} strokeLinecap="round"
                            strokeDasharray={CIRC} strokeDashoffset={dashOffset} />
                        </svg>
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#0A0A14" }}>
                          {score}%
                        </div>
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#0A0A14", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 5 }}>
                          {s.chapter}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: subjectMeta.bg, color: subjectMeta.color }}>
                            {s.subject}
                          </div>
                          <div style={{ fontSize: 11, color: "#666", fontWeight: 600 }}>
                            {s.completed_at ? relativeTime(s.completed_at) : relativeTime(s.started_at)}
                          </div>
                        </div>
                      </div>
                      {/* Score right */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#0A0A14" }}>{s.correct_count}/{s.total_questions}</div>
                        <div style={{ fontSize: 11, color: "#666", fontWeight: 600 }}>Level {s.level}</div>
                      </div>
                    </div>
                    {/* Bottom row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, padding: "5px 10px", borderRadius: 8, ...mistakeStyle }}>
                        {mistakeLabel}
                      </div>
                      <button
                        onClick={() => router.push(`/practice/${encodeURIComponent(s.subject)}/${encodeURIComponent(s.chapter)}?level=${s.level}&offset=${s.offset}&limit=${s.limit}`)}
                        style={{ fontSize: 13, fontWeight: 700, color: "#3D3B8E", background: "#EDEEFF", padding: "7px 14px", borderRadius: 10, border: "none", cursor: "pointer", minHeight: 36, display: "flex", alignItems: "center" }}
                      >
                        Review →
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

  {/* STICKY CTA — continue where you left off */}
  {ctaSession && !isEmpty && (
    <div
      onClick={() => router.push(`/practice/${encodeURIComponent(ctaSession.subject)}/${encodeURIComponent(ctaSession.chapter)}?level=${ctaSession.level}&offset=${ctaSession.offset}&limit=${ctaSession.limit}`)}
      style={{
        position: "fixed",
        bottom: 68,
        left: 14,
        right: 14,
        background: "#3D3B8E",
        borderRadius: 16,
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 8px 28px rgba(61,59,142,0.4)",
        cursor: "pointer",
        zIndex: 10,
      }}
    >
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.65)", marginBottom: 3 }}>
          {lastIncomplete ? "Continue where you left off" : "Practice again"}
        </div>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>
          {ctaSession.chapter} · L{ctaSession.level}
        </div>
      </div>
      <div style={{ width: 40, height: 40, background: "rgba(255,255,255,0.18)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#fff", flexShrink: 0 }}>
        →
      </div>
    </div>
  )}
</div>
```

);
}
