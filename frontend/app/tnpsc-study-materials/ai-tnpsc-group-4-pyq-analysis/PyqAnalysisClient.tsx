"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { T, shadow, fontSize } from "../../../lib/tokens";
import { PAPER_COUNT, MAX_TOPIC_COUNT, TOTAL_MARKS, Unit, RisingTopic } from "./data";
import { EN_LABELS, TA_LABELS, Labels } from "./labels";

/* ---------- Mark Map: 100 tiles that flow into unit blocks ---------- */
function MarkMap({ units, caption, onPick, active }: { units: Unit[]; caption: string; onPick: (key: string) => void; active: string | null }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 4;
      setShown(Math.min(i, 100));
      if (i >= 100) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, []);

  const tiles: Unit[] = [];
  units.forEach((u) => { for (let k = 0; k < u.marks; k++) tiles.push(u); });

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 4, maxWidth: 360, margin: "0 auto" }}>
        {tiles.map((u, idx) => {
          const on = idx < shown;
          const dim = active && active !== u.key;
          return (
            <div
              key={idx}
              onClick={() => onPick(u.key)}
              style={{
                aspectRatio: "1",
                borderRadius: 4,
                cursor: "pointer",
                background: on ? u.color : "#E9ECF5",
                opacity: on ? (dim ? 0.25 : 1) : 0.4,
                transform: on ? "scale(1)" : "scale(0.6)",
                transition: "all .35s cubic-bezier(.2,.8,.2,1)",
                transitionDelay: `${(idx % 10) * 12}ms`,
              }}
            />
          );
        })}
      </div>
      <div style={{ textAlign: "center", marginTop: 12, fontSize: fontSize.caption, color: T.textSec }}>
        {caption}
      </div>
    </div>
  );
}

/* ---------- Donut (pure SVG) ---------- */
function Donut({ units, labels, onPick, active }: { units: Unit[]; labels: Labels; onPick: (key: string) => void; active: string | null }) {
  let acc = 0;
  const R = 70;
  const C = 2 * Math.PI * R;
  return (
    <svg viewBox="0 0 180 180" style={{ width: 200, height: 200, display: "block", margin: "0 auto" }}>
      <circle cx="90" cy="90" r={R} fill="none" stroke="#EEF1FA" strokeWidth="26" />
      {units.map((u) => {
        const frac = u.marks / TOTAL_MARKS;
        const dash = `${frac * C} ${C - frac * C}`;
        const off = -acc * C;
        acc += frac;
        const dim = active && active !== u.key;
        return (
          <circle
            key={u.key}
            cx="90" cy="90" r={R} fill="none"
            stroke={u.color}
            strokeWidth={dim ? 16 : 26}
            strokeDasharray={dash}
            strokeDashoffset={off}
            transform="rotate(-90 90 90)"
            style={{ cursor: "pointer", transition: "stroke-width .25s", opacity: dim ? 0.4 : 1 }}
            onClick={() => onPick(u.key)}
          />
        );
      })}
      <text x="90" y="84" textAnchor="middle" fontSize="30" fontWeight="800" fill={T.text}>{TOTAL_MARKS}</text>
      <text x="90" y="104" textAnchor="middle" fontSize={fontSize.caption} fill={T.textSec}>{labels.marksTotal}</text>
    </svg>
  );
}

