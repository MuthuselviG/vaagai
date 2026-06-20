import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CreatorProfileClient, { type CreatorData, type PackData } from "./CreatorProfileClient";

export const dynamic = "force-dynamic";

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
    .order("created_at", { ascending: false });

  return (
    <CreatorProfileClient
      creator={creator as CreatorData}
      packs={(packs ?? []) as PackData[]}
    />
  );
}
