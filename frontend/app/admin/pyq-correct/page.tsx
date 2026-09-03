"use client";

import { useEffect, useState, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { APC } from "@/lib/adminPyqTokens";

type QuestionRow = {
  id: string;
  question: string;
  subject: string;
  topic: string | null;
  pyq_years: number[] | null;
  pyq_groups: string[] | null;
  lang: "en" | "ta";
  status: string | null;
  report_count: number | null;
};

type Filters = { subjects: string[]; years: number[]; groups: string[] };

const PAGE_SIZE = 20;

function Chip({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        fontSize: 11,
        background: APC.chipBg,
        color: APC.chipText,
        padding: "2px 7px",
        borderRadius: 10,
      }}
    >
      {children}
    </span>
  );
}

function StatusBadge({ status, reportCount }: { status: string | null; reportCount: number | null }) {
  if (reportCount && reportCount > 0) {
    return (
      <span style={{ fontSize: 11, fontWeight: 600, background: APC.redBg, color: APC.red, padding: "3px 8px", borderRadius: 10, width: "fit-content" }}>
        புகார் · {reportCount}
      </span>
    );
  }
  if (status === "approved") {
    return (
      <span style={{ fontSize: 11, fontWeight: 600, background: APC.greenBg, color: APC.green, padding: "3px 8px", borderRadius: 10, width: "fit-content" }}>
        அங்கீகரிக்கப்பட்டது
      </span>
    );
  }
  return (
    <span style={{ fontSize: 11, fontWeight: 600, background: APC.chipBg, color: APC.textSec, padding: "3px 8px", borderRadius: 10, width: "fit-content" }}>
      வரைவு
    </span>
  );
}

const selectStyle: React.CSSProperties = {
  padding: "7px 8px",
  fontSize: 13,
  border: `1px solid ${APC.border}`,
  borderRadius: 4,
  color: APC.text,
  fontFamily: "inherit",
  background: APC.surface,
};

