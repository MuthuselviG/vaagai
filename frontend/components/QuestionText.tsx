"use client";

import { T } from "../../frontend/lib/tokens";

/**
 * QuestionText
 * Place at: frontend/app/components/QuestionText.tsx
 */

type Props = { text: string; lang: "en" | "ta"; fontSize?: number };

const C = {
  teal: "#0E7C86",
  tealBg: "#E6F6F7",
  tealBorder: "#9FD9DD",
  rose: "#BE185D",
  roseBg: "#FDF2F8",
  roseBorder: "#F9A8D4",
};

// ── detection ────────────────────────────────────────────────────────────────

function isAssertionReason(t: string): boolean {
  const tamilChar  = / \(A\) /.test(t) && / \(R\) /.test(t);
  const tamilKw    = /கூற்று/.test(t) && /காரணம்/.test(t);
  const tamilColon = /\(A\)\s*:/.test(t) && /\(R\)\s*:/.test(t);
  const enRound    = /Assertion\s*\(A\)\s*[：:]/i.test(t) && /Reason\s*\(R\)\s*[：:]/i.test(t);
  const enSquare   = /Assertion\s*\[A\]\s*[：:]/i.test(t) && /Reason\s*\[R\]\s*[：:]/i.test(t);
  return tamilChar || tamilKw || tamilColon || enRound || enSquare;
}

function isMatchList(t: string): boolean {
  return (t.match(/பட்டியல்/g) || []).length >= 2 ||
         (t.match(/\bList\s*I\b/gi) || []).length >= 2;
}

function isStatement(t: string): boolean {
  const paren = (t.match(/\((?:1|2|3|4)\)/g) || []).length;
  const roman = (t.match(/\b(?:I|II|III|IV)\.\s/g) || []).length;
  return paren >= 2 || roman >= 2;
}

function isStatementPair(t: string): boolean {
  return /கூற்று\s*I[^I]/i.test(t) && /கூற்று\s*II/i.test(t);
}

// ── shared ───────────────────────────────────────────────────────────────────

function TypeTag({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      position: "absolute", top: -9, left: 14,
      fontSize: 9, fontWeight: 800, letterSpacing: 0.5,
      padding: "2px 8px", borderRadius: 6, color: "#fff", background: color,
    }}>{label}</span>
  );
}

function SegLabel({ label, color, bg, border }: { label: string; color: string; bg: string; border: string }) {
  return (
    <span style={{
      display: "inline-block", fontSize: 11, fontWeight: 800, borderRadius: 6,
      padding: "3px 9px", marginBottom: 4, letterSpacing: 0.3,
      color, background: bg, border: `1px solid ${border}`,
    }}>{label}</span>
  );
}

function ItemBlock({ text, fontSize }: { text: string; fontSize: number }) {
  const lines = text.includes("\n")
    ? text.split("\n").map(l => l.trim()).filter(Boolean)
    : [text.trim()];
  return (
    <div style={{ fontSize, fontWeight: 700, lineHeight: 1.7, color: T.text }}>
      {lines.map((line, i) => <div key={i}>{line}</div>)}
    </div>
  );
}

function Regular({ text, fontSize }: { text: string; fontSize: number }) {
  return (
    <p style={{ color: T.text, fontSize, fontWeight: 700, lineHeight: 1.55, letterSpacing: -0.3 }}>
      {text}
    </p>
  );
}

// ── assertion-reason ─────────────────────────────────────────────────────────

