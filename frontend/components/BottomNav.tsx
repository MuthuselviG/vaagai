"use client";

import { T } from "../lib/tokens";

type TabId = "home" | "practice" | "scores";

type BottomNavProps = {
  active: TabId;
};

function BarIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? T.indigo : T.textTer} strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function ClockIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? T.indigo : T.textTer} strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? T.indigo : T.textTer} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  );
}

export default function BottomNav({ active }: BottomNavProps) {
  return (
    <div
      style={{
        display: "flex",
        borderTop: `1px solid ${T.border}`,
        background: T.surface,
        paddingBottom: 24,
        paddingTop: 10
      }}
    >
      {[
        { id: "home", label: "Home", Icon: HomeIcon },
        { id: "practice", label: "Practice", Icon: ClockIcon },
        { id: "scores", label: "Scores", Icon: BarIcon }
      ].map(({ id, label, Icon }) => {
        const isActive = id === active;
        return (
          <div
            key={id}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              cursor: "pointer"
            }}
          >
            <Icon active={isActive} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: isActive ? T.indigo : T.textTer,
                letterSpacing: 0.3
              }}
            >
              {label}
            </span>
            {isActive && <div style={{ width: 4, height: 4, borderRadius: 2, background: T.indigo, marginTop: -2 }} />}
          </div>
        );
      })}
    </div>
  );
}
