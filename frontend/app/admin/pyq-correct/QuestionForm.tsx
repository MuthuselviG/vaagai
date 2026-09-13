"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { T, shadow } from "@/lib/tokens";

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
  padding: "0 13px",
  height: 44,
  fontSize: 14,
  border: `1.5px solid ${T.border}`,
  borderRadius: 12,
  color: T.text,
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const textareaStyle: CSSProperties = {
  width: "100%",
  padding: "11px 13px",
  fontSize: 14,
  border: `1.5px solid ${T.indigoMid}`,
  borderRadius: 12,
  color: T.text,
  fontFamily: "inherit",
  lineHeight: 1.5,
  resize: "vertical",
  boxSizing: "border-box",
};

const cardStyle: CSSProperties = {
  background: T.surface,
  border: `1.5px solid ${T.border}`,
  borderRadius: 18,
  padding: 16,
  boxShadow: shadow.sm,
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.03em",
  color: T.textTer,
  textTransform: "uppercase",
  marginBottom: 9,
};

function ChipList({
  items,
  onRemove,
}: {
  items: (string | number)[];
  onRemove: (item: string | number) => void;
}) {
  if (items.length === 0) {
    return <div style={{ fontSize: 12, color: T.textTer, marginBottom: 8 }}>இதுவரை இல்லை</div>;
  }
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 8 }}>
      {items.map((item) => (
        <span
          key={item}
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, background: T.indigoLight, color: T.indigo, padding: "6px 8px 6px 12px", borderRadius: 20 }}
        >
          {item}
          <span onClick={() => onRemove(item)} style={{ color: T.textTer, cursor: "pointer", fontWeight: 800 }}>×</span>
        </span>
      ))}
    </div>
  );
}

