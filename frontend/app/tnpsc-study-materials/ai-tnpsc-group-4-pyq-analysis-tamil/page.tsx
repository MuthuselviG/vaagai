import { Metadata } from "next";
import Link from "next/link";
import { T, shadow, fontSize } from "../../../lib/tokens";
import PyqAnalysisClient from "../ai-tnpsc-group-4-pyq-analysis/PyqAnalysisClient";
import { PAPER_COUNT } from "../ai-tnpsc-group-4-pyq-analysis/data";
import { UNITS_TA, RISING_TA, FAQS_TA } from "../ai-tnpsc-group-4-pyq-analysis/data.ta";
import { TA_LABELS } from "../ai-tnpsc-group-4-pyq-analysis/labels";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "TNPSC குரூப் 4 வினாத்தாள் பகுப்பாய்வு 2012–2025 (2026 பாடத்திட்டம்) | MCQ பழகு",
  description:
    "2012–2025 TNPSC குரூப் 4 பொது அறிவு தாள்களை பகுப்பாய்வு செய்தோம் — தலைப்பு வாரியான வினா அடர்த்தி, 2026 பாடத்திட்டத்துடன் ஒப்பிடப்பட்டது, புதிய & உயரும் தலைப்புகளுடன்.",
  alternates: {
    canonical: "https://mcqpalagu.in/tnpsc-study-materials/ai-tnpsc-group-4-pyq-analysis-tamil",
    languages: {
      en: "https://mcqpalagu.in/tnpsc-study-materials/ai-tnpsc-group-4-pyq-analysis",
    },
  },
};

export default function PyqAnalysisTamilPage() {
  console.log(`[pyq-analysis] rendering TA page — ${UNITS_TA.length} units, ${UNITS_TA.reduce((s, u) => s + u.topics.length, 0)} topics`);

  const labels = TA_LABELS;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS_TA.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <PyqAnalysisClient lang="ta" units={UNITS_TA} rising={RISING_TA} />

      <div style={{ maxWidth: 460, margin: "0 auto", padding: "0 16px 60px", background: T.bg }}>
        {/* Table of contents */}
        <nav aria-label="இந்தப் பக்கத்தில்" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, marginBottom: 30, boxShadow: shadow.sm }}>
          <div style={{ fontSize: fontSize.caption, fontWeight: 800, color: T.textTer, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 10 }}>
            {labels.tocHeading}
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
            {UNITS_TA.map((u) => (
              <li key={u.key}>
                <a href={`#${u.key}`} style={{ color: T.indigo, fontSize: fontSize.body, fontWeight: 600, textDecoration: "none" }}>
                  {u.name} {labels.tocMarks(u.marks)}
                </a>
              </li>
            ))}
            <li>
              <a href="#faq" style={{ color: T.indigo, fontSize: fontSize.body, fontWeight: 600, textDecoration: "none" }}>
                {labels.faqHeading}
              </a>
            </li>
          </ul>
        </nav>

        {/* Detailed topic-wise breakdown — server-rendered prose, for search & AI crawlers */}
        <h2 style={{ fontSize: fontSize.heading, fontWeight: 800, marginBottom: 4 }}>{labels.breakdownHeading}</h2>
        <p style={{ fontSize: fontSize.body, color: T.textSec, lineHeight: 1.6, margin: "0 0 18px" }}>
          {labels.breakdownSub}
        </p>

        {UNITS_TA.map((u) => (
          <section key={u.key} id={u.key} style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: fontSize.label, fontWeight: 800, color: T.text, marginBottom: 4 }}>
              {u.name} <span style={{ color: T.textSec, fontWeight: 600, fontSize: fontSize.body }}>{labels.marksSuffix(u.marks)}</span>
            </h3>
            <p style={{ fontSize: fontSize.body, color: T.textSec, lineHeight: 1.7, marginBottom: 12 }}>{u.intro}</p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {u.topics.map((t, i) => (
                <li key={i} style={{ borderBottom: `1px solid ${T.border}`, padding: "8px 0" }}>
                  <div style={{ fontSize: fontSize.bodyLg, color: T.text, fontWeight: 600, lineHeight: 1.4 }}>
                    {t.label}
                    {t.rising && (
                      <span style={{ fontSize: fontSize.caption, background: "#FEF3C7", color: "#B45309", padding: "2px 8px", borderRadius: 6, fontWeight: 700, marginLeft: 6 }}>
                        {labels.risingBadge}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: fontSize.caption, color: T.textSec, marginTop: 2 }}>{labels.breakdownStat(t.n, t.papers, PAPER_COUNT)}</div>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {/* FAQ */}
        <section id="faq" style={{ marginBottom: 10 }}>
          <h2 style={{ fontSize: fontSize.heading, fontWeight: 800, marginBottom: 12 }}>{labels.faqHeading}</h2>
          {FAQS_TA.map((f, i) => (
            <div key={i} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: shadow.sm }}>
              <div style={{ fontSize: fontSize.bodyLg, fontWeight: 700, color: T.text, marginBottom: 6 }}>{f.q}</div>
              <p style={{ fontSize: fontSize.body, color: T.textSec, lineHeight: 1.6, margin: 0 }}>{f.a}</p>
            </div>
          ))}
        </section>

        <p style={{ fontSize: fontSize.caption, color: T.textTer, lineHeight: 1.6, marginTop: 20 }}>
          {labels.footerCaText}
          <Link href="/tnpsc-study-materials/current-affairs" style={{ color: T.indigo, fontWeight: 600 }}>
            {labels.footerCaLink}
          </Link>
        </p>
      </div>
    </>
  );
}
