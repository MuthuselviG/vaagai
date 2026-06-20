import Link from "next/link";
import { Metadata } from "next";
import { T, shadow } from "../../../../lib/tokens";
import { fetchQuestionsForPack, Question } from "../../../../lib/supabase";

const PACK_ID = "02d15d29-ac1f-419b-bdce-5dd5e743e96b";
const CREATOR_SLUG = "daily-gk-thoughts";

export const metadata: Metadata = {
  title: "Daily GK Thoughts — June 2026 Edition | TNPSC GK Practice",
  description:
    "Daily GK Thoughts (June 2026) — Tamil general knowledge questions & answers on important days and key facts, by Daily GK Thoughts. Free TNPSC Group 4 practice with answers and explanations.",
  alternates: {
    canonical: "https://mcqpalagu.in/tnpsc-study-materials/daily-gk-thoughts/june-2026",
  },
};

const RELATED = [
  { href: "/subjects", icon: "📋", title: "TNPSC குரூப் 4 PYQ பயிற்சி", sub: "முந்தைய ஆண்டு வினாத்தாள்கள்" },
  { href: "/current-affairs", icon: "📰", title: "தினசரி நடப்பு நிகழ்வுகள்", sub: "தினமும் புதுப்பிக்கப்படும் MCQ" },
  { href: "/tnpsc-study-materials", icon: "📚", title: "TNPSC படிப்பு பொருட்கள்", sub: "குறிப்புகள், நடப்பு நிகழ்வுகள் மற்றும் பல" },
];

function QCard({ q, num }: { q: Question; num: number }) {
  const correctIndex = q.options.findIndex((o) => o === q.correct_option);
  const hasExplanation = (q.explanation ?? "").trim().length > 0;
  return (
    <div id={`q${num}`} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, marginBottom: 14, boxShadow: shadow.sm }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14 }}>
        <span style={{ flexShrink: 0, fontWeight: 800, color: T.indigo, background: T.indigoLight, width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{num}</span>
        <p style={{ fontSize: 16, fontWeight: 600, color: T.text, lineHeight: 1.55, margin: 0 }}>{q.question}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 14 }}>
        {q.options.map((opt, i) => {
          const isCorrect = i === correctIndex;
          return (
            <div key={i} style={{ background: isCorrect ? T.greenBg : T.bg, border: `1px solid ${isCorrect ? T.greenBorder : T.border}`, borderRadius: 9, padding: "9px 10px", fontSize: 14, color: isCorrect ? T.green : T.textSec, display: "flex", alignItems: "flex-start", gap: 7, lineHeight: 1.4 }}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", background: isCorrect ? T.green : T.indigoLight, color: isCorrect ? "white" : T.indigo, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{String.fromCharCode(65 + i)}</span>
              {opt}
            </div>
          );
        })}
      </div>
      {hasExplanation && (
        <div style={{ background: T.indigoLight, border: `1px solid ${T.indigoMid}`, borderRadius: 10, padding: "10px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.indigo, textTransform: "uppercase" as const, letterSpacing: "0.4px", marginBottom: 4 }}>📖 விளக்கம்</div>
          <div style={{ fontSize: 14, color: T.textSec, lineHeight: 1.55 }}>{q.explanation}</div>
        </div>
      )}
    </div>
  );
}

