"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { T, shadow } from "../lib/tokens";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomePage() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("mcqpalagu_lang")) {
      localStorage.setItem("mcqpalagu_lang", "ta");
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        background: T.bg,
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "24px 24px 32px",
          textAlign: "center",
          overflowY: "auto"
        }}
      >
        <img
          src="/logo.png"
          alt="MCQ பழகு"
          style={{ height: 80, width: "auto", marginBottom: 8 }}
        />
        <p style={{ color: T.textSec, fontSize: 16, fontWeight: 500, marginBottom: 20, lineHeight: 1.6 }}>Crack TNPSC with AI-powered practice in Tamil</p>

        <button
          onClick={() => router.push("/subjects")}
          style={{
            width: "100%",
            background: `linear-gradient(135deg, ${T.indigo}, #5062B8)`,
            border: "none",
            borderRadius: 16,
            padding: "17px",
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: -0.2,
            boxShadow: shadow.indigo,
            marginBottom: 16
          }}
        >
          Start Practicing Free
        </button>

        {!loggedIn && (
          <button
            onClick={() => router.push("/login")}
            style={{
              width: "100%",
              background: "#fff",
              border: `1.5px solid ${T.indigo}`,
              borderRadius: 16,
              padding: "16px",
              color: T.indigo,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Log In
          </button>
        )}

        <div style={{ width: "100%", marginTop: 18, background: T.surface, borderRadius: 16, overflow: "hidden", border: `1px solid ${T.border}`, boxShadow: shadow.sm }}>
          {[
            { icon: "✨", bg: T.indigoLight, text: "AI-powered", sub: "Gemini powered explanations", indigo: true },
            { icon: "📚", bg: "#fff4ed", text: "10,000+ PYQ", sub: "Previous year questions across all subjects" },
            { icon: "✅", bg: "#edfaf4", text: "TNPSC Group 4 Ready", sub: "Updated syllabus" }
          ].map((feature, i) => (
            <div
              key={feature.text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 18px",
                borderTop: i > 0 ? `1px solid ${T.border}` : "none"
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: feature.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0
                }}
              >
                {feature.icon}
              </div>
              <div>
                <div style={{ color: feature.indigo ? T.indigo : T.text, fontSize: 15, fontWeight: 700 }}>
                  {feature.text}
                </div>
                <div style={{ color: T.textTer, fontSize: 12, fontWeight: 500, marginTop: 2 }}>
                  {feature.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
