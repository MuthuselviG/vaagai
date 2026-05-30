// PASTE TO: app/tnpsc-study-materials/current-affairs/may-2026-tamil/page.tsx

import { Metadata } from "next";
import Link from "next/link";
import {
  fetchCAMonthlyUnitCounts,
  fetchCAMonthlyPreview,
  CA_UNIT_ORDER,
  CA_UNIT_LABELS,
  CA_UNIT_SUBJECTS,
  CAQuestion,
} from "../../../../lib/supabase";
import { T, shadow } from "../../../../lib/tokens";

export const revalidate = 86400;

const MONTH = "2026-05";

export const metadata: Metadata = {
  title: "TNPSC Group 4 Current Affairs May 2026 in Tamil | Free Test",
  description: "TNPSC குரூப் 4 மற்றும் குரூப் 2 தேர்வுகளுக்கான மே 2026 நடப்பு நிகழ்வுகள் வினாக்கள். சமச்சீர் பாடத்திட்ட விளக்கங்களுடன் இலவச ஆன்லைன் பயிற்சி.",
  alternates: {
    canonical: "https://mcqpalagu.in/tnpsc-study-materials/current-affairs/may-2026-tamil",
    languages: { en: "https://mcqpalagu.in/tnpsc-study-materials/current-affairs/may-2026" },
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
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textTer, textTransform: "uppercase" as const, letterSpacing: "0.5px", marginBottom: 8 }}>வினா {num}</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: T.text, lineHeight: 1.6, marginBottom: 12 }}>{q.question}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
        {q.options.map((opt, i) => (
          <div key={i} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, color: T.textSec, display: "flex", alignItems: "flex-start", gap: 7, lineHeight: 1.4 }}>
            <span style={{ width: 20, height: 20, borderRadius: "50%", background: T.indigoLight, color: T.indigo, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{["அ","ஆ","இ","ஈ"][i]}</span>
            {opt}
          </div>
        ))}
      </div>
      <div style={{ background: T.greenBg, border: `1px solid ${T.greenBorder}`, borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase" as const, letterSpacing: "0.4px", marginBottom: 3 }}>✅ சரியான விடை</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.green }}>{q.correct_option}</div>
      </div>
      {q.explanation && (
        <div style={{ background: T.indigoLight, border: `1px solid ${T.indigoMid}`, borderRadius: 10, padding: "10px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.indigo, textTransform: "uppercase" as const, letterSpacing: "0.4px", marginBottom: 3 }}>📖 விளக்கம்</div>
          <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.6 }}>{q.explanation}</div>
        </div>
      )}
    </div>
  );
}

