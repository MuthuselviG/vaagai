import { CSSProperties } from "react";
import { CAQuestion } from "@/lib/supabase";
import { T, shadow } from "@/lib/tokens";
import { QuestionWatermark } from "./PdfBranding";

type Lang = "en" | "ta";
type Variant = "hub" | "unit";

const TEXT: Record<Lang, {
  questionLabel: (num: number) => string;
  correctLabel: string;
  explanationLabel: string;
  letter: (i: number) => string;
}> = {
  en: {
    questionLabel: (num) => `Question ${num}`,
    correctLabel: "✅ Correct Answer",
    explanationLabel: "📖 Explanation",
    letter: (i) => String.fromCharCode(65 + i),
  },
  ta: {
    questionLabel: (num) => `வினா ${num}`,
    correctLabel: "✅ சரியான விடை",
    explanationLabel: "📖 விளக்கம்",
    letter: (i) => ["அ", "ஆ", "இ", "ஈ"][i],
  },
};

export default function CAQuestionCard({
  q,
  num,
  lang,
  variant,
}: {
  q: CAQuestion;
  num: number;
  lang: Lang;
  variant: Variant;
}) {
  const isUnit = variant === "unit";
  const t = TEXT[lang];

  const cardStyle: CSSProperties = {
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: isUnit ? 16 : 14,
    padding: isUnit ? 18 : 16,
    marginBottom: isUnit ? 14 : 12,
    boxShadow: shadow.sm,
    position: "relative",
    overflow: "hidden",
    zIndex: 0,
  };

  return (
    <div id={isUnit ? (q.slug ? q.slug.replace(/\s+/g, "-") : q.id) : undefined} style={cardStyle}>
      <QuestionWatermark />

      {isUnit && lang === "en" ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.textTer, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.questionLabel(num)}</span>
          {q.topic && <span style={{ fontSize: 11, fontWeight: 600, color: T.indigo, background: T.indigoLight, padding: "3px 8px", borderRadius: 8 }}>{q.topic}</span>}
        </div>
      ) : (
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textTer, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: isUnit ? 10 : 8 }}>
          {t.questionLabel(num)}
        </div>
      )}

      <p style={{ fontSize: 15, fontWeight: 600, color: T.text, lineHeight: isUnit ? (lang === "en" ? 1.55 : 1.6) : (lang === "en" ? 1.5 : 1.6), marginBottom: isUnit ? 14 : 12 }}>
        {q.question}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: isUnit ? 7 : 6, marginBottom: isUnit ? 14 : 12 }}>
        {q.options.map((opt, i) => {
          const isCorrect = isUnit && opt === q.correct_option;
          return (
            <div key={i} style={{ background: isCorrect ? T.greenBg : T.bg, border: `1px solid ${isCorrect ? T.greenBorder : T.border}`, borderRadius: isUnit ? 9 : 8, padding: isUnit ? "9px 10px" : "8px 10px", fontSize: 13, color: isCorrect ? T.green : T.textSec, display: "flex", alignItems: "flex-start", gap: 7, lineHeight: 1.4 }}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", background: isCorrect ? T.green : T.indigoLight, color: isCorrect ? "white" : T.indigo, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                {t.letter(i)}
              </span>
              {opt}
            </div>
          );
        })}
      </div>

      <div style={{ background: T.greenBg, border: `1px solid ${T.greenBorder}`, borderRadius: 10, padding: "10px 14px", marginBottom: isUnit ? 10 : 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 3 }}>{t.correctLabel}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.green, ...(isUnit ? { lineHeight: 1.4 } : {}) }}>{q.correct_option}</div>
      </div>

      {q.explanation && (
        <div style={{ background: T.indigoLight, border: `1px solid ${T.indigoMid}`, borderRadius: 10, padding: "10px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.indigo, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: isUnit ? 4 : 3 }}>{t.explanationLabel}</div>
          <div style={{ fontSize: 13, color: T.textSec, lineHeight: isUnit ? (lang === "en" ? 1.55 : 1.6) : (lang === "en" ? 1.5 : 1.6) }}>{q.explanation}</div>
        </div>
      )}
    </div>
  );
}
