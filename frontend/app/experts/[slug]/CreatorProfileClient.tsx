"use client";

import { useRouter } from "next/navigation";
import { T, shadow } from "../../../lib/tokens";
import { slugify } from "../../../lib/slugify";
import WhatsAppShareButton from "../../../components/WhatsAppShareButton";

const ACCENT_GRADIENTS: Record<string, string> = {
  yellow: "linear-gradient(135deg, #FFD93D, #FF9500)",
  coral:  "linear-gradient(135deg, #FF6B6B, #C2185B)",
  purple: "linear-gradient(135deg, #9B5DE5, #5E35B1)",
  blue:   "linear-gradient(135deg, #4D96FF, #1565C0)",
  teal:   "linear-gradient(135deg, #00C9A7, #00897B)",
  navy:   "linear-gradient(135deg, #3D52A0, #2D3E7A)",
  green:  "linear-gradient(135deg, #6BCB77, #2E7D32)",
  orange: "linear-gradient(135deg, #FF9A3C, #E65100)",
};

const ACCENT_MAP: Record<string, string> = {
  yellow: "#F59E0B", coral: "#F43F5E", blue: "#0284C7", green: "#10B981",
  purple: "#7C3AED", red: "#EF4444", orange: "#F97316", pink: "#EC4899",
  teal: "#00C9A7", navy: "#3D52A0",
};

const EXAM_LABELS: Record<string, string> = {
  group4: "Group 4", group2: "Group 2", tet: "TET", tnusrb: "TNUSRB",
};

export type CreatorData = {
  id: string;
  name: string;
  slug: string;
  type: string;
  verified: boolean;
  accent_color: string;
  tagline?: string | null;
  bio?: string | null;
  social_youtube?: string | null;
  social_instagram?: string | null;
  social_telegram?: string | null;
  [key: string]: unknown;
};

export type PackData = {
  id: string;
  name: string;
  description: string | null;
  subject: string | null;
  exams: string[] | null;
  question_count: number;
  is_free: boolean;
};

const YtIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
const IgIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const TgIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

