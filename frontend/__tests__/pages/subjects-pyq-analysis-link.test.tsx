import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// A generic chainable/thenable stub so any `.select().eq().contains()...` chain
// resolves to an empty result, without needing to model each query shape.
function chainable(resolvedValue: unknown): any {
  const handler: ProxyHandler<object> = {
    get(_target, prop) {
      if (prop === "then") return (resolve: (v: unknown) => void) => resolve(resolvedValue);
      return () => proxy;
    },
  };
  const proxy = new Proxy({}, handler);
  return proxy;
}

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/supabase", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/supabase")>();
  return {
    ...actual,
    fetchChapterCounts: vi.fn().mockResolvedValue([]),
    supabase: {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: vi.fn(() => chainable({ data: [], count: 0 })),
    },
  };
});

import SubjectsPage from "@/app/subjects/page";

describe("Subjects page — PYQ Analysis link", () => {
  it("links to the Tamil PYQ analysis page by default (default lang is Tamil)", async () => {
    render(<SubjectsPage />);
    const link = await screen.findByText("எந்த தலைப்புகள் மீண்டும் வரும்?");
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "/tnpsc-study-materials/ai-tnpsc-group-4-pyq-analysis-tamil"
    );
  });

  it("links to the English PYQ analysis page when lang is saved as English", async () => {
    localStorage.setItem("mcqpalagu_lang", "en");
    render(<SubjectsPage />);
    const link = await screen.findByText("Which topics actually repeat?");
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "/tnpsc-study-materials/ai-tnpsc-group-4-pyq-analysis"
    );
  });
});
