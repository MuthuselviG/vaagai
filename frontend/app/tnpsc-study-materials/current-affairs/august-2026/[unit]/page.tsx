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
import PdfBranding from "../../../../../components/PdfBranding";
import WhatsAppShareButton from "../../../../../components/WhatsAppShareButton";
import { UNIT_COLORS, UNIT_NUMERALS } from "@/lib/caUnits";
import CAQuestionCard from "@/components/CAQuestionCard";
import CAPrintStyles from "@/components/CAPrintStyles";
import CAUnitActionBar from "@/components/CAUnitActionBar";

export const revalidate = 3600;

const MONTH = "2026-08";
const MONTH_LABEL = "August 2026";

const UNIT_SEO: Record<string, { title: string; description: string }> = {
  "general-science":     { title: "TNPSC August 2026 Science Current Affairs MCQ | Free Test", description: "Practice August 2026 Science and Technology current affairs questions for TNPSC exams. Features space and scientific updates." },
  "geography":           { title: "TNPSC August 2026 Geography Current Affairs MCQ | Free Test", description: "Practice August 2026 Geography, weather, and climate current affairs MCQs for TNPSC Group 4 and Group 2." },
  "indian-history":      { title: "TNPSC Group 4 History MCQ August 2026 | Free Online Test", description: "Practice August 2026 Indian History and National Movement current affairs questions with detailed textbook explanations." },
  "indian-polity":       { title: "TNPSC Polity Questions August 2026 | Free MCQ Test Group 4 & Group 2", description: "Test your knowledge on August 2026 Polity current affairs, constitutional amendments, and bills for TNPSC Group 4 and 2." },
  "welfare-schemes":     { title: "TNPSC Public Administration Unit 5 August 2026 | Welfare Schemes MCQ", description: "High-yield August 2026 Tamil Nadu welfare schemes and socio-economic development MCQs. Mapped to Unit V blueprint." },
  "archaeology-updates": { title: "Keeladi Excavations TNPSC Questions August 2026 | Unit VI Free MCQ", description: "Practice August 2026 archaeological discoveries, Keeladi excavations, and Tamil culture MCQs for Group 4." },
};

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
      canonical: `https://mcqpalagu.in/tnpsc-study-materials/current-affairs/august-2026/${unit}`,
      languages: { ta: `https://mcqpalagu.in/tnpsc-study-materials/current-affairs/august-2026-tamil/${unit}` },
    },
  };
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

  return (
    <>
      <CAPrintStyles variant="unit" />
      <PdfBranding />
      <WhatsAppShareButton title={`TNPSC ${label.en} Current Affairs August 2026 MCQ`} floating />
      <nav className="no-print" style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "0 16px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: shadow.sm }}>
        <Link href="/tnpsc-study-materials/current-affairs/august-2026" style={{ height: 34, borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 6, padding: "0 12px", textDecoration: "none", color: T.text, fontSize: 13, fontWeight: 600 }}>← August 2026</Link>
        <Link href={`/tnpsc-study-materials/current-affairs/august-2026-tamil/${unit}`} style={{ background: col.bg, color: col.text, border: `1px solid ${col.border}`, borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" as const }}>
          தமிழில் படிக்க →
        </Link>
      </nav>

      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "14px 20px 14px" }}>
        <div style={{ fontSize: 12, color: T.textTer, marginBottom: 12, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" as const }}>
          <Link href="/tnpsc-study-materials" style={{ color: T.indigo, textDecoration: "none", fontWeight: 500 }}>Study Materials</Link>
          <span>›</span>
          <Link href="/tnpsc-study-materials/current-affairs/august-2026" style={{ color: T.indigo, textDecoration: "none", fontWeight: 500 }}>August 2026</Link>
          <span>›</span>
          <span>{label.en}</span>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: col.bg, border: `1px solid ${col.border}`, color: col.text, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, marginBottom: 12, textTransform: "uppercase" as const, letterSpacing: "0.4px" }}>
          {label.icon} Unit {numeral}
        </div>
        <h1 style={{ fontFamily: "serif", fontSize: 24, fontWeight: 800, color: T.text, lineHeight: 1.2, letterSpacing: "-0.4px", marginBottom: 10 }}>
          TNPSC <span style={{ color: col.text }}>{label.en}</span> Current Affairs August 2026 MCQ
        </h1>
        <div style={{ display: "flex", gap: 10, fontSize: 13, color: T.textSec, marginBottom: 20, flexWrap: "wrap" as const }}>
          <span>📅 August 2026</span><span>🎯 Group 4 &amp; Group 2</span>
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
          : questions.map((q, i) => <CAQuestionCard key={q.id} q={q} num={i + 1} lang="en" variant="unit" />)
        }
      </div>

      {/* INTERNAL LINKS */}
      <div className="no-print" style={{ padding: "24px 20px 0" }}>
        <h2 style={{ fontFamily: "serif", fontSize: 18, fontWeight: 700, color: T.text, margin: "0 0 14px 0" }}>More August 2026 Units</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {otherUnits.map((slug, i) => {
            const c = UNIT_COLORS[slug];
            const l = CA_UNIT_LABELS[slug];
            const n = UNIT_NUMERALS[CA_UNIT_ORDER.indexOf(slug)];
            const isLast = i === otherUnits.length - 1 && otherUnits.length % 2 !== 0;
            return (
              <Link key={slug} href={`/tnpsc-study-materials/current-affairs/august-2026/${slug}`} style={{ background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 12, padding: 12, textDecoration: "none", display: "block", gridColumn: isLast ? "1 / -1" : undefined }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.4px", marginBottom: 3, color: c.text, opacity: 0.7 }}>Unit {n}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.text, lineHeight: 1.3 }}>{l.icon} {l.en}</div>
              </Link>
            );
          })}
        </div>

        <h2 style={{ fontFamily: "serif", fontSize: 18, fontWeight: 700, color: T.text, margin: "0 0 14px 0" }}>Explore More</h2>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 24 }}>
          {[
            { href: "/tnpsc-study-materials/current-affairs/august-2026", icon: "📅", bg: T.indigoLight, title: "August 2026 — All Units", sub: "All current affairs for August 2026" },
            { href: "/current-affairs", icon: "📰", bg: T.greenBg, title: "Today's Current Affairs", sub: "Daily updated questions" },
            { href: "/subjects", icon: "📋", bg: "#FEF3C7", title: "Group 4 PYQ Practice", sub: "Previous Year Question Papers" },
            { href: "/mock", icon: "📝", bg: "#F5F3FF", title: "Full Mock Test", sub: "200 questions · 3 hours · Free" },
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
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>TNPSC Group 4 Syllabus</div>
                <div style={{ fontSize: 12, color: T.textSec, marginTop: 1 }}>Unit-wise syllabus breakdown</div>
              </div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: T.textTer, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 20, padding: "3px 10px", letterSpacing: "0.4px", textTransform: "uppercase" as const }}>Coming Soon</span>
          </div>
        </div>
      </div>

      <div style={{ height: 140 }} />

      <CAUnitActionBar lang="en" unit={unit} month={MONTH} questionCount={questions.length} />
    </>
  );
}