export default async function DailyGKThoughtsJune2026Page() {
  const questions = await fetchQuestionsForPack(PACK_ID, "ta");
  const practiceHref = `/practice/pack/${PACK_ID}?pack_id=${PACK_ID}&label=${encodeURIComponent("Daily GK Thoughts — June 2026")}&creator=${CREATOR_SLUG}&level=1&offset=0&limit=${questions.length}`;

  return (
    <>
      {/* HERO */}
      <div style={{ background: `linear-gradient(135deg, ${T.indigo} 0%, ${T.indigoDark} 100%)`, color: "white", borderRadius: "0 0 28px 28px", padding: "16px 16px 18px", position: "relative", overflow: "hidden" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.16)", padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>
          💡 Daily GK Thoughts · ஜூன் 2026
        </span>
        <h1 style={{ fontFamily: "serif", fontSize: 24, fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.4px", margin: "14px 0 6px" }}>
          Daily GK Thoughts — ஜூன் 2026 பதிப்பு
        </h1>
        <p style={{ fontSize: 14, opacity: 0.85, margin: 0 }}>
          வழங்குபவர்: <b style={{ color: "#FFD24D" }}>Daily GK Thoughts</b> · தினசரி பொது அறிவு
        </p>
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* CTA ROW */}
        <div style={{ display: "flex", gap: 10, margin: "20px 0 6px" }}>
          <Link href={practiceHref} style={{ flex: 1, textAlign: "center" as const, padding: 15, borderRadius: 14, fontWeight: 800, fontSize: 15, textDecoration: "none", background: "linear-gradient(135deg, #F59E0B, #EA7317)", color: "white", boxShadow: "0 6px 16px rgba(234,115,23,0.35)" }}>
            {questions.length} கேள்வி பயிற்சி →
          </Link>
          <a href="#q1" style={{ background: T.surface, color: T.indigo, border: `1.5px solid ${T.indigoMid}`, textAlign: "center" as const, padding: 15, borderRadius: 14, fontWeight: 800, fontSize: 15, textDecoration: "none" }}>
            வினா-விடை படிக்க
          </a>
        </div>

        {/* INTRO */}
        <section style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, marginTop: 20 }}>
          <h2 style={{ fontFamily: "serif", fontSize: 19, fontWeight: 700, marginBottom: 8, color: T.indigoDark }}>இந்த தொகுப்பு பற்றி</h2>
          <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6, margin: 0 }}>
            Daily GK Thoughts வழங்கும் {questions.length} பொது அறிவு வினா-விடைகள் — முக்கிய தினங்கள், விருதுகள் மற்றும் பல தலைப்புகளை உள்ளடக்கியது. TNPSC குரூப் 4 தேர்வுக்கு தினசரி திருப்பிப் படிக்க உதவும் வகையில் வரிசைப்படுத்தப்பட்டுள்ளது.
          </p>
        </section>

        {/* EXPERT INFO */}
        <Link href="/experts/daily-gk-thoughts" style={{ display: "flex", alignItems: "center", gap: 12, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, marginTop: 14, textDecoration: "none" }}>
          <span style={{ flexShrink: 0, width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg, #FFD93D, #FF9500)", color: "white", fontFamily: "serif", fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
            D
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Daily GK Thoughts</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.indigo }}>✓</span>
            </div>
            <p style={{ fontSize: 13, color: T.textSec, margin: "2px 0 0", lineHeight: 1.4 }}>💡 தினசரி பொது அறிவு தகவல்கள் பகிரும் கிரியேட்டர்</p>
          </div>
          <span style={{ color: T.indigo, fontSize: 18, flexShrink: 0 }}>→</span>
        </Link>

        {/* QUESTIONS */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "28px 4px 14px" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "white", background: T.indigo, width: 26, height: 26, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>Q</div>
          <h2 style={{ fontFamily: "serif", fontSize: 19, fontWeight: 700, color: T.indigoDark, margin: 0 }}>வினா & விடைகள்</h2>
        </div>

        {questions.map((q, i) => (
          <QCard key={q.id} q={q} num={i + 1} />
        ))}

        {/* RELATED LINKS */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, marginTop: 10, marginBottom: 24 }}>
          <h3 style={{ fontFamily: "serif", fontSize: 16, fontWeight: 700, color: T.indigoDark, marginBottom: 4 }}>தொடர்ந்து பயிற்சி செய்யுங்கள்</h3>
          {RELATED.map((link) => (
            <Link key={link.href} href={link.href} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.border}`, textDecoration: "none", color: T.text }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>{link.icon}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{link.title}</div>
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
        <Link href={practiceHref} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 13, borderRadius: 10, background: T.indigo, color: "white", fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: shadow.indigo }}>
          🎯 {questions.length} கேள்வி பயிற்சியைத் தொடங்கு →
        </Link>
      </div>
    </>
  );
}
