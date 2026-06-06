import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import {
  Brain, CalendarCheck, ClipboardText, Target,
  BookOpen, Barbell, NotePencil, Trophy, Lightning,
  Scales, Scroll, TrendUp, GlobeHemisphereEast, Flask, BookBookmark,
  CaretRight,
} from "@phosphor-icons/react/dist/ssr";
import { T, shadow } from "../lib/tokens";
import { slugify } from "../lib/slugify";
import HomeLangToggle from "../components/HomeLangToggle";
import HomeLoginButton from "../components/HomeLoginButton";

type FeaturedPack = {
  id: string;
  name: string;
  subject: string | null;
  exams: string[] | null;
  question_count: number;
  is_free: boolean;
  creators: {
    name: string;
    slug: string;
    verified: boolean;
    accent_color: string;
    section: string;
  };
};

const ACCENT_GRADIENTS: Record<string, string> = {
  yellow: "linear-gradient(135deg, #FFD93D, #FF9500)",
  coral:  "linear-gradient(135deg, #FF6B6B, #C2185B)",
  purple: "linear-gradient(135deg, #9B5DE5, #5E35B1)",
  blue:   "linear-gradient(135deg, #4D96FF, #1565C0)",
  teal:   "linear-gradient(135deg, #00C9A7, #00897B)",
  navy:   "linear-gradient(135deg, #3D52A0, #2D3E7A)",
};

const ACCENT_PILL: Record<string, { bg: string; border: string }> = {
  yellow: { bg: "#FFF9C4", border: "#FFE082" },
  coral:  { bg: "#FFE4E4", border: "#FFAB91" },
  purple: { bg: "#F3E5F5", border: "#CE93D8" },
  blue:   { bg: "#E3F2FD", border: "#90CAF9" },
  teal:   { bg: "#E0F2F1", border: "#80CBC4" },
  navy:   { bg: T.indigoLight, border: T.indigoMid },
};

const EXAM_LABELS: Record<string, string> = {
  group4: "Group 4", group2: "Group 2", tet: "TET", tnusrb: "TNUSRB",
};

function TelegramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
    </svg>
  );
}

const BENEFITS = [
  { icon: <Brain size={22} color="#3D52A0" weight="duotone" />, iconBg: "#EEF1FA", ta: "AI விளக்கங்கள்", en: "AI Explanations",  sub: "AI Explanations" },
  { icon: <CalendarCheck size={22} color="#057A55" weight="duotone" />, iconBg: "#E8F8F0", ta: "தினசரி புதுப்பிப்பு", en: "Daily Updates", sub: "Daily Updates" },
  { icon: <ClipboardText size={22} color="#B45309" weight="duotone" />, iconBg: "#FFF8E1", ta: "மாதிரி தேர்வுகள்", en: "Mock Tests", sub: "Mock Tests" },
  { icon: <Target size={22} color="#C0392B" weight="duotone" />, iconBg: "#FCE4EC", ta: "TNPSC கவனம்", en: "TNPSC Focused", sub: "TNPSC Focused" },
];

const PROGRESS_STEPS = [
  { num: 1, icon: <BookOpen size={24} color="#fff" weight="duotone" />, ta: "படிப்பு", en: "Learn", active: true },
  { num: 2, icon: <Barbell size={24} color="#9CA3AF" weight="duotone" />, ta: "பயிற்சி", en: "Practice", active: false },
  { num: 3, icon: <NotePencil size={24} color="#9CA3AF" weight="duotone" />, ta: "மாதிரி தேர்வு", en: "Mock Test", active: false },
  { num: 4, icon: <Trophy size={24} color="#9CA3AF" weight="duotone" />, ta: "வெற்றி", en: "Succeed", active: false },
];

const SUBJECTS = [
  { icon: <Scales size={22} color="#B45309" weight="duotone" />, bg: "#FFF8E1", ta: "அரசியல்", en: "Polity" },
  { icon: <Scroll size={22} color="#057A55" weight="duotone" />, bg: "#E8F5E9", ta: "வரலாறு", en: "History" },
  { icon: <TrendUp size={22} color="#0D9488" weight="duotone" />, bg: "#E0F2F1", ta: "பொருளாதாரம்", en: "Economy" },
  { icon: <GlobeHemisphereEast size={22} color="#1D4ED8" weight="duotone" />, bg: "#E3F2FD", ta: "புவியியல்", en: "Geography" },
  { icon: <Flask size={22} color="#C0392B" weight="duotone" />, bg: "#FCE4EC", ta: "அறிவியல்", en: "Science" },
  { icon: <BookBookmark size={22} color="#6D28D9" weight="duotone" />, bg: "#EDE9FE", ta: "தமிழ்", en: "Tamil" },
];

