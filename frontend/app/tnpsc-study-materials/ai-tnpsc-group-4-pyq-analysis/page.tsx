import { Metadata } from "next";
import Link from "next/link";
import { T, shadow } from "../../../lib/tokens";
import PyqAnalysisClient from "./PyqAnalysisClient";
import { UNITS, RISING, FAQS, PAPER_COUNT } from "./data";
import { EN_LABELS } from "./labels";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "TNPSC Group 4 PYQ Analysis 2012–2025 (2026 Syllabus) | MCQ பழகு",
  description:
    "We analyzed 9 TNPSC Group 4 GS papers (2012–2025) — topic-wise question frequency mapped to the latest 2026 syllabus, with new and rising topics highlighted.",
  alternates: {
    canonical: "https://mcqpalagu.in/tnpsc-study-materials/ai-tnpsc-group-4-pyq-analysis",
    languages: {
      ta: "https://mcqpalagu.in/tnpsc-study-materials/ai-tnpsc-group-4-pyq-analysis-tamil",
    },
  },
};

export default function PyqAnalysisPage() {
  console.log(`[pyq-analysis] rendering EN page — ${UNITS.length} units, ${UNITS.reduce((s, u) => s + u.topics.length, 0)} topics`);

  const labels = EN_LABELS;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <PyqAnalysisClient lang="en" units={UNITS} rising={RISING} labels={labels} />

      <div style={{ maxWidth: 460, margin: "0 auto", padding: "0 16px 60px", background: T.bg }}>
        {/* Table of contents */}
        <nav aria-label="Table of contents" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, marginBottom: 30, boxShadow: shadow.sm }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.textTer, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 10 }}>
            {labels.tocHeading}
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
            {UNITS.map((u) => (
              <li key={u.key}>
                <a href={`#${u.key}`} style={{ color: T.indigo, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                  {u.name} {labels.tocMarks(u.marks)}
                </a>
              </li>
            ))}
            <li>
              <a href="#faq" style={{ color: T.indigo, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                {labels.faqHeading}
              </a>
            </li>
          </ul>
        </nav>

        {/* Detailed topic-wise breakdown — server-rendered prose, for search & AI crawlers */}
        <h2 style={{ fontSize: 19, fontWeight: 800, marginBottom: 4 }}>{labels.breakdownHeading}</h2>
        <p style={{ fontSize: 13.5, color: T.textSec, margin: "0 0 18px" }}>
          {labels.breakdownSub}
        </p>

        {UNITS.map((u) => (
          <section key={u.key} id={u.key} style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: T.text, marginBottom: 4 }}>
              {u.name} <span style={{ color: T.textSec, fontWeight: 600, fontSize: 14 }}>{labels.marksSuffix(u.marks)}</span>
            </h3>
            <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6, marginBottom: 10 }}>{u.intro}</p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
              {u.topics.map((t, i) => (
                <li key={i} style={{ fontSize: 13.5, color: T.text, display: "flex", justifyContent: "space-between", gap: 8, borderBottom: `1px solid ${T.border}`, padding: "6px 0" }}>
                  <span>
                    {t.label}
                    {t.rising && (
                      <span style={{ fontSize: 10, background: "#FEF3C7", color: "#B45309", padding: "1px 6px", borderRadius: 6, fontWeight: 700, marginLeft: 6 }}>
                        {labels.risingBadge}
                      </span>
                    )}
                  </span>
                  <span style={{ color: T.textSec, whiteSpace: "nowrap" }}>{labels.breakdownStat(t.n, t.papers, PAPER_COUNT)}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {/* FAQ */}
        <section id="faq" style={{ marginBottom: 10 }}>
          <h2 style={{ fontSize: 19, fontWeight: 800, marginBottom: 12 }}>{labels.faqHeading}</h2>
          {FAQS.map((f, i) => (
            <div key={i} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: shadow.sm }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 6 }}>{f.q}</div>
              <p style={{ fontSize: 13.5, color: T.textSec, lineHeight: 1.6, margin: 0 }}>{f.a}</p>
            </div>
          ))}
        </section>

        <p style={{ fontSize: 12.5, color: T.textTer, lineHeight: 1.6, marginTop: 20 }}>
          {labels.footerCaText}
          <Link href="/tnpsc-study-materials/current-affairs" style={{ color: T.indigo, fontWeight: 600 }}>
            {labels.footerCaLink}
          </Link>
        </p>
      </div>
    </>
  );
}
