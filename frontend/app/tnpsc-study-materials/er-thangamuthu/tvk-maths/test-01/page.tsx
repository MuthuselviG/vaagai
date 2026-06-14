import { cookies } from "next/headers";
import Link from "next/link";
import { Metadata } from "next";
import { T, shadow } from "../../../../../lib/tokens";
import HomeLangToggle from "../../../../../components/HomeLangToggle";
import { TVK_TEST01_QUESTIONS, TVK_PACK_ID, TVK_CREATOR_SLUG, TVKQuestion } from "./data";

export const metadata: Metadata = {
  title: "TVK Maths Test 01 — 50 Solved Questions | Er. Thangamuthu | TNPSC",
  description:
    "Free TNPSC aptitude practice set: TVK Maths Test 01 by Er. Thangamuthu — 50 questions on numbers, surds, simplification & figure counting, with full step-by-step solutions in Tamil & English.",
  alternates: {
    canonical: "https://mcqpalagu.in/tnpsc-study-materials/er-thangamuthu/tvk-maths/test-01",
  },
};

const COPY = {
  en: {
    eyebrow: "⚡ TVK Maths · Test 01",
    title: "TVK Maths Test 01 — 50 Questions with Solutions",
    credit: <>By <b style={{ color: "#FFD24D" }}>Er. Thangamuthu (TVK)</b> · TNPSC Group 1 / 2 / 4</>,
    topics: [
      { n: "1", t: "Number Basics" },
      { n: "2", t: "Number System" },
      { n: "3", t: "Simplification" },
      { n: "4", t: "Figure Counting" },
    ],
    proof: <>40+ aspirants have already attempted this test. Join them 👇</>,
    practiceAll: "Practice all 50 →",
    readSolutions: "Read solutions",
    introHeading: "About this test",
    introBody:
      "This set covers the core topics every TNPSC aspirant must master: number system basics, surds & indices, algebraic simplification, series, and figure-counting puzzles. Each question below shows the correct answer and a clear step-by-step solution. When you're ready, take the same 50 as a timed practice set.",
    questionsHeading: "Questions & Solutions",
    answerLabel: "Answer",
    explanationLabel: "Explanation",
    relatedHeading: "Keep practising",
    related: [
      { href: "/subjects", icon: "📋", title: "TNPSC Group 4 PYQ Practice", sub: "Previous Year Question Papers" },
      { href: "/current-affairs", icon: "📰", title: "Daily Current Affairs", sub: "Daily updated MCQs" },
      { href: "/tnpsc-study-materials", icon: "📚", title: "TNPSC Study Materials hub", sub: "Notes, current affairs & more" },
    ],
    startPractice: "Start the 50-question practice →",
    langSwitchNote: "தமிழில் படிக்க",
  },
  ta: {
    eyebrow: "⚡ TVK Maths · Test 01",
    title: "TVK Maths Test 01 — 50 கேள்விகள் & விளக்கங்கள்",
    credit: <>வழங்குபவர்: <b style={{ color: "#FFD24D" }}>Er. தங்கமுத்து (TVK)</b> · TNPSC குரூப் 1 / 2 / 4</>,
    topics: [
      { n: "1", t: "எண் அடிப்படைகள்" },
      { n: "2", t: "எண் அமைப்பு" },
      { n: "3", t: "எளிமையாக்கல்" },
      { n: "4", t: "உருவ எண்ணிக்கை" },
    ],
    proof: <>40+ போட்டியாளர்கள் இந்த தேர்வை ஏற்கனவே முயற்சித்துள்ளனர். நீங்களும் சேருங்கள் 👇</>,
    practiceAll: "50 கேள்விகளையும் பயிற்சி →",
    readSolutions: "விளக்கங்கள்",
    introHeading: "இந்த தேர்வு பற்றி",
    introBody:
      "ஒவ்வொரு TNPSC போட்டியாளரும் கற்க வேண்டிய அடிப்படைத் தலைப்புகளை இந்த தொகுப்பு உள்ளடக்கியது: எண் அமைப்பு அடிப்படைகள், வர்க்கமூலங்கள் மற்றும் அடுக்குகள், இயற்கணித எளிமையாக்கல், தொடர்கள் மற்றும் உருவ எண்ணிக்கை புதிர்கள். ஒவ்வொரு கேள்விக்கும் சரியான விடையும் படிப்படியான விளக்கமும் கீழே உள்ளது. தயாரானதும், இதே 50 கேள்விகளையும் பயிற்சியாக முயற்சியுங்கள்.",
    questionsHeading: "கேள்விகள் & விளக்கங்கள்",
    answerLabel: "விடை",
    explanationLabel: "விளக்கம்",
    relatedHeading: "தொடர்ந்து பயிற்சி செய்யுங்கள்",
    related: [
      { href: "/subjects", icon: "📋", title: "TNPSC குரூப் 4 PYQ பயிற்சி", sub: "முந்தைய ஆண்டு வினாத்தாள்கள்" },
      { href: "/current-affairs", icon: "📰", title: "தினசரி நடப்பு நிகழ்வுகள்", sub: "தினமும் புதுப்பிக்கப்படும் MCQ" },
      { href: "/tnpsc-study-materials", icon: "📚", title: "TNPSC படிப்பு பொருட்கள்", sub: "குறிப்புகள், நடப்பு நிகழ்வுகள் மற்றும் பல" },
    ],
    startPractice: "50 கேள்வி பயிற்சியைத் தொடங்கு →",
    langSwitchNote: "Read in English",
  },
};

