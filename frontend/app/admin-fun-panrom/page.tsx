"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAllCreators, fetchAllPacks, verifyCreator, unpublishPack, publishPack } from "@/lib/supabase";
import type { Creator, Pack } from "@/lib/supabase";
import { T, shadow } from "@/lib/tokens";

type Tab = "creators" | "packs";

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("creators");
  const [creators, setCreators] = useState<Creator[]>([]);
  const [packs, setPacks] = useState<(Pack & { creators?: { name: string } })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAllCreators(), fetchAllPacks()])
      .then(([c, p]) => { setCreators(c); setPacks(p); })
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin-fun-panrom/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: T.indigoDark, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", background: "#FF6B35", color: "#fff", padding: "3px 8px", borderRadius: 6 }}>ADMIN</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", flex: 1 }}>Creator Upload Panel</span>
        <button onClick={handleLogout} style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", background: "none", border: "none", cursor: "pointer" }}>Logout</button>
      </div>

      {/* Tabs */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, display: "flex" }}>
        {(["creators", "packs"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "12px 16px", background: "none", border: "none",
            borderBottom: `2px solid ${tab === t ? T.indigo : "transparent"}`,
            fontSize: 13, fontWeight: tab === t ? 700 : 500,
            color: tab === t ? T.indigo : T.textSec, cursor: "pointer",
          }}>
            {t === "creators" ? `Creators (${creators.length})` : `Packs (${packs.length})`}
          </button>
        ))}
      </div>

      <div style={{ padding: 16, maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading && <div style={{ textAlign: "center", padding: 32, color: T.textSec, fontSize: 13 }}>Loading...</div>}

        {/* CREATORS TAB */}
        {!loading && tab === "creators" && creators.map(c => (
          <div key={c.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, boxShadow: shadow.sm }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${T.indigo}, ${T.indigoDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{c.name}</div>
                <div style={{ fontSize: 11, color: T.textSec }}>{c.section} · {c.type}</div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                background: c.verified ? T.greenBg : T.redBg,
                color: c.verified ? T.green : T.red,
                border: `1px solid ${c.verified ? T.greenBorder : T.redBorder}`,
              }}>
                {c.verified ? "Verified" : "Pending"}
              </span>
            </div>
            {!c.verified && (
              <button
                onClick={async () => {
                  await verifyCreator(c.id);
                  setCreators(prev => prev.map(x => x.id === c.id ? { ...x, verified: true } : x));
                }}
                style={{ width: "100%", padding: 10, background: T.green, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                ✓ Verify Creator
              </button>
            )}
            <button
              onClick={() => router.push(`/admin-fun-panrom/upload?creator=${c.id}`)}
              style={{ width: "100%", marginTop: 6, padding: 10, background: T.indigoLight, color: T.indigo, border: `1px solid ${T.indigoMid}`, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              Upload Pack for {c.name} →
            </button>
          </div>
        ))}

        {/* PACKS TAB */}
        {!loading && tab === "packs" && packs.map(p => (
          <div key={p.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, boxShadow: shadow.sm }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 10, color: T.textTer, marginBottom: 2 }}>{p.creators?.name ?? "Unknown"}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{p.name}</div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                background: p.is_published ? T.greenBg : "#FFF8E1",
                color: p.is_published ? T.green : "#B45309",
                border: `1px solid ${p.is_published ? T.greenBorder : "#FDE68A"}`,
                whiteSpace: "nowrap", flexShrink: 0,
              }}>
                {p.is_published ? "Live" : "Draft"}
              </span>
            </div>
            <div style={{ fontSize: 11, color: T.textSec, marginBottom: 10, display: "flex", gap: 10 }}>
              <span>{p.question_count} questions</span>
              <span>·</span>
              <span>{p.subject}</span>
            </div>
            {p.is_published ? (
              <button
                onClick={async () => {
                  await unpublishPack(p.id);
                  setPacks(prev => prev.map(x => x.id === p.id ? { ...x, is_published: false } : x));
                }}
                style={{ width: "100%", padding: 8, background: T.redBg, color: T.red, border: `1px solid ${T.redBorder}`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                Unpublish
              </button>
            ) : (
              <button
                onClick={async () => {
                  await publishPack(p.id);
                  setPacks(prev => prev.map(x => x.id === p.id ? { ...x, is_published: true } : x));
                }}
                style={{ width: "100%", padding: 8, background: T.greenBg, color: T.green, border: `1px solid ${T.greenBorder}`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                Publish
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
