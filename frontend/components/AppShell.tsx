"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { T } from "../lib/tokens";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.textTer} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
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

  const [user, setUser] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setShowMenu(false);
    router.push("/");
  }

  return (
    <>
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
        .settings-menu {
          position: absolute;
          bottom: 60px;
          left: 12px;
          background: white;
          border: 1px solid ${T.border};
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          overflow: hidden;
          min-width: 160px;
          z-index: 200;
        }
        .settings-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          color: #C0392B;
        }
        .settings-menu-item:hover { background: #FFF0F0; }
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
            <img src="/logo.png" alt="MCQ பழகு" style={{ height: 48, width: "auto", display: "block" }} />
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

          {/* Settings at bottom of sidebar */}
          {user && (
            <div style={{ marginTop: "auto", position: "relative" }}>
              <button
                onClick={() => setShowMenu((v) => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "11px 12px", borderRadius: 12, border: "none",
                  background: "transparent", cursor: "pointer", width: "100%",
                  transition: "background 0.15s",
                }}
              >
                <SettingsIcon />
                <span style={{ fontSize: 14, fontWeight: 500, color: T.textSec }}>Settings</span>
              </button>

              {showMenu && (
                <div className="settings-menu">
                  <button className="settings-menu-item" onClick={handleLogout}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="2" strokeLinecap="round">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                      <polyline points="16,17 21,12 16,7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", maxWidth: 480, width: "100%" }}>
          {children}
        </div>

      </div>

      {/* Bottom nav — mobile only */}
      {!hideNav && (
        <div className="bottom-nav" style={{
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

          {/* Settings icon on mobile — right side */}
          {user && (
            <div style={{ position: "relative" }}>
              <div
                onClick={() => setShowMenu((v) => !v)}
                style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 4, cursor: "pointer",
                  padding: "0 16px",
                }}
              >
                <SettingsIcon />
                <span style={{ fontSize: 10, fontWeight: 600, color: T.textTer, letterSpacing: 0.3 }}>Settings</span>
              </div>

              {showMenu && (
                <div className="settings-menu" style={{ bottom: 70, left: "auto", right: 8 }}>
                  <button className="settings-menu-item" onClick={handleLogout}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="2" strokeLinecap="round">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                      <polyline points="16,17 21,12 16,7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
