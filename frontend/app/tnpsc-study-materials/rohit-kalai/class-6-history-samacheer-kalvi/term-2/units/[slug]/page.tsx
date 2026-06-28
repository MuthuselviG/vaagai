import { Metadata } from "next";
import { notFound } from "next/navigation";
import ReadingList from "@/components/ReadingList";
import { fetchRohitKalaiClass6HistoryTerm2Units } from "@/lib/supabase";

const BASE_PATH = "/tnpsc-study-materials/rohit-kalai/class-6-history-samacheer-kalvi/term-2/units";

export const revalidate = 60;

export async function generateStaticParams() {
  const units = await fetchRohitKalaiClass6HistoryTerm2Units();
  return units.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const units = await fetchRohitKalaiClass6HistoryTerm2Units();
  const unit = units.find((u) => u.slug === slug);
  if (!unit) return {};
  return {
    title: `${unit.topic} — Class 6 History Term 2 Q&A | Rohit Kalai | TNPSC`,
    description: `${unit.topic} — ${unit.questions.length} Tamil questions & answers from Class 6 Samacheer Kalvi History (Term 2) by Rohit Kalai. Free TNPSC Group 4 study material.`,
    alternates: {
      canonical: `https://mcqpalagu.in${BASE_PATH}/${slug}`,
    },
  };
}

export default async function RohitKalaiClass6HistoryTerm2UnitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const units = await fetchRohitKalaiClass6HistoryTerm2Units();
  const unitIndex = units.findIndex((u) => u.slug === slug);
  if (unitIndex === -1) notFound();
  const unit = units[unitIndex];

  const faqItems = unit.questions
    .filter((q) => q.explanation.trim().length > 0)
    .slice(0, 8)
    .map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.explanation },
    }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems,
  };

  const related = [
    { href: BASE_PATH, icon: "🗺️", title: "மற்ற அலகுகளைப் பார்க்க", sub: "Term 2 — அனைத்து அலகுகளும்" },
    { href: "/tnpsc-study-materials/rohit-kalai/class-6-history-samacheer-kalvi", icon: "📚", title: "புத்தக அடைப்புக்குத் திரும்ப", sub: "மற்ற Terms-ஐப் பார்க்க" },
    { href: "/subjects", icon: "📋", title: "TNPSC குரூப் 4 PYQ பயிற்சி", sub: "முந்தைய ஆண்டு வினாத்தாள்கள்" },
    { href: "/current-affairs", icon: "📰", title: "தினசரி நடப்பு நிகழ்வுகள்", sub: "தினமும் புதுப்பிக்கப்படும் MCQ" },
  ];

  return (
    <>
      {faqItems.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <ReadingList
        badgeLabel={`🏺 கலையரசன் ரா · அலகு ${unitIndex + 1}`}
        title={unit.topic}
        subtitle={`Term 2 · அலகு ${unitIndex + 1} · ${unit.questions.length} வினா & விடை`}
        tags={["Term 2", `${unit.questions.length} Q&A`, "Samacheer Kalvi"]}
        introTitle="இந்த அலகு பற்றி"
        introText={`6ஆம் வகுப்பு சமச்சீர் கல்வி வரலாறு (Term 2) பாடப்புத்தகத்தின் "${unit.topic}" அலகின் அடிப்படையில் கலையரசன் ரா தயாரித்த ${unit.questions.length} வினா-விடைகள். TNPSC குரூப் 4 தேர்வுக்கு உதவும் வகையில் வரிசைப்படுத்தப்பட்டுள்ளது.`}
        expertHref="/experts/rohit-kalai"
        expertInitial="க"
        expertName="கலையரசன் ரா"
        expertBio="🎓 தமிழ மாணவன் தமிழுக்கான மாணவன் 🙏"
        sectionLabel="வினா & விடைகள்"
        questions={unit.questions}
        related={related}
        shareTitle={`வரலாறு 6th Term 2 — ${unit.topic} (${unit.questions.length} வினா & விடை)`}
        shareContext="கலையரசன் ரா"
      />
    </>
  );
}
