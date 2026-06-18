import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, back: vi.fn() }),
}));

import PackDetailClient, { type PackDetailData } from "@/app/experts/[slug]/[packId]/PackDetailClient";

const baseCreator = {
  id: "creator-1",
  name: "கலையரசன் ரா",
  slug: "rohit-kalai",
  type: "vazhikatti",
  verified: true,
  accent_color: "purple",
};

function makePack(overrides: Partial<PackDetailData> = {}): PackDetailData {
  return {
    id: "some-pack-id",
    name: "Some Pack",
    description: null,
    subject: null,
    exams: null,
    question_count: 50,
    is_free: true,
    creator: baseCreator,
    ...overrides,
  };
}

describe("PackDetailClient", () => {
  beforeEach(() => {
    mocks.push.mockReset();
  });

  it("routes a regular MCQ pack to the practice flow", () => {
    const pack = makePack();
    render(<PackDetailClient pack={pack} />);
    fireEvent.click(screen.getByText("Start Pack →"));
    expect(mocks.push).toHaveBeenCalledWith(expect.stringContaining("/practice/pack/some-pack-id"));
  });

  it("routes the reading-only Rohit Kalai pack to its SEO page instead of the broken practice route", () => {
    const pack = makePack({ id: "a84ca4fc-efe7-45c8-b84d-47647d15cce8" });
    render(<PackDetailClient pack={pack} />);
    fireEvent.click(screen.getByText("Read Q&A →"));
    expect(mocks.push).toHaveBeenCalledWith(
      "/tnpsc-study-materials/rohit-kalai/class-6-history-samacheer-kalvi/term-1"
    );
  });
});
