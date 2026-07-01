import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

import MockLandingPage from "@/app/mock/page";

describe("Mock landing page — PYQ Analysis link", () => {
  it("links to the AI PYQ Analysis page", () => {
    render(<MockLandingPage />);
    const link = screen.getByText("Which topics actually repeat?").closest("a");
    expect(link).toHaveAttribute("href", "/tnpsc-study-materials/ai-tnpsc-group-4-pyq-analysis");
  });
});
