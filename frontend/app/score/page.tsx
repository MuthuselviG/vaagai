"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { T, shadow } from "../../lib/tokens";
import { getSession } from "../../lib/session";

function ScoreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const correct = parseInt(searchParams.get("correct") ?? "0");
  const total = parseInt(searchParams.get("total") ?? "0");
  const subject = searchParams.get("subject") ?? "";
  const chapter = searchParams.get("chapter") ?? subject;
  const level = parseInt(searchParams.get("level") ?? "1");
  const offset = parseInt(searchParams.get("offset") ?? "0");
  const limit = parseInt(searchParams.get("limit") ?? "10");
  const sessionId = searchParams.get("sid") ?? "";
  const session = sessionId ? getSession(sessionId) : null;
  const wrong = total - correct;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const r = 56;
  const circ = 2 * Math.PI * r;
  const avgTime = session ? Math.round(session.responses.reduce((s, r) => s + r.time_spent_seconds, 0) / session.responses.length) : null;

  const getMessage = () => {
    if (pct >= 80) return "Excellent! You're well prepared. 🔥";
    if (pct >= 60) return "Great effort! Review the missed questions. 💪";
    if (pct >= 40) return "Good start! Keep practicing. 📚";
    return "Don't give up! Practice makes perfect. 🎯";
  };

  const getStars = () => pct >= 80 ? 5 : pct >= 60 ? 3 : pct >= 40 ? 2 : 1;

  const handleShare = () => {
    const text = `I scored ${correct}/${total} (${pct}%) in ${chapter} on வாகை! Try it free 👉 https://vaagai.vercel.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleNextLevel = () => {
    const nextLevel = level + 1;
    const nextOffset = offset + limit;
    router.push(
      `/practice/${encodeURIComponent(subject)}/${encodeURIComponent(chapter)}?level=${nextLevel}&offset=${nextOffset}&limit=${limit}&label=${encodeURIComponent(chapter)}`
    );
  };

  const handleRetry = () => {
    router.push(
      `/practice/${encodeURIComponent(subject)}/${encodeURIComponent(chapter)}?level=${level}&offset=${offset}&limit=${limit}&label=${encodeURIComponent(chapter)}`
    );
  };

  return (
    <div style={{ background: T.bg, height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "16px 18px", flexShrink: 0 }}>
        <div style={{ color: T.textSec, fontSize: 12, fontWeight: 600, textAlign: "center" }}>{chapter} · Level {level}</div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 6, gap: 4 }}>
          {Array.from({ length: 5 }, (_, i) => (
            <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill={i < getStars() ? "#F59E0B" : T.border}>
              <path d="M8 1l1.8 3.6L14 5.4l-3 2.9.7 4.1L8 10.4l-3.7 2 .7-4.1-3-2.9 4.2-.8z" />
            </svg>
          ))}
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", overscrollBehavior: "none", WebkitOverflowScrolling: "touch", padding: "24px 18px 100px" }}>

        {/* Score ring */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div style={{ position: "relative", width: 152, height: 152 }}>
            <svg width="152" height="152" viewBox="0 0 152 152">
              <circle cx="76" cy="76" r={r} fill="none" stroke={T.border} strokeWidth="10" />
              <circle cx="76" cy="76" r={r} fill="none" stroke={T.indigo} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${circ * (pct / 100)} ${circ}`} strokeDashoffset={circ * 0.25}
                style={{ transform: "rotate(-90deg)", transformOrigin: "76px 76px" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ color: T.text, fontSize: 34, fontWeight: 900, letterSpacing: -1.5, lineHeight: 1 }}>
                {correct}<span style={{ color: T.textSec, fontSize: 20, fontWeight: 600 }}>/{total}</span>
              </div>
              <div style={{ color: T.indigo, fontSize: 13, fontWeight: 700, marginTop: 4 }}>{pct}%</div>
            </div>
          </div>
        </div>

        <p style={{ textAlign: "center", color: T.textSec, fontSize: 14, lineHeight: 1.6, marginBottom: 24, fontStyle: "italic" }}>"{getMessage()}"</p>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { label: "Correct", val: correct, color: T.green, bg: T.greenBg, border: T.greenBorder },
            { label: "Wrong", val: wrong, color: T.red, bg: T.redBg, border: T.redBorder },
            { label: "Avg Speed", val: avgTime ? `${avgTime}s` : "—", color: T.textSec, bg: T.surface, border: T.border },
          ].map((s) => (
            <div key={s.label} style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 14, padding: "14px 8px", textAlign: "center", boxShadow: shadow.sm }}>
              <div style={{ color: s.color, fontSize: 26, fontWeight: 900, letterSpacing: -1 }}>{s.val}</div>
              <div style={{ color: T.textSec, fontSize: 11, fontWeight: 600, marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Login nudge */}
        <div style={{ background: T.indigoLight, border: `1.5px solid ${T.indigoMid}`, borderRadius: 14, padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 22 }}>🔒</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: T.indigo, fontSize: 13, fontWeight: 700 }}>Login to save your progress</div>
            <div style={{ color: T.textSec, fontSize: 11, marginTop: 2 }}>Track scores, revisit wrong answers, unlock full access</div>
          </div>
          <button onClick={() => router.push("/login")} style={{ background: T.indigo, border: "none", borderRadius: 9, padding: "7px 12px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Login</button>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <button onClick={handleRetry} style={{ flex: 1, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: "14px", color: T.text, fontSize: 13.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: shadow.sm }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke={T.text} strokeWidth="1.8" strokeLinecap="round"><path d="M1 3v5h5M14 12a7 7 0 10-1.56-7.5L13 7H8" /></svg>
            Retry
          </button>
          <button onClick={handleNextLevel} style={{ flex: 1.5, background: `linear-gradient(135deg, ${T.indigo}, #5062B8)`, border: "none", borderRadius: 14, padding: "14px", color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: shadow.indigo }}>
            Next Level
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M10 5l3 3-3 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
        </div>

        <button onClick={handleShare} style={{ width: "100%", background: "#25D366", border: "none", borderRadius: 14, padding: "14px", color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, boxShadow: "0 4px 14px rgba(37,211,102,0.35)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
          Share your score on WhatsApp
        </button>
      </div>
    </div>
  );
}

export default function ScorePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>}>
      <ScoreContent />
    </Suspense>
  );
}
