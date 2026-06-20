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
    pyqEyebrow: "AI PYQ Analysis",
    pyqTitle: "TNPSC Group 4: which topics actually repeat?",
    pyqDesc: "9 papers (2012–2025) analyzed — topic-wise question frequency mapped to the 2026 syllabus, with new & rising topics.",
    pyqCta: "View analysis →",
    tvkHeading: "Teacher Shortcuts & Practice Sets",
    tvkTitle: "TVK Maths Test 01",
    tvkDesc: "50 solved questions by Er. Thangamuthu — number system, surds, simplification & figure counting.",
    tvkCta: "View & Practice →",
    historyTitle: "Class 6 History (Samacheer Kalvi) — Term 1",
    historyDesc: "166 Tamil Q&A by Rohit Kalai, in textbook order — quick revision for TNPSC Group 4.",
    historyCta: "Read Q&A →",
    gkTitle: "Daily GK Thoughts — June 2026",
    gkDesc: "Tamil GK Q&A by Daily GK Thoughts — important days, facts & more, with practice mode.",
    gkCta: "Read & Practice →",
  },
  ta: {
    title: <>TNPSC <span style={{ color: T.indigo }}>படிப்பகம்</span></>,
    subtitle: "நடப்பு நிகழ்வுகள், குறிப்புகள் மற்றும் பல — தமிழ் & ஆங்கிலம்.",
    caHeading: "நடப்பு நிகழ்வுகள்",
    dailyUpdated: "தினமும் புதுப்பிப்பு",
    pyqEyebrow: "AI வினாத்தாள் பகுப்பாய்வு",
    pyqTitle: "TNPSC குரூப் 4: எந்த தலைப்புகள் மீண்டும் மீண்டும் வரும்?",
    pyqDesc: "9 தாள்கள் (2012–2025) பகுப்பாய்வு — தலைப்பு வாரியான வினா அடர்த்தி, 2026 பாடத்திட்டத்துடன் ஒப்பிடப்பட்டது, புதிய & உயரும் தலைப்புகளுடன்.",
    pyqCta: "பகுப்பாய்வைப் பார்க்க →",
    tvkHeading: "ஆசிரியர் ஷார்ட்கட் & பயிற்சி தொகுப்புகள்",
    tvkTitle: "TVK Maths Test 01",
    tvkDesc: "Er. தங்கமுத்து வழங்கும் 50 தீர்வு கேள்விகள் — எண் அமைப்பு, வர்க்கமூலங்கள், எளிமையாக்கல் & உருவ எண்ணிக்கை.",
    tvkCta: "பார்க்க & பயிற்சி →",
    historyTitle: "6ஆம் வகுப்பு வரலாறு (சமச்சீர் கல்வி) — Term 1",
    historyDesc: "கலையரசன் ரா வழங்கும் 166 தமிழ் வினா-விடைகள், பாடப்புத்தக வரிசையில் — TNPSC குரூப் 4க்கு விரைவு திருப்பிப் படிப்பு.",
    historyCta: "வினா-விடை படிக்க →",
    gkTitle: "Daily GK Thoughts — ஜூன் 2026",
    gkDesc: "Daily GK Thoughts வழங்கும் தமிழ் பொது அறிவு வினா-விடைகள் — முக்கிய தினங்கள், தகவல்கள் மற்றும் பயிற்சி முறையுடன்.",
    gkCta: "படிக்க & பயிற்சி →",
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

const MONTH_NAMES_EN: Record<string, string> = {
  january: "January", february: "February", march: "March",
  april: "April", may: "May", june: "June",
  july: "July", august: "August", september: "September",
  october: "October", november: "November", december: "December",
};

const MONTH_NAMES_TA: Record<string, string> = {
  january: "ஜனவரி", february: "பிப்ரவரி", march: "மார்ச்",
  april: "ஏப்ரல்", may: "மே", june: "ஜூன்",
  july: "ஜூலை", august: "ஆகஸ்ட்", september: "செப்டம்பர்",
  october: "அக்டோபர்", november: "நவம்பர்", december: "டிசம்பர்",
};

function formatMonthSlug(slug: string, lang: "en" | "ta"): string {
  const [name, year] = slug.split("-");
  const names = lang === "ta" ? MONTH_NAMES_TA : MONTH_NAMES_EN;
  return `${names[name] ?? name} ${year}`;
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
          const label = formatMonthSlug(month, lang);
          const enHref = `/tnpsc-study-materials/current-affairs/${month}`;
          const taHref = `/tnpsc-study-materials/current-affairs/${month}-tamil`;
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
                  <Link href={lang === "ta" ? taHref : enHref} style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    background: T.indigo, color: "white", borderRadius: 10, padding: 11,
                    fontSize: 13, fontWeight: 700, textDecoration: "none",
                  }}>
                    {lang === "ta" ? `📖 ${label} படிக்க` : `📖 Read ${label}`}
                  </Link>
                  <Link href={lang === "ta" ? enHref : taHref} style={{
                    background: T.indigoLight, color: T.indigo,
                    border: `1px solid ${T.indigoMid}`,
                    borderRadius: 10, padding: "11px 14px",
                    fontSize: 13, fontWeight: 600,
                    textDecoration: "none", whiteSpace: "nowrap" as const,
                  }}>
                    {lang === "ta" ? "English" : "தமிழ்"}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: "20px 16px 0" }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", boxShadow: shadow.sm }}>
          <div style={{ background: `linear-gradient(135deg, ${T.indigo} 0%, ${T.indigoDark} 100%)`, padding: "14px 16px 12px" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: "rgba(255,255,255,0.75)", textTransform: "uppercase" as const, display: "block", marginBottom: 2 }}>
              {c.pyqEyebrow}
            </span>
            <span style={{ fontFamily: "serif", fontSize: 20, fontWeight: 800, color: "white", display: "block", marginBottom: 2 }}>{c.pyqTitle}</span>
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" as const }}>
              {["9 Papers", "2012–2025"].map((s) => (
                <span key={s} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "4px 8px", fontSize: 11, color: "white", fontWeight: 600 }}>{s}</span>
              ))}
            </div>
          </div>
          <div style={{ padding: "12px 16px" }}>
            <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.5, marginBottom: 12 }}>{c.pyqDesc}</div>
            <Link
              href={lang === "ta" ? "/tnpsc-study-materials/ai-tnpsc-group-4-pyq-analysis-tamil" : "/tnpsc-study-materials/ai-tnpsc-group-4-pyq-analysis"}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                background: T.indigo, color: "white", borderRadius: 10, padding: 11,
                fontSize: 13, fontWeight: 700, textDecoration: "none",
              }}
            >
              {c.pyqCta}
            </Link>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 16px 0" }}>
        <h2 style={{ fontFamily: "serif", fontSize: 18, fontWeight: 700, color: T.text, margin: "0 0 12px 0" }}>{c.tvkHeading}</h2>
        <Link href="/tnpsc-study-materials/er-thangamuthu/tvk-maths/test-01" style={{
          display: "block", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16,
          padding: "14px 16px", textDecoration: "none", marginBottom: 4, boxShadow: shadow.sm,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontFamily: "serif", fontSize: 15, fontWeight: 700, color: T.text }}>{c.tvkTitle}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.indigo, background: T.indigoLight, border: `1px solid ${T.indigoMid}`, padding: "3px 10px", borderRadius: 20 }}>50 Qs</span>
          </div>
          <p style={{ fontSize: 13, color: T.textSec, margin: "0 0 8px", lineHeight: 1.45 }}>{c.tvkDesc}</p>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.indigo }}>{c.tvkCta}</span>
        </Link>

        <Link href="/tnpsc-study-materials/rohit-kalai/class-6-history-samacheer-kalvi/term-1" style={{
          display: "block", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16,
          padding: "14px 16px", textDecoration: "none", marginBottom: 4, boxShadow: shadow.sm,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontFamily: "serif", fontSize: 15, fontWeight: 700, color: T.text }}>{c.historyTitle}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.indigo, background: T.indigoLight, border: `1px solid ${T.indigoMid}`, padding: "3px 10px", borderRadius: 20 }}>166 Q&A</span>
          </div>
          <p style={{ fontSize: 13, color: T.textSec, margin: "0 0 8px", lineHeight: 1.45 }}>{c.historyDesc}</p>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.indigo }}>{c.historyCta}</span>
        </Link>

        <Link href="/tnpsc-study-materials/daily-gk-thoughts/june-2026" style={{
          display: "block", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16,
          padding: "14px 16px", textDecoration: "none", marginBottom: 4, boxShadow: shadow.sm,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontFamily: "serif", fontSize: 15, fontWeight: 700, color: T.text }}>{c.gkTitle}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.indigo, background: T.indigoLight, border: `1px solid ${T.indigoMid}`, padding: "3px 10px", borderRadius: 20 }}>Daily</span>
          </div>
          <p style={{ fontSize: 13, color: T.textSec, margin: "0 0 8px", lineHeight: 1.45 }}>{c.gkDesc}</p>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.indigo }}>{c.gkCta}</span>
        </Link>
      </div>

      <div style={{ height: 100 }} />
    </>
  );
}
