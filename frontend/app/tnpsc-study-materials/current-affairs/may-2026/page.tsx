// PASTE TO: app/tnpsc-study-materials/current-affairs/may-2026/page.tsx

import { Metadata } from "next";
import Link from "next/link";
import {
  fetchCAMonthlyUnitCounts,
  fetchCAMonthlyPreview,
  CA_UNIT_ORDER,
  CA_UNIT_LABELS,
  CA_UNIT_SUBJECTS,
  CAQuestion,
  CAUnitMeta,
} from "../../../../lib/supabase";
import { T, shadow } from "../../../../lib/tokens";

export const revalidate = 86400;

const MONTH = "2026-05";

export const metadata: Metadata = {
  title: "TNPSC Current Affairs May 2026 | Monthly PDF & Free MCQ Test",
  description:
    "Practice May 2026 current affairs MCQs for TNPSC Group 4 and Group 2. Includes detailed Samacheer Kalvi blueprint mapping and daily updated question sets.",
  alternates: {
    canonical: "https://mcqpalagu.in/tnpsc-study-materials/current-affairs/may-2026",
    languages: {
      ta: "https://mcqpalagu.in/tnpsc-study-materials/current-affairs/may-2026-tamil",
    },
  },
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

function getCountForUnit(unitSlug: string, counts: { subject: string; count: number }[]): number {
  const subjects = CA_UNIT_SUBJECTS[unitSlug] ?? [];
  return counts.filter((c) => subjects.includes(c.subject)).reduce((sum, c) => sum + c.count, 0);
}

function QCard({ q, num }: { q: CAQuestion; num: number }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: shadow.sm }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textTer, textTransform: "uppercase" as const, letterSpacing: "0.5px", marginBottom: 8 }}>Question {num}</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: T.text, lineHeight: 1.5, marginBottom: 12 }}>{q.question}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
        {q.options.map((opt, i) => (
          <div key={i} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, color: T.textSec, display: "flex", alignItems: "flex-start", gap: 7, lineHeight: 1.4 }}>
            <span style={{ width: 20, height: 20, borderRadius: "50%", background: T.indigoLight, color: T.indigo, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{String.fromCharCode(65 + i)}</span>
            {opt}
          </div>
        ))}
      </div>
      <div style={{ background: T.greenBg, border: `1px solid ${T.greenBorder}`, borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase" as const, letterSpacing: "0.4px", marginBottom: 3 }}>✅ Correct Answer</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.green }}>{q.correct_option}</div>
      </div>
      {q.explanation && (
        <div style={{ background: T.indigoLight, border: `1px solid ${T.indigoMid}`, borderRadius: 10, padding: "10px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.indigo, textTransform: "uppercase" as const, letterSpacing: "0.4px", marginBottom: 3 }}>📖 Explanation</div>
          <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.5 }}>{q.explanation}</div>
        </div>
      )}
    </div>
  );
}

