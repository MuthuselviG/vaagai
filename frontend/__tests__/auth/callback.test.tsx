import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

const { mockPush, mockGetSession, mockFrom } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockGetSession: vi.fn(),
  mockFrom: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: { getSession: mockGetSession },
    from: mockFrom,
  })),
}));

import AuthCallbackPage from "@/app/auth/callback/page";

describe("AuthCallbackPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null }),
    });
  });

  it('renders "Signing you in..." loading text', () => {
    render(<AuthCallbackPage />);
    expect(screen.getByText("Signing you in...")).toBeInTheDocument();
  });

  it("redirects to /login when session is null", async () => {
    render(<AuthCallbackPage />);
    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith("/login")
    );
  });

  it("redirects to /login when getSession returns an error", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: new Error("Auth error"),
    });
    render(<AuthCallbackPage />);
    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith("/login")
    );
  });

  it("redirects to /subjects when user already exists in the DB", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "user-123" } } },
      error: null,
    });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: "user-123", exam_target: "group2" } }),
    });
    render(<AuthCallbackPage />);
    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith("/subjects")
    );
  });

  it("redirects to /onboarding when user is new (not in DB)", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "user-456" } } },
      error: null,
    });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
    render(<AuthCallbackPage />);
    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith("/onboarding")
    );
  });
});