const PRACTICE_HREF = `/practice/pack/${TVK_PACK_ID}?pack_id=${TVK_PACK_ID}&label=TVK%20Maths%20Test%2001&creator=${TVK_CREATOR_SLUG}&level=1&offset=0&limit=50`;

function QCard({ q, num, lang }: { q: TVKQuestion; num: number; lang: "en" | "ta" }) {
  const isTa = lang === "ta";
  const text = isTa ? q.qTa : q.qEn;
  const c = COPY[lang];
  return (
    <div id={`q${num}`} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, marginBottom: 14, boxShadow: shadow.sm }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: q.image ? 12 : 14 }}>
        <span style={{ flexShrink: 0, fontWeight: 800, color: T.indigo, background: T.indigoLight, width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{num}</span>
        <p style={{ fontSize: isTa ? 16 : 15, fontWeight: 600, color: T.text, lineHeight: 1.55, margin: 0 }}>{text}</p>
      </div>
      {q.image && (
        <div style={{ margin: "0 0 14px", textAlign: "center" as const }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={q.image} alt={`Diagram for question ${num}`} style={{ maxWidth: "100%", maxHeight: 220, borderRadius: 10, border: `1px solid ${T.border}` }} />
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 14 }}>
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correctIndex;
          return (
            <div key={i} style={{ background: isCorrect ? T.greenBg : T.bg, border: `1px solid ${isCorrect ? T.greenBorder : T.border}`, borderRadius: 9, padding: "9px 10px", fontSize: isTa ? 14 : 13, color: isCorrect ? T.green : T.textSec, display: "flex", alignItems: "flex-start", gap: 7, lineHeight: 1.4 }}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", background: isCorrect ? T.green : T.indigoLight, color: isCorrect ? "white" : T.indigo, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{String.fromCharCode(65 + i)}</span>
              {opt}
            </div>
          );
        })}
      </div>
      <div style={{ background: T.greenBg, border: `1px solid ${T.greenBorder}`, borderRadius: 10, padding: "10px 14px", marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase" as const, letterSpacing: "0.4px", marginBottom: 3 }}>✅ {c.answerLabel} · {String.fromCharCode(65 + q.correctIndex)}</div>
        <div style={{ fontSize: isTa ? 16 : 15, fontWeight: 700, color: T.green, lineHeight: 1.4 }}>{q.options[q.correctIndex]}</div>
      </div>
      <div style={{ background: T.indigoLight, border: `1px solid ${T.indigoMid}`, borderRadius: 10, padding: "10px 14px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.indigo, textTransform: "uppercase" as const, letterSpacing: "0.4px", marginBottom: 4 }}>📖 {c.explanationLabel}</div>
        <div style={{ fontSize: isTa ? 14 : 13, color: T.textSec, lineHeight: 1.55 }}>{isTa ? q.explanationTa : q.explanationEn}</div>
      </div>
    </div>
  );
}

export default async function TVKMathsTest01Page() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("mcqpalagu_lang")?.value === "en" ? "en" : "ta") as "en" | "ta";
  const c = COPY[lang];
  const isTa = lang === "ta";

  return (
    <>
      {/* HERO */}
      <div style={{ background: `linear-gradient(135deg, ${T.indigo} 0%, ${T.indigoDark} 100%)`, color: "white", borderRadius: "0 0 28px 28px", padding: "16px 16px 34px", position: "relative", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.16)", padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>
            {c.eyebrow}
          </span>
          <HomeLangToggle initialLang={lang} />
        </div>
        <h1 style={{ fontFamily: "serif", fontSize: 24, fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.4px", margin: "14px 0 6px" }}>
          {c.title}
        </h1>
        <p style={{ fontSize: isTa ? 14 : 13, opacity: 0.85, marginBottom: 18 }}>{c.credit}</p>
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginTop: 14 }}>
          {c.topics.map((t) => (
            <div key={t.t} style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)", padding: "6px 12px", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
              <span style={{ color: "#FFD24D", fontWeight: 800, marginRight: 4 }}>{t.n}</span>{t.t}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* SOCIAL PROOF */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: T.surface, margin: "-18px 0 0", position: "relative", zIndex: 2, borderRadius: 16, padding: "14px 16px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex" }}>
            {["#FFD24D", "#A8DBBE", "#C5CEF0", "#F5BFBB"].map((bg, i) => (
              <i key={bg} style={{ width: 30, height: 30, borderRadius: "50%", border: "2px solid white", marginLeft: i === 0 ? 0 : -8, display: "block", background: bg }} />
            ))}
          </div>
          <p style={{ fontSize: isTa ? 14 : 13, color: T.textSec, margin: 0 }}>{c.proof}</p>
        </div>

        {/* CTA ROW */}
        <div style={{ display: "flex", gap: 10, margin: "20px 0 6px" }}>
          <Link href={PRACTICE_HREF} style={{ flex: 1, textAlign: "center" as const, padding: 15, borderRadius: 14, fontWeight: 800, fontSize: 15, textDecoration: "none", background: "linear-gradient(135deg, #F59E0B, #EA7317)", color: "white", boxShadow: "0 6px 16px rgba(234,115,23,0.35)" }}>
            {c.practiceAll}
          </Link>
          <a href="#q1" style={{ background: T.surface, color: T.indigo, border: `1.5px solid ${T.indigoMid}`, textAlign: "center" as const, padding: 15, borderRadius: 14, fontWeight: 800, fontSize: 15, textDecoration: "none" }}>
            {c.readSolutions}
          </a>
        </div>

        {/* INTRO */}
        <section style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, marginTop: 26 }}>
          <h2 style={{ fontFamily: "serif", fontSize: isTa ? 19 : 18, fontWeight: 700, marginBottom: 8, color: T.indigoDark }}>{c.introHeading}</h2>
          <p style={{ fontSize: isTa ? 14 : 13, color: T.textSec, lineHeight: 1.6, margin: 0 }}>{c.introBody}</p>
        </section>

        {/* QUESTIONS */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "28px 4px 14px" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "white", background: T.indigo, width: 26, height: 26, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>Q</div>
          <h2 style={{ fontFamily: "serif", fontSize: isTa ? 19 : 18, fontWeight: 700, color: T.indigoDark, margin: 0 }}>{c.questionsHeading}</h2>
        </div>

        {TVK_TEST01_QUESTIONS.map((q) => (
          <QCard key={q.order} q={q} num={q.order} lang={lang} />
        ))}

        {/* RELATED LINKS */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, marginTop: 10, marginBottom: 24 }}>
          <h3 style={{ fontFamily: "serif", fontSize: isTa ? 16 : 15, fontWeight: 700, color: T.indigoDark, marginBottom: 4 }}>{c.relatedHeading}</h3>
          {c.related.map((link) => (
            <Link key={link.href} href={link.href} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.border}`, textDecoration: "none", color: T.text }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>{link.icon}</span>
                <div>
                  <div style={{ fontSize: isTa ? 15 : 14, fontWeight: 600 }}>{link.title}</div>
                  <div style={{ fontSize: 12, color: T.textSec, marginTop: 1 }}>{link.sub}</div>
                </div>
              </div>
              <span style={{ color: T.indigo, fontSize: 18 }}>→</span>
            </Link>
          ))}
        </div>
      </div>

      <div style={{ height: 100 }} />

      {/* FIXED BOTTOM CTA */}
      <div style={{ position: "fixed", bottom: 60, left: 0, right: 0, background: T.surface, borderTop: `1px solid ${T.border}`, padding: "12px 16px", boxShadow: "0 -2px 10px rgba(0,0,0,0.07)", zIndex: 90 }}>
        <Link href={PRACTICE_HREF} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 13, borderRadius: 10, background: T.indigo, color: "white", fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: shadow.indigo }}>
          🎯 {c.startPractice}
        </Link>
      </div>
    </>
  );
}
