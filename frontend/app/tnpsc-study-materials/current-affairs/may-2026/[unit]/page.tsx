// PASTE TO: app/tnpsc-study-materials/current-affairs/may-2026/[unit]/page.tsx

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
import PdfBranding from "../../../../../components/PdfBranding";

export const revalidate = 86400;

const MONTH = "2026-05";
const MONTH_LABEL = "May 2026";

const UNIT_SEO: Record<string, { title: string; description: string }> = {
  "general-science":     { title: "TNPSC May 2026 Science Current Affairs MCQ | Free Test", description: "Practice May 2026 Science and Technology current affairs questions for TNPSC exams. Features space and scientific updates." },
  "geography":           { title: "TNPSC May 2026 Geography Current Affairs MCQ | Free Test", description: "Practice May 2026 Geography, weather, and climate current affairs MCQs for TNPSC Group 4 and Group 2." },
  "indian-history":      { title: "TNPSC Group 4 History MCQ May 2026 | Free Online Test", description: "Practice May 2026 Indian History and National Movement current affairs questions with detailed textbook explanations." },
  "indian-polity":       { title: "TNPSC Polity Questions May 2026 | Free MCQ Test Group 4 & Group 2", description: "Test your knowledge on May 2026 Polity current affairs, constitutional amendments, and bills for TNPSC Group 4 and 2." },
  "welfare-schemes":     { title: "TNPSC Public Administration Unit 5 May 2026 | Welfare Schemes MCQ", description: "High-yield May 2026 Tamil Nadu welfare schemes and socio-economic development MCQs. Mapped to Unit V blueprint." },
  "archaeology-updates": { title: "Keeladi Excavations TNPSC Questions May 2026 | Unit VI Free MCQ", description: "Practice May 2026 archaeological discoveries, Keeladi excavations, and Tamil culture MCQs for Group 4." },
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
  const seo = UNIT_SEO[unit];
  if (!seo) return {};
  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: `https://mcqpalagu.in/tnpsc-study-materials/current-affairs/may-2026/${unit}`,
      languages: { ta: `https://mcqpalagu.in/tnpsc-study-materials/current-affairs/may-2026-tamil/${unit}` },
    },
  };
}

function QCard({ q, num }: { q: CAQuestion; num: number }) {
  return (
    <div id={q.slug ? q.slug.replace(/\s+/g, "-") : q.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, marginBottom: 14, boxShadow: shadow.sm }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.textTer, textTransform: "uppercase" as const, letterSpacing: "0.5px" }}>Question {num}</span>
        {q.topic && <span style={{ fontSize: 11, fontWeight: 600, color: T.indigo, background: T.indigoLight, padding: "3px 8px", borderRadius: 8 }}>{q.topic}</span>}
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: T.text, lineHeight: 1.55, marginBottom: 14 }}>{q.question}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 14 }}>
        {q.options.map((opt, i) => {
          const isCorrect = opt === q.correct_option;
          return (
            <div key={i} style={{ background: isCorrect ? T.greenBg : T.bg, border: `1px solid ${isCorrect ? T.greenBorder : T.border}`, borderRadius: 9, padding: "9px 10px", fontSize: 13, color: isCorrect ? T.green : T.textSec, display: "flex", alignItems: "flex-start", gap: 7, lineHeight: 1.4 }}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", background: isCorrect ? T.green : T.indigoLight, color: isCorrect ? "white" : T.indigo, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{String.fromCharCode(65 + i)}</span>
              {opt}
            </div>
          );
        })}
      </div>
      <div style={{ background: T.greenBg, border: `1px solid ${T.greenBorder}`, borderRadius: 10, padding: "10px 14px", marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase" as const, letterSpacing: "0.4px", marginBottom: 3 }}>✅ Correct Answer</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.green, lineHeight: 1.4 }}>{q.correct_option}</div>
      </div>
      {q.explanation && (
        <div style={{ background: T.indigoLight, border: `1px solid ${T.indigoMid}`, borderRadius: 10, padding: "10px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.indigo, textTransform: "uppercase" as const, letterSpacing: "0.4px", marginBottom: 4 }}>📖 Explanation</div>
          <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.55 }}>{q.explanation}</div>
        </div>
      )}
    </div>
  );
}

