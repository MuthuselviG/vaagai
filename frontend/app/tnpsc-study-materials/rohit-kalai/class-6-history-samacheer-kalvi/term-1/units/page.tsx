import { Metadata } from "next";
import UnitPath from "@/components/UnitPath";
import { fetchRohitKalaiClass6HistoryTerm1Units } from "@/lib/supabase";

const PAGE_PATH = "/tnpsc-study-materials/rohit-kalai/class-6-history-samacheer-kalvi/term-1/units";

export const metadata: Metadata = {
  title: "Class 6 History Samacheer Kalvi Term 1 — Unit-wise Q&A | Rohit Kalai | TNPSC",
  description:
    "6th std Samacheer Kalvi History (Term 1) Tamil questions & answers by Rohit Kalai, organised unit by unit. Free TNPSC Group 4 study material.",
  alternates: {
    canonical: `https://mcqpalagu.in${PAGE_PATH}`,
  },
};

export default async function RohitKalaiClass6HistoryTerm1UnitsPage() {
  const units = await fetchRohitKalaiClass6HistoryTerm1Units();

  return (
    <UnitPath
      termTag="Term 1"
      title="வரலாறு — அலகுகள்"
      subtitle={`கலையரசன் ரா · ${units.length} அலகுகள்`}
      backHref="/tnpsc-study-materials/rohit-kalai/class-6-history-samacheer-kalvi"
      backLabel="← புத்தக அடைப்பு"
      basePath={PAGE_PATH}
      units={units.map((u) => ({ slug: u.slug, topic: u.topic, count: u.questions.length }))}
      countLabel={(count) => `${count} வினா & விடை`}
    />
  );
}
