"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { T, shadow } from "../lib/tokens";
import LangToggle from "../components/LangToggle";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

export default function HomePage() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [lang, setLang] = useState<'en' | 'ta'>('ta');
  const [featuredPacks, setFeaturedPacks] = useState<FeaturedPack[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      setLoggedIn(!!session);

      if (session?.user) {
        const { data } = await supabase
          .from("users")
          .select("lang")
          .eq("id", session.user.id)
          .single();
        if (data?.lang === "en" || data?.lang === "ta") {
          setLang(data.lang as "en" | "ta");
        }
      }

      supabase
        .from("packs")
        .select("id, name, subject, exams, question_count, is_free, creators(name, slug, verified, accent_color, section)")
        .eq("is_published", true)
        .eq("is_featured", true)
        .limit(3)
        .then(({ data }) => { if (data) setFeaturedPacks(data as unknown as FeaturedPack[]); });
    }

    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setLoggedIn(!!session));
    return () => subscription.unsubscribe();
  }, []);

  async function handleLangChange(l: "en" | "ta") {
    setLang(l);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("users").update({ lang: l }).eq("id", user.id);
    }
  }

  const todayISO = new Date().toISOString().split("T")[0];

  return (
    <main style={{ width: "100%", background: T.bg }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 24px 100px", textAlign: "center" }}>

        {/* lang toggle */}
        <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <LangToggle lang={lang} setLang={handleLangChange} />
        </div>

        <img src="/logo.png" alt="MCQ பழகு" style={{ height: 80, width: "auto", marginBottom: 8 }} />
        <p style={{ color: T.textSec, fontSize: 16, fontWeight: 500, marginBottom: 20, lineHeight: 1.6 }}>
          Crack TNPSC with AI-powered practice in Tamil
        </p>

        {/* Main CTA */}
        <button
          onClick={() => router.push("/subjects")}
          style={{ width: "100%", background: `linear-gradient(135deg, ${T.indigo}, #5062B8)`, border: "none", borderRadius: 16, padding: "17px", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: -0.2, boxShadow: shadow.indigo, marginBottom: 12, fontFamily: "inherit" }}
        >
          {lang === "ta" ? "இலவசமாக பயிற்சி தொடங்கு →" : "Start Practicing Free →"}
        </button>

        {!loggedIn && (
          <button
            onClick={() => router.push("/login")}
            style={{ width: "100%", background: "#fff", border: `1.5px solid ${T.indigo}`, borderRadius: 16, padding: "16px", color: T.indigo, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          >
            Log In
          </button>
        )}

        {/* Current Affairs Card */}
        <div
          onClick={() => router.push("/current-affairs")}
          style={{ width: "100%", marginTop: 16, background: `linear-gradient(135deg, ${T.indigoDark} 0%, ${T.indigo} 60%, #5B73C7 100%)`, borderRadius: 18, overflow: "hidden", boxShadow: shadow.indigo, cursor: "pointer" }}
        >
          <div style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: "3px 10px" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ADE80" }} />
                <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" as const }}>
                  {lang === "ta" ? "தினசரி புதுப்பிப்பு" : "Daily Update"}
                </span>
              </div>
            </div>

            <div style={{ color: "white", fontSize: 18, fontWeight: 800, lineHeight: 1.2, marginBottom: 2, textAlign: "left" }}>
              {lang === "ta"
                ? <span>இன்றைய <span style={{ color: "#FDE68A" }}>நடப்பு நிகழ்வுகள்</span></span>
                : <span>Today's <span style={{ color: "#FDE68A" }}>Current Affairs</span></span>}
            </div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginBottom: 14, textAlign: "left" }}>
              {lang === "ta" ? "Today's Current Affairs" : "நடப்பு நிகழ்வுகள்"} · {todayISO}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "10px 14px" }}>
              <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>
                {lang === "ta"
                  ? <span>📖 படி &amp; பயிற்சி செய் &nbsp;<span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 400 }}>Read &amp; Practice</span></span>
                  : "📖 Read & Practice"}
              </div>
              <div style={{ color: "white", fontSize: 16 }}>→</div>
            </div>
          </div>
        </div>

        {/* Featured packs */}
        {featuredPacks.length > 0 && (
          <div style={{ width: "100%", marginTop: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: T.text }}>
                🎯 {lang === "ta" ? "நிபுணர் பேக்குகள்" : "Expert Packs"}
              </div>
              <button
                onClick={() => router.push("/experts")}
                style={{ fontSize: 12, fontWeight: 700, color: T.indigo, background: T.indigoLight, border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontFamily: "inherit" }}
              >
                {lang === "ta" ? "அனைத்தும் →" : "See all →"}
              </button>
            </div>

            {featuredPacks.map((pack) => {
              const c = Array.isArray(pack.creators) ? pack.creators[0] : pack.creators;
              const accent = c.accent_color ?? "navy";
              const gradient = ACCENT_GRADIENTS[accent] ?? ACCENT_GRADIENTS.navy;
              const pill = ACCENT_PILL[accent] ?? ACCENT_PILL.navy;
              const initials = c.name.charAt(0).toUpperCase();
              const estimatedMins = Math.round((pack.question_count * 30) / 60);

              return (
                <div
                  key={pack.id}
                  onClick={() => router.push(`/experts/${c.slug}/${pack.id}`)}
                  style={{ width: "100%", background: T.surface, borderRadius: 16, padding: 14, marginBottom: 10, border: `1.5px solid ${T.border}`, cursor: "pointer", boxShadow: shadow.sm, textAlign: "left", position: "relative", overflow: "hidden" }}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: gradient, borderRadius: "16px 16px 0 0" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff" }}>
                        {initials}
                      </div>
                      {c.verified && (
                        <div style={{ position: "absolute", bottom: -2, right: -2, width: 13, height: 13, background: "#6BCB77", borderRadius: "50%", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 6, color: "#fff", fontWeight: 900 }}>✓</div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 900, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pack.name}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: T.textSec }}>
                        {c.name} · {c.section === 'buddies' ? (lang === 'ta' ? 'சேர்ந்து படிப்போம்' : 'Study Buddy') : (lang === 'ta' ? 'வழிகாட்டி' : 'Expert')}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                    {(pack.exams ?? []).slice(0, 2).map(e => (
                      <span key={e} style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 0.3, background: T.indigoLight, color: T.indigo }}>
                        {EXAM_LABELS[e] ?? e}
                      </span>
                    ))}
                    {pack.subject && (
                      <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 0.3, background: pill.bg, color: T.text, border: `1px solid ${pill.border}` }}>
                        {pack.subject}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.textSec }}>
                      <b style={{ color: T.indigo, fontWeight: 900 }}>{pack.question_count}</b> {lang === "ta" ? "வினாக்கள்" : "questions"} · ~{estimatedMins} mins
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/experts/${c.slug}/${pack.id}`); }}
                      style={{ background: T.indigo, color: "#fff", border: "none", borderRadius: 9, padding: "6px 14px", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      {lang === "ta" ? "தொடங்கு →" : "Start →"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Creator CTA */}
        <div style={{ width: "100%", marginTop: 24, background: `linear-gradient(135deg, ${T.indigoDark} 0%, #1a2a6c 100%)`, borderRadius: 20, padding: "20px 18px", textAlign: "left", position: "relative", overflow: "hidden", boxShadow: shadow.indigo }}>
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
            {(lang === "ta" ? [
              { n: "1", text: "பதிவு செய்து நிபுணர் அல்லது Study Buddy தேர்வு செய்யுங்கள்" },
              { n: "2", text: "எங்கள் குழுவால் சரிபார்க்கப்படுங்கள்" },
              { n: "3", text: "உங்கள் வினாக்களை பதிவேற்றுங்கள் — மீதியை நாங்கள் பார்த்துக்கொள்கிறோம்" },
            ] : [
              { n: "1", text: "Register & select Expert or Study Buddy" },
              { n: "2", text: "Get verified by our team" },
              { n: "3", text: "Upload your MCQs — we handle the rest" },
            ]).map(step => (
              <div key={step.n} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{step.n}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.4 }}>{step.text}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push("/login")}
            style={{ width: "100%", padding: "13px", background: "#fff", color: T.indigoDark, border: "none", borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: "pointer", marginBottom: 14, fontFamily: "inherit" }}
          >
            {lang === "ta" ? "படைப்பாளராக சேரு →" : "Join as Creator →"}
          </button>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 14 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
              {lang === "ta" ? "தொடர்பு கொள்ளுங்கள்" : "Contact us"}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <a href="https://t.me/MCQPalagu" target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px", background: "rgba(255,255,255,0.1)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
                <TelegramIcon />Telegram
              </a>
              <a href="https://www.instagram.com/mcqpalagu" target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px", background: "rgba(255,255,255,0.1)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
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
