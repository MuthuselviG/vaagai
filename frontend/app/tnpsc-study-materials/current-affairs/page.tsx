import { redirect } from "next/navigation";
import { fetchCAAvailableMonths } from "../../../lib/supabase";

export const revalidate = 3600;

// Bounded so a slow/unreachable DB never delays this redirect beyond a couple
// seconds — falls back to the last-known-good month rather than hanging.
async function latestMonthOrFallback(): Promise<string> {
  const months = await Promise.race([
    fetchCAAvailableMonths().catch((): string[] => []),
    new Promise<string[]>((resolve) => setTimeout(() => resolve([]), 2000)),
  ]);
  return months[0] ?? "september-2026";
}

export default async function CurrentAffairsRootPage() {
  redirect(`/tnpsc-study-materials/current-affairs/${await latestMonthOrFallback()}`);
}
