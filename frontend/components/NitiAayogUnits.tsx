"use client";

import { useState } from "react";
import { T, shadow } from "@/lib/tokens";
import { BilingualQA, BilingualUnit } from "@/lib/supabase";

type Props = {
  units: BilingualUnit[];
  lang: "en" | "ta";
  answerLabel: string;
  qa: (n: number) => string;
  tapHint: string;
};

const BADGES = [
  { grad: "radial-gradient(circle at 35% 30%, #C5CEF0 0%, #5469C4 55%, #3D52A0 100%)", glow: "rgba(61,82,160,0.5)" },
  { grad: "radial-gradient(circle at 35% 30%, #6FE3C4 0%, #1FAE8E 55%, #0E7E68 100%)", glow: "rgba(14,126,104,0.5)" },
  { grad: "radial-gradient(circle at 35% 30%, #FFD988 0%, #E8A93B 55%, #C9821C 100%)", glow: "rgba(201,130,28,0.55)" },
  { grad: "radial-gradient(circle at 35% 30%, #FF9C9C 0%, #D6453F 55%, #A82A28 100%)", glow: "rgba(168,42,40,0.5)" },
];
const EMOJIS = ["🏛️", "👥", "🎯", "📊"];

function QCard({ q, num, lang, answerLabel }: { q: BilingualQA; num: number; lang: "en" | "ta"; answerLabel: string }) {
  const isTa = lang === "ta";
  const question = isTa ? q.questionTa : q.questionEn;
  const explanation = isTa ? q.explanationTa : q.explanationEn;
  const hasAnswer = explanation.trim().length > 0;
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, marginBottom: 14, boxShadow: shadow.sm }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: hasAnswer ? 14 : 0 }}>
        <span style={{ flexShrink: 0, fontWeight: 800, color: T.indigo, background: T.indigoLight, width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{num}</span>
        <p style={{ fontSize: isTa ? 16 : 15, fontWeight: 600, color: T.text, lineHeight: 1.55, margin: 0 }}>{question}</p>
      </div>
      {hasAnswer && (
        <div style={{ background: T.greenBg, border: `1px solid ${T.greenBorder}`, borderRadius: 10, padding: "10px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase" as const, letterSpacing: "0.4px", marginBottom: 3 }}>✅ {answerLabel}</div>
          <div style={{ fontSize: isTa ? 14 : 13, color: T.green, lineHeight: 1.5 }}>{explanation}</div>
        </div>
      )}
    </div>
  );
}

// Renders every unit's questions up front (hidden via CSS when collapsed) so
// the full Q&A set stays in the server-rendered HTML for crawlers, while the
// picker above only toggles which section is visible on screen.
export default function NitiAayogUnits({ units, lang, answerLabel, qa, tapHint }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isTa = lang === "ta";

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px 12px" }}>
        {units.map((u, i) => {
          const badge = BADGES[i % BADGES.length];
          const emoji = EMOJIS[i % EMOJIS.length];
          const isOpen = openIndex === i;
          return (
            <button
              key={u.topic}
              onClick={() => setOpenIndex(isOpen ? null : i)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit" }}
            >
              <div style={{ width: 72, height: 72, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, position: "relative", border: isOpen ? `3px solid ${T.indigo}` : "3px solid rgba(0,0,0,0.05)", background: badge.grad, boxShadow: isOpen ? `0 0 0 5px ${badge.glow}` : `0 8px 16px -6px ${badge.glow}`, transition: "box-shadow 0.15s, border-color 0.15s" }}>
                {emoji}
                <span style={{ position: "absolute", bottom: -4, right: -4, width: 24, height: 24, borderRadius: "50%", background: T.text, color: "#fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${T.bg}` }}>
                  {i + 1}
                </span>
              </div>
              <div style={{ fontFamily: "serif", fontSize: 13, fontWeight: 800, color: T.text, marginTop: 8, textAlign: "center", lineHeight: 1.25 }}>{u.topic}</div>
              <div style={{ fontSize: 11, color: T.textTer, marginTop: 2, fontWeight: 600 }}>{qa(u.questions.length)}</div>
              <div style={{ fontSize: 10.5, color: isOpen ? T.indigo : T.textTer, marginTop: 3, fontWeight: 700 }}>{isOpen ? "▲" : `▼ ${tapHint}`}</div>
            </button>
          );
        })}
      </div>

      {units.map((u, i) => (
        <div key={u.topic} style={{ display: openIndex === i ? "block" : "none", marginTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 4px 14px" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "white", background: T.indigo, width: 26, height: 26, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
            <h2 style={{ fontFamily: "serif", fontSize: isTa ? 19 : 18, fontWeight: 700, color: T.indigoDark, margin: 0 }}>{u.topic}</h2>
          </div>
          {u.questions.map((q, qi) => (
            <QCard key={q.id} q={q} num={qi + 1} lang={lang} answerLabel={answerLabel} />
          ))}
        </div>
      ))}
    </>
  );
}
