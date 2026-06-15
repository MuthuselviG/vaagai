import { render, screen } from "@testing-library/react";
import QuestionImage from "@/components/QuestionImage";

describe("QuestionImage", () => {
  it("returns null when src is missing", () => {
    const { container } = render(<QuestionImage src={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when src is null", () => {
    const { container } = render(<QuestionImage src={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when src is an empty string", () => {
    const { container } = render(<QuestionImage src="" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders an img with the given src", () => {
    const { container } = render(<QuestionImage src="https://example.com/question.png" />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", "https://example.com/question.png");
  });

  it("uses lazy loading and an empty alt by default", () => {
    const { container } = render(<QuestionImage src="https://example.com/question.png" />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("alt", "");
  });

  it("accepts a custom alt text", () => {
    render(<QuestionImage src="https://example.com/question.png" alt="Diagram" />);
    expect(screen.getByAltText("Diagram")).toBeInTheDocument();
  });
});