export default async function CAMonthlyPage() {
  const [enCounts, ...previews] = await Promise.all([
    fetchCAMonthlyUnitCounts(MONTH, "en").catch((): CAUnitMeta[] => []),
    ...CA_UNIT_ORDER.map((slug) => fetchCAMonthlyPreview(MONTH, slug, "en").catch((): CAQuestion[] => [])),
  ]);

  const totalCount = enCounts.reduce((sum, c) => sum + c.count, 0);
  const circumference = 2 * Math.PI * 50;
  const donutData = CA_UNIT_ORDER.map((slug, i) => ({
    slug, count: getCountForUnit(slug, enCounts),
    color: Object.values(UNIT_COLORS)[i].btn,
    label: CA_UNIT_LABELS[slug].en,
  }));
  const donutTotal = donutData.reduce((s, d) => s + d.count, 0) || 1;
  let offset = 0;
  const segments = donutData.map((d) => {
    const dash = (d.count / donutTotal) * circumference;
    const seg = { ...d, dash, offset };
    offset += dash;
    return seg;
  });

  const faqItems = previews
    .flat()
    .filter((q) => q && q.question && q.correct_option)
    .slice(0, 8)
    .map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.explanation ? `${q.correct_option}. ${q.explanation}` : q.correct_option,
      },
    }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems,
  };

  return (
    <>
      {faqItems.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <nav style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "0 16px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: shadow.sm }}>
        <Link href="/tnpsc-study-materials" style={{ height: 34, borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 6, padding: "0 12px", textDecoration: "none", color: T.text, fontSize: 13, fontWeight: 600 }}>← படிப்பகம்</Link>
        <Link href="/tnpsc-study-materials/current-affairs/may-2026-tamil" style={{ background: T.indigoLight, color: T.indigo, border: `1px solid ${T.indigoMid}`, borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" as const }}>
          தமிழில் படிக்க →
        </Link>
      </nav>

      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "14px 20px 14px" }}>
        <div style={{ fontSize: 12, color: T.textTer, marginBottom: 12, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" as const }}>
          <Link href="/tnpsc-study-materials" style={{ color: T.indigo, textDecoration: "none", fontWeight: 500 }}>TNPSC Study Materials</Link>
          <span>›</span>
          <Link href="/tnpsc-study-materials/current-affairs" style={{ color: T.indigo, textDecoration: "none", fontWeight: 500 }}>Current Affairs</Link>
          <span>›</span>
          <span>May 2026</span>
        </div>
        <h1 style={{ fontFamily: "serif", fontSize: 26, fontWeight: 800, color: T.text, lineHeight: 1.2, letterSpacing: "-0.5px", marginBottom: 10 }}>
          TNPSC Current Affairs <span style={{ color: T.indigo }}>May 2026</span> MCQ Questions
        </h1>
        <div style={{ display: "flex", gap: 10, fontSize: 13, color: T.textSec, marginBottom: 20, flexWrap: "wrap" as const }}>
          <span>📅 May 1–31, 2026</span><span>✅ Daily Updated</span><span>🎯 Group 4 &amp; Group 2</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {[{ num: totalCount || "—", label: "Questions" }, { num: 6, label: "Units" }, { num: 31, label: "Days" }].map((s) => (
            <div key={s.label} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 10px", textAlign: "center" as const }}>
              <span style={{ fontFamily: "serif", fontSize: 24, fontWeight: 700, color: T.indigo, display: "block" }}>{s.num}</span>
              <span style={{ fontSize: 12, color: T.textSec, marginTop: 2, fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DONUT */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "24px 20px" }}>
        <h2 style={{ fontFamily: "serif", fontSize: 18, fontWeight: 700, margin: "0 0 20px 0", color: T.text }}>Unit-wise Distribution</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ position: "relative", width: 130, height: 130, flexShrink: 0 }}>
            <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="65" cy="65" r="50" fill="none" stroke={T.indigoLight} strokeWidth="18" />
              {segments.map((seg, i) => (
                <circle key={i} cx="65" cy="65" r="50" fill="none" stroke={seg.color} strokeWidth="18"
                  strokeDasharray={`${seg.dash} ${circumference - seg.dash}`} strokeDashoffset={-seg.offset} />
              ))}
            </svg>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" as const }}>
              <span style={{ fontFamily: "serif", fontSize: 22, fontWeight: 800, color: T.text, display: "block" }}>{donutTotal}</span>
              <span style={{ fontSize: 11, color: T.textSec, fontWeight: 500 }}>questions</span>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" as const, gap: 9 }}>
            {donutData.map((d) => (
              <div key={d.slug} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: T.textSec, flex: 1 }}>{d.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* UNIT CARDS */}
      <div style={{ padding: "24px 20px 0" }}>
        <h2 style={{ fontFamily: "serif", fontSize: 20, fontWeight: 700, margin: "0 0 4px 0" }}>Read by Unit</h2>
        <div style={{ fontSize: 14, color: T.textSec, marginBottom: 16 }}>Expand a unit to preview questions, then read all or test yourself</div>

        {CA_UNIT_ORDER.map((slug, idx) => {
          const col = UNIT_COLORS[slug];
          const label = CA_UNIT_LABELS[slug];
          const count = getCountForUnit(slug, enCounts);
          const qs: CAQuestion[] = previews[idx] ?? [];
          return (
            <details key={slug} style={{ background: col.bg, border: `1.5px solid ${col.border}`, borderRadius: 16, marginBottom: 14, overflow: "hidden", boxShadow: shadow.sm }}>
              <summary style={{ padding: 16, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", listStyle: "none" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: col.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{label.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Unit {UNIT_NUMERALS[idx]} — {label.en}</div>
                  <div style={{ fontSize: 13, color: T.textSec, marginTop: 2 }}>{count} questions</div>
                </div>
                <div style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${col.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: col.text, fontSize: 14 }}>›</div>
              </summary>
              <div style={{ padding: "0 16px 16px" }}>
                {qs.length === 0
                  ? <p style={{ fontSize: 13, color: T.textSec, padding: "12px 0" }}>Questions loading — check back soon.</p>
                  : qs.map((q, i) => <QCard key={q.id} q={q} num={i + 1} />)
                }
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <Link href={`/tnpsc-study-materials/current-affairs/may-2026/${slug}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 11, borderRadius: 10, border: `1.5px solid ${col.border}`, background: col.bg, color: col.text, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                    📖 Read all {count} →
                  </Link>
                  <Link href={`/practice/current-affairs/${slug}?month=may-2026`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 11, borderRadius: 10, background: col.btn, color: "white", fontSize: 13, fontWeight: 700, textDecoration: "none", border: "none" }}>
                    🎯 Test Yourself
                  </Link>
                </div>
              </div>
            </details>
          );
        })}
      </div>

      {/* INTERNAL LINKS */}
      <div style={{ padding: "24px 20px 0" }}>
        <h2 style={{ fontFamily: "serif", fontSize: 18, fontWeight: 700, color: T.text, margin: "0 0 14px 0" }}>Explore More</h2>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 24 }}>
          {[
            { href: "/current-affairs", icon: "📰", bg: T.greenBg, title: "Today's Current Affairs", sub: "Daily updated questions" },
            { href: "/pyq/group4", icon: "📋", bg: "#FEF3C7", title: "Group 4 PYQ Practice", sub: "Previous Year Question Papers" },
            { href: "/tnpsc-study-materials/syllabus/group-4", icon: "📚", bg: T.indigoLight, title: "TNPSC Group 4 Syllabus", sub: "Full unit-wise syllabus breakdown" },
            { href: "/tnpsc-study-materials/current-affairs/may-2026-tamil", icon: "🔤", bg: "#F5F3FF", title: "தமிழில் படிக்க", sub: "Read May 2026 in Tamil" },
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

      {/* PDF */}
      <div style={{ margin: "0 20px 24px", background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 16, padding: 16, display: "flex", alignItems: "center", gap: 14, boxShadow: shadow.sm }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>📄</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>⬇️ Download May 2026 as PDF</div>
          <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>All {totalCount || "—"} questions with answers. Free with login.</div>
        </div>
        <Link href="/login?redirect=/tnpsc-study-materials/current-affairs/may-2026?download=pdf" style={{ background: T.indigoLight, color: T.indigo, border: `1px solid ${T.indigoMid}`, borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" as const }}>Download</Link>
      </div>

      <div style={{ height: 100 }} />
    </>
  );
}
