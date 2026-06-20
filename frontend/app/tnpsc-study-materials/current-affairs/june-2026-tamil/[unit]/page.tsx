import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchCAForUnit,
  CA_UNIT_LABELS,
  CA_UNIT_ORDER,
  CAQuestion,
} from "../../../../../lib/supabase";
import { T, shadow } from "../../../../../lib/tokens";
import PdfDownloadButton from "../../../../../components/PdfDownloadButton";
import PdfBranding, { QuestionWatermark } from "../../../../../components/PdfBranding";
import WhatsAppShareButton from "../../../../../components/WhatsAppShareButton";

export const revalidate = 3600;

const MONTH = "2026-06";

const UNIT_SEO_TA: Record<string, { title: string; description: string }> = {
  "general-science":     { title: "TNPSC June 2026 Science MCQ in Tamil | Free Online Test", description: "ஜூன் 2026 பொது அறிவியல் மற்றும் புதிய கண்டுபிடிப்புகள் சார்ந்த TNPSC நடப்பு நிகழ்வுகள் வினாக்கள். சமச்சீர் பாடத்திட்ட விளக்கங்களுடன்." },
  "geography":           { title: "TNPSC June 2026 Geography MCQ in Tamil | Free Online Test", description: "ஜூன் 2026 இந்திய மற்றும் தமிழ்நாடு நிலவியல் சார்ந்த நடப்பு நிகழ்வுகள் வினாக்கள். குரூப் 4 தேர்வு ஆன்லைன் பயிற்சி." },
  "indian-history":      { title: "TNPSC June 2026 History MCQ in Tamil | Free Online Test", description: "ஜூன் 2026 இந்திய வரலாறு மற்றும் தேசிய இயக்கம் சார்ந்த TNPSC நடப்பு நிகழ்வுகள் வினாக்கள். விளக்கங்களுடன் இலவச பயிற்சி." },
  "indian-polity":       { title: "TNPSC June 2026 Indian Polity MCQ in Tamil | Free Online Test", description: "ஜூன் 2026 இந்திய அரசியல் அமைப்பு மற்றும் நடப்பு நிகழ்வுகள் வினாக்கள். TNPSC குரூப் 4, குரூப் 2 தேர்வுக்கான ஆன்லைன் டெஸ்ட்." },
  "welfare-schemes":     { title: "TNPSC June 2026 Welfare Schemes MCQ in Tamil | Free Test", description: "ஜூன் 2026 தமிழக அரசு நலத்திட்டங்கள் மற்றும் வளர்ச்சி நிர்வாகம் சார்ந்த முக்கிய வினாக்கள். சமச்சீர் அலகு 5 பாடத்திட்ட விளக்கங்களுடன்." },
  "archaeology-updates": { title: "TNPSC June 2026 Archaeology & Culture MCQ in Tamil", description: "ஜூன் 2026 கீழடி அகழ்வாராய்ச்சி மற்றும் தமிழ்நாடு வரலாறு, பண்பாடு சார்ந்த முக்கிய வினாக்கள். அலகு 6 தேர்வு ஆன்லைன் பயிற்சி." },
};

const UNIT_COLORS: Record<string, { bg: string; border: string; text: string; btn: string }> = {
  "general-science":     { bg: T.indigoLight, border: T.indigoMid,   text: T.indigo,  btn: T.indigo },
  "geography":           { bg: T.greenBg,     border: T.greenBorder, text: T.green,   btn: T.green },
  "indian-history":      { bg: "#FEF3C7",     border: "#FCD34D",     text: "#B45309", btn: "#B45309" },
  "indian-polity":       { bg: "#F5F3FF",     border: "#DDD6FE",     text: "#7C3AED", btn: "#7C3AED" },
  "welfare-schemes":     { bg: T.redBg,       border: T.redBorder,   text: T.red,     btn: T.red },
  "archaeology-updates": { bg: "#E0F7FA",     border: "#A5D8E3",     text: "#0E7490", btn: "#0E7490" },
};

const UNIT_NUMERALS = ["I", "II", "III", "IV", "V", "VI"];

export async function generateStaticParams() {
  return CA_UNIT_ORDER.map((unit) => ({ unit }));
}

export async function generateMetadata({ params }: { params: Promise<{ unit: string }> }): Promise<Metadata> {
  const { unit } = await params;
  const seo = UNIT_SEO_TA[unit];
  if (!seo) return {};
  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: `https://mcqpalagu.in/tnpsc-study-materials/current-affairs/june-2026-tamil/${unit}`,
      languages: { en: `https://mcqpalagu.in/tnpsc-study-materials/current-affairs/june-2026/${unit}` },
    },
  };
}

