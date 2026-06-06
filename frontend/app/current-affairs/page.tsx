"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { T, shadow } from "../../lib/tokens";
import QuestionText from "../../components/QuestionText";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type CAQuestion = {
  id: string;
  question: string;
  correct_option: string;
  explanation: string | null;
  topic: string | null;
  published_date: string;
};

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
  return days;
}

function formatDayLabel(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase();
}

function formatDayNum(iso: string) {
  return new Date(iso + "T00:00:00").getDate();
}

function getMonthLabel(iso: string, lang: "en" | "ta") {
  return new Date(iso + "T00:00:00").toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", { month: "long", year: "numeric" });
}

function getMonthParam(iso: string) {
  return iso.slice(0, 7);
}

export default function CurrentAffairsPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "ta">("ta");
  const [selectedDate, setSelectedDate] = useState(toISODate(new Date()));
  const [questions, setQuestions] = useState<CAQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCal, setShowCal] = useState(false);
  const [calMonth, setCalMonth] = useState(() => toISODate(new Date()).slice(0, 7));
  const [datesWithContent, setDatesWithContent] = useState<Set<string>>(new Set());

  const last7 = getLast7Days();
  const todayISO = toISODate(new Date());
  const isToday = selectedDate === todayISO;

  useEffect(() => {
    const stored = localStorage.getItem("lang");
    if (stored === "en" || stored === "ta") setLang(stored as "en" | "ta");
  }, []);

  useEffect(() => {
    async function fetchDates() {
      const [y, m] = calMonth.split("-").map(Number);
      const start = calMonth + "-01";
      const nextMonth = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
      const endExclusive = `${nextMonth}-01`;
      const { data } = await supabase
        .from("current_affairs")
        .select("published_date")
        .eq("lang", "ta")
        .gte("published_date", start)
        .lt("published_date", endExclusive);
      if (data) setDatesWithContent(new Set(data.map((r: any) => r.published_date)));
    }
    fetchDates();
  }, [calMonth]);

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      const { data } = await supabase
        .from("current_affairs")
        .select("id, question, correct_option, explanation, topic, published_date")
        .eq("published_date", selectedDate)
        .eq("lang", lang)
        .order("created_at", { ascending: true });
      setQuestions(data ?? []);
      setLoading(false);
    }
    fetchQuestions();
  }, [selectedDate, lang]);

  function getCalDays() {
    const [y, m] = calMonth.split("-").map(Number);
    return {
      firstDay: new Date(y, m - 1, 1).getDay(),
      daysInMonth: new Date(y, m, 0).getDate(),
    };
  }

  function prevMonth() {
    const [y, m] = calMonth.split("-").map(Number);
    setCalMonth(toISODate(new Date(y, m - 2, 1)).slice(0, 7));
  }

  function nextMonth() {
    const [y, m] = calMonth.split("-").map(Number);
    const next = toISODate(new Date(y, m, 1)).slice(0, 7);
    if (next <= todayISO.slice(0, 7)) setCalMonth(next);
  }

  const { firstDay, daysInMonth } = getCalDays();

  return (
    <main style={{ width: "100%", background: T.bg, paddingBottom: 100 }}>

      {/* HERO */}
      <div style={{ background: `linear-gradient(135deg, ${T.indigoDark} 0%, ${T.indigo} 100%)`, padding: "20px 20px 24px" }}>

        {/* back + lang toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div onClick={() => router.back()} style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer" }}>
            ← {lang === "ta" ? "முகப்பு" : "Home"}
          </div>
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

        {/* date strip */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" as const }}>
          {last7.map(date => {
            const isSelected = date === selectedDate;
            return (
              <div key={date} onClick={() => setSelectedDate(date)}
                style={{ flexShrink: 0, minWidth: 52, padding: "7px 10px", borderRadius: 12, background: isSelected ? "white" : "rgba(255,255,255,0.12)", border: `1.5px solid ${isSelected ? "white" : "rgba(255,255,255,0.18)"}`, cursor: "pointer", textAlign: "center" as const }}
              >
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 0.5, color: isSelected ? T.indigo : "rgba(255,255,255,0.5)" }}>
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

          <div onClick={() => setShowCal(!showCal)}
            style={{ flexShrink: 0, minWidth: 48, padding: "7px 10px", borderRadius: 12, background: showCal ? "white" : "rgba(255,255,255,0.1)", border: `1.5px solid ${showCal ? "white" : "rgba(255,255,255,0.18)"}`, cursor: "pointer", textAlign: "center" as const, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 2 }}
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, textAlign: "center" as const }}>
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
                  <div key={dayNum}
                    onClick={() => { if (hasContent && !isFuture) { setSelectedDate(iso); setShowCal(false); } }}
                    style={{ fontSize: 12, padding: "5px 0", borderRadius: 6, background: isSelected ? "white" : hasContent && !isFuture ? "rgba(255,255,255,0.2)" : "transparent", color: isSelected ? T.indigo : isFuture ? "rgba(255,255,255,0.15)" : hasContent ? "white" : "rgba(255,255,255,0.25)", fontWeight: isSelected || hasContent ? 700 : 400, cursor: hasContent && !isFuture ? "pointer" : "default" }}
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
            {isToday ? (lang === "ta" ? "இன்றைய Fact Sheet" : "Today's Fact Sheet") : `${formatDayNum(selectedDate)} — Fact Sheet`}
          </div>
          <div style={{ fontSize: 12, color: T.textSec, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 20, padding: "3px 10px" }}>
            {questions.length} {lang === "ta" ? "வினாக்கள்" : "facts"}
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: "center" as const, padding: "40px 0", color: T.textTer, fontSize: 14 }}>
            {lang === "ta" ? "ஏற்றுகிறது..." : "Loading..."}
          </div>
        )}

        {!loading && questions.length === 0 && (
          <div style={{ textAlign: "center" as const, padding: "40px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.textSec }}>
              {lang === "ta" ? "இந்த நாளுக்கு வினாக்கள் இல்லை" : "No questions for this date"}
            </div>
          </div>
        )}

        {!loading && questions.map((q, i) => (
          <div key={q.id} style={{ background: T.surface, borderRadius: 16, padding: 16, marginBottom: 10, boxShadow: shadow.sm, border: `1.5px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: 0.3, textTransform: "uppercase" as const, background: T.indigoLight, color: T.indigo }}>
                {q.topic ?? "Current Affairs"}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.textTer }}>#{i + 1}</span>
            </div>

            <div style={{ marginBottom: 10 }}>
              <QuestionText text={q.question} lang={lang} fontSize={15} />
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
        ))}

        <div style={{ height: 20 }} />

        {/* Challenge button — bottom */}
        <button
          onClick={() => router.push(`/practice/current-affairs/daily?date=${selectedDate}&lang=${lang}`)}
          style={{ width: "100%", background: `linear-gradient(135deg, ${T.indigo}, ${T.indigoDark})`, color: "white", border: "none", borderRadius: 14, padding: "14px", fontSize: 15, fontWeight: 800, cursor: "pointer", marginTop: 10, boxShadow: shadow.indigo, fontFamily: "inherit" }}
        >
          தைரியமா டெஸ்ட் எடு! 🔥
        </button>
      </div>
    </main>
  );
}
