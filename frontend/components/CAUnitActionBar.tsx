import Link from "next/link";
import { T, shadow } from "@/lib/tokens";
import PdfDownloadButton from "./PdfDownloadButton";

export default function CAUnitActionBar({
  lang,
  unit,
  month,
  questionCount,
}: {
  lang: "en" | "ta";
  unit: string;
  month: string;
  questionCount: number;
}) {
  const practiceHref = `/practice/current-affairs/${unit}?month=${month}${lang === "ta" ? "&lang=ta" : ""}`;

  return (
    <div className="no-print" style={{ position: "fixed", bottom: 60, left: 0, right: 0, background: T.surface, borderTop: `1px solid ${T.border}`, padding: "12px 20px", display: "flex", gap: 10, boxShadow: "0 -2px 10px rgba(0,0,0,0.07)", zIndex: 90 }}>
      <Link href={practiceHref} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 13, borderRadius: 10, background: T.indigo, color: "white", fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: shadow.indigo }}>
        {lang === "en" ? `🎯 Test Yourself — ${questionCount} Questions` : `🎯 தேர்வு எழுது — ${questionCount} வினாக்கள்`}
      </Link>
      <PdfDownloadButton style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "13px 12px", borderRadius: 10, background: T.green, color: "white", border: "none", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", boxShadow: shadow.green }}>
        {lang === "en" ? "⬇️ Download as PDF" : "⬇️ PDF பதிவிறக்கம்"}
      </PdfDownloadButton>
    </div>
  );
}