function UnitCard({ u, labels, open, onToggle }: { u: Unit; labels: Labels; open: boolean; onToggle: () => void }) {
  return (
    <div
      id={u.key}
      style={{
        background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`,
        boxShadow: shadow.sm, overflow: "hidden", marginBottom: 14,
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%", border: "none", background: "none", padding: 18,
          display: "flex", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "left",
        }}
      >
        <div style={{
          width: 54, height: 54, borderRadius: 14, background: u.color, color: "#fff",
          display: "grid", placeItems: "center", flexShrink: 0, boxShadow: `0 4px 12px ${u.color}55`,
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{u.marks}</div>
          <div style={{ fontSize: 9, opacity: 0.9 }}>{labels.marksUnit}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: T.text, fontSize: fontSize.bodyLg }}>{u.name}</div>
          <div style={{ fontSize: fontSize.caption, color: T.textSec }}>{u.tamil}</div>
        </div>
        <div style={{ fontSize: 20, color: T.textTer, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}>⌄</div>
      </button>
      {open && (
        <div style={{ padding: "0 18px 18px" }}>
          <div style={{
            background: u.soft, color: u.color, fontWeight: 600, fontSize: fontSize.body,
            padding: "10px 14px", borderRadius: 12, marginBottom: 16,
          }}>
            💡 {u.ease}
          </div>
          {u.topics.map((t, i) => (
            <div key={i} style={{ marginBottom: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                <span style={{ fontSize: fontSize.body, color: T.text, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                  {t.label}
                  {t.rising && (
                    <span style={{
                      fontSize: fontSize.caption, background: "#FEF3C7", color: "#B45309",
                      padding: "1px 6px", borderRadius: 6, fontWeight: 700,
                    }}>
                      {labels.risingBadge}
                    </span>
                  )}
                </span>
                <span style={{ fontSize: fontSize.caption, color: T.textSec, fontWeight: 700, whiteSpace: "nowrap", marginLeft: 8 }}>{labels.topicCount(t.n)}</span>
              </div>
              <div style={{ height: 9, background: "#F0F2F8", borderRadius: 6, overflow: "hidden" }}>
                <div style={{
                  width: `${(t.n / MAX_TOPIC_COUNT) * 100}%`, height: "100%", background: u.color,
                  borderRadius: 6, transition: "width .6s",
                }} />
              </div>
              <div style={{ fontSize: fontSize.caption, color: T.textTer, marginTop: 3 }}>{labels.papersCaption(t.papers, PAPER_COUNT)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PyqAnalysisClient({ lang, units, rising }: { lang: "en" | "ta"; units: Unit[]; rising: RisingTopic[] }) {
  const labels: Labels = lang === "ta" ? TA_LABELS : EN_LABELS;
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const unitRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const pick = (key: string) => {
    setActive(key);
    setOpen(key);
    setTimeout(() => unitRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
  };

  const tamilPaperHref = lang === "ta" ? "/pyq/group4" : "/pyq/group4";
  const ctaHref = "/pyq/group4";

  return (
    <div style={{ background: T.bg, fontFamily: "'Inter', system-ui, sans-serif", color: T.text, paddingBottom: 100 }}>
      {/* top syllabus strip */}
      <div style={{ background: T.indigoDark, color: "#fff", padding: "10px 16px", fontSize: fontSize.caption, textAlign: "center" }}>
        {labels.syllabusStripPrefix}
        <Link href="/tnpsc-study-materials" style={{ color: "#fff", textDecoration: "underline", fontWeight: 600 }}>
          {labels.viewSyllabus}
        </Link>
      </div>

      {/* hero */}
      <div style={{ padding: "30px 18px 10px", textAlign: "center", maxWidth: 460, margin: "0 auto" }}>
        <div style={{ fontSize: fontSize.caption, fontWeight: 700, letterSpacing: 1, color: T.indigo, textTransform: "uppercase" }}>{labels.eyebrow}</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: "8px 0 10px", lineHeight: 1.2 }}>
          {labels.h1Line1}<br />{labels.h1Line2}
        </h1>
        <p style={{ fontSize: fontSize.bodyLg, color: T.textSec, lineHeight: 1.5, margin: "0 0 22px" }}>
          {labels.heroDesc}
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 22, marginBottom: 26 }}>
          {[["900", labels.statQuestions], ["9", labels.statPapers], ["14", labels.statYears]].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontSize: 28, fontWeight: 800, color: T.indigo }}>{n}</div>
              <div style={{ fontSize: fontSize.caption, color: T.textSec }}>{l}</div>
            </div>
          ))}
        </div>
        <MarkMap units={units} caption={labels.markMapCaption} onPick={pick} active={active} />
      </div>

      {/* scope banner */}
      <div style={{ maxWidth: 460, margin: "26px auto 0", padding: "0 16px" }}>
        <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 14, padding: 14, fontSize: fontSize.body, color: "#9A3412" }}>
          {labels.scopeBannerLine1}<b>{labels.scopeBannerLine2}</b>{labels.scopeBannerOnly}<br />
          {labels.scopeBannerQuestion}
          <Link href={tamilPaperHref} style={{ color: "#9A3412", textDecoration: "underline", fontWeight: 700 }}>
            {labels.scopeBannerLink}
          </Link>
        </div>
      </div>

      {/* donut */}
      <div style={{ maxWidth: 460, margin: "30px auto 0", padding: "0 16px", textAlign: "center" }}>
        <h2 style={{ fontSize: fontSize.heading, fontWeight: 800, marginBottom: 4 }}>{labels.donutHeading}</h2>
        <p style={{ fontSize: fontSize.body, color: T.textSec, margin: "0 0 14px" }}>{labels.donutSub}</p>
        <Donut units={units} labels={labels} onPick={pick} active={active} />
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 14px", marginTop: 16 }}>
          {units.map((u) => (
            <button
              key={u.key}
              onClick={() => pick(u.key)}
              style={{
                border: "none", background: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, fontSize: fontSize.caption,
                color: active && active !== u.key ? T.textTer : T.text,
              }}
            >
              <span style={{ width: 11, height: 11, borderRadius: 3, background: u.color }} />
              {u.short} <b>{u.marks}</b>
            </button>
          ))}
        </div>
      </div>

      {/* rising topics */}
      <div style={{ maxWidth: 460, margin: "34px auto 0", padding: "0 16px" }}>
        <div style={{ background: "linear-gradient(135deg,#1A1A2E,#3D2A5C)", borderRadius: 20, padding: 20, color: "#fff" }}>
          <div style={{ fontSize: fontSize.caption, fontWeight: 700, letterSpacing: 1, opacity: 0.8, textTransform: "uppercase" }}>{labels.risingEyebrow}</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: "6px 0 4px", color: "#fff" }}>{labels.risingHeading}</h2>
          <p style={{ fontSize: fontSize.body, opacity: 0.75, margin: "0 0 16px" }}>
            {labels.risingSub}
          </p>
          {rising.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderTop: i ? "1px solid rgba(255,255,255,.12)" : "none" }}>
              <div style={{ width: 6, borderRadius: 3, background: r.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: fontSize.bodyLg }}>
                  {r.topic} <span style={{ fontSize: fontSize.caption, opacity: 0.6, fontWeight: 500 }}>· {r.unit}</span>
                </div>
                <div style={{ fontSize: fontSize.body, opacity: 0.8, lineHeight: 1.45 }}>{r.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* per-unit cards */}
      <div style={{ maxWidth: 460, margin: "34px auto 0", padding: "0 16px" }}>
        <h2 style={{ fontSize: fontSize.heading, fontWeight: 800, marginBottom: 4 }}>{labels.unitsHeading}</h2>
        <p style={{ fontSize: fontSize.body, color: T.textSec, margin: "0 0 16px" }}>{labels.unitsSub}</p>
        {units.map((u) => (
          <div key={u.key} ref={(el) => { unitRefs.current[u.key] = el; }}>
            <UnitCard u={u} labels={labels} open={open === u.key} onToggle={() => setOpen(open === u.key ? null : u.key)} />
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ maxWidth: 460, margin: "30px auto 0", padding: "0 16px" }}>
        <Link
          href={ctaHref}
          style={{
            display: "block", background: T.indigo, borderRadius: 20, padding: 24, textAlign: "center", color: "#fff",
            boxShadow: shadow.indigo, textDecoration: "none",
          }}
        >
          <div style={{ fontSize: fontSize.heading, fontWeight: 800, marginBottom: 6 }}>{labels.ctaHeading}</div>
          <div style={{ fontSize: fontSize.body, opacity: 0.85, marginBottom: 16 }}>{labels.ctaDesc}</div>
          <div style={{ background: "#fff", color: T.indigo, fontWeight: 700, padding: "12px 20px", borderRadius: 12, display: "inline-block" }}>
            {labels.ctaButton}
          </div>
        </Link>
      </div>
    </div>
  );
}
