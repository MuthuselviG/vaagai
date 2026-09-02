"use client";

import { useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { APC } from "@/lib/adminPyqTokens";

export type QuestionFormValue = {
  question: string;
  options: string[];
  correct_option: string;
  explanation: string;
  subject: string;
  topic: string;
  lang: "en" | "ta";
  pyq_years: number[];
  pyq_groups: string[];
  status: string;
};

const EMPTY_VALUE: QuestionFormValue = {
  question: "",
  options: ["", "", "", ""],
  correct_option: "",
  explanation: "",
  subject: "",
  topic: "",
  lang: "en",
  pyq_years: [],
  pyq_groups: [],
  status: "approved",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  fontSize: 13,
  border: `1px solid ${APC.border}`,
  borderRadius: 4,
  color: APC.text,
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const cardStyle: CSSProperties = {
  background: APC.surface,
  border: `1px solid ${APC.border}`,
  borderRadius: 6,
  padding: "16px 18px",
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.03em",
  color: APC.textTer,
  textTransform: "uppercase",
  marginBottom: 8,
};

function ChipList({
  items,
  onRemove,
}: {
  items: (string | number)[];
  onRemove: (item: string | number) => void;
}) {
  if (items.length === 0) {
    return <div style={{ fontSize: 12, color: APC.textTer, marginBottom: 8 }}>None yet</div>;
  }
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
      {items.map((item) => (
        <span
          key={item}
          style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, background: APC.chipBg, color: APC.chipText, padding: "4px 6px 4px 10px", borderRadius: 12 }}
        >
          {item}
          <span onClick={() => onRemove(item)} style={{ color: APC.textTer, cursor: "pointer", fontWeight: 700 }}>×</span>
        </span>
      ))}
    </div>
  );
}

