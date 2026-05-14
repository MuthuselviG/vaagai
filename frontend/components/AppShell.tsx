"use client";

import { useRouter, usePathname } from "next/navigation";
import { T, shadow } from "../lib/tokens";

type TabId = "home" | "practice" | "scores";

function getActive(pathname: string): TabId {
  if (pathname.startsWith("/subjects") || pathname.startsWith("/practice")) return "practice";
  if (pathname.startsWith("/score")) return "scores";
  return "home";
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? T.indigo : T.textTer} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
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

function BarIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? T.indigo : T.textTer} strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

const tabs = [
  { id: "home" as TabId, label: "Home", path: "/", Icon: HomeIcon },
  { id: "practice" as TabId, label: "Practice", path: "/subjects", Icon: ClockIcon },
  { id: "scores" as TabId, label: "Scores", path: "/score", Icon: BarIcon },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const active = getActive(pathname);
  const hideNav = pathname.startsWith("/practice");

  return (
    <>
      {/* ── Desktop layout ── */}
      <style>{`
        @media (min-width: 768px) {
          .app-shell { display: flex !important; }
          .sidebar { display: flex !important; }
          .bottom-nav { display: none !important; }
          .main-content { border-left: 1px solid ${T.border}; }
        }
        @media (max-width: 767px) {
          .app-shell { display: block !important; }
          .sidebar { display: none !important; }
          .bottom-nav { display: flex !important; }
        }
        * { box-sizing: border-box; }
      `}</style>

      <div className="app-shell" style={{ minHeight: "100vh", display: "flex", background: T.bg }}>

        {/* Sidebar — desktop only */}
        <div className="sidebar" style={{
          display: "none",
          flexDirection: "column",
          width: 240,
          minHeight: "100vh",
          background: T.surface,
          borderRight: `1px solid ${T.border}`,
          padding: "28px 16px",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
        }}>
          {/* Logo */}
          <div style={{ marginBottom: 36, paddingLeft: 12 }}>
            <div style={{ color: T.indigo, fontSize: 26, fontWeight: 900, letterSpacing: -1, fontFamily: "var(--font-noto-sans-tamil), var(--font-inter), sans-serif" }}>
              பழகு
            </div>
            <div style={{ color: T.textTer, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, marginTop: 2 }}>TNPSC EXAM PREP</div>
          </div>

          {/* Nav items */}
          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {tabs.map(({ id, label, path, Icon }) => {
              const isActive = id === active;
              return (
                <button key={id} onClick={() => router.push(path)} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "11px 12px", borderRadius: 12, border: "none",
                  background: isActive ? T.indigoLight : "transparent",
                  cursor: "pointer", textAlign: "left", width: "100%",
                  transition: "background 0.15s",
                }}>
                  <Icon active={isActive} />
                  <span style={{
                    fontSize: 14, fontWeight: isActive ? 700 : 500,
                    color: isActive ? T.indigo : T.textSec,
                  }}>{label}</span>
                  {isActive && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: 3, background: T.indigo }} />}
                </button>
              );
            })}
          </nav>

          {/* Bottom of sidebar */}
          <div style={{ marginTop: "auto", paddingLeft: 12 }}>
            </div>
        </div>

        {/* Main content */}
        <div className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          {children}
        </div>

      </div>

      {/* Bottom nav — mobile only */}
      {!hideNav && <div className="bottom-nav" style={{
        display: "none",
        position: "fixed", bottom: 0, left: 0, right: 0,
        borderTop: `1px solid ${T.border}`,
        background: T.surface,
        paddingBottom: 24, paddingTop: 10,
        zIndex: 100,
      }}>
        {tabs.map(({ id, label, path, Icon }) => {
          const isActive = id === active;
          return (
            <div key={id} onClick={() => router.push(path)} style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", gap: 4, cursor: "pointer",
            }}>
              <Icon active={isActive} />
              <span style={{ fontSize: 10, fontWeight: 600, color: isActive ? T.indigo : T.textTer, letterSpacing: 0.3 }}>
                {label}
              </span>
              {isActive && <div style={{ width: 4, height: 4, borderRadius: 2, background: T.indigo, marginTop: -2 }} />}
            </div>
          );
        })}
      </div>}
    </>
  );
}
