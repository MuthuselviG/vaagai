import { MetadataRoute } from "next";
import {
  fetchCAAvailableMonths,
  CA_UNIT_ORDER,
  fetchRohitKalaiClass6HistoryTerm1Units,
  fetchRohitKalaiClass6HistoryTerm2Units,
} from "../lib/supabase";

const BASE = "https://mcqpalagu.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const months = await fetchCAAvailableMonths().catch(() => [] as string[]);
  const term1Units = await fetchRohitKalaiClass6HistoryTerm1Units().catch(() => []);
  const term2Units = await fetchRohitKalaiClass6HistoryTerm2Units().catch(() => []);

  const TERM1_UNITS_PATH = "/tnpsc-study-materials/rohit-kalai/class-6-history-samacheer-kalvi/term-1/units";
  const TERM2_UNITS_PATH = "/tnpsc-study-materials/rohit-kalai/class-6-history-samacheer-kalvi/term-2/units";

  const rohitKalaiUnitPages = [
    {
      url: `${BASE}${TERM1_UNITS_PATH}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    ...term1Units.map((u) => ({
      url: `${BASE}${TERM1_UNITS_PATH}/${u.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    {
      url: `${BASE}${TERM2_UNITS_PATH}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    ...term2Units.map((u) => ({
      url: `${BASE}${TERM2_UNITS_PATH}/${u.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

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
    { url: `${BASE}/tnpsc-study-materials/ai-tnpsc-group-4-pyq-analysis`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/tnpsc-study-materials/ai-tnpsc-group-4-pyq-analysis-tamil`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/mock`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/experts`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/tnpsc-study-materials/er-thangamuthu/tvk-maths/test-01`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/tnpsc-study-materials/rohit-kalai/class-6-history-samacheer-kalvi`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/tnpsc-study-materials/rohit-kalai/class-6-history-samacheer-kalvi/term-1`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/tnpsc-study-materials/daily-gk-thoughts/june-2026`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    ...rohitKalaiUnitPages,
    ...monthPages,
  ];
}