function AssertionReason({ text, lang, fontSize }: Props & { fontSize: number }) {
  let intro = "", aLabel = "(A)", rLabel = "(R)", aClean = "", rClean = "";

  if (lang === "ta") {
    // Handles all Tamil formats:
    // 1. "கூற்று (A): ..."  — keyword + colon (CA format)
    // 2. "கண்ணன் (A) : ..." — character name + space (PYQ format)
    const aMatch = text.match(/\(A\)\s*:?\s*/);
    const rMatch = text.match(/\(R\)\s*:?\s*/);
    if (!aMatch || !rMatch || aMatch.index === undefined || rMatch.index === undefined)
      return <Regular text={text} fontSize={fontSize} />;

    const aIdx = aMatch.index;
    const rIdx = rMatch.index;
    const aEnd = aIdx + aMatch[0].length;
    const rEnd = rIdx + rMatch[0].length;

    // Word/phrase before (A) is the A label
    const beforeA = text.slice(0, aIdx).trimEnd();
    const beforeALines = beforeA.split("\n").map(l => l.trim()).filter(Boolean);
    const aLabelWord = beforeALines[beforeALines.length - 1] ?? "";
    aLabel = aLabelWord ? `${aLabelWord} (A)` : "(A)";
    intro = beforeALines.slice(0, -1).join(" ");

    // Between (A) and (R): last token is R label word
    const between = text.slice(aEnd, rIdx);
    const rLabelMatch = between.match(/\s+(\S+)\s*$/);
    const rLabelWord = rLabelMatch ? rLabelMatch[1] : "";
    rLabel = rLabelWord ? `${rLabelWord} (R)` : "(R)";
    aClean = between.replace(/\s+\S+\s*$/, "").trim();

    // After (R)
    rClean = text.slice(rEnd).trim()
      .replace(/\n*சரியான விருப்பத்தைத் தேர்ந்தெடுக்கவும்[^]*/i, "")
      .replace(/\n*கீழே குறிப்பிடப்பட்டுள்ள[^]*/i, "")
      .replace(/\n*கீழ்க்கண்ட[^]*/i, "")
      .trim();

  } else {
    // English: handles (A)/(R) and [A]/[R], newline or | separator
    const aMatch = text.match(/Assertion\s*[\[(][Aa][\])]\s*[：:]\s*/i);
    const rMatch = text.match(/Reason\s*[\[(][Rr][\])]\s*[：:]\s*/i);
    if (!aMatch || !rMatch) return <Regular text={text} fontSize={fontSize} />;

    const aIdx = text.indexOf(aMatch[0]);
    const rIdx = text.indexOf(rMatch[0]);
    if (aIdx === -1 || rIdx === -1) return <Regular text={text} fontSize={fontSize} />;

    intro = text.slice(0, aIdx).trim();
    aClean = text.slice(aIdx + aMatch[0].length, rIdx)
      .replace(/\s*\|\s*$/, "")
      .trim();
    rClean = text.slice(rIdx + rMatch[0].length).trim()
      .replace(/\s*Now select[^]*/i, "")
      .replace(/\s*Select your answer[^]*/i, "")
      .replace(/\s*Considering \(A\)[^]*/i, "")
      .replace(/\s*Choose the correct[^]*/i, "")
      .trim();

    aLabel = "Assertion (A)";
    rLabel = "Reason (R)";
  }

  if (!aClean || !rClean) return <Regular text={text} fontSize={fontSize} />;

  const tagLabel = lang === "ta" ? "கூற்று – காரணம்" : "Assertion – Reason";
  const bodySize = fontSize - 1;
  const introSize = fontSize - 3;

  return (
    <div style={{ background: T.indigoLight, border: `1.5px solid ${T.indigoMid}`, borderRadius: 14, padding: "18px 16px", position: "relative" }}>
      <TypeTag label={tagLabel} color={T.indigo} />
      {intro && (
        <p style={{ fontSize: introSize, fontWeight: 600, color: T.textSec, lineHeight: 1.5, marginBottom: 14 }}>
          {intro}
        </p>
      )}
      <div style={{ background: T.surface, borderRadius: 11, padding: "13px 14px", marginBottom: 9 }}>
        <SegLabel label={aLabel} color={T.indigo} bg={T.indigoLight} border={T.indigoMid} />
        <p style={{ fontSize: bodySize, fontWeight: 700, lineHeight: 1.55, letterSpacing: -0.3, color: T.text }}>{aClean}</p>
      </div>
      <div style={{ background: T.surface, borderRadius: 11, padding: "13px 14px" }}>
        <SegLabel label={rLabel} color={T.indigo} bg={T.indigoLight} border={T.indigoMid} />
        <p style={{ fontSize: bodySize, fontWeight: 700, lineHeight: 1.55, letterSpacing: -0.3, color: T.text }}>{rClean}</p>
      </div>
    </div>
  );
}

