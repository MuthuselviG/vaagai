"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { T, shadow } from "../../lib/tokens";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Question = {
  id: string;
  question: string;
  correct_option: string;
  explanation: string | null;
  subject: string | null;
  topic: string | null;
  priority_order: number | null;
  published_date: string;
};

const SUBJECT_COLOR: Record<string, { bg: string; color: string }> = {
  "Administration": { bg: T.indigoLight, color: T.indigo },
  "Polity":         { bg: T.indigoLight, color: T.indigo },
  "Economy":        { bg: "#E8F8F0", color: T.green },
  "Science":        { bg: "#FEF3C7", color: "#92400E" },
  "Sports":         { bg: "#FDE8F0", color: "#9D174D" },
  "International":  { bg: "#F3E8FF", color: "#6B21A8" },
};

function getSubjectStyle(subject: string | null) {
  if (!subject) return { bg: T.indigoLight, color: T.indigo };
  return SUBJECT_COLOR[subject] ?? { bg: T.indigoLight, color: T.indigo };
}

function toISODate(d: Date) {
  return d.toISOString().split("T")[0];
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(toISODate(d));
  }
  return days; // today first
}

function formatDayLabel(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase();
}

function formatDayNum(iso: string) {
  return new Date(iso + "T00:00:00").getDate();
}

function getMonthLabel(iso: string, lang: "en" | "ta") {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", { month: "long", year: "numeric" });
}

function getMonthParam(iso: string) {
  return iso.slice(0, 7); // YYYY-MM
}

