import { MetadataRoute } from "next";
import { fetchCAAvailableMonths, CA_UNIT_ORDER } from "../lib/supabase";

const BASE = "https://mcqpalagu.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const months = await fetchCAAvailableMonths().catch(() => [] as string[]);

  const monthPages = months.flatMap((month) => {
    const unitPages = CA_UNIT_ORDER.flatMap((slug) => [
      {
        url: `${BASE}/tnpsc-study-materials/current-affairs/${month}/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      },
      {
        url: `${BASE}/tnpsc-study-materials/current-affairs/${month}-tamil/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      },
    ]);
    return [
      {
        url: `${BASE}/tnpsc-study-materials/current-affairs/${month}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      {
        url: `${BASE}/tnpsc-study-materials/current-affairs/${month}-tamil`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      ...unitPages,
    ];
  });

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/subjects`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/tnpsc-study-materials`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/current-affairs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/tnpsc-study-materials/current-affairs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/mock`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/experts`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    ...monthPages,
  ];
}
