// PASTE TO: app/tnpsc-study-materials/page.tsx

import { Metadata } from "next";
import Link from "next/link";
import { T, shadow } from "../../lib/tokens";

export const metadata: Metadata = {
  title: "TNPSC Study Materials 2026 | Free MCQ Practice",
  description:
    "TNPSC Group 4 study materials — current affairs, syllabus notes and more. Tamil & English. Free daily updates.",
  alternates: {
    canonical: "https://mcqpalagu.in/tnpsc-study-materials",
  },
};

const UNIT_PILLS = [
  { label: "🔬 Science",    bg: T.indigoLight, border: T.indigoMid,    color: T.indigo },
  { label: "🌍 Geography",  bg: T.greenBg,     border: T.greenBorder,  color: T.green },
  { label: "🏛️ History",   bg: "#FEF3C7",     border: "#FCD34D",      color: "#B45309" },
  { label: "⚖️ Polity",    bg: "#F5F3FF",     border: "#DDD6FE",      color: "#7C3AED" },
  { label: "💰 Welfare",   bg: T.redBg,       border: T.redBorder,    color: T.red },
  { label: "🏺 TN History", bg: "#E0F7FA",    border: "#A5D8E3",      color: "#0E7490" },
];

export default function StudyMaterialsPage() {
  return (
    <>
      {/* HERO */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "24px 20px 20px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: T.greenBg, border: `1px solid ${T.greenBorder}`,
          color: T.green, fontSize: 11, fontWeight: 600,
          padding: "4px 12px", borderRadius: 20, marginBottom: 14,
          textTransform: "uppercase" as const, letterSpacing: "0.4px",
        }}>
          படிப்பகம்
        </div>
        <h1 style={{ fontFamily: "serif", fontSize: 28, fontWeight: 800, color: T.text, lineHeight: 1.2, letterSpacing: "-0.5px", marginBottom: 8 }}>
          TNPSC <span style={{ color: T.indigo }}>Study</span> Materials
        </h1>
        <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.5 }}>
          Current affairs, notes &amp; more — Tamil &amp; English.
        </p>
      </div>

      {/* CURRENT AFFAIRS SECTION */}
      <div style={{ padding: "24px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "serif", fontSize: 20, fontWeight: 700, color: T.text }}>Current Affairs</h2>
          <span style={{ fontSize: 11, fontWeight: 600, color: T.green, background: T.greenBg, border: `1px solid ${T.greenBorder}`, padding: "3px 10px", borderRadius: 20 }}>
            Daily Updated
          </span>
        </div>

        {/* MAY 2026 CARD */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", marginBottom: 12, boxShadow: shadow.sm }}>
          <div style={{ background: `linear-gradient(135deg, ${T.indigo} 0%, ${T.indigoDark} 100%)`, padding: "16px 18px 14px" }}>
            <span style={{ fontFamily: "serif", fontSize: 22, fontWeight: 800, color: "white", display: "block", marginBottom: 4 }}>May 2026</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>TNPSC Current Affairs</span>
            <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
              {["248 Questions", "6 Units", "✅ Complete"].map((s) => (
                <span key={s} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "5px 10px", fontSize: 12, color: "white", fontWeight: 600 }}>{s}</span>
              ))}
            </div>
          </div>
          <div style={{ padding: "14px 18px" }}>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 14 }}>
              {UNIT_PILLS.map((p) => (
                <span key={p.label} style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, border: `1.5px solid ${p.border}`, background: p.bg, color: p.color }}>
                  {p.label}
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href="/tnpsc-study-materials/current-affairs/may-2026" style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                background: T.indigo, color: "white", borderRadius: 10, padding: 11,
                fontSize: 13, fontWeight: 700, textDecoration: "none",
              }}>
                📖 Read in English
              </Link>
              <Link href="/tnpsc-study-materials/current-affairs/may-2026-tamil" style={{
                background: T.indigoLight, color: T.indigo,
                border: `1px solid ${T.indigoMid}`,
                borderRadius: 10, padding: "11px 14px",
                fontSize: 13, fontWeight: 600,
                textDecoration: "none", whiteSpace: "nowrap" as const,
              }}>
                தமிழ்
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* COMING SOON */}
      <div style={{ padding: "28px 20px 0" }}>
        <div style={{
          background: T.surface,
          border: `1.5px dashed ${T.border}`,
          borderRadius: 16, padding: "24px 20px",
          textAlign: "center" as const,
        }}>
          <span style={{ fontSize: 32, marginBottom: 10, display: "block" }}>📋</span>
          <div style={{ fontFamily: "serif", fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 6 }}>PYQ Study Materials</div>
          <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.5 }}>Year-wise previous year question analysis with topic breakdown and answer keys.</div>
          <span style={{
            display: "inline-block", background: T.bg,
            border: `1px solid ${T.border}`, color: T.textTer,
            fontSize: 11, fontWeight: 600, padding: "4px 12px",
            borderRadius: 20, marginTop: 10,
            textTransform: "uppercase" as const, letterSpacing: "0.4px",
          }}>
            Coming Soon
          </span>
        </div>
      </div>

      <div style={{ height: 100 }} />
    </>
  );
}
