"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { T, shadow } from "@/lib/tokens";

const PYQ_YEARS = [
  { year: 2025, bg: "#EEF1FA", border: "#C5CEF0", color: "#3D52A0" },
  { year: 2024, bg: "#E8F8F0", border: "#A8DBBE", color: "#057A55" },
  { year: 2022, bg: "#FFF5EE", border: "#FFD8B8", color: "#C2410C" },
  { year: 2019, bg: "#FEFCE8", border: "#FDE68A", color: "#A16207" },
  { year: 2018, bg: "#EFF6FF", border: "#93C5FD", color: "#1D4ED8" },
  { year: 2016, bg: "#FDECEC", border: "#F5BFBB", color: "#C0392B" },
  { year: 2014, bg: "#E8F8F0", border: "#A8DBBE", color: "#057A55" },
  { year: 2013, bg: "#F5F3FF", border: "#C4B5FD", color: "#6D28D9" },
  { year: 2012, bg: "#F7F8FC", border: "#E4E7F0", color: "#6B7280" },
];

export default function MockLandingPage() {
  const router = useRouter();

  return (
    <div style={{ background: T.bg, fontFamily: "system-ui, sans-serif", minHeight: "100dvh" }}>
      {/* Top bar */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, boxShadow: shadow.sm, flexShrink: 0 }}>
        <button onClick={() => router.back()} style={iconBtnStyle}>‹</button>
        <div>
          <h1 style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: 0 }}>Mock Tests</h1>
          <div style={{ fontSize: 11, color: T.textSec }}>TNPSC Group 4 · 200 questions · 3 hours</div>
        </div>
      </div>

      <div style={{ padding: "16px 16px 100px", display: "flex", flexDirection: "column", gap: 14, maxWidth: 600, margin: "0 auto" }}>

        {/* PYQ Year-wise */}
        <div style={{ background: T.surface, border: `1.5px solid ${T.indigoMid}`, borderRadius: 20, overflow: "hidden", boxShadow: shadow.sm }}>
          <div style={{ background: T.indigoLight, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: T.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📋</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.indigo }}>PYQ Year-wise</div>
              <div style={{ fontSize: 11, color: T.textSec }}>Attempt actual past papers in exam format</div>
            </div>
          </div>
          <div style={{ padding: "12px 16px 16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {PYQ_YEARS.map(({ year, bg, border, color }) => (
                <button
                  key={year}
                  onClick={() => router.push(`/mock/${year}`)}
                  style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 14, padding: "16px 8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.1s" }}
                  onTouchStart={e => (e.currentTarget.style.transform = "scale(0.95)")}
                  onTouchEnd={e => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <span style={{ fontSize: 18, fontWeight: 900, color, letterSpacing: -0.5 }}>{year}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PYQ Analysis CTA */}
        <Link
          href="/tnpsc-study-materials/ai-tnpsc-group-4-pyq-analysis"
          style={{ background: T.surface, border: `1.5px solid ${T.indigoMid}`, borderRadius: 20, padding: 16, display: "flex", alignItems: "center", gap: 12, textDecoration: "none", boxShadow: shadow.sm }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 13, background: T.indigoLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>📊</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>Which topics actually repeat?</div>
            <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>AI-analyzed PYQ patterns · 9 papers · 2012–2025</div>
          </div>
          <div style={{ background: T.indigo, color: "#fff", borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>View →</div>
        </Link>

        {/* AI Predicted — coming soon */}
        <div style={{ background: T.surface, border: `1.5px dashed ${T.border}`, borderRadius: 20, padding: 16, display: "flex", alignItems: "center", gap: 12, opacity: 0.6 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: T.bg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>✨</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>AI Predicted Paper</div>
            <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>Generated from 9 years of PYQ patterns</div>
            <div style={{ background: "#FFF3E0", border: "1px solid #FFD180", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 800, color: "#E65100", display: "inline-block", marginTop: 6 }}>Coming soon</div>
          </div>
        </div>

      </div>
    </div>
  );
}

const iconBtnStyle: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 10, border: `1px solid ${T.border}`,
  background: T.surface, display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", fontSize: 18, color: T.text, flexShrink: 0,
};
