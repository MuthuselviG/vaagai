import Link from "next/link";
import { Metadata } from "next";
import { T, shadow } from "../../../../../lib/tokens";
import WhatsAppShareButton from "../../../../../components/WhatsAppShareButton";
import { fetchRohitKalaiClass6HistoryTerm1, ReadingQA } from "../../../../../lib/supabase";

export const metadata: Metadata = {
  title: "Class 6 History Samacheer Kalvi Term 1 — 166 Q&A | Rohit Kalai | TNPSC",
  description:
    "6th std Samacheer Kalvi History (Term 1) — 166 Tamil questions & answers by Rohit Kalai. Free TNPSC Group 4 study material covering வரலாறு என்றால் என்ன, அசோகர் மற்றும் பல தலைப்புகள்.",
  alternates: {
    canonical: "https://mcqpalagu.in/tnpsc-study-materials/rohit-kalai/class-6-history-samacheer-kalvi/term-1",
  },
};

const RELATED = [
  { href: "/tnpsc-study-materials/rohit-kalai/class-6-history-samacheer-kalvi", icon: "📚", title: "புத்தக அடைப்புக்குத் திரும்ப", sub: "மற்ற Terms-ஐப் பார்க்க" },
  { href: "/subjects", icon: "📋", title: "TNPSC குரூப் 4 PYQ பயிற்சி", sub: "முந்தைய ஆண்டு வினாத்தாள்கள்" },
  { href: "/current-affairs", icon: "📰", title: "தினசரி நடப்பு நிகழ்வுகள்", sub: "தினமும் புதுப்பிக்கப்படும் MCQ" },
  { href: "/tnpsc-study-materials", icon: "📚", title: "TNPSC படிப்பு பொருட்கள்", sub: "குறிப்புகள், நடப்பு நிகழ்வுகள் மற்றும் பல" },
];

function QCard({ q, num }: { q: ReadingQA; num: number }) {
  const hasAnswer = q.explanation.trim().length > 0;
  return (
    <div id={`q${num}`} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, marginBottom: 14, boxShadow: shadow.sm }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: hasAnswer ? 14 : 0 }}>
        <span style={{ flexShrink: 0, fontWeight: 800, color: T.indigo, background: T.indigoLight, width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{num}</span>
        <p style={{ fontSize: 16, fontWeight: 600, color: T.text, lineHeight: 1.55, margin: 0 }}>{q.question}</p>
      </div>
      {hasAnswer && (
        <div style={{ background: T.greenBg, border: `1px solid ${T.greenBorder}`, borderRadius: 10, padding: "10px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase" as const, letterSpacing: "0.4px", marginBottom: 3 }}>✅ விடை</div>
          <div style={{ fontSize: 14, color: T.green, lineHeight: 1.5 }}>{q.explanation}</div>
        </div>
      )}
    </div>
  );
}

export default async function RohitKalaiClass6HistoryTerm1Page() {
  const questions = await fetchRohitKalaiClass6HistoryTerm1();

  const faqItems = questions
    .filter((q) => q.explanation.trim().length > 0)
    .slice(0, 8)
    .map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.explanation },
    }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems,
  };

  return (
    <>
      {faqItems.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <WhatsAppShareButton title={`வரலாறு 6th Term 1 — ${questions.length} வினா & விடை`} context="கலையரசன் ரா" floating />
      {/* HERO */}
      <div style={{ background: `linear-gradient(135deg, ${T.indigo} 0%, ${T.indigoDark} 100%)`, color: "white", borderRadius: "0 0 28px 28px", padding: "16px 16px 34px", position: "relative", overflow: "hidden" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.16)", padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>
          🏺 கலையரசன் ரா · Class 6 History
        </span>
        <h1 style={{ fontFamily: "serif", fontSize: 24, fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.4px", margin: "14px 0 6px" }}>
          வரலாறு 6th Term 1 — {questions.length} வினா & விடை
        </h1>
        <p style={{ fontSize: 14, opacity: 0.85, marginBottom: 16 }}>
          வழங்குபவர்: <b style={{ color: "#FFD24D" }}>கலையரசன் ரா</b> · Samacheer Kalvi
        </p>
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginTop: 4 }}>
          {["Term 1", `${questions.length} Q&A`, "Samacheer Kalvi"].map((s) => (
            <div key={s} style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)", padding: "6px 12px", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
              {s}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* INTRO */}
        <section style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, marginTop: 26 }}>
          <h2 style={{ fontFamily: "serif", fontSize: 19, fontWeight: 700, marginBottom: 8, color: T.indigoDark }}>இந்த தொகுப்பு பற்றி</h2>
          <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6, margin: 0 }}>
            6ஆம் வகுப்பு சமச்சீர் கல்வி வரலாறு (Term 1) பாடப்புத்தகத்தின் அடிப்படையில் கலையரசன் ரா தயாரித்த {questions.length} வினா-விடைகள். TNPSC குரூப் 4 தேர்வுக்கு அடிப்படை வரலாற்று கருத்துக்களை திருப்பிப் படிக்க உதவும் வகையில் வரிசைப்படுத்தப்பட்டுள்ளது.
          </p>
        </section>

        {/* EXPERT INFO */}
        <Link href="/experts/rohit-kalai" style={{ display: "flex", alignItems: "center", gap: 12, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, marginTop: 14, textDecoration: "none" }}>
          <span style={{ flexShrink: 0, width: 46, height: 46, borderRadius: "50%", background: "#7C3AED", color: "white", fontFamily: "serif", fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
            க
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>கலையரசன் ரா</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.indigo }}>✓</span>
            </div>
            <p style={{ fontSize: 13, color: T.textSec, margin: "2px 0 0", lineHeight: 1.4 }}>🎓 தமிழ மாணவன் தமிழுக்கான மாணவன் 🙏</p>
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

      <div style={{ height: 40 }} />
    </>
  );
}
