import { MetadataRoute } from "next";

const BASE = "https://mcqpalagu.in";

const CA_UNITS = [
  "general-science",
  "geography",
  "indian-history",
  "indian-polity",
  "welfare-schemes",
  "archaeology-updates",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const unitPages = CA_UNITS.flatMap((slug) => [
    {
      url: `${BASE}/tnpsc-study-materials/current-affairs/may-2026/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${BASE}/tnpsc-study-materials/current-affairs/may-2026-tamil/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
  ]);

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/subjects`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/tnpsc-study-materials`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/current-affairs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/tnpsc-study-materials/current-affairs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/tnpsc-study-materials/current-affairs/may-2026`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/tnpsc-study-materials/current-affairs/may-2026-tamil`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/mock`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/experts`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    ...unitPages,
  ];
}
