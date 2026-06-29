import Link from "next/link";
import { T } from "@/lib/tokens";

type PathUnit = { slug: string; topic: string; count: number };

type UnitPathProps = {
  termTag: string;
  title: string;
  subtitle: string;
  backHref: string;
  backLabel: string;
  basePath: string;
  units: PathUnit[];
  countLabel: (count: number) => string;
};

const BADGES = [
  { grad: "radial-gradient(circle at 35% 30%, #FFD988 0%, #E8A93B 55%, #C9821C 100%)", glow: "rgba(201,130,28,0.55)" },
  { grad: "radial-gradient(circle at 35% 30%, #6FE3C4 0%, #1FAE8E 55%, #0E7E68 100%)", glow: "rgba(14,126,104,0.5)" },
  { grad: "radial-gradient(circle at 35% 30%, #FF9C9C 0%, #D6453F 55%, #A82A28 100%)", glow: "rgba(168,42,40,0.5)" },
];
const EMOJIS = ["🏺", "📜", "🛡️", "📿", "🗿", "⚱️"];

const NODE_TOP_START = 24;
const NODE_GAP_Y = 130;
const BADGE_SIZE = 76;
const CONNECT_OFFSET = 66;
const LEFT_X = 91;
const RIGHT_X = 299;
const VIEW_WIDTH = 390;

export default function UnitPath({ termTag, title, subtitle, backHref, backLabel, basePath, units, countLabel }: UnitPathProps) {
  const points = units.map((_, i) => {
    const rowFromBottom = units.length - 1 - i;
    return {
      x: i % 2 === 0 ? LEFT_X : RIGHT_X,
      top: NODE_TOP_START + rowFromBottom * NODE_GAP_Y,
      y: NODE_TOP_START + rowFromBottom * NODE_GAP_Y + CONNECT_OFFSET,
    };
  });

  const pathD = points
    .slice(1)
    .map((p, i) => {
      const prev = points[i];
      const c1y = prev.y + (p.y - prev.y) * 0.538;
      const c2y = prev.y + (p.y - prev.y) * 0.385;
      return `${i === 0 ? `M ${prev.x} ${prev.y} ` : ""}C ${prev.x} ${c1y}, ${p.x} ${c2y}, ${p.x} ${p.y}`;
    })
    .join(" ");

  const wrapHeight = NODE_TOP_START + (units.length - 1) * NODE_GAP_Y + BADGE_SIZE + 90;
  const stars = points.slice(1).map((p, i) => {
    const prev = points[i];
    return { x: (prev.x + p.x) / 2 + (prev.x < p.x ? 30 : -30), y: (prev.y + p.y) / 2, glyph: i % 2 === 0 ? "✦" : "✧" };
  });

  return (
    <>
      <Link href={backHref} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "16px 16px 0", fontSize: 13, fontWeight: 600, color: T.textSec, textDecoration: "none" }}>
        {backLabel}
      </Link>

      <div style={{ margin: "12px 16px 0", borderRadius: 16, background: "linear-gradient(165deg, #5469C4 0%, #3D52A0 45%, #232F5E 100%)", padding: "16px 18px 14px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.06) 100%)" }} />
        <span style={{ position: "relative", zIndex: 2, display: "inline-flex", alignItems: "center", gap: 6, background: "linear-gradient(180deg, #F2C14E 0%, #D4A92B 100%)", color: "#2D3E7A", fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 6 }}>
          {termTag}
        </span>
        <h1 style={{ position: "relative", zIndex: 2, fontFamily: "Georgia, 'Noto Serif Tamil', serif", fontSize: 22, fontWeight: 800, color: "#fff", marginTop: 8, marginBottom: 0 }}>{title}</h1>
        <div style={{ position: "relative", zIndex: 2, fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{subtitle}</div>
      </div>

      {units.length === 0 ? (
        <div style={{ margin: "20px 16px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20, textAlign: "center", color: T.textSec, fontSize: 14 }}>
          அலகுகள் இன்னும் சேர்க்கப்படவில்லை. விரைவில் வரும்.
        </div>
      ) : (
        <div style={{ position: "relative", height: wrapHeight, margin: "6px 16px 0" }}>
          <svg viewBox={`0 0 ${VIEW_WIDTH} ${wrapHeight}`} preserveAspectRatio="none" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1 }}>
            {pathD && <path d={pathD} fill="none" stroke="#C5CEF0" strokeWidth={4} strokeDasharray="2 10" strokeLinecap="round" />}
          </svg>

          {stars.map((s, i) => (
            <span key={i} style={{ position: "absolute", top: s.y, left: s.x, fontSize: 13, zIndex: 1, opacity: 0.7, color: T.indigoMid }}>{s.glyph}</span>
          ))}

          {units.map((u, i) => {
            const badge = BADGES[i % BADGES.length];
            const emoji = EMOJIS[i % EMOJIS.length];
            const isLeft = i % 2 === 0;
            return (
              <Link
                key={u.slug}
                href={`${basePath}/${u.slug}`}
                style={{ position: "absolute", top: points[i].top, left: isLeft ? 16 : 224, width: 150, display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, textDecoration: "none" }}
              >
                <div style={{ width: BADGE_SIZE, height: BADGE_SIZE, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, position: "relative", border: "3px solid rgba(255,255,255,0.55)", background: badge.grad, boxShadow: `0 10px 18px -6px ${badge.glow}` }}>
                  {emoji}
                  <span style={{ position: "absolute", bottom: -4, right: -4, width: 26, height: 26, borderRadius: "50%", background: T.text, color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${T.bg}` }}>
                    {i + 1}
                  </span>
                </div>
                <div style={{ fontFamily: "Georgia, 'Noto Serif Tamil', serif", fontSize: 15, fontWeight: 800, color: T.text, marginTop: 10, textAlign: "center", lineHeight: 1.25 }}>
                  அலகு {i + 1}<br />{u.topic}
                </div>
                <div style={{ fontSize: 11.5, color: T.textTer, marginTop: 2, fontWeight: 600 }}>{countLabel(u.count)}</div>
              </Link>
            );
          })}
        </div>
      )}

      <div style={{ height: 90 }} />
    </>
  );
}
