"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { T, shadow } from "@/lib/tokens";

type QuestionRow = {
  id: string;
  question: string;
  correct_option: string;
  lang: "en" | "ta";
};

type Filters = { years: number[] };

const PAGE_SIZE = 20;

const CHEVRON = (
  <svg width="9" height="15" viewBox="0 0 9 15" fill="none" style={{ flexShrink: 0 }}>
    <path d="M1.5 1.5L7 7.5L1.5 13.5" stroke={T.indigoMid} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function PyqCorrectListPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const year = searchParams.get("year") ?? "";
  const paper = searchParams.get("paper") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1") || 1;

  const [filters, setFilters] = useState<Filters>({ years: [] });
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/pyq-correct/filters")
      .then((r) => r.json())
      .then(setFilters)
      .catch(() => {});
  }, []);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (year) params.set("year", year);
    if (paper) params.set("paper", paper);
    params.set("page", String(page));

    const res = await fetch(`/api/admin/pyq-correct/questions?${params}`);
    const data = await res.json();
    setQuestions(data.questions ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [year, paper, page]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  function updateParams(next: { year?: string; paper?: string; page?: number }) {
    const params = new URLSearchParams();
    const y = next.year !== undefined ? next.year : year;
    const p = next.paper !== undefined ? next.paper : paper;
    const pg = next.page !== undefined ? next.page : page;
    if (y) params.set("year", y);
    if (p) params.set("paper", p);
    if (pg > 1) params.set("page", String(pg));
    const qs = params.toString();
    router.push(qs ? `/admin/pyq-correct?${qs}` : "/admin/pyq-correct");
  }

  function clearFilters() {
    router.push("/admin/pyq-correct");
  }

  async function handleLogout() {
    await fetch("/api/admin/pyq-correct/login", { method: "DELETE" });
    router.push("/admin/pyq-correct/login");
  }

  function openQuestion(id: string) {
    const params = new URLSearchParams();
    if (year) params.set("year", year);
    if (paper) params.set("paper", paper);
    params.set("page", String(page));
    router.push(`/admin/pyq-correct/${id}?${params}`);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const papers: { value: string; label: string }[] = [
    { value: "", label: "அனைத்தும்" },
    { value: "tamil", label: "தமிழ்" },
    { value: "gs", label: "GS" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "var(--font-noto-sans-tamil), var(--font-inter), sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ flexShrink: 0, background: T.surface, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 14px" }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 800, color: T.text, letterSpacing: -0.3 }}>முன்னாள் வினாக்கள்</div>
          <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>
            {loading ? "ஏற்றுகிறது..." : `${total} வினாக்கள் · திருத்தம்`}
          </div>
        </div>
        <a onClick={handleLogout} style={{ fontSize: 12, color: T.textSec, fontWeight: 600, cursor: "pointer" }}>
          வெளியேறு
        </a>
      </div>

      {/* Filter bar */}
      <div style={{ flexShrink: 0, background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "4px 16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <select
            value={year}
            onChange={(e) => updateParams({ year: e.target.value, page: 1 })}
            style={{ flex: 1, minWidth: 0, height: 42, padding: "0 12px", fontSize: 14, fontWeight: 600, border: `1.5px solid ${T.indigoMid}`, borderRadius: 12, color: T.text, fontFamily: "inherit", background: T.surface }}
          >
            <option value="">அனைத்து ஆண்டுகளும்</option>
            {filters.years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <div style={{ flexShrink: 0, display: "flex", background: T.indigoLight, borderRadius: 12, padding: 3, gap: 2 }}>
            {papers.map((p) => (
              <span
                key={p.value}
                onClick={() => updateParams({ paper: p.value, page: 1 })}
                style={{
                  padding: "0 12px", height: 36, display: "flex", alignItems: "center",
                  fontSize: 12, fontWeight: 800, borderRadius: 9, cursor: "pointer",
                  background: paper === p.value ? T.indigo : "transparent",
                  color: paper === p.value ? "#FFFFFF" : T.indigo,
                }}
              >
                {p.label}
              </span>
            ))}
          </div>
        </div>
        {(year || paper) && (
          <a onClick={clearFilters} style={{ fontSize: 12, color: T.indigo, fontWeight: 600, cursor: "pointer", alignSelf: "flex-end" }}>
            வடிகட்டிகளை அழி
          </a>
        )}
      </div>

      {/* Card list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 90px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading && (
          <div style={{ padding: 32, textAlign: "center", color: T.textSec, fontSize: 13 }}>ஏற்றுகிறது...</div>
        )}

        {!loading && questions.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: T.textSec, fontSize: 13 }}>இந்த வடிகட்டிகளுக்கு பொருந்தும் வினாக்கள் இல்லை.</div>
        )}

        {!loading && questions.map((q) => (
          <div
            key={q.id}
            onClick={() => openQuestion(q.id)}
            style={{
              background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 16,
              padding: "14px 12px 14px 15px", boxShadow: shadow.sm, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, color: T.text, lineHeight: 1.45 }}>{q.question}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 10.5, fontWeight: 800, color: T.textTer, textTransform: "uppercase", letterSpacing: "0.04em", flexShrink: 0 }}>
                  {q.lang === "ta" ? "பதில்" : "Answer"}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.green, lineHeight: 1.4 }}>{q.correct_option}</span>
              </div>
            </div>
            {CHEVRON}
          </div>
        ))}

        {/* Pagination */}
        {!loading && total > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 4px 4px" }}>
            <span style={{ fontSize: 12, color: T.textSec, fontWeight: 600 }}>{from}–{to} / {total}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => updateParams({ page: Math.max(1, page - 1) })}
                disabled={page <= 1}
                style={{ padding: "9px 16px", fontSize: 13, fontWeight: 700, border: `1.5px solid ${T.border}`, background: T.surface, color: page <= 1 ? T.textTer : T.textSec, borderRadius: 11, fontFamily: "inherit", cursor: page <= 1 ? "default" : "pointer" }}
              >
                முந்தைய
              </button>
              <button
                onClick={() => updateParams({ page: Math.min(totalPages, page + 1) })}
                disabled={page >= totalPages}
                style={{ padding: "9px 16px", fontSize: 13, fontWeight: 700, border: `1.5px solid ${T.indigoMid}`, background: T.surface, color: page >= totalPages ? T.textTer : T.indigo, borderRadius: 11, fontFamily: "inherit", cursor: page >= totalPages ? "default" : "pointer" }}
              >
                அடுத்த
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FAB: add new question */}
      <div
        onClick={() => router.push("/admin/pyq-correct/new")}
        style={{
          position: "fixed", right: 18, bottom: 26, width: 56, height: 56, borderRadius: "50%",
          background: T.indigo, boxShadow: shadow.indigo, display: "flex", alignItems: "center",
          justifyContent: "center", cursor: "pointer",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" /></svg>
      </div>
    </div>
  );
}

export default function PyqCorrectListPage() {
  return (
    <Suspense fallback={null}>
      <PyqCorrectListPageInner />
    </Suspense>
  );
}
