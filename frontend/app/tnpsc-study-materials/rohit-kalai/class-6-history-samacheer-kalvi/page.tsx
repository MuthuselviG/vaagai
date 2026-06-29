import Link from "next/link";
import { Metadata } from "next";
import { T, shadow } from "@/lib/tokens";
import WhatsAppShareButton from "@/components/WhatsAppShareButton";
import BookCover from "@/components/BookCover";
import { fetchRohitKalaiClass6HistoryTerm1, fetchRohitKalaiClass6HistoryTerm2Units } from "@/lib/supabase";

const BASE = "https://mcqpalagu.in";
const PAGE_PATH = "/tnpsc-study-materials/rohit-kalai/class-6-history-samacheer-kalvi";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Class 6 History (Samacheer Kalvi) — Rohit Kalai | TNPSC Study Materials",
  description:
    "Browse Rohit Kalai's Class 6 Samacheer Kalvi History Q&A by term, organised unit by unit. Free TNPSC Group 4 study material.",
  alternates: {
    canonical: `${BASE}${PAGE_PATH}`,
  },
};

const RELATED = [
  { href: `${PAGE_PATH}/term-1`, icon: "📄", title: "Term 1 — ஒரே பக்கத்தில் படிக்க", sub: "அனைத்து வினா-விடைகளும் ஒரே பக்கத்தில்" },
  { href: "/subjects", icon: "📋", title: "TNPSC குரூப் 4 PYQ பயிற்சி", sub: "முந்தைய ஆண்டு வினாத்தாள்கள்" },
  { href: "/current-affairs", icon: "📰", title: "தினசரி நடப்பு நிகழ்வுகள்", sub: "தினமும் புதுப்பிக்கப்படும் MCQ" },
  { href: "/tnpsc-study-materials", icon: "📚", title: "TNPSC படிப்பு பொருட்கள்", sub: "குறிப்புகள், நடப்பு நிகழ்வுகள் மற்றும் பல" },
];

export default async function RohitKalaiClass6HistoryBookshelfPage() {
  const term1Questions = await fetchRohitKalaiClass6HistoryTerm1();
  const term1Count = term1Questions.length;
  const term2Units = await fetchRohitKalaiClass6HistoryTerm2Units();
  const term2Count = term2Units.reduce((sum, u) => sum + u.questions.length, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "TNPSC Study Materials", item: `${BASE}/tnpsc-study-materials` },
      { "@type": "ListItem", position: 2, name: "Rohit Kalai", item: `${BASE}/experts/rohit-kalai` },
      { "@type": "ListItem", position: 3, name: "Class 6 History (Samacheer Kalvi)", item: `${BASE}${PAGE_PATH}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <WhatsAppShareButton title="வரலாறு 6th — கலையரசன் ரா புத்தக அடைப்பு" context="கலையரசன் ரா" floating />

      <nav style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "0 16px", height: 56, display: "flex", alignItems: "center", position: "sticky", top: 0, zIndex: 100, boxShadow: shadow.sm }}>
        <Link href="/tnpsc-study-materials" style={{ height: 34, borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 6, padding: "0 12px", textDecoration: "none", color: T.text, fontSize: 13, fontWeight: 600 }}>
          ← படிப்பகம்
        </Link>
      </nav>

      <div style={{ padding: "22px 16px 30px" }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: T.textTer, marginBottom: 4 }}>
          Class 6 · Social Science
        </div>
        <h1 style={{ fontFamily: "Georgia, 'Noto Serif Tamil', serif", fontSize: 26, fontWeight: 800, color: T.text, letterSpacing: "-0.3px", margin: 0 }}>
          வரலாறு
        </h1>
        <p style={{ fontSize: 12.5, color: T.textSec, margin: "2px 0 22px" }}>
          வழங்குபவர்: <b style={{ color: T.indigo }}>கலையரசன் ரா</b> · Samacheer Kalvi
        </p>

        {/* SHELF */}
        <div style={{ position: "relative", paddingBottom: 22 }}>
          <div style={{ display: "flex", gap: 18, alignItems: "flex-end", position: "relative", zIndex: 2 }}>
            <BookCover
              emoji="🏺"
              label={<>Term<br />1</>}
              status="available"
              plate={`${term1Count} Q&A · தயார்`}
              href={`${PAGE_PATH}/term-1/units`}
              ariaLabel={`Term 1 — ${term1Count} Q&A, தயார்`}
            />
            <BookCover
              emoji="📕"
              label={<>Term<br />2</>}
              status="available"
              plate={`${term2Count} Q&A · தயார்`}
              href={`${PAGE_PATH}/term-2/units`}
              ariaLabel={`Term 2 — ${term2Count} Q&A, தயார்`}
            />
          </div>
          <div style={{ position: "absolute", left: -16, right: -16, bottom: 0, height: 14, background: "linear-gradient(180deg, #DCD3C4 0%, #C7B89E 100%)", boxShadow: "0 6px 10px -2px rgba(0,0,0,0.18)", zIndex: 1 }} />
        </div>

        {/* ABOUT */}
        <section style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, marginTop: 26 }}>
          <h2 style={{ fontFamily: "Georgia, 'Noto Serif Tamil', serif", fontSize: 19, fontWeight: 700, marginBottom: 8, color: T.indigoDark }}>இந்த புத்தகம் பற்றி</h2>
          <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6, margin: 0 }}>
            6ஆம் வகுப்பு சமச்சீர் கல்வி வரலாறு பாடப்புத்தகத்தின் அடிப்படையில் கலையரசன் ரா தயாரித்த வினா-விடைகள், டெர்ம் வாரியாக வரிசைப்படுத்தப்பட்டுள்ளது. Term 1 முழுவதும் தயார்; Term 2 அலகு வாரியாக விரைவில் வரும்.
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

        {/* RELATED LINKS */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, marginTop: 14 }}>
          <h3 style={{ fontFamily: "Georgia, 'Noto Serif Tamil', serif", fontSize: 16, fontWeight: 700, color: T.indigoDark, marginBottom: 4 }}>தொடர்ந்து பயிற்சி செய்யுங்கள்</h3>
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
