"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // On success — Supabase redirects to Google, then back to /auth/callback
  }

  const s: Record<string, React.CSSProperties> = {
    page: {
      minHeight: "100dvh",
      background: "#F4F5F9",
      display: "flex",
      flexDirection: "column",
      paddingBottom: 40,
      fontFamily: "'Sora', sans-serif",
      maxWidth: 480,
      margin: "0 auto",
    },
    hero: {
      padding: "64px 28px 40px",
    },
    wordmark: {
      fontFamily: "'Noto Sans Tamil', sans-serif",
      fontSize: 36,
      fontWeight: 800,
      color: "#1B2352",
      letterSpacing: -0.5,
      marginBottom: 10,
      display: "block",
    },
    tagline: {
      fontSize: 15,
      color: "#6B7280",
      fontWeight: 400,
      lineHeight: 1.6,
      maxWidth: 280,
    },
    card: {
      background: "white",
      borderRadius: 24,
      margin: "0 16px",
      padding: "28px 24px",
      boxShadow: "0 4px 24px rgba(15,21,38,0.08)",
      border: "1px solid #ECEEF5",
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 700,
      color: "#1B2352",
      marginBottom: 6,
    },
    cardSub: {
      fontSize: 13,
      color: "#9BA3BF",
      fontWeight: 400,
      marginBottom: 24,
      lineHeight: 1.5,
    },
    googleBtn: {
      width: "100%",
      background: "white",
      border: "1.5px solid #ECEEF5",
      borderRadius: 14,
      padding: "15px 20px",
      fontSize: 15,
      fontWeight: 600,
      color: "#1B2352",
      fontFamily: "'Sora', sans-serif",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      boxShadow: "0 2px 8px rgba(15,21,38,0.06)",
      transition: "all 0.15s",
      marginBottom: 16,
    },
    divider: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      margin: "4px 0 16px",
    },
    dividerLine: {
      flex: 1,
      height: 1,
      background: "#ECEEF5",
    },
    dividerText: {
      fontSize: 12,
      color: "#C5CADC",
      fontWeight: 500,
    },
    note: {
      fontSize: 12,
      color: "#9BA3BF",
      textAlign: "center" as const,
      lineHeight: 1.6,
    },
    error: {
      background: "#FFF0F0",
      border: "1px solid #FECACA",
      borderRadius: 12,
      padding: "12px 14px",
      fontSize: 13,
      color: "#C0392B",
      fontWeight: 500,
      marginBottom: 16,
    },
    spacer: { flex: 1 },
    features: {
      padding: "32px 28px 0",
      display: "flex",
      flexDirection: "column" as const,
      gap: 16,
    },
    featureItem: {
      display: "flex",
      alignItems: "center",
      gap: 14,
    },
    featureIcon: {
      width: 42,
      height: 42,
      borderRadius: 12,
      background: "#EEF1FA",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 19,
      flexShrink: 0,
    },
    featureTitle: {
      fontSize: 14,
      fontWeight: 600,
      color: "#1B2352",
    },
    featureSub: {
      fontSize: 12,
      color: "#9BA3BF",
      fontWeight: 400,
      marginTop: 2,
    },
  };

  return (
    <div style={s.page}>
      <div style={s.hero}>
        <span style={s.wordmark}>வாகை</span>
        <p style={s.tagline}>Crack TNPSC with AI-powered practice in Tamil.</p>
      </div>

      <div style={s.card}>
        <div style={s.cardTitle}>Welcome</div>
        <div style={s.cardSub}>Sign in to track your progress and unlock full access.</div>

        {error && <div style={s.error}>{error}</div>}

        <button
          style={s.googleBtn}
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {/* Google SVG icon */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? "Signing in..." : "Continue with Google"}
        </button>

        <div style={s.note}>
          By continuing you agree to our Terms of Service.
        </div>
      </div>

      <div style={s.spacer} />

      <div style={s.features}>
        {[
          { icon: "📚", title: "10,000+ Questions", sub: "Samacheer Kalvi Class 6–10" },
          { icon: "🎯", title: "TNPSC, TET, TNUSRB", sub: "All major TN govt exams" },
          { icon: "🌐", title: "Tamil & English", sub: "Switch anytime, practice your way" },
        ].map((f) => (
          <div key={f.title} style={s.featureItem}>
            <div style={s.featureIcon}>{f.icon}</div>
            <div>
              <div style={s.featureTitle}>{f.title}</div>
              <div style={s.featureSub}>{f.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