// ── match list ────────────────────────────────────────────────────────────────

function splitOnLast(str: string, pattern: RegExp): [string, string] | null {
  const flags = pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g";
  const matches = [...str.matchAll(new RegExp(pattern.source, flags))];
  if (!matches.length) return null;
  const last = matches[matches.length - 1];
  const idx = last.index!;
  return [str.slice(0, idx), str.slice(idx + last[0].length)];
}

function MatchList({ text, lang, fontSize }: Props & { fontSize: number }) {
  const splitIIRe = lang === "ta"
    ? /பட்டியல்\s*II[-–ல்]*\s*[：:பொ]?\s*/i
    : /\bList\s*II\b\s*[-–:：]?\s*/i;

  const splitII = splitOnLast(text, splitIIRe);
  if (!splitII) return <Regular text={text} fontSize={fontSize} />;
  const [beforeII, listIIRaw] = splitII;

  const splitIRe = lang === "ta"
    ? /பட்டியல்\s*I\s*[：:（(]?\s*\n*/i
    : /\bList\s*I\b\s*[-–:：]?\s*/i;

  const splitI = splitOnLast(beforeII, splitIRe);
  if (!splitI) return <Regular text={text} fontSize={fontSize} />;
  const [introRaw, listIRaw] = splitI;

  const intro = introRaw.trim().replace(/[:：\s]+$/, "");
  const listIClean = listIRaw.trim();
  const listIIClean = listIIRaw
    .replace(/\n*(குறியீடுகள்|Codes?)\s*[：:]?.*/is, "")
    .trim();

  if (!listIClean || !listIIClean) return <Regular text={text} fontSize={fontSize} />;

  const listILabel  = lang === "ta" ? "பட்டியல் I"  : "List I";
  const listIILabel = lang === "ta" ? "பட்டியல் II" : "List II";
  const tagLabel    = lang === "ta" ? "பொருத்துக"   : "Match the Lists";
  const itemSize = Math.max(fontSize - 2, 13);
  const introSize = Math.max(fontSize - 3, 12);

  return (
    <div style={{ background: C.tealBg, border: `1.5px solid ${C.tealBorder}`, borderRadius: 14, padding: "18px 16px", position: "relative" }}>
      <TypeTag label={tagLabel} color={C.teal} />
      {intro && (
        <p style={{ fontSize: introSize, fontWeight: 600, color: T.textSec, lineHeight: 1.5, marginBottom: 14 }}>
          {intro}
        </p>
      )}
      <div style={{ display: "flex", gap: 9 }}>
        <div style={{ flex: 1, background: T.surface, borderRadius: 11, padding: "13px 14px" }}>
          <SegLabel label={listILabel} color={C.teal} bg={C.tealBg} border={C.tealBorder} />
          <ItemBlock text={listIClean} fontSize={itemSize} />
        </div>
        <div style={{ flex: 1, background: T.surface, borderRadius: 11, padding: "13px 14px" }}>
          <SegLabel label={listIILabel} color={C.teal} bg={C.tealBg} border={C.tealBorder} />
          <ItemBlock text={listIIClean} fontSize={itemSize} />
        </div>
      </div>
    </div>
  );
}

// ── statement ────────────────────────────────────────────────────────────────

function Statement({ text, lang, fontSize }: Props & { fontSize: number }) {
  const markerRe = /(?=\((?:1|2|3|4)\)|\b(?:I|II|III|IV)\.\s)/g;
  const pieces = text.split(markerRe).map(p => p.trim()).filter(Boolean);
  if (pieces.length < 3) return <Regular text={text} fontSize={fontSize} />;

  const intro = pieces[0];
  const statements = pieces.slice(1);
  const tagLabel = lang === "ta" ? "கூற்றுகள்" : "Statements";
  const bodySize = fontSize - 1;
  const introSize = fontSize - 3;

  return (
    <div style={{ background: T.greenBg, border: `1.5px solid ${T.greenBorder}`, borderRadius: 14, padding: "18px 16px", position: "relative" }}>
      <TypeTag label={tagLabel} color={T.green} />
      {intro && (
        <p style={{ fontSize: introSize, fontWeight: 600, color: T.textSec, lineHeight: 1.5, marginBottom: 12 }}>
          {intro}
        </p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {statements.map((s, i) => (
          <div key={i} style={{
            background: T.surface, border: `1px solid ${T.greenBorder}`, borderRadius: 9,
            padding: "11px 13px", fontSize: bodySize, fontWeight: 700, lineHeight: 1.5,
            letterSpacing: -0.3, color: T.text,
          }}>{s}</div>
        ))}
      </div>
    </div>
  );
}

// ── statement pair (கூற்று I / கூற்று II) ────────────────────────────────────

function StatementPair({ text, lang, fontSize }: Props & { fontSize: number }) {
  // Split on கூற்று II to get intro + stmt I + stmt II
  const splitII = text.split(/கூற்று\s*II\s*[：:]\s*/i);
  if (splitII.length < 2) return <Regular text={text} fontSize={fontSize} />;

  const beforeII = splitII[0];
  const stmtII = splitII.slice(1).join("").trim()
    .replace(/\n*மேலே கொடுக்கப்பட்ட[^]*/i, "")
    .replace(/\n*எது\/எவை[^]*/i, "")
    .trim();

  const splitI = beforeII.split(/கூற்று\s*I\s*[：:]\s*/i);
  if (splitI.length < 2) return <Regular text={text} fontSize={fontSize} />;

  const intro = splitI[0].trim().replace(/[:：\s]+$/, "");
  const stmtI = splitI.slice(1).join("").trim();

  if (!stmtI || !stmtII) return <Regular text={text} fontSize={fontSize} />;

  const tagLabel = lang === "ta" ? "கூற்றுகள் I & II" : "Statements I & II";
  const bodySize = fontSize - 1;
  const introSize = fontSize - 3;

  return (
    <div style={{ background: C.roseBg, border: `1.5px solid ${C.roseBorder}`, borderRadius: 14, padding: "18px 16px", position: "relative" }}>
      <TypeTag label={tagLabel} color={C.rose} />
      {intro && (
        <p style={{ fontSize: introSize, fontWeight: 600, color: T.textSec, lineHeight: 1.5, marginBottom: 14 }}>
          {intro}
        </p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <div style={{ background: T.surface, borderRadius: 11, padding: "13px 14px" }}>
          <SegLabel label="கூற்று I" color={C.rose} bg={C.roseBg} border={C.roseBorder} />
          <p style={{ fontSize: bodySize, fontWeight: 700, lineHeight: 1.55, letterSpacing: -0.3, color: T.text }}>{stmtI}</p>
        </div>
        <div style={{ background: T.surface, borderRadius: 11, padding: "13px 14px" }}>
          <SegLabel label="கூற்று II" color={C.rose} bg={C.roseBg} border={C.roseBorder} />
          <p style={{ fontSize: bodySize, fontWeight: 700, lineHeight: 1.55, letterSpacing: -0.3, color: T.text }}>{stmtII}</p>
        </div>
      </div>
    </div>
  );
}

// ── main ─────────────────────────────────────────────────────────────────────

export default function QuestionText({ text, lang, fontSize = 20 }: Props) {
  if (!text) return null;
  try {
    if (isStatementPair(text))   return <StatementPair text={text} lang={lang} fontSize={fontSize} />;
    if (isAssertionReason(text)) return <AssertionReason text={text} lang={lang} fontSize={fontSize} />;
    if (isMatchList(text))       return <MatchList text={text} lang={lang} fontSize={fontSize} />;
    if (isStatement(text))       return <Statement text={text} lang={lang} fontSize={fontSize} />;
  } catch {
    return <Regular text={text} fontSize={fontSize} />;
  }
  return <Regular text={text} fontSize={fontSize} />;
}
