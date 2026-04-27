"use client";

import type { CSSProperties } from "react";
import { T, shadow } from "../lib/tokens";

type Lang = "en" | "ta";

type LangToggleProps = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  style?: CSSProperties;
};

export default function LangToggle({ lang, setLang, style = {} }: LangToggleProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 20,
        padding: 3,
        boxShadow: shadow.sm,
        flexShrink: 0,
        ...style
      }}
    >
      {[
        ["en", "EN"],
        ["ta", "தமிழ்"]
      ].map(([value, label]) => (
        <button
          key={value}
          onClick={() => setLang(value as Lang)}
          style={{
            border: "none",
            cursor: "pointer",
            background: lang === value ? T.indigo : "transparent",
            color: lang === value ? "#fff" : T.textSec,
            padding: "4px 10px",
            borderRadius: 16,
            fontSize: 11,
            fontWeight: 700,
            transition: "all 0.18s ease",
            fontFamily: value === "ta" ? "var(--font-noto-sans-tamil), var(--font-inter), sans-serif" : "var(--font-inter), sans-serif"
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
