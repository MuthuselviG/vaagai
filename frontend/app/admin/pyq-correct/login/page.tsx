"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { APC } from "@/lib/adminPyqTokens";

export default function PyqCorrectLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!password) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/pyq-correct/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Invalid password");
      return;
    }

    router.push("/admin/pyq-correct");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: APC.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 340,
          background: APC.surface,
          border: `1px solid ${APC.border}`,
          borderRadius: 6,
          padding: "36px 32px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            color: APC.textTer,
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Admin
        </div>
        <h1 style={{ fontSize: 19, fontWeight: 600, color: APC.text, margin: "0 0 6px 0" }}>
          PYQ Correction Tool
        </h1>
        <p style={{ fontSize: 13, color: APC.textSec, margin: "0 0 24px 0", lineHeight: 1.5 }}>
          Enter the admin password to continue.
        </p>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#344054", marginBottom: 6 }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="••••••••"
            autoFocus
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: 14,
              border: `1px solid ${APC.border}`,
              borderRadius: 4,
              color: APC.text,
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </div>

        {error && (
          <div style={{ fontSize: 12, color: APC.red, marginBottom: 12 }}>{error}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !password}
          style={{
            width: "100%",
            padding: 10,
            background: APC.accent,
            color: "#FFFFFF",
            border: "none",
            borderRadius: 4,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: loading || !password ? "default" : "pointer",
            opacity: loading || !password ? 0.6 : 1,
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p style={{ fontSize: 11, color: APC.textTer, margin: "18px 0 0 0", textAlign: "center" }}>
          Internal tool — not linked from the public site.
        </p>
      </div>
    </div>
  );
}