export default async function CAMonthlyTamilPage() {
  const [taCounts, ...previews] = await Promise.all([
    fetchCAMonthlyUnitCounts(MONTH, "ta"),
    ...CA_UNIT_ORDER.map((slug) => fetchCAMonthlyPreview(MONTH, slug, "ta")),
  ]);

  const totalCount = taCounts.reduce((sum, c) => sum + c.count, 0);
  const circumference = 2 * Math.PI * 50;
  const donutData = CA_UNIT_ORDER.map((slug, i) => ({
    slug, count: getCountForUnit(slug, taCounts),
    color: Object.values(UNIT_COLORS)[i].btn,
    label: CA_UNIT_LABELS[slug].ta,
  }));
  const donutTotal = donutData.reduce((s, d) => s + d.count, 0) || 1;
  let offset = 0;
  const segments = donutData.map((d) => {
    const dash = (d.count / donutTotal) * circumference;
    const seg = { ...d, dash, offset };
    offset += dash;
    return seg;
  });

  return (
    <>
      <nav style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "0 16px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: shadow.sm }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/tnpsc-study-materials" style={{ width: 34, height: 34, borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: T.text }}>←</Link>
          <span style={{ fontFamily: "serif", fontSize: 18, fontWeight: 800, color: T.indigo }}>mcqpalagu</span>
        </div>
        <Link href="/tnpsc-study-materials/current-affairs/may-2026" style={{ background: T.greenBg, color: T.green, border: `1px solid ${T.greenBorder}`, borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" as const }}>
          Read in English →
        </Link>
      </nav>

      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "24px 20px 20px" }}>
        <div style={{ fontSize: 12, color: T.textTer, marginBottom: 12, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" as const }}>
          <Link href="/tnpsc-study-materials" style={{ color: T.indigo, textDecoration: "none", fontWeight: 500 }}>படிப்பகம்</Link>
          <span>›</span>
          <Link href="/tnpsc-study-materials/current-affairs" style={{ color: T.indigo, textDecoration: "none", fontWeight: 500 }}>நடப்பு நிகழ்வுகள்</Link>
          <span>›</span>
          <span>மே 2026</span>
        </div>
        <h1 style={{ fontFamily: "serif", fontSize: 24, fontWeight: 800, color: T.text, lineHeight: 1.25, letterSpacing: "-0.3px", marginBottom: 10 }}>
          TNPSC Current Affairs May 2026 MCQ in Tamil <span style={{ color: T.indigo }}>(மே நடப்பு நிகழ்வுகள்)</span>
        </h1>
        <div style={{ display: "flex", gap: 10, fontSize: 13, color: T.textSec, marginBottom: 20, flexWrap: "wrap" as const }}>
          <span>📅 மே 1–31, 2026</span><span>✅ தினமும் புதுப்பிக்கப்படும்</span><span>🎯 குரூப் 4 &amp; குரூப் 2</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {[{ num: totalCount || "—", label: "வினாக்கள்" }, { num: 6, label: "அலகுகள்" }, { num: 31, label: "நாட்கள்" }].map((s) => (
            <div key={s.label} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 10px", textAlign: "center" as const }}>
              <span style={{ fontFamily: "serif", fontSize: 24, fontWeight: 700, color: T.indigo, display: "block" }}>{s.num}</span>
              <span style={{ fontSize: 12, color: T.textSec, marginTop: 2, fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "24px 20px" }}>
        <div style={{ fontFamily: "serif", fontSize: 18, fontWeight: 700, marginBottom: 20, color: T.text }}>அலகு வாரியான பகிர்வு</div>
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
              <span style={{ fontSize: 11, color: T.textSec, fontWeight: 500 }}>வினாக்கள்</span>
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

      <div style={{ padding: "24px 20px 0" }}>
        <div style={{ fontFamily: "serif", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>அலகு வாரியாக படிக்கவும்</div>
        <div style={{ fontSize: 14, color: T.textSec, marginBottom: 16 }}>வினாக்கள், விடைகள் மற்றும் விளக்கங்களை படிக்க ஒரு அலகை தேர்ந்தெடுக்கவும்</div>

        {CA_UNIT_ORDER.map((slug, idx) => {
          const col = UNIT_COLORS[slug];
          const label = CA_UNIT_LABELS[slug];
          const count = getCountForUnit(slug, taCounts);
          const qs: CAQuestion[] = previews[idx] ?? [];
          return (
            <details key={slug} style={{ background: col.bg, border: `1.5px solid ${col.border}`, borderRadius: 16, marginBottom: 14, overflow: "hidden", boxShadow: shadow.sm }}>
              <summary style={{ padding: 16, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", listStyle: "none" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: col.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{label.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>அலகு {UNIT_NUMERALS[idx]} — {label.ta}</div>
                  <div style={{ fontSize: 13, color: T.textSec, marginTop: 2 }}>{count} வினாக்கள்</div>
                </div>
                <div style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${col.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: col.text, fontSize: 14 }}>›</div>
              </summary>
              <div style={{ padding: "0 16px 16px" }}>
                {qs.length === 0
                  ? <p style={{ fontSize: 13, color: T.textSec, padding: "12px 0" }}>வினாக்கள் சேர்க்கப்படுகின்றன — சீக்கிரம் திரும்பி வாருங்கள்.</p>
                  : qs.map((q, i) => <QCard key={q.id} q={q} num={i + 1} />)
                }
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <Link href={`/tnpsc-study-materials/current-affairs/may-2026-tamil/${slug}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 11, borderRadius: 10, border: `1.5px solid ${col.border}`, background: col.bg, color: col.text, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                    📖 {count} வினாக்களை படிக்கவும் →
                  </Link>
                  <Link href={`/practice/current-affairs/${slug}?month=may-2026&lang=ta`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 11, borderRadius: 10, background: col.btn, color: "white", fontSize: 13, fontWeight: 700, textDecoration: "none", border: "none" }}>
                    🎯 தேர்வு எழுது
                  </Link>
                </div>
              </div>
            </details>
          );
        })}
      </div>

      <div style={{ padding: "24px 20px 0" }}>
        <div style={{ fontFamily: "serif", fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 14 }}>மேலும் படிக்கவும்</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 24 }}>
          {[
            { href: "/current-affairs", icon: "📰", bg: T.greenBg, title: "இன்றைய நடப்பு நிகழ்வுகள்", sub: "தினமும் புதுப்பிக்கப்படும் வினாக்கள்" },
            { href: "/pyq/group4", icon: "📋", bg: "#FEF3C7", title: "குரூப் 4 PYQ பயிற்சி", sub: "முந்தைய ஆண்டு வினாத்தாள்கள்" },
            { href: "/tnpsc-study-materials/syllabus/group-4", icon: "📚", bg: T.indigoLight, title: "TNPSC குரூப் 4 பாடத்திட்டம்", sub: "அலகு வாரியான பாடத்திட்ட விவரம்" },
            { href: "/tnpsc-study-materials/current-affairs/may-2026", icon: "🔤", bg: "#F5F3FF", title: "Read in English →", sub: "May 2026 in English" },
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

      <div style={{ margin: "0 20px 24px", background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 16, padding: 16, display: "flex", alignItems: "center", gap: 14, boxShadow: shadow.sm }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>📄</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>⬇️ மே 2026 PDF பதிவிறக்கம்</div>
          <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>{totalCount || "—"} வினாக்கள் விடைகளுடன். உள்நுழைவுடன் இலவசம்.</div>
        </div>
        <Link href="/login?redirect=/tnpsc-study-materials/current-affairs/may-2026-tamil?download=pdf" style={{ background: T.indigoLight, color: T.indigo, border: `1px solid ${T.indigoMid}`, borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" as const }}>பதிவிறக்கம்</Link>
      </div>

      <div style={{ height: 100 }} />
    </>
  );
}
