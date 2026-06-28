import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  pathname: "/tnpsc-study-materials/current-affairs/may-2026/geography",
  push: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
  usePathname: () => mocks.pathname,
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: { getSession: mocks.getSession },
  })),
}));

import CAUnitActionBar from "@/components/CAUnitActionBar";

describe("CAUnitActionBar", () => {
  beforeEach(() => {
    mocks.getSession.mockResolvedValue({ data: { session: null } });
  });

  it("renders English copy and links practice with no lang param", () => {
    render(<CAUnitActionBar lang="en" unit="geography" month="2026-05" questionCount={12} />);
    const link = screen.getByText("🎯 Test Yourself — 12 Questions").closest("a");
    expect(link).toHaveAttribute("href", "/practice/current-affairs/geography?month=2026-05");
    expect(screen.getByText("⬇️ Download as PDF")).toBeInTheDocument();
  });

  it("renders Tamil copy and links practice with &lang=ta", () => {
    render(<CAUnitActionBar lang="ta" unit="geography" month="2026-05" questionCount={12} />);
    const link = screen.getByText("🎯 தேர்வு எழுது — 12 வினாக்கள்").closest("a");
    expect(link).toHaveAttribute("href", "/practice/current-affairs/geography?month=2026-05&lang=ta");
    expect(screen.getByText("⬇️ PDF பதிவிறக்கம்")).toBeInTheDocument();
  });

  it("interpolates unit, month, and questionCount into the practice link and label", () => {
    render(<CAUnitActionBar lang="en" unit="indian-polity" month="2026-06" questionCount={7} />);
    const link = screen.getByText("🎯 Test Yourself — 7 Questions").closest("a");
    expect(link).toHaveAttribute("href", "/practice/current-affairs/indian-polity?month=2026-06");
  });
});
