"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import LangToggle from "../../../../components/LangToggle";
import { T, shadow } from "../../../../lib/tokens";
import { fetchQuestionsForLevel, type Question } from "../../../../lib/supabase";
import { startSession, recordResponse, completeSession } from "../../../../lib/session";

export default function PracticePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const subject = decodeURIComponent(params.subject as string);
  const chapter = decodeURIComponent(params.chapter as string);
  const chapterLabel = searchParams.get("label") ?? chapter;
  const level = parseInt(searchParams.get("level") ?? "1");
  const offset = parseInt(searchParams.get("offset") ?? "0");
  const limit = parseInt(searchParams.get("limit") ?? "10");

  const [lang, setLang] = useState<"en" | "ta">("en");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const sessionIdRef = useRef<string | null>(null);
  const questionStartRef = useRef<number>(Date.now());
  const pillRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    setCurrentIndex(0);
    setAnswers({});
    setSelected(null);
    setRevealed(false);
    sessionIdRef.current = startSession(subject, chapter, level, offset, limit);
    fetchQuestionsForLevel(subject, chapter, lang, offset, limit)
      .then(qs => { setQuestions(qs); setLoading(false); })
      .catch(() => { setError("Could not load questions."); setLoading(false); });
  }, [subject, chapter, lang, offset, limit, level]);

  useEffect(() => {
    questionStartRef.current = Date.now();
    const ans = answers[currentIndex];
    setSelected(ans ?? null);
    setRevealed(ans !== undefined);
  }, [currentIndex, answers]);

  const q = questions[currentIndex];
  const total = questions.length;

  const getOptions = (q: Question): string[] => {
    if (Array.isArray(q.options)) return q.options;
    const o = q.options as unknown as Record<string, string>;
    return [o.a, o.b, o.c, o.d].filter(Boolean);
  };

  const handleSelect = (optText: string) => {
    if (revealed || !q) return;
    const timeSpent = Math.round((Date.now() - questionStartRef.current) / 1000);
    const isCorrect = optText === q.correct_option;
    setSelected(optText);
    setRevealed(true);
    setAnswers(prev => ({ ...prev, [currentIndex]: optText }));
    if (sessionIdRef.current) recordResponse(sessionIdRef.current, q.id, optText, isCorrect, timeSpent);
  };

  const handleNext = () => {
    if (!revealed) return;
    if (currentIndex + 1 >= total) {
      if (sessionIdRef.current) completeSession(sessionIdRef.current);
      const correct = Object.entries(answers).filter(
        ([i, ans]) => ans === questions[parseInt(i)]?.correct_option
      ).length;
      router.push(`/score?correct=${correct}&total=${total}&subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapterLabel)}&level=${level}&sid=${sessionIdRef.current}`);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
      <div style={{ color: T.textSec, fontSize: 14 }}>Loading questions…</div>
    </div>
  );

  if (error || questions.length === 0) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: T.bg, padding: 24, gap: 16 }}>
      <div style={{ color: T.text, fontSize: 15, fontWeight: 600, textAlign: "center" }}>
        {error ?? `No questions found for "${chapter}".`}
      </div>
      <button onClick={() => router.back()} style={{ background: T.indigo, border: "none", borderRadius: 12, padding: "12px 24px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Go Back</button>
    </div>
  );

  const options = getOptions(q);
  const labels = ["A", "B", "C", "D"];

  return (
    <div style={{ background: T.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.back()} style={{ width: 38, height: 38, borderRadius: 11, background: T.bg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 13.5L6.5 9 11 4.5" stroke={T.text} strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>{chapterLabel}</div>
            <div style={{ color: T.textSec, fontSize: 11, marginTop: 1 }}>{subject} · Level {level}</div>
          </div>
          <LangToggle lang={lang} setLang={setLang} />
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>Question {currentIndex + 1} <span style={{ color: T.textSec, fontWeight: 500 }}>of {total}</span></span>
            <span style={{ color: T.textTer, fontSize: 12 }}>{total - currentIndex - 1} left</span>
          </div>
          <div style={{ height: 4, background: T.border, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${((currentIndex + 1) / total) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${T.indigo}, #6274CC)`, borderRadius: 2, transition: "width 0.3s" }} />
          </div>
        </div>

        <div ref={pillRowRef} style={{ display: "flex", gap: 6, marginTop: 12, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
          {questions.map((_, i) => {
            const isCur = i === currentIndex;
            const isDone = answers[i] !== undefined;
            const isCorrect = isDone && answers[i] === questions[i]?.correct_option;
            return (
              <div key={i} onClick={() => setCurrentIndex(i)} style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, border: isCur ? `2px solid ${T.indigo}` : `1.5px solid ${isDone ? (isCorrect ? T.greenBorder : T.redBorder) : T.border}`, background: isDone ? (isCorrect ? T.greenBg : T.redBg) : isCur ? "transparent" : T.surface, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: isCur ? T.indigo : isDone ? (isCorrect ? T.green : T.red) : T.textTer }}>{i + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 20px" }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: "20px 18px", marginBottom: 12, boxShadow: shadow.md }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: T.indigoLight, borderRadius: 8, padding: "3px 10px", marginBottom: 12 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.indigo }} />
            <span style={{ color: T.indigo, fontSize: 10, fontWeight: 800, letterSpacing: 0.7 }}>{subject.toUpperCase()}</span>
          </div>
          <p style={{ color: T.text, fontSize: 15, fontWeight: 600, lineHeight: 1.65, letterSpacing: -0.15 }}>{q.question}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {options.map((optText, i) => {
            const isCorrect = optText === q.correct_option;
            const isSelected = optText === selected;
            let st: "correct" | "wrong" | "idle" = "idle";
            if (revealed) { if (isCorrect) st = "correct"; else if (isSelected) st = "wrong"; }
            const s = {
              correct: { bg: T.greenBg, border: T.greenBorder, text: T.green, badgeBg: T.green },
              wrong: { bg: T.redBg, border: T.redBorder, text: T.red, badgeBg: T.red },
              idle: { bg: T.surface, border: T.border, text: T.text, badgeBg: T.bg },
            }[st];
            return (
              <button key={i} onClick={() => handleSelect(optText)} style={{ width: "100%", background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 13, padding: "13px 14px", display: "flex", alignItems: "center", gap: 12, cursor: revealed ? "default" : "pointer", textAlign: "left", minHeight: 54, boxShadow: st === "correct" ? "0 2px 12px rgba(5,122,85,0.12)" : st === "wrong" ? "0 2px 12px rgba(192,57,43,0.1)" : shadow.sm, transition: "all 0.22s ease" }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: st !== "idle" ? s.badgeBg : T.surface, border: st === "idle" ? `1.5px solid ${T.border}` : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {st === "correct" ? <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5L5 9.5L11 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
                    : st === "wrong" ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2L10 10M10 2L2 10" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
                    : <span style={{ fontSize: 11, fontWeight: 700, color: T.textSec }}>{labels[i]}</span>}
                </div>
                <span style={{ fontSize: 13.5, fontWeight: st !== "idle" ? 600 : 500, color: s.text, lineHeight: 1.5, flex: 1 }}>{optText}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "12px 14px 28px", background: T.bg, borderTop: `1px solid ${T.border}` }}>
        <button onClick={handleNext} disabled={!revealed} style={{ width: "100%", background: revealed ? `linear-gradient(135deg, ${T.indigo}, #5062B8)` : T.border, border: "none", borderRadius: 14, padding: "15px", color: revealed ? "#fff" : T.textTer, fontSize: 14, fontWeight: 700, cursor: revealed ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: revealed ? shadow.indigo : "none", transition: "all 0.2s ease" }}>
          {revealed ? (currentIndex + 1 >= total ? "See Results" : "Next Question") : "Select an answer"}
          {revealed && <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M4 8.5H13M13 8.5L9 4.5M13 8.5L9 12.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" /></svg>}
        </button>
      </div>
    </div>
  );
}
