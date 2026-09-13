"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { T, shadow } from "@/lib/tokens";

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
      setError(data.error === "Password is required" ? "கடவுச்சொல் தேவை" : "தவறான கடவுச்சொல்");
      return;
    }

    router.push("/admin/pyq-correct");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "var(--font-noto-sans-tamil), var(--font-inter), sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 340,
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 20,
          padding: "32px 28px",
          boxShadow: shadow.md,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.08em",
            color: T.textTer,
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          நிர்வாகம்
        </div>
        <h1 style={{ fontSize: 19, fontWeight: 800, color: T.text, margin: "0 0 6px 0" }}>
          முன்னாள் வினாத்தாள் திருத்தும் கருவி
        </h1>
        <p style={{ fontSize: 13, color: T.textSec, margin: "0 0 22px 0", lineHeight: 1.5 }}>
          தொடர நிர்வாக கடவுச்சொல்லை உள்ளிடவும்.
        </p>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 6 }}>
            கடவுச்சொல்
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
              height: 46,
              padding: "0 14px",
              fontSize: 15,
              border: `1.5px solid ${T.indigoMid}`,
              borderRadius: 12,
              color: T.text,
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </div>

        {error && (
          <div style={{ fontSize: 12, color: T.red, marginBottom: 12, fontWeight: 600 }}>{error}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !password}
          style={{
            width: "100%",
            height: 48,
            background: T.indigo,
            color: "#FFFFFF",
            border: "none",
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 800,
            fontFamily: "inherit",
            cursor: loading || !password ? "default" : "pointer",
            opacity: loading || !password ? 0.6 : 1,
            boxShadow: shadow.indigo,
          }}
        >
          {loading ? "உள்நுழைகிறது..." : "உள்நுழை"}
        </button>

        <p style={{ fontSize: 11, color: T.textTer, margin: "16px 0 0 0", textAlign: "center" }}>
          அக பயன்பாட்டு கருவி — பொது தளத்தில் இணைக்கப்படவில்லை.
        </p>
      </div>
    </div>
  );
}
