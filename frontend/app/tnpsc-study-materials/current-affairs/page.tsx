import { redirect } from "next/navigation";
import { fetchCAAvailableMonths } from "../../../lib/supabase";

export default async function CurrentAffairsRootPage() {
  const months = await fetchCAAvailableMonths().catch((): string[] => []);
  redirect(`/tnpsc-study-materials/current-affairs/${months[0] ?? "september-2026"}`);
}
