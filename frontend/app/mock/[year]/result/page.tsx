"use client";

import { useSearchParams, useParams, useRouter } from "next/navigation";
import { T, shadow } from "@/lib/tokens";

function formatTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

function pct(correct: number, total: number) {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

function scoreColor(p: number) {
  if (p >= 70) return T.green;
  if (p >= 50) return "#D97706";
  return "#C0392B";
}

const CIRC = 2 * Math.PI * 42;

export default function MockResultPage() {
  const { year } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const score = parseInt(searchParams.get("score") ?? "0");
  const total = parseInt(searchParams.get("total") ?? "200");
  const timeTaken = parseInt(searchParams.get("time") ?? "0");
  const tamilCount = parseInt(searchParams.get("tamil_count") ?? "0");
  const breakdown: { subject: string; correct: number; total: number }[] = JSON.parse(
    searchParams.get("breakdown") ?? "[]"
  );

  // Derive Tamil vs GS scores from breakdown
  const tamilBreakdown = breakdown.filter(b => b.subject === "General Tamil");
  const gsBreakdown = breakdown.filter(b => b.subject !== "General Tamil");
  const tamilScore = tamilBreakdown.reduce((s, b) => s + b.correct, 0);
  const gsScore = gsBreakdown.reduce((s, b) => s + b.correct, 0);
  const gsTotal = total - tamilCount;

  const accuracy = pct(score, total);
  const wrong = total - score;
  const dashOffset = CIRC - (CIRC * accuracy) / 100;
  const ringColor = accuracy >= 70 ? T.green : accuracy >= 50 ? "#D97706" : "#C0392B";

  return (
    <div style={{ background: T.bg, fontFamily: "system-ui, sans-serif", minHeight: "100dvh" }}>
      {/* Top bar */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, boxShadow: shadow.sm }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>முடிவுகள்</div>
          <div style={{ fontSize: 11, color: T.textSec }}>Group 4 · {year}</div>
        </div>
        <button
          onClick={() => router.push("/mock")}
          style={{ padding: "7px 14px", background: T.indigoLight, border: `1px solid ${T.indigoMid}`, borderRadius: 10, fontSize: 12, fontWeight: 700, color: T.indigo, cursor: "pointer", fontFamily: "inherit" }}
        >
          All Tests
        </button>
      </div>

      <div style={{ padding: "16px 16px 100px", display: "flex", flexDirection: "column", gap: 12, maxWidth: 600, margin: "0 auto" }}>

        {/* Score card */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: 20, boxShadow: shadow.md, textAlign: "center" }}>
          {/* Ring */}
          <div style={{ width: 110, height: 110, margin: "0 auto 14px", position: "relative" }}>
            <svg viewBox="0 0 100 100" width={110} height={110} style={{ transform: "rotate(-90deg)" }}>
              <circle cx="50" cy="50" r="42" fill="none" stroke={T.indigoLight} strokeWidth={9} />
              <circle cx="50" cy="50" r="42" fill="none" stroke={ringColor} strokeWidth={9} strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={dashOffset} style={{ transition: "stroke-dashoffset 1s ease" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: T.text, lineHeight: 1 }}>{score}</div>
              <div style={{ fontSize: 11, color: T.textSec }}>/ {total}</div>
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: scoreColor(accuracy), marginBottom: 4 }}>{accuracy}%</div>
          <div style={{ fontSize: 12, color: T.textSec }}>Time taken: {formatTime(timeTaken)}</div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "center" }}>
            <div style={{ background: T.greenBg, borderRadius: 12, padding: "10px 16px", textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: T.green }}>{score}</div>
              <div style={{ fontSize: 10, color: T.textSec, fontWeight: 600 }}>Correct</div>
            </div>
            <div style={{ background: T.redBg, borderRadius: 12, padding: "10px 16px", textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#C0392B" }}>{wrong}</div>
              <div style={{ fontSize: 10, color: T.textSec, fontWeight: 600 }}>Wrong</div>
            </div>
            <div style={{ background: T.bg, borderRadius: 12, padding: "10px 16px", textAlign: "center", flex: 1, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: T.textSec }}>{total - score}</div>
              <div style={{ fontSize: 10, color: T.textSec, fontWeight: 600 }}>Skipped</div>
            </div>
          </div>
        </div>

        {/* Tamil vs GS split */}
        {tamilCount > 0 && (
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: 16, boxShadow: shadow.sm }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: T.textTer, letterSpacing: 0.8, marginBottom: 12, textTransform: "uppercase" as const }}>Paper-wise Score</div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1, background: "#EDE9FE", border: "1px solid #C4B5FD", borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#6D28D9", marginBottom: 6 }}>தமிழ்</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#6D28D9" }}>{tamilScore}</div>
                <div style={{ fontSize: 10, color: T.textSec }}>/ {tamilCount}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#6D28D9", marginTop: 4 }}>{pct(tamilScore, tamilCount)}%</div>
              </div>
              <div style={{ flex: 1, background: T.indigoLight, border: `1px solid ${T.indigoMid}`, borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.indigo, marginBottom: 6 }}>பொது அறிவு</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: T.indigo }}>{gsScore}</div>
                <div style={{ fontSize: 10, color: T.textSec }}>/ {gsTotal}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.indigo, marginTop: 4 }}>{pct(gsScore, gsTotal)}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Subject breakdown */}
        {breakdown.length > 0 && (
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: 16, boxShadow: shadow.sm }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: T.textTer, letterSpacing: 0.8, marginBottom: 12, textTransform: "uppercase" as const }}>
              Subject-wise Breakdown
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {breakdown.map(({ subject, correct, total: subTotal }) => {
                const p = pct(correct, subTotal);
                const barC = p >= 70 ? T.green : p >= 50 ? "#D97706" : "#C0392B";
                const barBg = p >= 70 ? T.greenBg : p >= 50 ? "#FFFBEB" : T.redBg;
                return (
                  <div key={subject}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{subject}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: barC }}>{correct} / {subTotal}</span>
                    </div>
                    <div style={{ background: barBg, borderRadius: 6, height: 8 }}>
                      <div style={{ background: barC, borderRadius: 6, height: 8, width: `${p}%`, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <button
          onClick={() => router.push(`/mock/${year}`)}
          style={{ width: "100%", padding: 14, background: T.surface, border: `1.5px solid ${T.indigoMid}`, borderRadius: 14, fontSize: 14, fontWeight: 700, color: T.indigo, cursor: "pointer", fontFamily: "inherit" }}
        >
          மீண்டும் முயற்சி
        </button>
        <button
          onClick={() => router.push("/mock")}
          style={{ width: "100%", padding: 14, background: T.indigo, border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "inherit", boxShadow: shadow.indigo }}
        >
          வேறு தேர்வு →
        </button>

      </div>
    </div>
  );
}