export default function PyqCorrectListPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>({ subjects: [], years: [], groups: [] });
  const [year, setYear] = useState("");
  const [group, setGroup] = useState("");
  const [lang, setLang] = useState("");
  const [subject, setSubject] = useState("");
  const [page, setPage] = useState(1);
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
    if (group) params.set("group", group);
    if (lang) params.set("lang", lang);
    if (subject) params.set("subject", subject);
    params.set("page", String(page));

    const res = await fetch(`/api/admin/pyq-correct/questions?${params}`);
    const data = await res.json();
    setQuestions(data.questions ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [year, group, lang, subject, page]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  function clearFilters() {
    setYear("");
    setGroup("");
    setLang("");
    setSubject("");
    setPage(1);
  }

  async function handleLogout() {
    await fetch("/api/admin/pyq-correct/login", { method: "DELETE" });
    router.push("/admin/pyq-correct/login");
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div style={{ minHeight: "100vh", background: APC.bg, fontFamily: "var(--font-noto-sans-tamil), var(--font-inter), sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: APC.surface, borderBottom: `1px solid ${APC.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: APC.text }}>முன்னாள் வினாக்கள் திருத்தம்</span>
          <span style={{ fontSize: 11, color: APC.textTer, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
            /admin/pyq-correct
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={handleLogout}
            style={{ fontSize: 12, color: APC.textSec, background: "none", border: "none", cursor: "pointer" }}
          >
            வெளியேறு
          </button>
          <button
            onClick={() => router.push("/admin/pyq-correct/new")}
            style={{ padding: "8px 14px", background: APC.accent, color: "#FFFFFF", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}
          >
            + புதிய வினா சேர்
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ background: APC.surface, borderBottom: `1px solid ${APC.border}`, display: "flex", alignItems: "flex-end", gap: 14, padding: "12px 24px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 500, color: APC.textSec }}>ஆண்டு</label>
          <select value={year} onChange={(e) => { setYear(e.target.value); setPage(1); }} style={{ ...selectStyle, width: 120 }}>
            <option value="">அனைத்து ஆண்டுகளும்</option>
            {filters.years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 500, color: APC.textSec }}>குரூப்</label>
          <select value={group} onChange={(e) => { setGroup(e.target.value); setPage(1); }} style={{ ...selectStyle, width: 130 }}>
            <option value="">அனைத்து குரூப்களும்</option>
            {filters.groups.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 500, color: APC.textSec }}>மொழி</label>
          <select value={lang} onChange={(e) => { setLang(e.target.value); setPage(1); }} style={{ ...selectStyle, width: 110 }}>
            <option value="">ஆங்./த.</option>
            <option value="en">EN</option>
            <option value="ta">TA</option>
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 500, color: APC.textSec }}>பாடம்</label>
          <select value={subject} onChange={(e) => { setSubject(e.target.value); setPage(1); }} style={{ ...selectStyle, width: 220 }}>
            <option value="">அனைத்து பாடங்களும்</option>
            {filters.subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <a
          onClick={clearFilters}
          style={{ fontSize: 12, marginLeft: "auto", marginBottom: 8, textDecoration: "none", color: APC.accent, cursor: "pointer" }}
        >
          வடிகட்டிகளை அழி
        </a>
      </div>

      {/* Table panel */}
      <div style={{ margin: "16px 24px", background: APC.surface, border: `1px solid ${APC.border}`, borderRadius: 6, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 110px 130px 60px 92px 28px", gap: 8, padding: "10px 16px", background: APC.surfaceAlt, borderBottom: `1px solid ${APC.border}` }}>
          {["வினா", "பாடம்", "ஆண்டு(கள்)", "குரூப்(கள்)", "மொழி", "நிலை", ""].map((h) => (
            <span key={h} style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", color: APC.textTer, textTransform: "uppercase" }}>{h}</span>
          ))}
        </div>

        {loading && (
          <div style={{ padding: 32, textAlign: "center", color: APC.textSec, fontSize: 13 }}>ஏற்றுகிறது...</div>
        )}

        {!loading && questions.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: APC.textSec, fontSize: 13 }}>இந்த வடிகட்டிகளுக்கு பொருந்தும் வினாக்கள் இல்லை.</div>
        )}

        {!loading && questions.map((q, i) => (
          <div
            key={q.id}
            onClick={() => router.push(`/admin/pyq-correct/${q.id}`)}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 130px 110px 130px 60px 92px 28px",
              gap: 8,
              alignItems: "center",
              padding: "11px 16px",
              borderBottom: i === questions.length - 1 ? "none" : `1px solid ${APC.borderLight}`,
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 13, color: APC.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {q.question}
            </span>
            <span style={{ fontSize: 12, color: "#475467" }}>{q.subject}</span>
            <span style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {(q.pyq_years ?? []).length > 0 ? q.pyq_years!.map((y) => <Chip key={y}>{y}</Chip>) : <span style={{ color: APC.textTer, fontSize: 12 }}>—</span>}
            </span>
            <span style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {(q.pyq_groups ?? []).length > 0 ? q.pyq_groups!.map((g) => <Chip key={g}>{g}</Chip>) : <span style={{ color: APC.textTer, fontSize: 12 }}>—</span>}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, background: q.lang === "en" ? APC.accentBg : APC.amberBg, color: q.lang === "en" ? APC.accent : APC.amber, padding: "2px 8px", borderRadius: 3, width: "fit-content", fontFamily: "ui-monospace, monospace" }}>
              {q.lang.toUpperCase()}
            </span>
            <StatusBadge status={q.status} reportCount={q.report_count} />
            <span style={{ color: "#C4C9D4", fontSize: 15, textAlign: "right" }}>›</span>
          </div>
        ))}

        {/* Pagination */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderTop: `1px solid ${APC.border}` }}>
          <span style={{ fontSize: 12, color: APC.textSec }}>
            {total === 0 ? "முடிவுகள் இல்லை" : `${total} இல் ${from}–${to} காட்டப்படுகிறது`}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{ padding: "5px 10px", fontSize: 12, border: `1px solid ${APC.border}`, background: APC.surface, color: page <= 1 ? APC.textTer : "#475467", borderRadius: 4, fontFamily: "inherit", cursor: page <= 1 ? "default" : "pointer" }}
            >
              முந்தைய
            </button>
            <span style={{ padding: "5px 10px", fontSize: 12, color: APC.textSec }}>
              பக்கம் {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={{ padding: "5px 10px", fontSize: 12, border: `1px solid ${APC.border}`, background: APC.surface, color: page >= totalPages ? APC.textTer : "#475467", borderRadius: 4, fontFamily: "inherit", cursor: page >= totalPages ? "default" : "pointer" }}
            >
              அடுத்த
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
