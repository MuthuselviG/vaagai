"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { T, shadow } from "@/lib/tokens";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"google" | "password">("google");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/admin-fun-panrom/login?step=password` },
    });
    if (error) { setError(error.message); setLoading(false); }
  }

  async function handlePasswordSubmit() {
    if (!password) return;
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Not logged in."); setLoading(false); return; }

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Invalid credentials");
      return;
    }

    router.push("/admin-fun-panrom");
  }

  // Check if returning from Google OAuth with step=password
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("step") === "password" && step === "google") {
      setStep("password");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: T.indigoDark, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: T.surface, borderRadius: 20, padding: 32, width: "100%", maxWidth: 360, boxShadow: shadow.lg }}>

        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", background: "#FF6B35", color: "#fff", padding: "3px 8px", borderRadius: 6, display: "inline-block", marginBottom: 16 }}>
          ADMIN
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: T.text, marginBottom: 4 }}>
          {step === "google" ? "Sign in to continue" : "Enter admin password"}
        </div>
        <div style={{ fontSize: 13, color: T.textSec, marginBottom: 24 }}>
          mcqpalagu.in · Admin Panel
        </div>

        {step === "google" && (
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{ width: "100%", padding: 13, background: T.indigo, color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: shadow.indigo, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Redirecting..." : "Continue with Google →"}
          </button>
        )}

        {step === "password" && (
          <>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handlePasswordSubmit()}
              placeholder="Admin password"
              style={{ width: "100%", padding: "11px 13px", border: `1.5px solid ${T.border}`, borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 8, fontFamily: "system-ui" }}
            />
            {error && (
              <div style={{ fontSize: 12, color: T.red, marginBottom: 8 }}>{error}</div>
            )}
            <button
              onClick={handlePasswordSubmit}
              disabled={loading || !password}
              style={{ width: "100%", padding: 13, background: T.indigo, color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: shadow.indigo, opacity: loading || !password ? 0.6 : 1 }}
            >
              {loading ? "Verifying..." : "Login →"}
            </button>
          </>
        )}

        {error && step === "google" && (
          <div style={{ fontSize: 12, color: T.red, marginTop: 8 }}>{error}</div>
        )}
      </div>
    </div>
  );
}
