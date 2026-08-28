import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CreatorProfileClient, { type CreatorData, type PackData } from "./CreatorProfileClient";
import { READING_ONLY_PACK_IDS, buildStudyGuides } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Reading-only packs (see READING_ONLY_PACK_IDS) aren't real MCQ packs, so
// they're excluded from the pack list below and linked here instead, to
// their dedicated SEO reading page. Both Rohit Kalai history packs point at
// the same page (its two terms), so they collapse into one card.
const READING_PAGE_BY_PACK_ID: Record<string, string> = {
  "a84ca4fc-efe7-45c8-b84d-47647d15cce8": "/tnpsc-study-materials/rohit-kalai/class-6-history-samacheer-kalvi",
  "7fd3ce12-6147-40cb-8b64-9cef49236935": "/tnpsc-study-materials/rohit-kalai/class-6-history-samacheer-kalvi",
  "7378c007-de39-4362-8f72-6c8787bdf2ec": "/tnpsc-study-materials/er-thangamuthu/niti-aayog",
};

function makeSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = makeSupabase();
  const { data } = await supabase
    .from("creators")
    .select("name, tagline, bio")
    .eq("slug", slug)
    .single();

  if (!data) return { title: "Expert | MCQ Palagu" };

  const description = data.bio ?? data.tagline ?? `Practice TNPSC questions curated by ${data.name}.`;
  return {
    title: `${data.name} | MCQ Palagu`,
    description,
    alternates: { canonical: `https://mcqpalagu.in/experts/${slug}` },
    openGraph: {
      title: `${data.name} | MCQ Palagu`,
      description,
      url: `https://mcqpalagu.in/experts/${slug}`,
    },
  };
}

export default async function CreatorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = makeSupabase();

  const { data: creator, error } = await supabase
    .from("creators")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !creator) notFound();

  const { data: packs } = await supabase
    .from("packs")
    .select("id, name, description, subject, exams, question_count, is_free")
    .eq("creator_id", creator.id)
    .eq("is_published", true)
    .not("id", "in", `(${READING_ONLY_PACK_IDS.join(",")})`)
    .order("created_at", { ascending: false });

  const { data: readingPacks } = await supabase
    .from("packs")
    .select("id, name, question_count")
    .eq("creator_id", creator.id)
    .eq("is_published", true)
    .in("id", READING_ONLY_PACK_IDS);

  const studyGuides = buildStudyGuides(readingPacks ?? [], READING_PAGE_BY_PACK_ID);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: creator.name,
    url: `https://mcqpalagu.in/experts/${slug}`,
    ...(creator.bio || creator.tagline ? { description: creator.bio ?? creator.tagline } : {}),
    ...(creator.photo_url ? { image: creator.photo_url } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CreatorProfileClient
        creator={creator as CreatorData}
        packs={(packs ?? []) as PackData[]}
        studyGuides={studyGuides}
      />
    </>
  );
}
