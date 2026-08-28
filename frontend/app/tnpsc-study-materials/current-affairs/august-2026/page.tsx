import { Metadata } from "next";
import Link from "next/link";
import {
  fetchCAMonthlyUnitCounts,
  fetchCAMonthlyPreview,
  fetchCAForUnit,
  CA_UNIT_ORDER,
  CA_UNIT_LABELS,
  CAQuestion,
  CAUnitMeta,
} from "../../../../lib/supabase";
import { T, shadow } from "../../../../lib/tokens";
import PdfDownloadButton from "../../../../components/PdfDownloadButton";
import PdfBranding from "../../../../components/PdfBranding";
import WhatsAppShareButton from "../../../../components/WhatsAppShareButton";
import { UNIT_COLORS, UNIT_NUMERALS, getCountForUnit } from "@/lib/caUnits";
import CAQuestionCard from "@/components/CAQuestionCard";
import CAPrintStyles from "@/components/CAPrintStyles";

export const revalidate = 3600;

const MONTH = "2026-08";

export const metadata: Metadata = {
  title: "TNPSC Current Affairs August 2026 | Monthly PDF & Free MCQ Test",
  description:
    "Practice August 2026 current affairs MCQs for TNPSC Group 4 and Group 2. Includes detailed Samacheer Kalvi blueprint mapping and daily updated question sets.",
  alternates: {
    canonical: "https://mcqpalagu.in/tnpsc-study-materials/current-affairs/august-2026",
    languages: {
      ta: "https://mcqpalagu.in/tnpsc-study-materials/current-affairs/august-2026-tamil",
    },
  },
};

