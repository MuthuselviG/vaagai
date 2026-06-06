import { render, screen } from "@testing-library/react";
import QuestionText from "@/components/QuestionText";

describe("QuestionText", () => {
  it("returns null for empty string", () => {
    const { container } = render(<QuestionText text="" lang="en" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders plain text as a Regular paragraph", () => {
    render(<QuestionText text="What is the capital of India?" lang="en" />);
    expect(
      screen.getByText("What is the capital of India?")
    ).toBeInTheDocument();
  });

  it("renders English Assertion-Reason type tag", () => {
    const text =
      "Assertion (A): The sky is blue. Reason (R): Rayleigh scattering.";
    render(<QuestionText text={text} lang="en" />);
    expect(screen.getByText("Assertion – Reason")).toBeInTheDocument();
  });

  it("renders English Assertion-Reason segments separately", () => {
    const text =
      "Assertion (A): The sky is blue. Reason (R): Rayleigh scattering.";
    render(<QuestionText text={text} lang="en" />);
    expect(screen.getByText("The sky is blue.")).toBeInTheDocument();
    expect(screen.getByText("Rayleigh scattering.")).toBeInTheDocument();
  });

  it("renders Tamil Assertion-Reason type tag", () => {
    const text =
      "கூற்று (A) : வானம் நீலமாக உள்ளது. காரணம் (R) : ரெய்லே சிதறல்.";
    render(<QuestionText text={text} lang="ta" />);
    expect(screen.getByText("கூற்று – காரணம்")).toBeInTheDocument();
  });

  it("renders English Match List type tag", () => {
    const text =
      "Match List I with List II\nList I:\na) A\nb) B\nList II:\n1. X\n2. Y";
    render(<QuestionText text={text} lang="en" />);
    expect(screen.getByText("Match the Lists")).toBeInTheDocument();
  });

  it("renders English Statement type tag", () => {
    const text =
      "Consider the following:\n(1) First statement.\n(2) Second statement.\n(3) Third statement.";
    render(<QuestionText text={text} lang="en" />);
    expect(screen.getByText("Statements")).toBeInTheDocument();
  });

  it("renders Tamil Statement type tag", () => {
    const text =
      "பின்வருவனவற்றில்:\n(1) முதல் கூற்று.\n(2) இரண்டாம் கூற்று.";
    render(<QuestionText text={text} lang="ta" />);
    expect(screen.getByText("கூற்றுகள்")).toBeInTheDocument();
  });
});
