"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { T, shadow } from "../lib/tokens";

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

export default function HomePage() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [lang, setLang] = useState<'en' | 'ta'>('ta');
  const [featuredPacks, setFeaturedPacks] = useState<FeaturedPack[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("mcqpalagu_lang");
    if (!saved) {
      localStorage.setItem("mcqpalagu_lang", "ta");
    } else if (saved === 'en' || saved === 'ta') {
      setLang(saved as 'en' | 'ta');
    }
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setLoggedIn(!!session));

    // Fetch featured packs
    supabase
      .from("packs")
      .select("id, name, subject, exams, question_count, is_free, creators(name, slug, verified, accent_color, section)")
      .eq("is_published", true)
      .eq("is_featured", true)
      .limit(3)
      .then(({ data }) => { if (data) setFeaturedPacks(data as FeaturedPack[]); });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <main style={{ minHeight: "100vh", width: "100%", background: T.bg, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "24px 24px 32px", textAlign: "center", overflowY: "auto" }}>

        <img src="/logo.png" alt="MCQ பழகு" style={{ height: 80, width: "auto", marginBottom: 8 }} />
        <p style={{ color: T.textSec, fontSize: 16, fontWeight: 500, marginBottom: 20, lineHeight: 1.6 }}>Crack TNPSC with AI-powered practice in Tamil</p>

        <button
          onClick={() => router.push("/subjects")}
          style={{ width: "100%", background: `linear-gradient(135deg, ${T.indigo}, #5062B8)`, border: "none", borderRadius: 16, padding: "17px", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: -0.2, boxShadow: shadow.indigo, marginBottom: 16 }}
        >
          Start Practicing Free
        </button>

        {!loggedIn && (
          <button
            onClick={() => router.push("/login")}
            style={{ width: "100%", background: "#fff", border: `1.5px solid ${T.indigo}`, borderRadius: 16, padding: "16px", color: T.indigo, fontSize: 15, fontWeight: 600, cursor: "pointer" }}
          >
            Log In
          </button>
        )}

        {/* Features card — unchanged */}
        <div style={{ width: "100%", marginTop: 18, background: T.surface, borderRadius: 16, overflow: "hidden", border: `1px solid ${T.border}`, boxShadow: shadow.sm }}>
          {[
            { icon: "✨", bg: T.indigoLight, text: "AI-powered", sub: "Gemini powered explanations", indigo: true },
            { icon: "📚", bg: "#fff4ed", text: "10,000+ PYQ", sub: "Previous year questions across all subjects" },
            { icon: "✅", bg: "#edfaf4", text: "TNPSC Group 4 Ready", sub: "Updated syllabus" }
          ].map((feature, i) => (
            <div key={feature.text} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderTop: i > 0 ? `1px solid ${T.border}` : "none" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: feature.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                {feature.icon}
              </div>
              <div>
                <div style={{ color: feature.indigo ? T.indigo : T.text, fontSize: 15, fontWeight: 700 }}>{feature.text}</div>
                <div style={{ color: T.textTer, fontSize: 12, fontWeight: 500, marginTop: 2 }}>{feature.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured packs section — only shown when packs exist */}
        {featuredPacks.length > 0 && (
          <div style={{ width: "100%", marginTop: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: T.text }}>🎯 Expert Packs</div>
              <button
                onClick={() => router.push("/experts")}
                style={{ fontSize: 12, fontWeight: 700, color: T.indigo, background: T.indigoLight, border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontFamily: "inherit" }}
              >
                See all →
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
                  {/* Accent top bar */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: gradient, borderRadius: "16px 16px 0 0" }} />

                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    {/* Creator avatar */}
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
                      <div style={{ fontSize: 11, fontWeight: 600, color: T.textSec }}>{c.name} · {c.section === 'buddies' ? 'Study Buddy' : (lang === 'ta' ? 'வழிகாட்டி' : 'Expert')}</div>
                    </div>
                  </div>

                  {/* Pills */}
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

                  {/* Bottom row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.textSec }}>
                      <b style={{ color: T.indigo, fontWeight: 900 }}>{pack.question_count}</b> questions · ~{estimatedMins} mins
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/experts/${c.slug}/${pack.id}`); }}
                      style={{ background: T.indigo, color: "#fff", border: "none", borderRadius: 9, padding: "6px 14px", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      Start →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
