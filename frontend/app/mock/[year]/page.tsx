"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { T, shadow } from "@/lib/tokens";
import { supabase, type Question } from "@/lib/supabase";

type AnswerState = "unanswered" | "answered" | "marked" | "skipped";

function formatTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const TOTAL_SECS = 3 * 60 * 60; // 3 hours
const LABELS = ["A", "B", "C", "D"];

export default function MockTestPage() {
  const { year } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const yearNum = parseInt(year as string);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [tamilCount, setTamilCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // question_id → selected_option
  const [states, setStates] = useState<Record<string, AnswerState>>({}); // question_id → state
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECS);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const pillRowRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Auth check
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    });
  }, [router, pathname]);

  // Fetch questions via API route
  useEffect(() => {
    setLoading(true);
    const lang = localStorage.getItem("lang") ?? "ta";
    fetch(`/api/mock/questions?year=${yearNum}&group=group4&lang=${lang}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setQuestions(data.questions ?? []);
        setTamilCount(data.tamil_count ?? 0);
        setLoading(false);
      })
      .catch(() => { setError("Could not load questions. Please try again."); setLoading(false); });
  }, [yearNum]);

  // Timer
  useEffect(() => {
    if (loading || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(interval); handleSubmit(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading]);

  // Scroll pill into view
  useEffect(() => {
    if (!pillRowRef.current) return;
    const pill = pillRowRef.current.children[currentIndex] as HTMLElement;
    if (pill) pill.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [currentIndex]);

  const q = questions[currentIndex];
  const total = questions.length;

  function handleSelect(opt: string) {
    if (!q) return;
    setAnswers(prev => ({ ...prev, [q.id]: opt }));
    setStates(prev => ({ ...prev, [q.id]: "answered" }));
  }

  function handleMark() {
    if (!q) return;
    setStates(prev => ({ ...prev, [q.id]: prev[q.id] === "marked" ? (answers[q.id] ? "answered" : "unanswered") : "marked" }));
  }

  function handleNext() {
    if (!q) return;
    // Mark unanswered as skipped when moving past
    if (!answers[q.id] && states[q.id] !== "marked") {
      setStates(prev => ({ ...prev, [q.id]: "skipped" }));
    }
    if (currentIndex + 1 < total) setCurrentIndex(i => i + 1);
  }

  function handlePrev() {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  }

  const handleSubmit = useCallback(async (auto = false) => {
    setSubmitting(true);
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);

    let score = 0;
    const subjectMap: Record<string, { correct: number; total: number }> = {};

    for (const q of questions) {
      const subj = q.subject ?? "General";
      if (!subjectMap[subj]) subjectMap[subj] = { correct: 0, total: 0 };
      subjectMap[subj].total++;
      if (answers[q.id] === q.correct_option) {
        score++;
        subjectMap[subj].correct++;
      }
    }

    const subjectBreakdown = Object.entries(subjectMap).map(([subject, v]) => ({
      subject, correct: v.correct, total: v.total,
    }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("mock_attempts").insert({
          user_id: user.id,
          year: yearNum,
          score,
          total,
          time_taken: timeTaken,
          answers,
          subject_breakdown: subjectBreakdown,
        });
      }
    } catch (e) {
      console.error("Failed to save attempt:", e);
    }

    // Navigate to result
    const params = new URLSearchParams({
      score: String(score),
      total: String(total),
      time: String(timeTaken),
      breakdown: JSON.stringify(subjectBreakdown),
      tamil_count: String(tamilCount),
    });
    router.push(`/mock/${yearNum}/result?${params.toString()}`);
  }, [answers, questions, yearNum, router]);

  if (loading) return (
    <div style={{ background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
      <div style={{ fontSize: 14, color: T.textSec }}>வினாக்கள் ஏற்றப்படுகின்றன...</div>
    </div>
  );

  if (error) return (
    <div style={{ background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100dvh", gap: 12, padding: 24 }}>
      <div style={{ fontSize: 32 }}>⚠️</div>
      <div style={{ fontSize: 14, color: T.text, textAlign: "center" }}>{error}</div>
      <button onClick={() => router.back()} style={{ padding: "10px 20px", background: T.indigo, color: "#fff", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Back</button>
    </div>
  );

  if (!q) return null;

  const timerUrgent = timeLeft < 600; // under 10 mins
  const answeredCount = Object.values(states).filter(s => s === "answered").length;
  const markedCount = Object.values(states).filter(s => s === "marked").length;
  const skippedCount = Object.values(states).filter(s => s === "skipped").length;
  const selectedOpt = answers[q.id] ?? null;
  const currentState = states[q.id] ?? "unanswered";

  function pillStyle(i: number): React.CSSProperties {
    const qId = questions[i]?.id;
    const st = states[qId] ?? "unanswered";
    const isCur = i === currentIndex;
    if (isCur) return { background: T.indigo, border: `1.5px solid ${T.indigo}`, color: "#fff" };
    if (st === "answered") return { background: T.greenBg, border: `1.5px solid ${T.greenBorder}`, color: T.green };
    if (st === "marked") return { background: "#FFFBEB", border: "1.5px solid #FDE68A", color: "#92400E" };
    if (st === "skipped") return { background: T.redBg, border: `1.5px solid ${T.redBorder}`, color: T.red };
    return { background: T.bg, border: `1.5px solid ${T.border}`, color: T.textTer };
  }

  return (
    <div style={{ background: T.bg, display: "flex", flexDirection: "column", height: "100dvh", fontFamily: "system-ui, sans-serif", overflow: "hidden" }}>

      {/* Sticky timer bar */}
      <div style={{ background: "#1A1A2E", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: timerUrgent ? "#EF4444" : "#6BCB77" }} />
          <span style={{ fontSize: 14, fontWeight: 900, color: timerUrgent ? "#EF4444" : "#fff", fontVariantNumeric: "tabular-nums" }}>
            {formatTime(timeLeft)}
          </span>
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
          <b style={{ color: "#fff" }}>{currentIndex + 1}</b> / {total}
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "5px 12px", fontSize: 11, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
        >
          சமர்ப்பி
        </button>
      </div>

      {/* Pill nav */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "8px 14px", overflowX: "auto", flexShrink: 0, WebkitOverflowScrolling: "touch" as any, scrollbarWidth: "none" as any }}>
        <div ref={pillRowRef} style={{ display: "flex", gap: 5, width: "max-content", alignItems: "center" }}>
          {questions.map((_, i) => {
            const isGSStart = tamilCount > 0 && i === tamilCount;
            return (
              <>
                {isGSStart && (
                  <div key={`gs-label`} style={{ fontSize: 9, fontWeight: 800, color: T.indigo, background: T.indigoLight, border: `1px solid ${T.indigoMid}`, borderRadius: 6, padding: "3px 6px", flexShrink: 0, marginLeft: 4, marginRight: 2 }}>GS</div>
                )}
                {i === 0 && tamilCount > 0 && (
                  <div key={`ta-label`} style={{ fontSize: 9, fontWeight: 800, color: "#6D28D9", background: "#EDE9FE", border: "1px solid #C4B5FD", borderRadius: 6, padding: "3px 6px", flexShrink: 0, marginRight: 2 }}>தமிழ்</div>
                )}
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, cursor: "pointer", flexShrink: 0, fontFamily: "inherit", ...pillStyle(i) }}
                >
                  {i + 1}
                </button>
              </>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "5px 14px", display: "flex", gap: 12, flexShrink: 0 }}>
        {[
          { bg: T.greenBg, border: T.greenBorder, label: `${answeredCount} Answered` },
          { bg: "#FFFBEB", border: "#FDE68A", label: `${markedCount} Marked` },
          { bg: T.redBg, border: T.redBorder, label: `${skippedCount} Skipped` },
          { bg: T.bg, border: T.border, label: `${total - answeredCount - markedCount - skippedCount} Not visited` },
        ].map(({ bg, border, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: bg, border: `1px solid ${border}` }} />
            <span style={{ fontSize: 9, color: T.textSec, fontWeight: 600 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Question content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px 20px", overscrollBehavior: "none", WebkitOverflowScrolling: "touch" as any }}>

        {/* Question card */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: "16px 16px", marginBottom: 10, boxShadow: shadow.md }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" as const }}>
            <span style={{ background: "#FFF3E0", border: "1px solid #FFD180", borderRadius: 6, padding: "2px 8px", fontSize: 9, fontWeight: 800, color: "#E65100" }}>⭐ PYQ {yearNum}</span>
            {currentIndex < tamilCount
              ? <span style={{ background: "#EDE9FE", border: "1px solid #C4B5FD", borderRadius: 6, padding: "2px 8px", fontSize: 9, fontWeight: 800, color: "#6D28D9" }}>தமிழ்</span>
              : <span style={{ background: T.indigoLight, border: `1px solid ${T.indigoMid}`, borderRadius: 6, padding: "2px 8px", fontSize: 9, fontWeight: 800, color: T.indigo }}>பொது அறிவு</span>
            }
            {q.subject && <span style={{ background: T.indigoLight, borderRadius: 6, padding: "2px 8px", fontSize: 9, fontWeight: 800, color: T.indigo }}>{q.subject.toUpperCase()}</span>}
          </div>
          <p style={{ color: T.text, fontSize: 18, fontWeight: 700, lineHeight: 1.55, margin: 0 }}>{q.question}</p>
        </div>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {q.options.map((opt, i) => {
            const isSelected = opt === selectedOpt;
            return (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                style={{
                  width: "100%", background: isSelected ? T.indigoLight : T.surface,
                  border: `1.5px solid ${isSelected ? T.indigo : T.border}`,
                  borderRadius: 13, padding: "13px 14px", display: "flex", alignItems: "center",
                  gap: 12, cursor: "pointer", textAlign: "left", minHeight: 52,
                  boxShadow: isSelected ? `0 2px 12px rgba(61,82,160,0.12)` : shadow.sm,
                  transition: "all 0.15s ease", fontFamily: "inherit",
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: isSelected ? T.indigo : T.surface, border: isSelected ? "none" : `1.5px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: isSelected ? "#fff" : T.textSec }}>{LABELS[i]}</span>
                </div>
                <span style={{ fontSize: 15, fontWeight: isSelected ? 600 : 500, color: isSelected ? T.indigo : T.text, lineHeight: 1.5, flex: 1 }}>{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Nav buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handlePrev} disabled={currentIndex === 0} style={{ padding: "13px 18px", background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 12, fontSize: 13, fontWeight: 700, color: T.textSec, cursor: currentIndex === 0 ? "not-allowed" : "pointer", opacity: currentIndex === 0 ? 0.4 : 1, fontFamily: "inherit" }}>←</button>
          <button
            onClick={currentIndex + 1 === total ? () => setShowConfirm(true) : handleNext}
            style={{ flex: 1, padding: "13px 0", background: T.indigo, border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "inherit", boxShadow: shadow.indigo }}
          >
            {currentIndex + 1 === total ? "சமர்ப்பி →" : "அடுத்து →"}
          </button>
        </div>

        {/* Mark for review — below nav */}
        <button
          onClick={handleMark}
          style={{ width: "100%", marginTop: 8, padding: "11px 0", background: currentState === "marked" ? "#FFFBEB" : T.surface, border: `1.5px solid ${currentState === "marked" ? "#FDE68A" : T.border}`, borderRadius: 12, fontSize: 12, fontWeight: 700, color: currentState === "marked" ? "#92400E" : T.textSec, cursor: "pointer", fontFamily: "inherit" }}
        >
          🔖 {currentState === "marked" ? "Marked" : "Mark for review"}
        </button>
      </div>

      {/* Confirm submit modal */}
      {showConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 50, display: "flex", alignItems: "flex-end" }} onClick={() => setShowConfirm(false)}>
          <div style={{ background: T.surface, borderRadius: "20px 20px 0 0", width: "100%", padding: "20px 20px 40px", maxWidth: 600, margin: "0 auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: T.border, margin: "0 auto 16px" }} />
            <div style={{ fontSize: 17, fontWeight: 800, color: T.text, marginBottom: 6 }}>தேர்வை சமர்ப்பிக்கவா?</div>
            <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.5, marginBottom: 18 }}>
              {answeredCount} answered · {markedCount} marked · {skippedCount} skipped · {total - answeredCount - markedCount - skippedCount} not visited
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: 13, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 12, fontSize: 14, fontWeight: 600, color: T.textSec, cursor: "pointer", fontFamily: "inherit" }}>
                திரும்பு
              </button>
              <button onClick={() => handleSubmit(false)} disabled={submitting} style={{ flex: 2, padding: 13, background: T.indigo, border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "inherit", boxShadow: shadow.indigo, opacity: submitting ? 0.7 : 1 }}>
                {submitting ? "சேமிக்கிறது..." : "உறுதிப்படுத்து →"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