function QCard({ q, num }: { q: CAQuestion; num: number }) {
  return (
    <div id={q.slug ? q.slug.replace(/\s+/g, "-") : q.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, marginBottom: 14, boxShadow: shadow.sm, position: "relative", overflow: "hidden", zIndex: 0 }}>
      <QuestionWatermark />
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textTer, textTransform: "uppercase" as const, letterSpacing: "0.5px", marginBottom: 10 }}>வினா {num}</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: T.text, lineHeight: 1.6, marginBottom: 14 }}>{q.question}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 14 }}>
        {q.options.map((opt, i) => {
          const isCorrect = opt === q.correct_option;
          return (
            <div key={i} style={{ background: isCorrect ? T.greenBg : T.bg, border: `1px solid ${isCorrect ? T.greenBorder : T.border}`, borderRadius: 9, padding: "9px 10px", fontSize: 13, color: isCorrect ? T.green : T.textSec, display: "flex", alignItems: "flex-start", gap: 7, lineHeight: 1.4 }}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", background: isCorrect ? T.green : T.indigoLight, color: isCorrect ? "white" : T.indigo, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{["அ","ஆ","இ","ஈ"][i]}</span>
              {opt}
            </div>
          );
        })}
      </div>
      <div style={{ background: T.greenBg, border: `1px solid ${T.greenBorder}`, borderRadius: 10, padding: "10px 14px", marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase" as const, letterSpacing: "0.4px", marginBottom: 3 }}>✅ சரியான விடை</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.green, lineHeight: 1.4 }}>{q.correct_option}</div>
      </div>
      {q.explanation && (
        <div style={{ background: T.indigoLight, border: `1px solid ${T.indigoMid}`, borderRadius: 10, padding: "10px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.indigo, textTransform: "uppercase" as const, letterSpacing: "0.4px", marginBottom: 4 }}>📖 விளக்கம்</div>
          <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.6 }}>{q.explanation}</div>
        </div>
      )}
    </div>
  );
}

