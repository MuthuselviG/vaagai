import { Metadata } from "next";
import UnitPath from "@/components/UnitPath";
import { fetchRohitKalaiClass6HistoryTerm1Units } from "@/lib/supabase";

const PAGE_PATH = "/tnpsc-study-materials/rohit-kalai/class-6-history-samacheer-kalvi/term-1/units";

export const revalidate = 60;

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://mcqpalagu.in/" },
      { "@type": "ListItem", position: 2, name: "TNPSC Study Materials", item: "https://mcqpalagu.in/tnpsc-study-materials" },
      {
        "@type": "ListItem",
        position: 3,
        name: "Class 6 History — Rohit Kalai",
        item: "https://mcqpalagu.in/tnpsc-study-materials/rohit-kalai/class-6-history-samacheer-kalvi",
      },
      { "@type": "ListItem", position: 4, name: "Term 1 Units", item: `https://mcqpalagu.in${PAGE_PATH}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
    </>
  );
}
