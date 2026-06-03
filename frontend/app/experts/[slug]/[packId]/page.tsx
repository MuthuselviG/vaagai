import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PackDetailClient, { type PackDetailData } from "./PackDetailClient";
import { slugify } from "../../../../lib/slugify";

function makeSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const findPack = cache(async function findPack(creatorSlug: string, packNameSlug: string) {
  const supabase = makeSupabase();

  const { data: creator } = await supabase
    .from("creators")
    .select("id, name, slug, type, verified, accent_color")
    .eq("slug", creatorSlug)
    .single();
  if (!creator) return null;

  const { data: packs } = await supabase
    .from("packs")
    .select("id, name, description, subject, exams, question_count, is_free")
    .eq("creator_id", creator.id)
    .eq("is_published", true);
  if (!packs) return null;

  let decodedSlug = packNameSlug;
  try { decodedSlug = decodeURIComponent(packNameSlug); } catch { /* use raw */ }

  console.log("[findPack] slug param:", packNameSlug, "→ decoded:", decodedSlug);
  console.log("[findPack] pack slugs:", packs.map(p => slugify(p.name)));

  const pack = packs.find(p => slugify(p.name) === decodedSlug);
  if (!pack) return null;

  return { ...pack, creator };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; packId: string }>;
}): Promise<Metadata> {
  const { slug, packId } = await params;
  const pack = await findPack(slug, packId);
  if (!pack) return { title: "Pack | MCQ Palagu" };
  const description = pack.description ?? `Practice ${pack.name} MCQ questions on MCQ Palagu.`;
  return {
    title: `${pack.name} | MCQ Palagu`,
    description,
    alternates: { canonical: `https://mcqpalagu.in/experts/${slug}/${packId}` },
    openGraph: { title: `${pack.name} | MCQ Palagu`, description, url: `https://mcqpalagu.in/experts/${slug}/${packId}` },
  };
}

export default async function PackDetailPage({
  params,
}: {
  params: Promise<{ slug: string; packId: string }>;
}) {
  const { slug, packId } = await params;
  const data = await findPack(slug, packId);
  if (!data) notFound();

  const pack: PackDetailData = {
    id: data.id,
    name: data.name,
    description: data.description,
    subject: data.subject,
    exams: data.exams,
    question_count: data.question_count,
    is_free: data.is_free,
    creator: data.creator as PackDetailData["creator"],
  };

  return <PackDetailClient pack={pack} />;
}
