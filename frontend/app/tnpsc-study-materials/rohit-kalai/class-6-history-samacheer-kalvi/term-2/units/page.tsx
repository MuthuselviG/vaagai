import { Metadata } from "next";
import UnitPath from "@/components/UnitPath";
import { fetchRohitKalaiClass6HistoryTerm2Units } from "@/lib/supabase";

const PAGE_PATH = "/tnpsc-study-materials/rohit-kalai/class-6-history-samacheer-kalvi/term-2/units";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Class 6 History Samacheer Kalvi Term 2 — Unit-wise Q&A | Rohit Kalai | TNPSC",
  description:
    "6th std Samacheer Kalvi History (Term 2) Tamil questions & answers by Rohit Kalai, organised unit by unit. Free TNPSC Group 4 study material.",
  alternates: {
    canonical: `https://mcqpalagu.in${PAGE_PATH}`,
  },
};

export default async function RohitKalaiClass6HistoryTerm2UnitsPage() {
  const units = await fetchRohitKalaiClass6HistoryTerm2Units();

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
      { "@type": "ListItem", position: 4, name: "Term 2 Units", item: `https://mcqpalagu.in${PAGE_PATH}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <UnitPath
        termTag="Term 2"
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