export default async function CAUnitPage({ params }: { params: Promise<{ unit: string }> }) {
  const { unit } = await params;
  if (!CA_UNIT_ORDER.includes(unit)) notFound();

  const label = CA_UNIT_LABELS[unit];
  const col = UNIT_COLORS[unit];
  const unitIndex = CA_UNIT_ORDER.indexOf(unit);
  const numeral = UNIT_NUMERALS[unitIndex];
  const questions = await fetchCAForUnit(MONTH, unit, "en").catch((): CAQuestion[] => []);
  const otherUnits = CA_UNIT_ORDER.filter((s) => s !== unit);

  console.log(`[CAUnitPage] unit=${unit} questions=${questions.length}`);

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>
      <PdfBranding />
      <nav className="no-print" style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "0 16px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: shadow.sm }}>
        <Link href="/tnpsc-study-materials/current-affairs/may-2026" style={{ height: 34, borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 6, padding: "0 12px", textDecoration: "none", color: T.text, fontSize: 13, fontWeight: 600 }}>← படிப்பகம்</Link>
        <Link href={`/tnpsc-study-materials/current-affairs/may-2026-tamil/${unit}`} style={{ background: col.bg, color: col.text, border: `1px solid ${col.border}`, borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" as const }}>
          தமிழில் படிக்க →
        </Link>
      </nav>

      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "14px 20px 14px" }}>
        <div style={{ fontSize: 12, color: T.textTer, marginBottom: 12, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" as const }}>
          <Link href="/tnpsc-study-materials" style={{ color: T.indigo, textDecoration: "none", fontWeight: 500 }}>Study Materials</Link>
          <span>›</span>
          <Link href="/tnpsc-study-materials/current-affairs/may-2026" style={{ color: T.indigo, textDecoration: "none", fontWeight: 500 }}>May 2026</Link>
          <span>›</span>
          <span>{label.en}</span>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: col.bg, border: `1px solid ${col.border}`, color: col.text, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, marginBottom: 12, textTransform: "uppercase" as const, letterSpacing: "0.4px" }}>
          {label.icon} Unit {numeral}
        </div>
        <h1 style={{ fontFamily: "serif", fontSize: 24, fontWeight: 800, color: T.text, lineHeight: 1.2, letterSpacing: "-0.4px", marginBottom: 10 }}>
          TNPSC <span style={{ color: col.text }}>{label.en}</span> Current Affairs May 2026 MCQ
        </h1>
        <div style={{ display: "flex", gap: 10, fontSize: 13, color: T.textSec, marginBottom: 20, flexWrap: "wrap" as const }}>
          <span>📅 May 2026</span><span>🎯 Group 4 &amp; Group 2</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {[{ num: questions.length || "—", label: "Questions" }, { num: `~${Math.ceil((questions.length || 10) * 0.4)}`, label: "Min Read" }, { num: "Free", label: "Full Access" }].map((s) => (
            <div key={s.label} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 8px", textAlign: "center" as const }}>
              <span style={{ fontFamily: "serif", fontSize: 22, fontWeight: 700, color: col.text, display: "block" }}>{s.num}</span>
              <span style={{ fontSize: 11, color: T.textSec, marginTop: 2, fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 20px 0" }}>
        <h2 style={{ fontFamily: "serif", fontSize: 20, fontWeight: 700, color: T.text, margin: "0 0 4px 0" }}>{MONTH_LABEL} — {label.en} Questions</h2>
        <div style={{ fontSize: 13, color: T.textSec, marginBottom: 16 }}>All questions with answers &amp; explanations. Mapped to TNPSC Group 4 syllabus Unit {numeral}.</div>
        {questions.length === 0
          ? <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24, textAlign: "center" as const, color: T.textSec }}>Questions for this unit are being added — check back soon.</div>
          : questions.map((q, i) => <QCard key={q.id} q={q} num={i + 1} />)
        }
      </div>

      {/* INTERNAL LINKS */}
      <div className="no-print" style={{ padding: "24px 20px 0" }}>
        <h2 style={{ fontFamily: "serif", fontSize: 18, fontWeight: 700, color: T.text, margin: "0 0 14px 0" }}>More May 2026 Units</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {otherUnits.map((slug, i) => {
            const c = UNIT_COLORS[slug];
            const l = CA_UNIT_LABELS[slug];
            const n = UNIT_NUMERALS[CA_UNIT_ORDER.indexOf(slug)];
            const isLast = i === otherUnits.length - 1 && otherUnits.length % 2 !== 0;
            return (
              <Link key={slug} href={`/tnpsc-study-materials/current-affairs/may-2026/${slug}`} style={{ background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 12, padding: 12, textDecoration: "none", display: "block", gridColumn: isLast ? "1 / -1" : undefined }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.4px", marginBottom: 3, color: c.text, opacity: 0.7 }}>Unit {n}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.text, lineHeight: 1.3 }}>{l.icon} {l.en}</div>
              </Link>
            );
          })}
        </div>

        <h2 style={{ fontFamily: "serif", fontSize: 18, fontWeight: 700, color: T.text, margin: "0 0 14px 0" }}>Explore More</h2>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 24 }}>
          {[
            { href: "/tnpsc-study-materials/current-affairs/may-2026", icon: "📅", bg: T.indigoLight, title: "May 2026 — All Units", sub: "All current affairs for May 2026" },
            { href: "/current-affairs", icon: "📰", bg: T.greenBg, title: "Today's Current Affairs", sub: "Daily updated questions" },
            { href: "/pyq/group4", icon: "📋", bg: "#FEF3C7", title: "Group 4 PYQ Practice", sub: "Previous Year Question Papers" },
            { href: "/tnpsc-study-materials/syllabus/group-4", icon: "📚", bg: T.indigoLight, title: "TNPSC Group 4 Syllabus", sub: "Full unit-wise syllabus breakdown" },
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
        </div>
      </div>

      <div style={{ height: 140 }} />

      <div className="no-print" style={{ position: "fixed", bottom: 60, left: 0, right: 0, background: T.surface, borderTop: `1px solid ${T.border}`, padding: "12px 20px", display: "flex", gap: 10, boxShadow: "0 -2px 10px rgba(0,0,0,0.07)", zIndex: 90 }}>
        <Link href={`/practice/current-affairs/${unit}?month=may-2026`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 13, borderRadius: 10, background: T.indigo, color: "white", fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: shadow.indigo }}>
          🎯 Test Yourself — {questions.length} Questions
        </Link>
        <PdfDownloadButton style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "13px 12px", borderRadius: 10, background: T.bg, color: T.textSec, border: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" as const }}>
          ⬇️ Download as PDF
        </PdfDownloadButton>
      </div>
    </>
  );
}
