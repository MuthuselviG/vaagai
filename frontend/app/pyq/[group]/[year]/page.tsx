"use client";

import { useParams, useRouter } from "next/navigation";
import { T, shadow } from "../../../../lib/tokens";

const GROUP_LABELS: Record<string, string> = {
  group4: "குரூப் 4",
};

export default function PYQYearPage() {
  const params = useParams();
  const router = useRouter();

  const group = params.group as string;
  const year = params.year as string;

  const groupLabel = GROUP_LABELS[group] ?? group;

  return (
    <div style={{ background: T.bg, height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Top bar */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "14px 18px 14px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => router.back()}
            style={{ width: 38, height: 38, borderRadius: 11, background: T.bg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 13.5L6.5 9 11 4.5" stroke={T.text} strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
          <div>
            <h2 style={{ color: T.text, fontSize: 20, fontWeight: 800, letterSpacing: -0.4 }}>
              {groupLabel} — {year}
            </h2>
            <p style={{ color: T.textSec, fontSize: 12, marginTop: 2 }}>
              TNPSC கடந்த ஆண்டு வினாத்தாள்
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", overscrollBehavior: "none", padding: "16px 16px 100px" }}>

        <div style={{ fontSize: 11, fontWeight: 800, color: T.textTer, letterSpacing: 0.8, marginBottom: 10 }}>
          வினாத்தாளை தேர்வு செய்யுங்கள்
        </div>

        {/* Tamil Paper */}
        <button
          onClick={() => router.push(`/practice/pyq/${group}?year=${year}&paper=tamil`)}
          style={{
            width: "100%",
            background: "#EDE9FE",
            border: `1.5px solid #C4B5FD`,
            borderRadius: 20,
            padding: 20,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 14,
            cursor: "pointer",
            textAlign: "left",
            boxShadow: shadow.sm,
            transition: "transform 0.1s",
          }}
          onTouchStart={e => (e.currentTarget.style.transform = "scale(0.98)")}
          onTouchEnd={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          <div style={{ width: 52, height: 52, borderRadius: 16, background: "#DDD6FE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: "#6D28D9", flexShrink: 0 }}>
            அ
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: T.text, letterSpacing: -0.3 }}>தமிழ்</div>
            <div style={{ fontSize: 12, color: T.textSec, marginTop: 3 }}>100 வினாக்கள் · ~40 நிமிடங்கள்</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#6D28D9", marginTop: 6 }}>பயிற்சி தொடங்கு →</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#6D28D9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
        </button>

        {/* General Studies — Coming Soon */}
        <div style={{
          width: "100%",
          background: T.surface,
          border: `1.5px solid ${T.border}`,
          borderRadius: 20,
          padding: 20,
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 14,
          opacity: 0.5,
        }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
            📚
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: T.textSec, letterSpacing: -0.3 }}>பொது அறிவு</div>
            <div style={{ fontSize: 12, color: T.textSec, marginTop: 3 }}>100 வினாக்கள்</div>
            <div style={{ background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: T.textTer, marginTop: 6, display: "inline-block" }}>
              விரைவில் வருகிறது
            </div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke={T.textTer} strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
        </div>

        {/* Info card */}
        <div style={{ fontSize: 11, fontWeight: 800, color: T.textTer, letterSpacing: 0.8, marginBottom: 10 }}>
          வினாத்தாள் விவரங்கள்
        </div>
        <div style={{ background: T.surface, borderRadius: 16, padding: "4px 16px", border: `1px solid ${T.border}`, boxShadow: shadow.sm }}>
          {[
            { label: "தேர்வு", value: `TNPSC ${groupLabel}` },
            { label: "ஆண்டு", value: year },
            { label: "மொத்த வினாக்கள்", value: "100" },
            { label: "விளக்கங்கள்", value: "✓ உள்ளது", valueColor: T.green },
          ].map((row, i, arr) => (
            <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <span style={{ fontSize: 13, color: T.textSec }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: row.valueColor ?? T.text }}>{row.value}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