export default async function HomePage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("mcqpalagu_lang")?.value === "en" ? "en" : "ta") as "en" | "ta";

  const todayISO = new Date().toISOString().split("T")[0];

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from("packs")
    .select("id, name, subject, exams, question_count, is_free, creators(name, slug, verified, accent_color, section)")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(5);

  const featuredPacks = (data ?? []) as unknown as FeaturedPack[];

  const creatorSteps = lang === "ta" ? [
    { n: "1", text: "பதிவு செய்து நிபுணர் அல்லது Study Buddy தேர்வு செய்யுங்கள்" },
    { n: "2", text: "எங்கள் குழுவால் சரிபார்க்கப்படுங்கள்" },
    { n: "3", text: "உங்கள் வினாக்களை பதிவேற்றுங்கள் — மீதியை நாங்கள் பார்த்துக்கொள்கிறோம்" },
  ] : [
    { n: "1", text: "Register & select Expert or Study Buddy" },
    { n: "2", text: "Get verified by our team" },
    { n: "3", text: "Upload your MCQs — we handle the rest" },
  ];

  return (
    <main style={{ width: "100%", background: T.bg }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 16px 100px", textAlign: "center" }}>

        {/* ── Compact header ── */}
        <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <Image src="/logo.png" alt="MCQ பழகு" height={48} width={180} priority style={{ height: 48, width: "auto" }} />
          <HomeLangToggle initialLang={lang} />
        </div>

        {/* ── Tagline ── */}
        <p style={{ color: T.text, fontSize: 15, fontWeight: 600, fontStyle: "italic", marginBottom: 10, lineHeight: 1.5, textAlign: "center" }}>
          Crack TNPSC with AI-powered practice in Tamil
        </p>

        {/* ── Stats — inline, no box ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 22 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: T.text, letterSpacing: -0.4 }}>2000+</span>
            <span style={{ fontSize: 11, fontWeight: 500, color: T.textTer }}>
              {lang === "ta" ? "தேர்வர்கள்" : "Students"}
            </span>
          </div>
          <span style={{ fontSize: 16, lineHeight: 1 }}>✨</span>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: T.text, letterSpacing: -0.4 }}>14K+</span>
            <span style={{ fontSize: 11, fontWeight: 500, color: T.textTer, textAlign: "center", maxWidth: 100, lineHeight: 1.3 }}>
              {lang === "ta" ? "வினாக்கள் பதிலளிக்கப்பட்டது" : "Questions Solved"}
            </span>
          </div>
        </div>

        {/* ── Why MCQ Palagu ── */}
        <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 900, color: T.text, margin: 0 }}>
            {lang === "ta" ? "✅ ஏன் MCQ பழகு?" : "✅ Why MCQ Palagu?"}
          </h2>
        </div>
        <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 4 }}>
          {BENEFITS.map((b, i) => (
            <div key={i} style={{ background: T.surface, borderRadius: 20, padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10, boxShadow: shadow.md }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: b.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {b.icon}
                </div>
                <CaretRight size={16} color={T.textTer} />
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.text, lineHeight: 1.3 }}>
                  {lang === "ta" ? b.ta : b.en}
                </div>
                <div style={{ fontSize: 11, fontWeight: 500, color: T.textTer }}>
                  {lang === "ta" ? b.en : b.ta}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Progress path ── */}
        <h2 style={{ width: "100%", fontSize: 16, fontWeight: 900, color: T.text, margin: "24px 0 12px", textAlign: "left" }}>
          {lang === "ta" ? "🚀 உன் வெற்றி பாதை" : "🚀 Your Path to Selection"}
        </h2>
        <div style={{ width: "100%", background: T.surface, borderRadius: 22, padding: "20px 16px", boxShadow: shadow.md }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            {PROGRESS_STEPS.map((step, i) => (
              <>
                <div key={step.num} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: step.active ? T.indigo : T.indigoLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: step.active ? "#fff" : T.textTer }}>
                      {step.num}
                    </div>
                    <div style={{ width: 50, height: 50, borderRadius: 16, background: step.active ? `linear-gradient(135deg, ${T.indigo}, #5B73C7)` : T.bg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: step.active ? shadow.indigo : "none" }}>
                      {step.icon}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: step.active ? T.indigo : T.textTer, textAlign: "center", lineHeight: 1.3 }}>
                    {lang === "ta" ? step.ta : step.en}
                  </span>
                </div>
                {i < PROGRESS_STEPS.length - 1 && (
                  <div key={`arr-${i}`} style={{ paddingTop: 36, color: T.indigoMid, flexShrink: 0 }}>
                    <CaretRight size={14} />
                  </div>
                )}
              </>
            ))}
          </div>
        </div>

        {/* ── Main CTA ── */}
        <Link
          href="/current-affairs"
          style={{ width: "100%", background: `linear-gradient(135deg, ${T.indigo}, #5062B8)`, borderRadius: 20, padding: "18px", color: "#fff", fontSize: 16, fontWeight: 800, letterSpacing: -0.2, boxShadow: "0 6px 20px rgba(61,82,160,0.35)", marginTop: 24, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none", textAlign: "center", boxSizing: "border-box" }}
        >
          <Lightning size={18} color="#fff" weight="fill" />
          {lang === "ta" ? "இன்றே பயிற்சி தொடங்கு" : "Start Practicing Today"}
        </Link>

        {/* Login button — client island, only when logged out */}
        <HomeLoginButton />

        {/* ── Current Affairs Card ── */}
        <Link
          href="/current-affairs"
          style={{ width: "100%", marginTop: 20, background: `linear-gradient(135deg, ${T.indigoDark} 0%, ${T.indigo} 60%, #5B73C7 100%)`, borderRadius: 22, overflow: "hidden", boxShadow: "0 6px 20px rgba(61,82,160,0.3)", display: "block", textDecoration: "none", boxSizing: "border-box" }}
        >
          <div style={{ padding: "18px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 10px" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ADE80" }} />
                <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
                  {lang === "ta" ? "தினசரி புதுப்பிப்பு" : "Daily Update"}
                </span>
              </div>
            </div>
            <div style={{ color: "white", fontSize: 19, fontWeight: 800, lineHeight: 1.2, marginBottom: 3, textAlign: "left" }}>
              {lang === "ta"
                ? <span>இன்றைய <span style={{ color: "#FDE68A" }}>நடப்பு நிகழ்வுகள்</span></span>
                : <span>Today&apos;s <span style={{ color: "#FDE68A" }}>Current Affairs</span></span>}
            </div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginBottom: 14, textAlign: "left" }}>
              {lang === "ta" ? "Today's Current Affairs" : "நடப்பு நிகழ்வுகள்"} · {todayISO}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 14, padding: "11px 16px" }}>
              <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>
                {lang === "ta"
                  ? <span>📖 படி &amp; பயிற்சி செய் &nbsp;<span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 400 }}>Read &amp; Practice</span></span>
                  : "📖 Read & Practice"}
              </div>
              <div style={{ color: "white", fontSize: 16 }}>→</div>
            </div>
          </div>
        </Link>

        {/* ── Category shortcuts ── */}
        <h2 style={{ width: "100%", fontSize: 16, fontWeight: 900, color: T.text, margin: "24px 0 12px", textAlign: "left" }}>
          {lang === "ta" ? "📚 பாட வகைகள்" : "📚 Browse by Subject"}
        </h2>
        <div style={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {SUBJECTS.map((s, i) => (
            <Link
              key={i}
              href="/subjects"
              style={{ background: T.surface, borderRadius: 18, padding: "14px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, boxShadow: shadow.md, textDecoration: "none" }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 13, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {s.icon}
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.text, textAlign: "center" }}>
                {lang === "ta" ? s.ta : s.en}
              </div>
              <div style={{ fontSize: 10, fontWeight: 500, color: T.textTer, textAlign: "center" }}>
                {lang === "ta" ? s.en : s.ta}
              </div>
            </Link>
          ))}
        </div>

        {/* ── Featured packs ── */}
        {featuredPacks.length > 0 && (
          <div style={{ width: "100%", marginTop: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h2 style={{ fontSize: 15, fontWeight: 900, color: T.text, margin: 0 }}>
                🎯 {lang === "ta" ? "நிபுணர் பேக்குகள்" : "Expert Packs"}
              </h2>
              <Link href="/experts" style={{ fontSize: 12, fontWeight: 700, color: T.indigo, background: T.indigoLight, borderRadius: 10, padding: "5px 12px", textDecoration: "none" }}>
                {lang === "ta" ? "அனைத்தும் →" : "See all →"}
              </Link>
            </div>

            {featuredPacks.map((pack) => {
              const c = Array.isArray(pack.creators) ? pack.creators[0] : pack.creators;
              const accent = c.accent_color ?? "navy";
              const gradient = ACCENT_GRADIENTS[accent] ?? ACCENT_GRADIENTS.navy;
              const pill = ACCENT_PILL[accent] ?? ACCENT_PILL.navy;
              const initials = c.name.charAt(0).toUpperCase();
              const estimatedMins = Math.round((pack.question_count * 30) / 60);
              const packHref = `/experts/${c.slug}/${slugify(pack.name)}`;

              return (
                <Link
                  key={pack.id}
                  href={packHref}
                  style={{ width: "100%", background: T.surface, borderRadius: 20, padding: 16, marginBottom: 10, display: "block", textDecoration: "none", boxShadow: shadow.md, textAlign: "left", position: "relative", overflow: "hidden", boxSizing: "border-box" }}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: gradient, borderRadius: "20px 20px 0 0" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 12, background: gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 900, color: "#fff" }}>
                        {initials}
                      </div>
                      {c.verified && (
                        <div style={{ position: "absolute", bottom: -2, right: -2, width: 14, height: 14, background: "#6BCB77", borderRadius: "50%", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 6, color: "#fff", fontWeight: 900 }}>✓</div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 900, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pack.name}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: T.textSec }}>
                        {c.name} · {c.section === "buddies" ? (lang === "ta" ? "சேர்ந்து படிப்போம்" : "Study Buddy") : (lang === "ta" ? "வழிகாட்டி" : "Expert")}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                    {(pack.exams ?? []).slice(0, 2).map(e => (
                      <span key={e} style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 0.3, background: T.indigoLight, color: T.indigo }}>
                        {EXAM_LABELS[e] ?? e}
                      </span>
                    ))}
                    {pack.subject && (
                      <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 0.3, background: pill.bg, color: T.text, border: `1px solid ${pill.border}` }}>
                        {pack.subject}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: `1px solid ${T.bg}` }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: T.textTer }}>
                      <b style={{ color: T.indigo, fontWeight: 900 }}>{pack.question_count}</b> {lang === "ta" ? "வினாக்கள்" : "questions"} · ~{estimatedMins} mins
                    </div>
                    <span style={{ background: T.indigo, color: "#fff", borderRadius: 10, padding: "7px 16px", fontSize: 11, fontWeight: 800 }}>
                      {lang === "ta" ? "தொடங்கு →" : "Start →"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Creator CTA ── */}
        <div style={{ width: "100%", marginTop: 24, background: `linear-gradient(135deg, ${T.indigoDark} 0%, #1a2a6c 100%)`, borderRadius: 22, padding: "20px 18px", textAlign: "left", position: "relative", overflow: "hidden", boxShadow: shadow.indigo }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
          <div style={{ position: "absolute", bottom: -30, right: 20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />

          <div style={{ fontSize: 22, marginBottom: 6 }}>🎓</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", marginBottom: 4, lineHeight: 1.3 }}>
            {lang === "ta" ? "நீங்கள் ஒரு ஆசிரியரா அல்லது நிபுணரா?" : "Are you a Teacher or Expert?"}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 16, lineHeight: 1.6 }}>
            {lang === "ta"
              ? "உங்கள் வினாத் தொகுப்புகளை ஆயிரக்கணக்கான TNPSC தேர்வர்களுடன் பகிர்ந்துகொள்ளுங்கள்."
              : "Share your question packs with thousands of TNPSC aspirants."}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
            {creatorSteps.map(step => (
              <div key={step.n} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{step.n}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.4 }}>{step.text}</div>
              </div>
            ))}
          </div>

          <Link
            href="/login"
            style={{ width: "100%", padding: "13px", background: "#fff", color: T.indigoDark, borderRadius: 14, fontSize: 14, fontWeight: 800, marginBottom: 14, display: "block", textDecoration: "none", textAlign: "center", boxSizing: "border-box" }}
          >
            {lang === "ta" ? "படைப்பாளராக சேரு →" : "Join as Creator →"}
          </Link>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 14 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {lang === "ta" ? "தொடர்பு கொள்ளுங்கள்" : "Contact us"}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <a href="https://t.me/MCQPalagu" target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px", background: "rgba(255,255,255,0.1)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
                <TelegramIcon />Telegram
              </a>
              <a href="https://www.instagram.com/mcqpalagu" target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px", background: "rgba(255,255,255,0.1)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
                <InstagramIcon />Instagram
              </a>
            </div>
          </div>
        </div>

        <div style={{ height: 24 }} />
      </div>
    </main>
  );
}
