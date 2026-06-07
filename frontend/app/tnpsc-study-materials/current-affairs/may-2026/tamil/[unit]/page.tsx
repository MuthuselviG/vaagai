import { redirect } from "next/navigation";
export default async function MayTamilUnitRedirect({ params }: { params: Promise<{ unit: string }> }) {
  const { unit } = await params;
  redirect(`/tnpsc-study-materials/current-affairs/may-2026-tamil/${unit}`);
}
