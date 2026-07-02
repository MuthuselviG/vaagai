import Link from "next/link";
import { T, shadow } from "@/lib/tokens";
import HomeLangToggle from "@/components/HomeLangToggle";
import WhatsAppShareButton from "@/components/WhatsAppShareButton";
import { BilingualQA } from "@/lib/supabase";

type RelatedLink = { href: string; icon: string; title: string; sub: string };

type BilingualReadingListProps = {
  lang: "en" | "ta";
  badgeLabel: string;
  title: string;
  subtitle: string;
  tags: string[];
  introTitle: string;
  introText: string;
  expertHref: string;
  expertInitial: string;
  expertName: string;
  expertBio: string;
  sectionLabel: string;
  answerLabel: string;
  questions: BilingualQA[];
  related: RelatedLink[];
  shareTitle: string;
  shareContext: string;
};

function QCard({ q, num, lang, answerLabel }: { q: BilingualQA; num: number; lang: "en" | "ta"; answerLabel: string }) {
  const isTa = lang === "ta";
  const question = isTa ? q.questionTa : q.questionEn;
  const explanation = isTa ? q.explanationTa : q.explanationEn;
  const hasAnswer = explanation.trim().length > 0;
  return (
    <div id={`q${num}`} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, marginBottom: 14, boxShadow: shadow.sm }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: hasAnswer ? 14 : 0 }}>
        <span style={{ flexShrink: 0, fontWeight: 800, color: T.indigo, background: T.indigoLight, width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{num}</span>
        <p style={{ fontSize: isTa ? 16 : 15, fontWeight: 600, color: T.text, lineHeight: 1.55, margin: 0 }}>{question}</p>
      </div>
      {hasAnswer && (
        <div style={{ background: T.greenBg, border: `1px solid ${T.greenBorder}`, borderRadius: 10, padding: "10px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase" as const, letterSpacing: "0.4px", marginBottom: 3 }}>✅ {answerLabel}</div>
          <div style={{ fontSize: isTa ? 14 : 13, color: T.green, lineHeight: 1.5 }}>{explanation}</div>
        </div>
      )}
    </div>
  );
}

export default function BilingualReadingList({
  lang,
  badgeLabel,
  title,
  subtitle,
  tags,
  introTitle,
  introText,
  expertHref,
  expertInitial,
  expertName,
  expertBio,
  sectionLabel,
  answerLabel,
  questions,
  related,
  shareTitle,
  shareContext,
}: BilingualReadingListProps) {
  const isTa = lang === "ta";
  return (
    <>
      <WhatsAppShareButton title={shareTitle} context={shareContext} floating />
      {/* HERO */}
      <div style={{ background: `linear-gradient(135deg, ${T.indigo} 0%, ${T.indigoDark} 100%)`, color: "white", borderRadius: "0 0 28px 28px", padding: "16px 16px 34px", position: "relative", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.16)", padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>
            {badgeLabel}
          </span>
          <HomeLangToggle initialLang={lang} />
        </div>
        <h1 style={{ fontFamily: "serif", fontSize: 24, fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.4px", margin: "14px 0 6px" }}>
          {title}
        </h1>
        <p style={{ fontSize: isTa ? 14 : 13, opacity: 0.85, marginBottom: 16 }}>{subtitle}</p>
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginTop: 4 }}>
          {tags.map((tag) => (
            <div key={tag} style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)", padding: "6px 12px", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
              {tag}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* INTRO */}
        <section style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, marginTop: 26 }}>
          <h2 style={{ fontFamily: "serif", fontSize: isTa ? 19 : 18, fontWeight: 700, marginBottom: 8, color: T.indigoDark }}>{introTitle}</h2>
          <p style={{ fontSize: isTa ? 14 : 13, color: T.textSec, lineHeight: 1.6, margin: 0 }}>{introText}</p>
        </section>

        {/* EXPERT INFO */}
        <Link href={expertHref} style={{ display: "flex", alignItems: "center", gap: 12, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, marginTop: 14, textDecoration: "none" }}>
          <span style={{ flexShrink: 0, width: 46, height: 46, borderRadius: "50%", background: "#7C3AED", color: "white", fontFamily: "serif", fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {expertInitial}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{expertName}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.indigo }}>✓</span>
            </div>
            <p style={{ fontSize: 13, color: T.textSec, margin: "2px 0 0", lineHeight: 1.4 }}>{expertBio}</p>
          </div>
          <span style={{ color: T.indigo, fontSize: 18, flexShrink: 0 }}>→</span>
        </Link>

        {/* QUESTIONS */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "28px 4px 14px" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "white", background: T.indigo, width: 26, height: 26, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>Q</div>
          <h2 style={{ fontFamily: "serif", fontSize: isTa ? 19 : 18, fontWeight: 700, color: T.indigoDark, margin: 0 }}>{sectionLabel}</h2>
        </div>

        {questions.map((q, i) => (
          <QCard key={q.id} q={q} num={i + 1} lang={lang} answerLabel={answerLabel} />
        ))}

        {/* RELATED LINKS */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, marginTop: 10, marginBottom: 24 }}>
          {related.map((link) => (
            <Link key={link.href} href={link.href} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.border}`, textDecoration: "none", color: T.text }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>{link.icon}</span>
                <div>
                  <div style={{ fontSize: isTa ? 15 : 14, fontWeight: 600 }}>{link.title}</div>
                  <div style={{ fontSize: 12, color: T.textSec, marginTop: 1 }}>{link.sub}</div>
                </div>
              </div>
              <span style={{ color: T.indigo, fontSize: 18 }}>→</span>
            </Link>
          ))}
        </div>
      </div>

      <div style={{ height: 40 }} />
    </>
  );
}
