import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PackDetailClient, { type PackDetailData } from "./PackDetailClient";

function makeSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; packId: string }> }): Promise<Metadata> {
  const { packId } = await params;
  const supabase = makeSupabase();
  const { data } = await supabase
    .from("packs")
    .select("name, description, creators(name, slug)")
    .eq("id", packId)
    .eq("is_published", true)
    .single();

  if (!data) return { title: "Pack | MCQ Palagu" };

  const creator = Array.isArray(data.creators) ? data.creators[0] : data.creators;
  const description = data.description ?? `Practice ${data.name} MCQ questions on MCQ Palagu.`;
  return {
    title: `${data.name} | MCQ Palagu`,
    description,
    alternates: { canonical: `https://mcqpalagu.in/experts/${creator?.slug}/${packId}` },
    openGraph: {
      title: `${data.name} | MCQ Palagu`,
      description,
      url: `https://mcqpalagu.in/experts/${creator?.slug}/${packId}`,
    },
  };
}

export default async function PackDetailPage({ params }: { params: Promise<{ slug: string; packId: string }> }) {
  const { packId } = await params;
  const supabase = makeSupabase();

  const { data, error } = await supabase
    .from("packs")
    .select("id, name, description, subject, exams, question_count, is_free, creators(id, name, slug, type, verified, accent_color)")
    .eq("id", packId)
    .eq("is_published", true)
    .single();

  if (error || !data) notFound();

  const creatorRaw = Array.isArray(data.creators) ? data.creators[0] : data.creators;

  const pack: PackDetailData = {
    id: data.id,
    name: data.name,
    description: data.description,
    subject: data.subject,
    exams: data.exams,
    question_count: data.question_count,
    is_free: data.is_free,
    creator: creatorRaw as PackDetailData["creator"],
  };

  return <PackDetailClient pack={pack} />;
}
