import { cookies } from "next/headers";
import Link from "next/link";
import { Metadata } from "next";
import { T } from "@/lib/tokens";
import HomeLangToggle from "@/components/HomeLangToggle";
import WhatsAppShareButton from "@/components/WhatsAppShareButton";
import NitiAayogUnits from "@/components/NitiAayogUnits";
import { fetchNitiAayogUnits } from "@/lib/supabase";

const PAGE_PATH = "/tnpsc-study-materials/er-thangamuthu/niti-aayog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "NITI Aayog — Q&A by Unit | Er. Thangamuthu (TVK) | TNPSC",
  description:
    "NITI Aayog questions & answers by Er. Thangamuthu (TVK), organised unit by unit — establishment, leadership, vision & mission, indices & reports. Free TNPSC study material in Tamil & English.",
  alternates: {
    canonical: `https://mcqpalagu.in${PAGE_PATH}`,
  },
};

const COPY = {
  en: {
    eyebrow: "⚡ NITI Aayog · Q&A",
    title: "NITI Aayog — Questions & Answers",
    credit: <>By <b style={{ color: "#FFD24D" }}>Er. Thangamuthu (TVK)</b> · TNPSC Group 1 / 2 / 4</>,
    introHeading: "About this set",
    introBody:
      "NITI Aayog is a recurring TNPSC Polity topic. This set covers its establishment, leadership & structure, vision, mission & core values, and indices & reports — split into 4 units so you can revise one topic at a time.",
    unitsHeading: "Choose a unit",
    tapHint: "Tap to open",
    relatedHeading: "Keep practising",
    related: [
      { href: "/subjects", icon: "📋", title: "TNPSC Group 4 PYQ Practice", sub: "Previous Year Question Papers" },
      { href: "/current-affairs", icon: "📰", title: "Daily Current Affairs", sub: "Daily updated MCQs" },
      { href: "/tnpsc-study-materials", icon: "📚", title: "TNPSC Study Materials hub", sub: "Notes, current affairs & more" },
    ],
    qa: (n: number) => `${n} Q&A`,
    answerLabel: "Answer",
  },
  ta: {
    eyebrow: "⚡ NITI Aayog · வினா-விடை",
    title: "NITI Aayog — வினா & விடைகள்",
    credit: <>வழங்குபவர்: <b style={{ color: "#FFD24D" }}>Er. தங்கமுத்து (TVK)</b> · TNPSC குரூப் 1 / 2 / 4</>,
    introHeading: "இந்த தொகுப்பு பற்றி",
    introBody:
      "NITI Aayog என்பது TNPSC அரசியலில் மீண்டும் மீண்டும் வரும் தலைப்பு. இதன் தோற்றம், தலைமை & அமைப்பு, நோக்கம், பணி & மைய மதிப்புகள், மற்றும் குறியீடுகள் & அறிக்கைகள் ஆகியவற்றை உள்ளடக்கிய இந்த தொகுப்பு 4 அலகுகளாகப் பிரிக்கப்பட்டுள்ளது.",
    unitsHeading: "ஒரு அலகைத் தேர்ந்தெடுக்கவும்",
    tapHint: "தொடவும்",
    relatedHeading: "தொடர்ந்து பயிற்சி செய்யுங்கள்",
    related: [
      { href: "/subjects", icon: "📋", title: "TNPSC குரூப் 4 PYQ பயிற்சி", sub: "முந்தைய ஆண்டு வினாத்தாள்கள்" },
      { href: "/current-affairs", icon: "📰", title: "தினசரி நடப்பு நிகழ்வுகள்", sub: "தினமும் புதுப்பிக்கப்படும் MCQ" },
      { href: "/tnpsc-study-materials", icon: "📚", title: "TNPSC படிப்பு பொருட்கள்", sub: "குறிப்புகள், நடப்பு நிகழ்வுகள் மற்றும் பல" },
    ],
    qa: (n: number) => `${n} வினா-விடை`,
    answerLabel: "விடை",
  },
};

export default async function NitiAayogUnitsPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("mcqpalagu_lang")?.value === "en" ? "en" : "ta") as "en" | "ta";
  const c = COPY[lang];
  const isTa = lang === "ta";
  const units = await fetchNitiAayogUnits();
  const totalCount = units.reduce((sum, u) => sum + u.questions.length, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "TNPSC Study Materials", item: "https://mcqpalagu.in/tnpsc-study-materials" },
      { "@type": "ListItem", position: 2, name: "Er. Thangamuthu (TVK)", item: "https://mcqpalagu.in/experts/er-thangamuthu-tvk" },
      { "@type": "ListItem", position: 3, name: "NITI Aayog", item: `https://mcqpalagu.in${PAGE_PATH}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <WhatsAppShareButton title={c.title} context="Er. Thangamuthu (TVK)" floating />

      {/* HERO */}
      <div style={{ background: `linear-gradient(135deg, ${T.indigo} 0%, ${T.indigoDark} 100%)`, color: "white", borderRadius: "0 0 28px 28px", padding: "16px 16px 34px", position: "relative", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.16)", padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>
            {c.eyebrow}
          </span>
          <HomeLangToggle initialLang={lang} />
        </div>
        <h1 style={{ fontFamily: "serif", fontSize: 24, fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.4px", margin: "14px 0 6px" }}>
          {c.title}
        </h1>
        <p style={{ fontSize: isTa ? 14 : 13, opacity: 0.85, marginBottom: 16 }}>{c.credit}</p>
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginTop: 4 }}>
          {[c.qa(totalCount), `${units.length} Units`, "Indian Polity"].map((s) => (
            <div key={s} style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)", padding: "6px 12px", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
              {s}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* INTRO */}
        <section style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, marginTop: 26 }}>
          <h2 style={{ fontFamily: "serif", fontSize: isTa ? 19 : 18, fontWeight: 700, marginBottom: 8, color: T.indigoDark }}>{c.introHeading}</h2>
          <p style={{ fontSize: isTa ? 14 : 13, color: T.textSec, lineHeight: 1.6, margin: 0 }}>{c.introBody}</p>
        </section>

        {/* EXPERT INFO */}
        <Link href="/experts/er-thangamuthu-tvk" style={{ display: "flex", alignItems: "center", gap: 12, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, marginTop: 14, textDecoration: "none" }}>
          <span style={{ flexShrink: 0, width: 46, height: 46, borderRadius: "50%", background: "#7C3AED", color: "white", fontFamily: "serif", fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
            E
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Er. Thangamuthu (TVK)</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.indigo }}>✓</span>
            </div>
          </div>
          <span style={{ color: T.indigo, fontSize: 18, flexShrink: 0 }}>→</span>
        </Link>

        {/* UNITS */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "28px 4px 14px" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "white", background: T.indigo, width: 26, height: 26, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>U</div>
          <h2 style={{ fontFamily: "serif", fontSize: isTa ? 19 : 18, fontWeight: 700, color: T.indigoDark, margin: 0 }}>{c.unitsHeading}</h2>
        </div>

        <NitiAayogUnits units={units} lang={lang} answerLabel={c.answerLabel} tapHint={c.tapHint} />

        {/* RELATED LINKS */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, marginTop: 14, marginBottom: 24 }}>
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

      <div style={{ height: 40 }} />
    </>
  );
}