export default async function CAUnitTamilPage({ params }: { params: Promise<{ unit: string }> }) {
  const { unit } = await params;
  if (!CA_UNIT_ORDER.includes(unit)) notFound();

  const label = CA_UNIT_LABELS[unit];
  const col = UNIT_COLORS[unit];
  const unitIndex = CA_UNIT_ORDER.indexOf(unit);
  const numeral = UNIT_NUMERALS[unitIndex];
  const questions = await fetchCAForUnit(MONTH, unit, "ta").catch((): CAQuestion[] => []);
  const otherUnits = CA_UNIT_ORDER.filter((s) => s !== unit);

  console.log(`[CAUnitTamilPage] unit=${unit} questions=${questions.length}`);

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>
      <PdfBranding />
      <WhatsAppShareButton title={`TNPSC ${label.ta} நடப்பு நிகழ்வுகள் ஜூன் 2026 MCQ`} floating />
      <nav className="no-print" style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "0 16px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: shadow.sm }}>
        <Link href="/tnpsc-study-materials/current-affairs/june-2026-tamil" style={{ height: 34, borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 6, padding: "0 12px", textDecoration: "none", color: T.text, fontSize: 13, fontWeight: 600 }}>← படிப்பகம்</Link>
        <Link href={`/tnpsc-study-materials/current-affairs/june-2026/${unit}`} style={{ background: T.greenBg, color: T.green, border: `1px solid ${T.greenBorder}`, borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" as const }}>
          ஆங்கிலத்தில் படிக்க →
        </Link>
      </nav>

      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "14px 20px 14px" }}>
        <div style={{ fontSize: 12, color: T.textTer, marginBottom: 12, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" as const }}>
          <Link href="/tnpsc-study-materials" style={{ color: T.indigo, textDecoration: "none", fontWeight: 500 }}>படிப்பகம்</Link>
          <span>›</span>
          <Link href="/tnpsc-study-materials/current-affairs/june-2026-tamil" style={{ color: T.indigo, textDecoration: "none", fontWeight: 500 }}>ஜூன் 2026</Link>
          <span>›</span>
          <span>{label.ta}</span>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: col.bg, border: `1px solid ${col.border}`, color: col.text, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, marginBottom: 12, textTransform: "uppercase" as const, letterSpacing: "0.4px" }}>
          {label.icon} அலகு {numeral}
        </div>
        <h1 style={{ fontFamily: "serif", fontSize: 22, fontWeight: 800, color: T.text, lineHeight: 1.25, letterSpacing: "-0.3px", marginBottom: 10 }}>
          TNPSC <span style={{ color: col.text }}>{label.ta}</span> நடப்பு நிகழ்வுகள் ஜூன் 2026 MCQ
        </h1>
        <div style={{ display: "flex", gap: 10, fontSize: 13, color: T.textSec, marginBottom: 20, flexWrap: "wrap" as const }}>
          <span>📅 ஜூன் 2026</span><span>🎯 குரூப் 4 &amp; குரூப் 2</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {[{ num: questions.length || "—", label: "வினாக்கள்" }, { num: `~${Math.ceil((questions.length || 10) * 0.4)}`, label: "நிமிட வாசிப்பு" }, { num: "Free", label: "Full Access" }].map((s) => (
            <div key={s.label} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 8px", textAlign: "center" as const }}>
              <span style={{ fontFamily: "serif", fontSize: 20, fontWeight: 700, color: col.text, display: "block" }}>{s.num}</span>
              <span style={{ fontSize: 11, color: T.textSec, marginTop: 2, fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ fontFamily: "serif", fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 4 }}>ஜூன் 2026 — {label.ta} வினாக்கள்</div>
        <div style={{ fontSize: 13, color: T.textSec, marginBottom: 16 }}>அனைத்து வினாக்களும் விடைகளும் விளக்கங்களும். TNPSC குரூப் 4 பாடத்திட்டம் அலகு {numeral}-க்கு ஏற்ப வரிசைப்படுத்தப்பட்டுள்ளது.</div>
        {questions.length === 0
          ? <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24, textAlign: "center" as const, color: T.textSec }}>இந்த அலகிற்கான வினாக்கள் சேர்க்கப்படுகின்றன — சீக்கிரம் திரும்பி வாருங்கள்.</div>
          : questions.map((q, i) => <QCard key={q.id} q={q} num={i + 1} />)
        }
      </div>

      <div className="no-print" style={{ padding: "24px 20px 0" }}>
        <div style={{ fontFamily: "serif", fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 14 }}>மேலும் ஜூன் 2026 அலகுகள்</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {otherUnits.map((slug, i) => {
            const c = UNIT_COLORS[slug];
            const l = CA_UNIT_LABELS[slug];
            const n = UNIT_NUMERALS[CA_UNIT_ORDER.indexOf(slug)];
            const isLast = i === otherUnits.length - 1 && otherUnits.length % 2 !== 0;
            return (
              <Link key={slug} href={`/tnpsc-study-materials/current-affairs/june-2026-tamil/${slug}`} style={{ background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 12, padding: 12, textDecoration: "none", display: "block", gridColumn: isLast ? "1 / -1" : undefined }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.4px", marginBottom: 3, color: c.text, opacity: 0.7 }}>அலகு {n}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.text, lineHeight: 1.3 }}>{l.icon} {l.ta}</div>
              </Link>
            );
          })}
        </div>

        <div style={{ fontFamily: "serif", fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 14 }}>மேலும் படிக்கவும்</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 24 }}>
          {[
            { href: "/tnpsc-study-materials/current-affairs/june-2026-tamil", icon: "📅", bg: T.indigoLight, title: "ஜூன் 2026 — அனைத்து அலகுகள்", sub: "6 அலகுகளில் அனைத்து வினாக்கள்" },
            { href: "/current-affairs", icon: "📰", bg: T.greenBg, title: "இன்றைய நடப்பு நிகழ்வுகள்", sub: "தினமும் புதுப்பிக்கப்படும் வினாக்கள்" },
            { href: "/subjects", icon: "📋", bg: "#FEF3C7", title: "குரூப் 4 PYQ பயிற்சி", sub: "முந்தைய ஆண்டு வினாத்தாள்கள்" },
            { href: "/mock", icon: "📝", bg: "#F5F3FF", title: "Full Mock Test", sub: "" },
          ].map((link) => (
            <Link key={link.href} href={link.href} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: shadow.sm }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: link.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{link.icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{link.title}</div>
                  <div style={{ fontSize: 12, color: T.textSec, marginTop: 1 }}>{link.sub}</div>
                </div>
              </div>
              <span style={{ color: T.textTer, fontSize: 18 }}>›</span>
            </Link>
          ))}
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", opacity: 0.55 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: T.indigoLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📚</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>TNPSC குரூப் 4 பாடத்திட்டம்</div>
                <div style={{ fontSize: 12, color: T.textSec, marginTop: 1 }}>அலகு வாரியான பாடத்திட்ட விவரம்</div>
              </div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: T.textTer, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 20, padding: "3px 10px", letterSpacing: "0.4px", textTransform: "uppercase" as const }}>விரைவில்</span>
          </div>
        </div>
      </div>

      <div style={{ height: 140 }} />

      <div className="no-print" style={{ position: "fixed", bottom: 60, left: 0, right: 0, background: T.surface, borderTop: `1px solid ${T.border}`, padding: "12px 20px", display: "flex", gap: 10, boxShadow: "0 -2px 10px rgba(0,0,0,0.07)", zIndex: 90 }}>
        <Link href={`/practice/current-affairs/${unit}?month=june-2026&lang=ta`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 13, borderRadius: 10, background: T.indigo, color: "white", fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: shadow.indigo }}>
          🎯 தேர்வு எழுது — {questions.length} வினாக்கள்
        </Link>
        <PdfDownloadButton style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "13px 12px", borderRadius: 10, background: T.bg, color: T.textSec, border: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" as const }}>
          ⬇️ PDF பதிவிறக்கம்
        </PdfDownloadButton>
      </div>
    </>
  );
}