export default function CurrentAffairsPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "ta">("ta");
  const [selectedDate, setSelectedDate] = useState(toISODate(new Date()));
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCal, setShowCal] = useState(false);
  const [calMonth, setCalMonth] = useState(() => toISODate(new Date()).slice(0, 7));
  const [datesWithContent, setDatesWithContent] = useState<Set<string>>(new Set());

  const last7 = getLast7Days();

  // Load lang from localStorage (fallback for non-logged-in users)
  useEffect(() => {
    const stored = localStorage.getItem("lang");
    if (stored === "en" || stored === "ta") setLang(stored);
  }, []);

  // Fetch dates that have content for the current calendar month
  useEffect(() => {
    async function fetchDates() {
      const start = calMonth + "-01";
      const end = calMonth + "-31";
      const { data } = await supabase
        .from("questions")
        .select("published_date")
        .eq("source_type", "current_affairs")
        .eq("lang", "ta")
        .gte("published_date", start)
        .lte("published_date", end);
      if (data) {
        setDatesWithContent(new Set(data.map((r: any) => r.published_date)));
      }
    }
    fetchDates();
  }, [calMonth]);

  // Fetch questions for selected date
  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      const { data } = await supabase
        .from("questions")
        .select("id, question, correct_option, explanation, subject, topic, priority_order, published_date")
        .eq("source_type", "current_affairs")
        .eq("published_date", selectedDate)
        .eq("lang", lang)
        .order("priority_order", { ascending: true });
      setQuestions(data ?? []);
      setLoading(false);
    }
    fetchQuestions();
  }, [selectedDate, lang]);

  // Calendar helpers
  function getCalDays() {
    const [y, m] = calMonth.split("-").map(Number);
    const firstDay = new Date(y, m - 1, 1).getDay();
    const daysInMonth = new Date(y, m, 0).getDate();
    return { firstDay, daysInMonth };
  }

  function prevMonth() {
    const [y, m] = calMonth.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    setCalMonth(toISODate(d).slice(0, 7));
  }

  function nextMonth() {
    const [y, m] = calMonth.split("-").map(Number);
    const d = new Date(y, m, 1);
    const next = toISODate(d).slice(0, 7);
    if (next <= toISODate(new Date()).slice(0, 7)) setCalMonth(next);
  }

  const { firstDay, daysInMonth } = getCalDays();
  const todayISO = toISODate(new Date());
  const isToday = selectedDate === todayISO;

  return (
    <main style={{ width: "100%", background: T.bg, paddingBottom: 100 }}>

      {/* HERO */}
      <div style={{ background: `linear-gradient(135deg, ${T.indigoDark} 0%, ${T.indigo} 100%)`, padding: "20px 20px 24px" }}>

        {/* back + lang */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div onClick={() => router.back()} style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer" }}>← {lang === "ta" ? "முகப்பு" : "Home"}</div>
          <div style={{ display: "flex", background: "rgba(255,255,255,0.12)", borderRadius: 20, padding: 3, gap: 2 }}>
            {(["ta", "en"] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ padding: "4px 12px", borderRadius: 16, border: "none", background: lang === l ? "white" : "transparent", color: lang === l ? T.indigo : "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                {l === "ta" ? "தமிழ்" : "EN"}
              </button>
            ))}
          </div>
        </div>

        {/* title */}
        <div style={{ color: "white", fontSize: 22, fontWeight: 800, lineHeight: 1.2, marginBottom: 2 }}>
          {lang === "ta"
            ? <span>இன்றைய <span style={{ color: "#FDE68A" }}>நடப்பு நிகழ்வுகள்</span></span>
            : <span>Today's <span style={{ color: "#FDE68A" }}>Current Affairs</span></span>}
        </div>
        <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginBottom: 16 }}>
          {lang === "ta" ? "Today's Current Affairs" : "நடப்பு நிகழ்வுகள்"} · TNPSC Group 4
        </div>

        {/* date strip — today first */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
          {last7.map(date => {
            const isSelected = date === selectedDate;
            return (
              <div
                key={date}
                onClick={() => setSelectedDate(date)}
                style={{ flexShrink: 0, minWidth: 52, padding: "7px 10px", borderRadius: 12, background: isSelected ? "white" : "rgba(255,255,255,0.12)", border: `1.5px solid ${isSelected ? "white" : "rgba(255,255,255,0.18)"}`, cursor: "pointer", textAlign: "center" }}
              >
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: isSelected ? T.indigo : "rgba(255,255,255,0.5)" }}>
                  {formatDayLabel(date)}
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: isSelected ? T.indigo : "white", lineHeight: 1.1 }}>
                  {formatDayNum(date)}
                </div>
                {date === todayISO && (
                  <div style={{ width: 5, height: 5, background: "#4ADE80", borderRadius: "50%", margin: "3px auto 0" }} />
                )}
              </div>
            );
          })}

          {/* More / calendar toggle */}
          <div
            onClick={() => setShowCal(!showCal)}
            style={{ flexShrink: 0, minWidth: 48, padding: "7px 10px", borderRadius: 12, background: showCal ? "white" : "rgba(255,255,255,0.1)", border: `1.5px solid ${showCal ? "white" : "rgba(255,255,255,0.18)"}`, cursor: "pointer", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}
          >
            <div style={{ fontSize: 14 }}>📅</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: showCal ? T.indigo : "rgba(255,255,255,0.6)" }}>More</div>
          </div>
        </div>

        {/* Calendar dropdown */}
        {showCal && (
          <div style={{ marginTop: 12, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div onClick={prevMonth} style={{ color: "rgba(255,255,255,0.7)", fontSize: 18, cursor: "pointer", padding: "2px 8px" }}>‹</div>
              <div style={{ color: "white", fontSize: 13, fontWeight: 700 }}>{getMonthLabel(calMonth + "-01", lang)}</div>
              <div onClick={nextMonth} style={{ color: calMonth < todayISO.slice(0, 7) ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)", fontSize: 18, cursor: "pointer", padding: "2px 8px" }}>›</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, textAlign: "center" }}>
              {["S","M","T","W","T","F","S"].map((d, i) => (
                <div key={i} style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, fontWeight: 700, paddingBottom: 6 }}>{d}</div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const iso = `${calMonth}-${String(dayNum).padStart(2, "0")}`;
                const hasContent = datesWithContent.has(iso);
                const isSelected = iso === selectedDate;
                const isFuture = iso > todayISO;
                return (
                  <div
                    key={dayNum}
                    onClick={() => { if (hasContent && !isFuture) { setSelectedDate(iso); setShowCal(false); } }}
                    style={{
                      fontSize: 12, padding: "5px 0", borderRadius: 6,
                      background: isSelected ? "white" : hasContent && !isFuture ? "rgba(255,255,255,0.2)" : "transparent",
                      color: isSelected ? T.indigo : isFuture ? "rgba(255,255,255,0.15)" : hasContent ? "white" : "rgba(255,255,255,0.25)",
                      fontWeight: isSelected || hasContent ? 700 : 400,
                      cursor: hasContent && !isFuture ? "pointer" : "default",
                    }}
                  >
                    {dayNum}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div style={{ padding: "16px 16px 0" }}>

        {/* Challenge button */}
        <button
          onClick={() => router.push(`/practice/current-affairs/daily?date=${selectedDate}&lang=${lang}`)}
          style={{ width: "100%", background: `linear-gradient(135deg, ${T.indigo}, ${T.indigoDark})`, color: "white", border: "none", borderRadius: 14, padding: "14px", fontSize: 15, fontWeight: 800, cursor: "pointer", marginBottom: 10, boxShadow: shadow.indigo, fontFamily: "inherit" }}
        >
          தைரியமா டெஸ்ட் எடு! 🔥
        </button>

        {/* Monthly practice */}
        <div
          onClick={() => router.push(`/practice/current-affairs/monthly?month=${getMonthParam(selectedDate)}&lang=${lang}`)}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: "12px 16px", marginBottom: 20, cursor: "pointer", boxShadow: shadow.sm }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
              {lang === "ta" ? `${getMonthLabel(selectedDate, lang)} முழுவதும் பயிற்சி செய்` : `Practice all of ${getMonthLabel(selectedDate, lang)}`}
            </div>
            <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>
              {lang === "ta" ? "அனைத்து வினாக்களும்" : "All questions this month"}
            </div>
          </div>
          <div style={{ background: T.indigoLight, color: T.indigo, borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 700 }}>
            {lang === "ta" ? "தொடங்கு →" : "Start →"}
          </div>
        </div>

        {/* Fact sheet header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>
            {isToday
              ? (lang === "ta" ? "இன்றைய Fact Sheet" : "Today's Fact Sheet")
              : (lang === "ta" ? `${formatDayNum(selectedDate)} — Fact Sheet` : `${formatDayNum(selectedDate)} — Fact Sheet`)}
          </div>
          <div style={{ fontSize: 12, color: T.textSec, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 20, padding: "3px 10px" }}>
            {questions.length} {lang === "ta" ? "வினாக்கள்" : "facts"}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0", color: T.textTer, fontSize: 14 }}>
            {lang === "ta" ? "ஏற்றுகிறது..." : "Loading..."}
          </div>
        )}

        {/* No content */}
        {!loading && questions.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.textSec }}>
              {lang === "ta" ? "இந்த நாளுக்கு வினாக்கள் இல்லை" : "No questions for this date"}
            </div>
          </div>
        )}

        {/* Fact cards */}
        {!loading && questions.map((q, i) => {
          const style = getSubjectStyle(q.subject);
          return (
            <div key={q.id} style={{ background: T.surface, borderRadius: 16, padding: 16, marginBottom: 10, boxShadow: shadow.sm, border: `1.5px solid ${T.border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: 0.3, textTransform: "uppercase", background: style.bg, color: style.color }}>
                  {q.subject ?? "General"}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.textTer }}>#{i + 1}</span>
              </div>

              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, lineHeight: 1.45, marginBottom: 10 }}>
                {q.question}
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: T.greenBg, border: `1.5px solid ${T.greenBorder}`, borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.green }}>{q.correct_option}</div>
                  {q.explanation && (
                    <div style={{ fontSize: 11, color: T.textSec, marginTop: 5, lineHeight: 1.4 }}>{q.explanation}</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div style={{ height: 20 }} />
      </div>
    </main>
  );
}
