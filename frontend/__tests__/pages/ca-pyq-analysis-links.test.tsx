import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/tnpsc-study-materials/current-affairs",
}));

vi.mock("@/lib/supabase", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/supabase")>();
  return {
    ...actual,
    fetchCAMonthlyUnitCounts: vi.fn().mockResolvedValue([]),
    fetchCAForUnit: vi.fn().mockResolvedValue([]),
    fetchCAMonthlyPreview: vi.fn().mockResolvedValue([]),
  };
});

import MayEnPage from "@/app/tnpsc-study-materials/current-affairs/may-2026/page";
import MayTaPage from "@/app/tnpsc-study-materials/current-affairs/may-2026-tamil/page";
import JuneEnPage from "@/app/tnpsc-study-materials/current-affairs/june-2026/page";
import JuneTaPage from "@/app/tnpsc-study-materials/current-affairs/june-2026-tamil/page";

describe("CA monthly pages — Explore More links to the AI PYQ Analysis page", () => {
  it("May 2026 (EN) links to the EN PYQ analysis page", async () => {
    render(await MayEnPage());
    const link = screen.getByText("AI PYQ Analysis").closest("a");
    expect(link).toHaveAttribute("href", "/tnpsc-study-materials/ai-tnpsc-group-4-pyq-analysis");
  });

  it("May 2026 (Tamil) links to the Tamil PYQ analysis page", async () => {
    render(await MayTaPage());
    const link = screen.getByText("AI வினாத்தாள் பகுப்பாய்வு").closest("a");
    expect(link).toHaveAttribute("href", "/tnpsc-study-materials/ai-tnpsc-group-4-pyq-analysis-tamil");
  });

  it("June 2026 (EN) links to the EN PYQ analysis page", async () => {
    render(await JuneEnPage());
    const link = screen.getByText("AI PYQ Analysis").closest("a");
    expect(link).toHaveAttribute("href", "/tnpsc-study-materials/ai-tnpsc-group-4-pyq-analysis");
  });

  it("June 2026 (Tamil) links to the Tamil PYQ analysis page", async () => {
    render(await JuneTaPage());
    const link = screen.getByText("AI வினாத்தாள் பகுப்பாய்வு").closest("a");
    expect(link).toHaveAttribute("href", "/tnpsc-study-materials/ai-tnpsc-group-4-pyq-analysis-tamil");
  });
});
