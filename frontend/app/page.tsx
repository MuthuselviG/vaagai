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
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: T.indigoLight,
            border: `1px solid ${T.indigoMid}`,
            borderRadius: 20,
            padding: "6px 14px",
            marginBottom: 16
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.indigo }} />
          <span style={{ color: T.indigo, fontSize: 11, fontWeight: 700, letterSpacing: 0.8 }}>TNPSC EXAM PREP</span>
        </div>

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
              background: "transparent",
              border: `1.5px solid ${T.border}`,
              borderRadius: 16,
              padding: "16px",
              color: T.textSec,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Log In
          </button>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", marginTop: 18 }}>
          {[
            { icon: "📚", text: "10,000+ PYQ", sub: "Curated by experts" },
            { icon: "✨", text: "AI-powered Practice", sub: "Personalised for you", indigo: true },
            { icon: "✅", text: "TNPSC Ready", sub: "Updated syllabus" }
          ].map((feature) => (
            <div
              key={feature.text}
              style={{
                background: feature.indigo ? T.indigoLight : T.surface,
                border: `1px solid ${feature.indigo ? T.indigoMid : T.border}`,
                borderRadius: 14,
                padding: "13px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                boxShadow: shadow.sm
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: feature.indigo ? T.indigo : T.indigoLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0
                }}
              >
                {feature.icon}
              </div>
              <div>
                <div style={{ color: feature.indigo ? T.indigo : T.text, fontSize: 15, fontWeight: 700 }}>{feature.text}</div>
                <div style={{ color: feature.indigo ? T.indigoDark : T.textTer, fontSize: 13, fontWeight: 500, marginTop: 1 }}>{feature.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
