import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

const { mockPush, mockGetUser, mockUpsert, mockCreateCreatorRow } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockGetUser: vi.fn(),
  mockUpsert: vi.fn(),
  mockCreateCreatorRow: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { getUser: mockGetUser },
    from: () => ({ upsert: mockUpsert }),
  },
  createCreatorRow: mockCreateCreatorRow,
}));

import OnboardingPage from "@/app/onboarding/page";

function fillRequiredFields() {
  fireEvent.change(screen.getByPlaceholderText("Enter your name"), { target: { value: "Test User" } });
  fireEvent.click(screen.getByText("Group 4"));
  fireEvent.click(screen.getByText("Aspirant"));
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "Chennai North" } });
}

describe("OnboardingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-123", email: "test@example.com" } } });
    mockUpsert.mockResolvedValue({ data: null, error: null });
  });

  it("upserts the user row (not a plain update) so onboarding succeeds even if the login-time row-creation step failed", async () => {
    render(<OnboardingPage />);
    fillRequiredFields();
    fireEvent.click(screen.getByText("Start Practicing 🚀"));

    await waitFor(() => expect(mockUpsert).toHaveBeenCalled());
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        exam_target: "group4",
        taluk: "Chennai North",
        role: "aspirant",
      })
    );
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/subjects"));
  });

  it("shows an error and does not navigate away when the upsert fails", async () => {
    mockUpsert.mockResolvedValue({ data: null, error: new Error("network error") });
    render(<OnboardingPage />);
    fillRequiredFields();
    fireEvent.click(screen.getByText("Start Practicing 🚀"));

    await waitFor(() =>
      expect(screen.getByText("Something went wrong. Please try again.")).toBeInTheDocument()
    );
    expect(mockPush).not.toHaveBeenCalledWith("/subjects");
  });
});
