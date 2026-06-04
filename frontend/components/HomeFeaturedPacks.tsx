"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { T, shadow } from "../lib/tokens";
import { slugify } from "../lib/slugify";

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

export default function HomeFeaturedPacks({ initialLang }: { initialLang: "en" | "ta" }) {
  const router = useRouter();
  const [packs, setPacks] = useState<FeaturedPack[]>([]);
  // Use prop directly so router.refresh() updates labels without resetting packs
  const lang = initialLang;

  useEffect(() => {
    supabase
      .from("packs")
      .select("id, name, subject, exams, question_count, is_free, creators(name, slug, verified, accent_color, section)")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setPacks(data as unknown as FeaturedPack[]);
      });
  }, []);

  if (packs.length === 0) return null;

  return (
    <div style={{ width: "100%", marginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ fontSize: 15, fontWeight: 900, color: T.text, margin: 0 }}>
          🎯 {lang === "ta" ? "நிபுணர் பேக்குகள்" : "Expert Packs"}
        </h2>
        <button
          onClick={() => router.push("/experts")}
          style={{ fontSize: 12, fontWeight: 700, color: T.indigo, background: T.indigoLight, border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontFamily: "inherit" }}
        >
          {lang === "ta" ? "அனைத்தும் →" : "See all →"}
        </button>
      </div>

      {packs.map((pack) => {
        const c = Array.isArray(pack.creators) ? pack.creators[0] : pack.creators;
        const accent = c.accent_color ?? "navy";
        const gradient = ACCENT_GRADIENTS[accent] ?? ACCENT_GRADIENTS.navy;
        const pill = ACCENT_PILL[accent] ?? ACCENT_PILL.navy;
        const initials = c.name.charAt(0).toUpperCase();
        const estimatedMins = Math.round((pack.question_count * 30) / 60);

        return (
          <div
            key={pack.id}
            onClick={() => router.push(`/experts/${c.slug}/${slugify(pack.name)}`)}
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
                  {c.name} · {c.section === "buddies" ? (lang === "ta" ? "சேர்ந்து படிப்போம்" : "Study Buddy") : (lang === "ta" ? "வழிகாட்டி" : "Expert")}
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
                onClick={(e) => { e.stopPropagation(); router.push(`/experts/${c.slug}/${slugify(pack.name)}`); }}
                style={{ background: T.indigo, color: "#fff", border: "none", borderRadius: 9, padding: "6px 14px", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
              >
                {lang === "ta" ? "தொடங்கு →" : "Start →"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
