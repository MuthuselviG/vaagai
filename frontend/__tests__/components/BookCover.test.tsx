import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import BookCover from "@/components/BookCover";

describe("BookCover", () => {
  it("renders the label, emoji, and plate text for an available book", () => {
    render(
      <BookCover
        emoji="🏺"
        label={<>Term<br />1</>}
        status="available"
        plate="166 Q&A · தயார்"
        href="/some/path"
      />
    );
    expect(screen.getByText("🏺")).toBeInTheDocument();
    expect(screen.getByText("166 Q&A · தயார்")).toBeInTheDocument();
    expect(screen.getByTestId("book-cover")).toHaveAttribute("data-status", "available");
  });

  it("wraps an available book with an href in a link", () => {
    const { container } = render(
      <BookCover emoji="🏺" label="Term 1" status="available" href="/some/path" ariaLabel="Term 1" />
    );
    const link = container.querySelector("a");
    expect(link).toHaveAttribute("href", "/some/path");
    expect(link).toHaveAttribute("aria-label", "Term 1");
  });

  it("does not render a link when status is locked, even if href is passed", () => {
    const { container } = render(
      <BookCover emoji="📕" label="Term 2" status="locked" href="/some/path" />
    );
    expect(container.querySelector("a")).not.toBeInTheDocument();
  });

  it("shows a lock icon and no plate text for a locked book", () => {
    render(<BookCover emoji="📕" label="Term 2" status="locked" plate="should not show" />);
    expect(screen.getByText("🔒")).toBeInTheDocument();
    expect(screen.queryByText("should not show")).not.toBeInTheDocument();
  });

  it("omits the link wrapper when an available book has no href", () => {
    const { container } = render(<BookCover emoji="🏺" label="Term 1" status="available" />);
    expect(container.querySelector("a")).not.toBeInTheDocument();
  });
});