export default function QuestionForm({
  questionId,
  initialValue,
}: {
  questionId?: string;
  initialValue?: QuestionFormValue;
}) {
  const router = useRouter();
  const isEdit = Boolean(questionId);
  const [value, setValue] = useState<QuestionFormValue>(initialValue ?? EMPTY_VALUE);
  const [yearInput, setYearInput] = useState("");
  const [groupInput, setGroupInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof QuestionFormValue>(key: K, val: QuestionFormValue[K]) {
    setValue((v) => ({ ...v, [key]: val }));
  }

  function setOption(index: number, text: string) {
    setValue((v) => {
      const options = [...v.options];
      const prev = options[index];
      options[index] = text;
      const correct_option = v.correct_option === prev ? text : v.correct_option;
      return { ...v, options, correct_option };
    });
  }

  function addYear() {
    const y = parseInt(yearInput);
    if (!yearInput || isNaN(y)) return;
    if (!value.pyq_years.includes(y)) set("pyq_years", [...value.pyq_years, y].sort((a, b) => a - b));
    setYearInput("");
  }

  function addGroup() {
    const g = groupInput.trim();
    if (!g) return;
    if (!value.pyq_groups.includes(g)) set("pyq_groups", [...value.pyq_groups, g]);
    setGroupInput("");
  }

  async function handleSave() {
    setError("");

    if (!value.question.trim()) return setError("Question text is required.");
    if (value.options.some((o) => !o.trim())) return setError("All four options are required.");
    if (!value.correct_option) return setError("Select the correct option.");
    if (!value.subject.trim()) return setError("Subject is required.");

    setSaving(true);
    const payload = {
      question: value.question,
      options: value.options,
      correct_option: value.correct_option,
      explanation: value.explanation || null,
      subject: value.subject,
      topic: value.topic || null,
      lang: value.lang,
      pyq_years: value.pyq_years.length > 0 ? value.pyq_years : null,
      pyq_groups: value.pyq_groups.length > 0 ? value.pyq_groups : null,
      ...(isEdit ? { status: value.status } : {}),
    };

    const res = await fetch(
      isEdit ? `/api/admin/pyq-correct/questions/${questionId}` : "/api/admin/pyq-correct/questions",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to save question.");
      return;
    }

    router.push("/admin/pyq-correct");
  }

  return (
    <div style={{ minHeight: "100vh", background: APC.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: APC.surface, borderBottom: `1px solid ${APC.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <a onClick={() => router.push("/admin/pyq-correct")} style={{ fontSize: 13, color: APC.accent, cursor: "pointer" }}>← Back to list</a>
          <span style={{ width: 1, height: 14, background: APC.border }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: APC.text }}>{isEdit ? "Edit question" : "New question"}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => router.push("/admin/pyq-correct")}
            style={{ padding: "8px 16px", background: APC.surface, color: "#475467", border: `1px solid ${APC.border}`, borderRadius: 4, fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: "8px 16px", background: APC.accent, color: "#FFFFFF", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ margin: "16px 24px 0", padding: "10px 14px", background: APC.redBg, color: APC.red, borderRadius: 4, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Body */}
      <div style={{ display: "flex", gap: 16, padding: "20px 24px", maxWidth: 1320, alignItems: "flex-start" }}>
        {/* Main column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <div style={cardStyle}>
            <label style={labelStyle}>Question text</label>
            <textarea
              rows={3}
              value={value.question}
              onChange={(e) => set("question", e.target.value)}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
            />
          </div>

          <div style={cardStyle}>
            <label style={labelStyle}>Options — select the correct one</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {value.options.map((opt, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: APC.chipBg, color: APC.textSec, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => setOption(i, e.target.value)}
                    style={{
                      ...inputStyle,
                      flex: 1,
                      borderColor: value.correct_option === opt && opt ? APC.green : APC.border,
                      background: value.correct_option === opt && opt ? APC.greenBg : APC.surface,
                    }}
                  />
                  <input
                    type="radio"
                    name="correct_option"
                    checked={value.correct_option === opt && opt !== ""}
                    onChange={() => set("correct_option", opt)}
                    disabled={!opt.trim()}
                    style={{ width: 16, height: 16, accentColor: APC.green, flexShrink: 0 }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={cardStyle}>
            <label style={labelStyle}>Explanation</label>
            <textarea
              rows={4}
              value={value.explanation}
              onChange={(e) => set("explanation", e.target.value)}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ width: 340, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={cardStyle}>
            <label style={labelStyle}>Language</label>
            <div style={{ display: "flex", border: `1px solid ${APC.border}`, borderRadius: 4, overflow: "hidden", width: "fit-content" }}>
              {(["en", "ta"] as const).map((l) => (
                <span
                  key={l}
                  onClick={() => set("lang", l)}
                  style={{
                    padding: "6px 16px",
                    fontSize: 12,
                    fontWeight: 600,
                    background: value.lang === l ? APC.accent : APC.surface,
                    color: value.lang === l ? "#FFFFFF" : APC.textSec,
                    cursor: "pointer",
                  }}
                >
                  {l.toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Subject</label>
              <input type="text" value={value.subject} onChange={(e) => set("subject", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Topic</label>
              <input type="text" value={value.topic} onChange={(e) => set("topic", e.target.value)} style={inputStyle} />
            </div>
            {isEdit && (
              <div>
                <label style={labelStyle}>Status</label>
                <select value={value.status} onChange={(e) => set("status", e.target.value)} style={{ ...inputStyle, background: APC.surface }}>
                  <option value="draft">Draft</option>
                  <option value="approved">Approved</option>
                </select>
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <label style={labelStyle}>Year(s) — appeared in</label>
            <ChipList items={value.pyq_years} onRemove={(y) => set("pyq_years", value.pyq_years.filter((x) => x !== y))} />
            <div style={{ display: "flex", gap: 6 }}>
              <input
                type="number"
                value={yearInput}
                onChange={(e) => setYearInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addYear())}
                placeholder="e.g. 2021"
                style={{ ...inputStyle, fontSize: 12 }}
              />
              <button onClick={addYear} style={{ padding: "7px 12px", fontSize: 12, border: `1px solid ${APC.border}`, background: APC.surfaceAlt, borderRadius: 4, cursor: "pointer", color: APC.textSec, whiteSpace: "nowrap" }}>
                Add
              </button>
            </div>
          </div>

          <div style={cardStyle}>
            <label style={labelStyle}>Group(s) — appeared in</label>
            <ChipList items={value.pyq_groups} onRemove={(g) => set("pyq_groups", value.pyq_groups.filter((x) => x !== g))} />
            <div style={{ display: "flex", gap: 6 }}>
              <input
                type="text"
                value={groupInput}
                onChange={(e) => setGroupInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGroup())}
                placeholder="e.g. group4"
                style={{ ...inputStyle, fontSize: 12 }}
              />
              <button onClick={addGroup} style={{ padding: "7px 12px", fontSize: 12, border: `1px solid ${APC.border}`, background: APC.surfaceAlt, borderRadius: 4, cursor: "pointer", color: APC.textSec, whiteSpace: "nowrap" }}>
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
