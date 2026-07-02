import { cookies } from "next/headers";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import BilingualReadingList from "@/components/BilingualReadingList";
import { fetchNitiAayogUnits, findUnitBySlug } from "@/lib/supabase";

const BASE_PATH = "/tnpsc-study-materials/er-thangamuthu/niti-aayog";

export const revalidate = 60;

export async function generateStaticParams() {
  const units = await fetchNitiAayogUnits();
  return units.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const units = await fetchNitiAayogUnits();
  const unit = findUnitBySlug(units, slug);
  if (!unit) return {};
  return {
    title: `${unit.topic} — NITI Aayog Q&A | Er. Thangamuthu (TVK) | TNPSC`,
    description: `${unit.topic} — ${unit.questions.length} NITI Aayog questions & answers by Er. Thangamuthu (TVK). Free TNPSC study material in Tamil & English.`,
    alternates: {
      canonical: `https://mcqpalagu.in${BASE_PATH}/${slug}`,
    },
  };
}

const COPY = {
  en: {
    eyebrow: (n: number) => `⚡ Er. Thangamuthu (TVK) · Unit ${n}`,
    credit: "Er. Thangamuthu (TVK)",
    introHeading: "About this unit",
    introBody: (topic: string, count: number) =>
      `${count} questions & answers on "${topic}", part of the NITI Aayog set by Er. Thangamuthu (TVK). Useful for TNPSC Group 1, 2 and 4 Polity revision.`,
    sectionLabel: "Questions & Answers",
    answerLabel: "Answer",
    relatedHeading: "Keep practising",
    related: (unitIndex: number) => [
      { href: BASE_PATH, icon: "🗂️", title: "Browse other units", sub: "NITI Aayog — all units" },
      { href: "/subjects", icon: "📋", title: "TNPSC Group 4 PYQ Practice", sub: "Previous Year Question Papers" },
      { href: "/current-affairs", icon: "📰", title: "Daily Current Affairs", sub: "Daily updated MCQs" },
      { href: "/tnpsc-study-materials", icon: "📚", title: "TNPSC Study Materials hub", sub: "Notes, current affairs & more" },
    ],
    qa: (n: number) => `${n} Q&A`,
  },
  ta: {
    eyebrow: (n: number) => `⚡ Er. தங்கமுத்து (TVK) · அலகு ${n}`,
    credit: "Er. தங்கமுத்து (TVK)",
    introHeading: "இந்த அலகு பற்றி",
    introBody: (topic: string, count: number) =>
      `"${topic}" தலைப்பில் Er. தங்கமுத்து (TVK) வழங்கும் NITI Aayog தொகுப்பின் ${count} வினா-விடைகள். TNPSC குரூப் 1, 2 மற்றும் 4 அரசியல் திருப்பிப் படிக்க உதவும்.`,
    sectionLabel: "வினா & விடைகள்",
    answerLabel: "விடை",
    relatedHeading: "தொடர்ந்து பயிற்சி செய்யுங்கள்",
    related: (unitIndex: number) => [
      { href: BASE_PATH, icon: "🗂️", title: "மற்ற அலகுகளைப் பார்க்க", sub: "NITI Aayog — அனைத்து அலகுகளும்" },
      { href: "/subjects", icon: "📋", title: "TNPSC குரூப் 4 PYQ பயிற்சி", sub: "முந்தைய ஆண்டு வினாத்தாள்கள்" },
      { href: "/current-affairs", icon: "📰", title: "தினசரி நடப்பு நிகழ்வுகள்", sub: "தினமும் புதுப்பிக்கப்படும் MCQ" },
      { href: "/tnpsc-study-materials", icon: "📚", title: "TNPSC படிப்பு பொருட்கள்", sub: "குறிப்புகள், நடப்பு நிகழ்வுகள் மற்றும் பல" },
    ],
    qa: (n: number) => `${n} வினா-விடை`,
  },
};

export default async function NitiAayogUnitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const lang = (cookieStore.get("mcqpalagu_lang")?.value === "en" ? "en" : "ta") as "en" | "ta";

  const units = await fetchNitiAayogUnits();
  const unit = findUnitBySlug(units, slug);
  if (!unit) notFound();
  const unitIndex = units.indexOf(unit);
  const c = COPY[lang];

  const faqItems = unit.questions.slice(0, 8).map((q) => ({
    "@type": "Question",
    name: lang === "ta" ? q.questionTa : q.questionEn,
    acceptedAnswer: { "@type": "Answer", text: lang === "ta" ? q.explanationTa : q.explanationEn },
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BilingualReadingList
        lang={lang}
        badgeLabel={c.eyebrow(unitIndex + 1)}
        title={unit.topic}
        subtitle={`Unit ${unitIndex + 1} · ${c.qa(unit.questions.length)} · ${c.credit}`}
        tags={[`Unit ${unitIndex + 1}`, c.qa(unit.questions.length), "NITI Aayog"]}
        introTitle={c.introHeading}
        introText={c.introBody(unit.topic, unit.questions.length)}
        expertHref="/experts/er-thangamuthu-tvk"
        expertInitial="E"
        expertName="Er. Thangamuthu (TVK)"
        expertBio="TNPSC Group 1 / 2 / 4"
        sectionLabel={c.sectionLabel}
        answerLabel={c.answerLabel}
        questions={unit.questions}
        related={c.related(unitIndex)}
        shareTitle={`NITI Aayog — ${unit.topic} (${c.qa(unit.questions.length)})`}
        shareContext="Er. Thangamuthu (TVK)"
      />
    </>
  );
}