export default function QuestionForm({
  questionId,
  initialValue,
  hasOriginalVersion,
  nextHref,
  listHref = "/admin/pyq-correct",
  queuePosition,
}: {
  questionId?: string;
  initialValue?: QuestionFormValue;
  hasOriginalVersion?: boolean;
  nextHref?: string | null;
  listHref?: string;
  queuePosition?: { position: number; total: number } | null;
}) {
  const router = useRouter();
  const isEdit = Boolean(questionId);
  const [value, setValue] = useState<QuestionFormValue>(initialValue ?? EMPTY_VALUE);
  const [yearInput, setYearInput] = useState("");
  const [groupInput, setGroupInput] = useState("");
  const [saving, setSaving] = useState<"next" | "list" | false>(false);
  const [restoring, setRestoring] = useState(false);
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

  async function handleSave(goTo: "next" | "list") {
    setError("");

    if (!value.question.trim()) return setError("வினா உரை தேவை.");
    if (value.options.some((o) => !o.trim())) return setError("நான்கு விடைகளும் தேவை.");
    if (!value.correct_option) return setError("சரியான விடையைத் தேர்ந்தெடுக்கவும்.");
    if (!value.subject.trim()) return setError("பாடம் தேவை.");

    setSaving(goTo);
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
      setError(`வினாவைச் சேமிக்க முடியவில்லை${data.error ? `: ${data.error}` : ""}`);
      return;
    }

    if (goTo === "next" && nextHref) {
      router.push(nextHref);
    } else {
      router.push(listHref);
    }
  }

  async function handleRestoreOriginal() {
    if (!questionId) return;
    if (!window.confirm("மூல வினாவை மீட்டமைக்கவா? தற்போதைய திருத்தங்கள் இழக்கப்படும்.")) return;

    setError("");
    setRestoring(true);
    const res = await fetch(`/api/admin/pyq-correct/questions/${questionId}/restore`, {
      method: "POST",
    });
    const data = await res.json();
    setRestoring(false);

    if (!res.ok) {
      setError(`மீட்டமைக்க முடியவில்லை${data.error ? `: ${data.error}` : ""}`);
      return;
    }

    const q = data.question;
    setValue({
      question: q.question ?? "",
      options: Array.isArray(q.options) ? q.options : ["", "", "", ""],
      correct_option: q.correct_option ?? "",
      explanation: q.explanation ?? "",
      subject: q.subject ?? "",
      topic: q.topic ?? "",
      lang: q.lang === "ta" ? "ta" : "en",
      pyq_years: q.pyq_years ?? [],
      pyq_groups: q.pyq_groups ?? [],
      status: q.status ?? "approved",
    });
  }

  const optionLetterBg = (isCorrect: boolean) => (isCorrect ? T.greenBg : T.indigoLight);
  const optionLetterColor = (isCorrect: boolean) => (isCorrect ? T.green : T.indigo);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "var(--font-noto-sans-tamil), var(--font-inter), sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ flexShrink: 0, background: T.surface, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
        <a onClick={() => router.push(listHref)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: 11, background: T.bg, border: `1px solid ${T.border}`, flexShrink: 0, cursor: "pointer" }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 13.5L6.5 9 11 4.5" stroke={T.text} strokeWidth={2} strokeLinecap="round" /></svg>
        </a>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{isEdit ? "வினாவைத் திருத்து" : "புதிய வினா"}</div>
          {isEdit && queuePosition && (
            <div style={{ fontSize: 11.5, color: T.textTer, marginTop: 1, fontWeight: 600 }}>
              வினா {queuePosition.position} / {queuePosition.total}
            </div>
          )}
        </div>
        {isEdit && hasOriginalVersion && (
          <a
            onClick={handleRestoreOriginal}
            style={{ fontSize: 11.5, fontWeight: 700, color: "#B45309", cursor: restoring ? "default" : "pointer", opacity: restoring ? 0.6 : 1, flexShrink: 0, textAlign: "right" }}
          >
            {restoring ? "மீட்டமைக்கிறது..." : "மூலத்தை மீட்டமை"}
          </a>
        )}
      </div>
      {isEdit && queuePosition && (
        <div style={{ flexShrink: 0, height: 4, background: T.indigoLight }}>
          <div style={{ width: `${Math.min(100, (queuePosition.position / Math.max(1, queuePosition.total)) * 100)}%`, height: "100%", background: T.indigo, borderRadius: "0 3px 3px 0" }} />
        </div>
      )}

      {error && (
        <div style={{ margin: "12px 16px 0", padding: "10px 14px", background: T.redBg, color: T.red, borderRadius: 12, fontSize: 13, fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={cardStyle}>
          <label style={labelStyle}>வினா உரை</label>
          <textarea
            rows={3}
            value={value.question}
            onChange={(e) => set("question", e.target.value)}
            style={textareaStyle}
          />
        </div>

        <div style={cardStyle}>
          <label style={labelStyle}>விடைகள் — சரியானதைத் தேர்ந்தெடுக்கவும்</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {value.options.map((opt, i) => {
              const isCorrect = value.correct_option === opt && opt !== "";
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 9, background: optionLetterBg(isCorrect), color: optionLetterColor(isCorrect), fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => setOption(i, e.target.value)}
                    style={{
                      ...inputStyle,
                      flex: 1,
                      minWidth: 0,
                      borderColor: isCorrect ? T.greenBorder : T.border,
                      background: isCorrect ? T.greenBg : T.surface,
                    }}
                  />
                  <input
                    type="radio"
                    name="correct_option"
                    checked={isCorrect}
                    onChange={() => set("correct_option", opt)}
                    disabled={!opt.trim()}
                    style={{ width: 21, height: 21, accentColor: T.green, flexShrink: 0 }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div style={cardStyle}>
          <label style={labelStyle}>விளக்கம்</label>
          <textarea
            rows={3}
            value={value.explanation}
            onChange={(e) => set("explanation", e.target.value)}
            style={textareaStyle}
          />
        </div>

        <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label style={labelStyle}>பாடம்</label>
              <input type="text" value={value.subject} onChange={(e) => set("subject", e.target.value)} style={inputStyle} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label style={labelStyle}>மொழி</label>
              <div style={{ display: "flex", background: T.indigoLight, borderRadius: 12, padding: 3, height: 44 }}>
                {(["ta", "en"] as const).map((l) => (
                  <span
                    key={l}
                    onClick={() => set("lang", l)}
                    style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12.5, fontWeight: 800, borderRadius: 9, cursor: "pointer",
                      background: value.lang === l ? T.indigo : "transparent",
                      color: value.lang === l ? "#FFFFFF" : T.indigo,
                    }}
                  >
                    {l.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>தலைப்பு</label>
            <input type="text" value={value.topic} onChange={(e) => set("topic", e.target.value)} style={inputStyle} />
          </div>

          {isEdit && (
            <div>
              <label style={labelStyle}>நிலை</label>
              <select value={value.status} onChange={(e) => set("status", e.target.value)} style={{ ...inputStyle, background: T.surface, fontWeight: 600 }}>
                <option value="draft">வரைவு</option>
                <option value="approved">அங்கீகரிக்கப்பட்டது</option>
              </select>
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <label style={labelStyle}>ஆண்டு(கள்)</label>
          <ChipList items={value.pyq_years} onRemove={(y) => set("pyq_years", value.pyq_years.filter((x) => x !== y))} />
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="number"
              value={yearInput}
              onChange={(e) => setYearInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addYear())}
              placeholder="எ.கா. 2021"
              style={{ ...inputStyle, flex: 1, minWidth: 0, height: 40, fontSize: 13 }}
            />
            <button onClick={addYear} style={{ padding: "0 16px", height: 40, fontSize: 13, fontWeight: 700, border: `1.5px solid ${T.indigoMid}`, background: T.indigoLight, borderRadius: 11, cursor: "pointer", color: T.indigo, whiteSpace: "nowrap" }}>
              சேர்
            </button>
          </div>
        </div>

        <div style={cardStyle}>
          <label style={labelStyle}>குரூப்(கள்)</label>
          <ChipList items={value.pyq_groups} onRemove={(g) => set("pyq_groups", value.pyq_groups.filter((x) => x !== g))} />
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={groupInput}
              onChange={(e) => setGroupInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGroup())}
              placeholder="எ.கா. group4"
              style={{ ...inputStyle, flex: 1, minWidth: 0, height: 40, fontSize: 13 }}
            />
            <button onClick={addGroup} style={{ padding: "0 16px", height: 40, fontSize: 13, fontWeight: 700, border: `1.5px solid ${T.indigoMid}`, background: T.indigoLight, borderRadius: 11, cursor: "pointer", color: T.indigo, whiteSpace: "nowrap" }}>
              சேர்
            </button>
          </div>
        </div>
      </div>

      {/* Sticky bottom action bar */}
      <div style={{ flexShrink: 0, background: T.surface, borderTop: `1px solid ${T.border}`, padding: "12px 16px 18px", display: "flex", flexDirection: "column", gap: 9 }}>
        <button
          onClick={() => handleSave(isEdit && nextHref ? "next" : "list")}
          disabled={!!saving}
          style={{
            width: "100%", height: 52, background: T.indigo, color: "#FFFFFF", border: "none",
            borderRadius: 14, fontSize: 15, fontWeight: 800, fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: shadow.indigo, cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1,
          }}
        >
          {saving === "next" || saving === "list"
            ? "சேமிக்கிறது..."
            : isEdit && nextHref
              ? (
                <>
                  சேமித்து அடுத்தது
                  <ArrowIcon />
                </>
              )
              : isEdit
                ? "மாற்றங்களைச் சேமி"
                : "வினாவைச் சேமி"}
        </button>
        {isEdit && nextHref && (
          <a onClick={() => !saving && handleSave("list")} style={{ textAlign: "center", fontSize: 13, color: T.textSec, fontWeight: 600, cursor: saving ? "default" : "pointer" }}>
            சேமித்து பட்டியலுக்குத் திரும்பு
          </a>
        )}
      </div>
    </div>
  );
}

function ArrowIcon(): ReactNode {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 4.5L11.5 9 7 13.5" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" /></svg>
  );
}
