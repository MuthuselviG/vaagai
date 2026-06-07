import { cookies } from "next/headers";
import Link from "next/link";
import { Metadata } from "next";
import { T, shadow } from "../../lib/tokens";
import HomeLangToggle from "../../components/HomeLangToggle";
import { fetchCAAvailableMonths } from "../../lib/supabase";

export const metadata: Metadata = {
  title: "TNPSC Study Materials 2026 | Free MCQ Practice",
  description:
    "TNPSC Group 4 study materials — current affairs, syllabus notes and more. Tamil & English. Free daily updates.",
  alternates: {
    canonical: "https://mcqpalagu.in/tnpsc-study-materials",
  },
};

const COPY = {
  en: {
    title: <>TNPSC <span style={{ color: T.indigo }}>Study</span> Materials</>,
    subtitle: "Current affairs, notes & more — Tamil & English.",
    caHeading: "Current Affairs",
    dailyUpdated: "Daily Updated",
    comingTitle: "PYQ Study Materials",
    comingDesc: "Year-wise previous year question analysis with topic breakdown and answer keys.",
    comingSoon: "Coming Soon",
  },
  ta: {
    title: <>TNPSC <span style={{ color: T.indigo }}>படிப்பகம்</span></>,
    subtitle: "நடப்பு நிகழ்வுகள், குறிப்புகள் மற்றும் பல — தமிழ் & ஆங்கிலம்.",
    caHeading: "நடப்பு நிகழ்வுகள்",
    dailyUpdated: "தினமும் புதுப்பிப்பு",
    comingTitle: "PYQ படிப்பகம்",
    comingDesc: "ஆண்டு வாரியான முந்தைய ஆண்டு வினா பகுப்பாய்வு, தலைப்பு பிரிப்பு மற்றும் விடை விசைகள்.",
    comingSoon: "விரைவில்",
  },
};

const UNIT_PILLS = [
  { en: "🔬 Science",    ta: "🔬 அறிவியல்",    bg: T.indigoLight, border: T.indigoMid,   color: T.indigo },
  { en: "🌍 Geography",  ta: "🌍 நிலவியல்",   bg: T.greenBg,     border: T.greenBorder, color: T.green },
  { en: "🏛️ History",   ta: "🏛️ வரலாறு",    bg: "#FEF3C7",     border: "#FCD34D",     color: "#B45309" },
  { en: "⚖️ Polity",    ta: "⚖️ அரசியல்",    bg: "#F5F3FF",     border: "#DDD6FE",     color: "#7C3AED" },
  { en: "💰 Welfare",   ta: "💰 நலத்திட்டம்", bg: T.redBg,       border: T.redBorder,   color: T.red },
  { en: "🏺 TN History", ta: "🏺 TN வரலாறு",  bg: "#E0F7FA",     border: "#A5D8E3",     color: "#0E7490" },
];

function formatMonthSlug(slug: string): string {
  const [name, year] = slug.split("-");
  return `${name.charAt(0).toUpperCase() + name.slice(1)} ${year}`;
}

export default async function StudyMaterialsPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("mcqpalagu_lang")?.value === "en" ? "en" : "ta") as "en" | "ta";
  const months = await fetchCAAvailableMonths().catch(() => [] as string[]);

  const c = COPY[lang];

  return (
    <>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "12px 16px 14px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
          <h1 style={{ fontFamily: "serif", fontSize: 24, fontWeight: 800, color: T.text, lineHeight: 1.15, letterSpacing: "-0.5px", margin: 0 }}>
            {c.title}
          </h1>
          <HomeLangToggle initialLang={lang} />
        </div>
        <p style={{ fontSize: 13, color: T.textSec, lineHeight: 1.45, margin: 0 }}>
          {c.subtitle}
        </p>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ fontFamily: "serif", fontSize: 18, fontWeight: 700, color: T.text, margin: 0 }}>{c.caHeading}</h2>
          <span style={{ fontSize: 11, fontWeight: 600, color: T.green, background: T.greenBg, border: `1px solid ${T.greenBorder}`, padding: "3px 10px", borderRadius: 20 }}>
            {c.dailyUpdated}
          </span>
        </div>

        {months.map((month) => {
          const label = formatMonthSlug(month);
          const enHref = `/tnpsc-study-materials/current-affairs/${month}`;
          const taHref = `/tnpsc-study-materials/current-affairs/${month}/tamil`;
          return (
            <div key={month} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", marginBottom: 12, boxShadow: shadow.sm }}>
              <div style={{ background: `linear-gradient(135deg, ${T.indigo} 0%, ${T.indigoDark} 100%)`, padding: "14px 16px 12px" }}>
                <span style={{ fontFamily: "serif", fontSize: 20, fontWeight: 800, color: "white", display: "block", marginBottom: 2 }}>{label}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                  {lang === "ta" ? "TNPSC நடப்பு நிகழ்வுகள்" : "TNPSC Current Affairs"}
                </span>
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" as const }}>
                  {["6 Units", "✅ Available"].map((s) => (
                    <span key={s} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "4px 8px", fontSize: 11, color: "white", fontWeight: 600 }}>{s}</span>
                  ))}
                </div>
              </div>
              <div style={{ padding: "12px 16px" }}>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 12 }}>
                  {UNIT_PILLS.map((p) => (
                    <span key={p.en} style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, border: `1.5px solid ${p.border}`, background: p.bg, color: p.color }}>
                      {lang === "ta" ? p.ta : p.en}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link href={enHref} style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    background: T.indigo, color: "white", borderRadius: 10, padding: 11,
                    fontSize: 13, fontWeight: 700, textDecoration: "none",
                  }}>
                    📖 Read {label}
                  </Link>
                  <Link href={taHref} style={{
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
          );
        })}
      </div>

      <div style={{ padding: "20px 16px 0" }}>
        <div style={{
          background: T.surface,
          border: `1.5px dashed ${T.border}`,
          borderRadius: 16, padding: "20px 16px",
          textAlign: "center" as const,
        }}>
          <span style={{ fontSize: 28, marginBottom: 8, display: "block" }}>📋</span>
          <div style={{ fontFamily: "serif", fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>{c.comingTitle}</div>
          <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.5 }}>{c.comingDesc}</div>
          <span style={{
            display: "inline-block", background: T.bg,
            border: `1px solid ${T.border}`, color: T.textTer,
            fontSize: 11, fontWeight: 600, padding: "4px 12px",
            borderRadius: 20, marginTop: 10,
            textTransform: "uppercase" as const, letterSpacing: "0.4px",
          }}>
            {c.comingSoon}
          </span>
        </div>
      </div>

      <div style={{ height: 100 }} />
    </>
  );
}
