import { ReactNode } from "react";
import Link from "next/link";

export type BookCoverStatus = "available" | "locked";

type BookCoverProps = {
  emoji: string;
  label: ReactNode;
  status: BookCoverStatus;
  plate?: string;
  href?: string;
  ariaLabel?: string;
};

const SPINE_GRADIENT =
  "repeating-linear-gradient(to bottom, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 1px, rgba(255,255,255,0.06) 1px, rgba(255,255,255,0.06) 3px)";
const SHEEN_GRADIENT =
  "linear-gradient(115deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 28%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.08) 100%)";

export default function BookCover({ emoji, label, status, plate, href, ariaLabel }: BookCoverProps) {
  const available = status === "available";

  const cover = (
    <div
      data-testid="book-cover"
      data-status={status}
      style={{
        width: 142,
        height: 196,
        borderRadius: "6px 14px 14px 6px",
        position: "relative",
        flexShrink: 0,
        background: available
          ? "linear-gradient(165deg, #5469C4 0%, #3D52A0 45%, #232F5E 100%)"
          : "linear-gradient(165deg, #C4C9D4 0%, #9CA3AF 55%, #767E8E 100%)",
        boxShadow: available
          ? "0 14px 24px -8px rgba(45,62,122,0.55), 0 4px 8px rgba(45,62,122,0.3)"
          : "0 6px 12px -4px rgba(80,85,100,0.25)",
        opacity: available ? 1 : 0.92,
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 9, borderRadius: "6px 0 0 6px", background: SPINE_GRADIENT, zIndex: 3 }} />
      <div style={{ position: "absolute", top: 0, left: 9, right: 0, bottom: 0, borderRadius: "0 14px 14px 0", background: SHEEN_GRADIENT, zIndex: 4, pointerEvents: "none" }} />

      {available ? (
        <>
          <div
            style={{
              position: "absolute", top: 0, right: 22, width: 22, height: 38,
              background: "linear-gradient(180deg, #F2C14E 0%, #D4A92B 100%)",
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)",
              zIndex: 5, boxShadow: "-1px 1px 3px rgba(0,0,0,0.2)",
            }}
          />
          <div
            style={{
              position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)",
              width: 36, height: 36, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
              zIndex: 5, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)",
            }}
          >
            {emoji}
          </div>
        </>
      ) : (
        <div
          style={{
            position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
            width: 38, height: 38, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            zIndex: 5, background: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.5)", color: "#4B5160",
          }}
        >
          🔒
        </div>
      )}

      <div
        style={{
          position: "absolute", left: 16, right: 12, bottom: 38,
          fontFamily: "Georgia, 'Noto Serif Tamil', serif", fontWeight: 800, fontSize: 21,
          zIndex: 5,
          color: available ? "#fff" : "rgba(255,255,255,0.85)",
          textShadow: available ? "0 1px 3px rgba(0,0,0,0.25)" : undefined,
        }}
      >
        {label}
      </div>

      {available && plate && (
        <div
          style={{
            position: "absolute", left: 16, right: 12, bottom: 14,
            fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase",
            zIndex: 5, color: "#F2C14E",
          }}
        >
          {plate}
        </div>
      )}
    </div>
  );

  if (available && href) {
    return (
      <Link href={href} aria-label={ariaLabel} style={{ textDecoration: "none", display: "block" }}>
        {cover}
      </Link>
    );
  }

  return cover;
}