export default async function CAMonthlyPage() {
  const [enCounts, fullQuestions, ...previews] = await Promise.all([
    fetchCAMonthlyUnitCounts(MONTH, "en").catch((): CAUnitMeta[] => []),
    Promise.all(CA_UNIT_ORDER.map((slug) => fetchCAForUnit(MONTH, slug, "en").catch((): CAQuestion[] => []))),
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
      <CAPrintStyles variant="hub" />
      <PdfBranding />
      <WhatsAppShareButton title="TNPSC Current Affairs August 2026 MCQ Questions" floating />
      <nav className="no-print" style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "0 16px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: shadow.sm }}>
        <Link href="/tnpsc-study-materials" style={{ height: 34, borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 6, padding: "0 12px", textDecoration: "none", color: T.text, fontSize: 13, fontWeight: 600 }}>← படிப்பகம்</Link>
        <Link href="/tnpsc-study-materials/current-affairs/august-2026-tamil" style={{ background: T.indigoLight, color: T.indigo, border: `1px solid ${T.indigoMid}`, borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" as const }}>
          தமிழில் படிக்க →
        </Link>
      </nav>

      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "14px 20px 14px" }}>
        <div style={{ fontSize: 12, color: T.textTer, marginBottom: 12, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" as const }}>
          <Link href="/tnpsc-study-materials" style={{ color: T.indigo, textDecoration: "none", fontWeight: 500 }}>TNPSC Study Materials</Link>
          <span>›</span>
          <Link href="/tnpsc-study-materials/current-affairs" style={{ color: T.indigo, textDecoration: "none", fontWeight: 500 }}>Current Affairs</Link>
          <span>›</span>
          <span>August 2026</span>
        </div>
        <h1 style={{ fontFamily: "serif", fontSize: 26, fontWeight: 800, color: T.text, lineHeight: 1.2, letterSpacing: "-0.5px", marginBottom: 10 }}>
          TNPSC Current Affairs <span style={{ color: T.indigo }}>August 2026</span> MCQ Questions
        </h1>
        <div style={{ display: "flex", gap: 10, fontSize: 13, color: T.textSec, marginBottom: 20, flexWrap: "wrap" as const }}>
          <span>📅 August 1–31, 2026</span><span>✅ Daily Updated</span><span>🎯 Group 4 &amp; Group 2</span>
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
              <summary className="no-print" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", listStyle: "none" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: col.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{label.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Unit {UNIT_NUMERALS[idx]} — {label.en}</div>
                  <div style={{ fontSize: 13, color: T.textSec, marginTop: 2 }}>{count} questions</div>
                </div>
                <div style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${col.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: col.text, fontSize: 14 }}>›</div>
              </summary>
              <div className="no-print" style={{ padding: "0 16px 16px" }}>
                {qs.length === 0
                  ? <p style={{ fontSize: 13, color: T.textSec, padding: "12px 0" }}>Questions loading — check back soon.</p>
                  : qs.map((q, i) => <CAQuestionCard key={q.id} q={q} num={i + 1} lang="en" variant="hub" />)
                }
                <div className="no-print" style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <Link href={`/tnpsc-study-materials/current-affairs/august-2026/${slug}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 11, borderRadius: 10, border: `1.5px solid ${col.border}`, background: col.bg, color: col.text, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                    📖 Read all {count} →
                  </Link>
                  <Link href={`/practice/current-affairs/${slug}?month=${MONTH}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 11, borderRadius: 10, background: col.btn, color: "white", fontSize: 13, fontWeight: 700, textDecoration: "none", border: "none" }}>
                    🎯 Test Yourself
                  </Link>
                </div>
              </div>
            </details>
          );
        })}
      </div>

      {/* FULL CONTENT — PRINT ONLY */}
      <div className="pdf-only" style={{ padding: "24px 20px 0" }}>
        {CA_UNIT_ORDER.map((slug, idx) => {
          const label = CA_UNIT_LABELS[slug];
          const qs = fullQuestions[idx] ?? [];
          return (
            <div key={slug}>
              <h2 style={{ fontFamily: "serif", fontSize: 18, fontWeight: 700, color: T.text, margin: "20px 0 12px 0" }}>
                {label.icon} Unit {UNIT_NUMERALS[idx]} — {label.en}
              </h2>
              {qs.map((q, i) => <CAQuestionCard key={q.id} q={q} num={i + 1} lang="en" variant="hub" />)}
            </div>
          );
        })}
      </div>

      {/* INTERNAL LINKS */}
      <div className="no-print" style={{ padding: "24px 20px 0" }}>
        <h2 style={{ fontFamily: "serif", fontSize: 18, fontWeight: 700, color: T.text, margin: "0 0 14px 0" }}>Explore More</h2>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 24 }}>
          {[
            { href: "/current-affairs", icon: "📰", bg: T.greenBg, title: "Today's Current Affairs", sub: "Daily updated questions" },
            { href: "/subjects", icon: "📋", bg: "#FEF3C7", title: "Group 4 PYQ Practice", sub: "Previous Year Question Papers" },
            { href: "/tnpsc-study-materials/ai-tnpsc-group-4-pyq-analysis", icon: "📊", bg: T.redBg, title: "AI PYQ Analysis", sub: "Which topics actually repeat?" },
            { href: "/mock", icon: "📝", bg: "#F5F3FF", title: "Full Mock Test", sub: "200 questions · 3 hours · Free" },
            { href: "/tnpsc-study-materials/current-affairs/august-2026-tamil", icon: "🔤", bg: T.indigoLight, title: "தமிழில் படிக்க", sub: "Read August 2026 in Tamil" },
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

      {/* PDF */}
      <div className="no-print" style={{ margin: "0 20px 24px", background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 16, padding: 16, display: "flex", alignItems: "center", gap: 14, boxShadow: shadow.sm }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>📄</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>⬇️ Download August 2026 as PDF</div>
          <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>All {totalCount || "—"} questions with answers. Free with login.</div>
        </div>
        <PdfDownloadButton style={{ background: T.green, color: "white", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" as const, boxShadow: shadow.green }}>Download</PdfDownloadButton>
      </div>

      <div style={{ height: 100 }} />
    </>
  );
}
