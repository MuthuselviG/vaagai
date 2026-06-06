import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Hoisted so the vi.mock() factories can reference them before imports run.
const mocks = vi.hoisted(() => ({
  pathname: "/",
  push: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  from: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
  usePathname: () => mocks.pathname,
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
    },
    from: mocks.from,
  })),
}));

import AppShell from "@/components/AppShell";

describe("AppShell", () => {
  beforeEach(() => {
    mocks.pathname = "/";
    mocks.push.mockReset();
    mocks.getSession.mockResolvedValue({ data: { session: null } });
    mocks.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mocks.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null }),
    });
  });

  it("renders children content", () => {
    render(<AppShell><div>test-child-content</div></AppShell>);
    expect(screen.getByText("test-child-content")).toBeInTheDocument();
  });

  it("bottom nav is in DOM on home path", () => {
    mocks.pathname = "/";
    const { container } = render(<AppShell><div>child</div></AppShell>);
    expect(container.querySelector(".bottom-nav")).toBeInTheDocument();
  });

  it("bottom nav is removed when on /practice path", () => {
    mocks.pathname = "/practice/Polity/Intro";
    const { container } = render(<AppShell><div>child</div></AppShell>);
    expect(container.querySelector(".bottom-nav")).not.toBeInTheDocument();
  });

  it("bottom nav is removed when on /mock/ path", () => {
    mocks.pathname = "/mock/2024";
    const { container } = render(<AppShell><div>child</div></AppShell>);
    expect(container.querySelector(".bottom-nav")).not.toBeInTheDocument();
  });

  it("does not show Settings button when user is not logged in", async () => {
    render(<AppShell><div>child</div></AppShell>);
    await waitFor(() => {
      expect(screen.queryByText("Settings")).not.toBeInTheDocument();
    });
  });

  it("shows Settings button when user is logged in", async () => {
    mocks.getSession.mockResolvedValue({
      data: {
        session: { user: { id: "user-1", email: "test@example.com" } },
      },
    });
    render(<AppShell><div>child</div></AppShell>);
    await waitFor(() => {
      expect(screen.getAllByText("Settings")[0]).toBeInTheDocument();
    });
  });
});
