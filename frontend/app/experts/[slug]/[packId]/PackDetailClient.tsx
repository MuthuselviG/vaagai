"use client";

import { useRouter } from "next/navigation";
import { T, shadow } from "../../../../lib/tokens";
import WhatsAppShareButton from "../../../../components/WhatsAppShareButton";

const ACCENT_GRADIENTS: Record<string, string> = {
  yellow: "linear-gradient(135deg, #FFD93D, #FF9500)",
  coral:  "linear-gradient(135deg, #FF6B6B, #C2185B)",
  purple: "linear-gradient(135deg, #9B5DE5, #5E35B1)",
  blue:   "linear-gradient(135deg, #4D96FF, #1565C0)",
  teal:   "linear-gradient(135deg, #00C9A7, #00897B)",
  navy:   "linear-gradient(135deg, #3D52A0, #2D3E7A)",
};

const EXAM_LABELS: Record<string, string> = {
  group4: "Group 4", group2: "Group 2", tet: "TET", tnusrb: "TNUSRB",
};

export type PackDetailData = {
  id: string;
  name: string;
  description: string | null;
  subject: string | null;
  exams: string[] | null;
  question_count: number;
  is_free: boolean;
  creator: {
    id: string;
    name: string;
    slug: string;
    type: string;
    verified: boolean;
    accent_color: string;
  };
};

export default function PackDetailClient({ pack }: { pack: PackDetailData }) {
  const router = useRouter();
  const { creator } = pack;
  const gradient = ACCENT_GRADIENTS[creator.accent_color] ?? ACCENT_GRADIENTS.navy;
  const initials = creator.name.charAt(0).toUpperCase();
  const estimatedMins = Math.round((pack.question_count * 30) / 60);

  function handleStart() {
    router.push(`/practice/pack/${encodeURIComponent(pack.id)}?pack_id=${pack.id}&label=${encodeURIComponent(pack.name)}&creator=${encodeURIComponent(creator.name)}&level=1&offset=0&limit=${pack.question_count}`);
  }

  return (
    <div style={{ background: T.bg, maxWidth: 600, margin: "0 auto", width: "100%" }}>
      <WhatsAppShareButton title={pack.name} context={creator.name} floating />

      {/* Top nav */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => router.back()} style={{ width: 38, height: 38, borderRadius: 11, background: T.bg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 13.5L6.5 9 11 4.5" stroke={T.text} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <span style={{ fontSize: 14, fontWeight: 700, color: T.textSec }}>Pack Detail</span>
      </div>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14, paddingBottom: 0 }}>

        {/* Hero */}
        <div style={{ background: T.indigo, borderRadius: 20, padding: "20px 18px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.05)", top: -50, right: -40 }} />
          <div style={{ position: "absolute", width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.04)", bottom: -20, left: 30 }} />
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", fontSize: 10, fontWeight: 900, padding: "4px 10px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12, position: "relative", zIndex: 1 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFD93D" }} />
            {pack.subject ?? "General"}{pack.exams && pack.exams.length > 0 ? ` · ${EXAM_LABELS[pack.exams[0]] ?? pack.exams[0]}` : ""}
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1.3, marginBottom: 14, position: "relative", zIndex: 1 }}>{pack.name}</div>
          <div style={{ display: "flex", gap: 10, position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
              {pack.question_count} Questions
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
              ~{estimatedMins} mins
            </div>
          </div>
        </div>

        {/* Creator */}
        <div onClick={() => router.push(`/experts/${creator.slug}`)} style={{ background: T.surface, borderRadius: 16, padding: "13px 14px", display: "flex", alignItems: "center", gap: 12, border: `1.5px solid ${T.border}`, cursor: "pointer", boxShadow: shadow.sm }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, background: gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 900, color: "#fff" }}>{initials}</div>
            {creator.verified && <div style={{ position: "absolute", bottom: -3, right: -3, width: 15, height: 15, background: "#6BCB77", borderRadius: "50%", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: "#fff", fontWeight: 900 }}>✓</div>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: T.textTer, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Created by</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: T.text }}>{creator.name}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.textSec }}>{creator.type === "academy" ? "Academy" : "வழிகாட்டி"}</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textTer} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
        </div>

        {/* About */}
        {pack.description && (
          <>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.textTer, textTransform: "uppercase", letterSpacing: 0.8 }}>About</div>
            <div style={{ background: T.surface, borderRadius: 16, padding: "14px 16px", border: `1.5px solid ${T.border}`, fontSize: 13, color: "#374151", fontWeight: 600, lineHeight: 1.65 }}>{pack.description}</div>
          </>
        )}

        {/* Pills */}
        {((pack.exams && pack.exams.length > 0) || pack.subject) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(pack.exams ?? []).map(e => <span key={e} style={{ fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 0.3, background: T.indigoLight, color: T.indigo }}>{EXAM_LABELS[e] ?? e}</span>)}
            {pack.subject && <span style={{ fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 0.3, background: "#FFF9C4", color: "#B8860B" }}>{pack.subject}</span>}
          </div>
        )}

        {/* What's inside */}
        <div style={{ fontSize: 11, fontWeight: 800, color: T.textTer, textTransform: "uppercase", letterSpacing: 0.8 }}>What&apos;s inside</div>
        <div style={{ background: T.surface, borderRadius: 16, padding: "4px 16px", border: `1.5px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: T.indigoLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>❓</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{pack.question_count} MCQ Questions</div>
          </div>
        </div>

        {/* Start button */}
        <div style={{ padding: "4px 0 48px" }}>
          <button onClick={handleStart} style={{ width: "100%", background: `linear-gradient(135deg, ${T.indigo}, #5062B8)`, border: "none", borderRadius: 16, padding: "17px", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: shadow.indigo, fontFamily: "inherit" }}>
            Start Pack →
          </button>
        </div>
      </div>
    </div>
  );
}