export default function CreatorProfileClient({ creator, packs }: { creator: CreatorData; packs: PackData[] }) {
  const router = useRouter();
  const accent = ACCENT_MAP[creator.accent_color] ?? creator.accent_color;
  const gradient = ACCENT_GRADIENTS[creator.accent_color] ?? ACCENT_GRADIENTS.navy;
  const initials = creator.name.split(" ").map(w => w[0] ?? "").filter(Boolean).slice(0, 2).join("").toUpperCase();
  const totalQuestions = packs.reduce((s, p) => s + p.question_count, 0);
  const logoEmoji = creator.logo_emoji as string | null | undefined;
  const ytUrl = creator.social_youtube;
  const igUrl = creator.social_instagram;
  const tgUrl = creator.social_telegram;

  return (
    <div style={{ background: T.bg, maxWidth: 600, margin: "0 auto", width: "100%", minHeight: "100vh" }}>

      {/* Top nav */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => router.push("/experts")} style={{ width: 38, height: 38, borderRadius: 11, background: T.bg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 13.5L6.5 9 11 4.5" stroke={T.text} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <span style={{ fontSize: 14, fontWeight: 700, color: T.textSec }}>Expert Profile</span>
      </div>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Profile card */}
        <div style={{ background: T.surface, borderRadius: 20, overflow: "hidden", border: `1px solid ${T.border}`, boxShadow: shadow.sm }}>
          <div style={{ height: 6, background: accent }} />
          <div style={{ padding: "16px 16px 14px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: logoEmoji ? 28 : 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>
                  {logoEmoji ?? initials}
                </div>
                {creator.verified && (
                  <div style={{ position: "absolute", bottom: -3, right: -3, width: 18, height: 18, background: "#22C55E", borderRadius: "50%", border: "2.5px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: T.text, letterSpacing: "-0.3px", lineHeight: 1.2 }}>{creator.name}</div>
                  <WhatsAppShareButton title={creator.name} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.textSec, marginTop: 3 }}>
                  {creator.type === "academy" ? "Academy" : "வழிகாட்டி"}
                </div>
                {creator.tagline && <div style={{ fontSize: 12.5, color: T.textSec, marginTop: 4, lineHeight: 1.5 }}>{creator.tagline}</div>}
              </div>
            </div>

            {creator.bio && (
              <div style={{ marginTop: 12, fontSize: 13, color: "#374151", lineHeight: 1.65, fontWeight: 500, borderLeft: `3px solid ${accent}30`, paddingLeft: 10 }}>{creator.bio}</div>
            )}

            <div style={{ display: "flex", gap: 20, marginTop: 14 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: T.text, lineHeight: 1 }}>{packs.length}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.textTer, textTransform: "uppercase", letterSpacing: "0.6px", marginTop: 2 }}>Packs</div>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: T.text, lineHeight: 1 }}>{totalQuestions}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.textTer, textTransform: "uppercase", letterSpacing: "0.6px", marginTop: 2 }}>Questions</div>
              </div>
            </div>

            {(ytUrl || igUrl || tgUrl) && (
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                {ytUrl && <a href={ytUrl} target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, borderRadius: "50%", background: "#FFF0F0", color: "#FF0000", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", border: "1px solid rgba(255,0,0,0.15)", flexShrink: 0 }}><YtIcon /></a>}
                {igUrl && <a href={igUrl} target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, borderRadius: "50%", background: "#FFF0F5", color: "#E1306C", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", border: "1px solid rgba(225,48,108,0.15)", flexShrink: 0 }}><IgIcon /></a>}
                {tgUrl && <a href={tgUrl} target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, borderRadius: "50%", background: "#F0F8FF", color: "#0088cc", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", border: "1px solid rgba(0,136,204,0.15)", flexShrink: 0 }}><TgIcon /></a>}
              </div>
            )}
          </div>
        </div>

        {/* Packs */}
        <div style={{ fontSize: 11, fontWeight: 800, color: T.textTer, textTransform: "uppercase", letterSpacing: "0.8px" }}>
          Question Packs ({packs.length})
        </div>

        {packs.length === 0 ? (
          <div style={{ background: T.surface, borderRadius: 16, padding: "32px 16px", textAlign: "center", border: `1px solid ${T.border}`, color: T.textSec, fontSize: 14, fontWeight: 600 }}>
            No packs published yet.
          </div>
        ) : (
          packs.map((pack) => {
            const estimatedMins = Math.round((pack.question_count * 30) / 60);
            return (
              <div key={pack.id} onClick={() => router.push(`/experts/${creator.slug}/${slugify(pack.name)}`)}
                style={{ background: T.surface, borderRadius: 16, padding: 14, border: `1px solid ${T.border}`, cursor: "pointer", boxShadow: shadow.sm, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: T.text, lineHeight: 1.3 }}>{pack.name}</div>
                    {pack.description && <div style={{ fontSize: 12.5, color: T.textSec, marginTop: 4, lineHeight: 1.5, fontWeight: 500 }}>{pack.description}</div>}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textTer} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M9 18l6-6-6-6" /></svg>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: T.indigoLight, color: T.indigo, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                    {pack.question_count} Qs
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#F1F5F9", color: T.textSec, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                    ~{estimatedMins} min
                  </span>
                  {pack.is_free && <span style={{ background: "#F0FDF4", color: "#16A34A", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8 }}>Free</span>}
                  {pack.subject && <span style={{ background: "#FFF9C4", color: "#B8860B", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8 }}>{pack.subject}</span>}
                  {(pack.exams ?? []).map(e => <span key={e} style={{ background: "#EDE9FE", color: "#7C3AED", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8 }}>{EXAM_LABELS[e] ?? e}</span>)}
                </div>
              </div>
            );
          })
        )}
        <div style={{ paddingBottom: 48 }} />
      </div>
    </div>
  );
}
