import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CAQuestionCard from "@/components/CAQuestionCard";
import type { CAQuestion } from "@/lib/supabase";

const baseQuestion: CAQuestion = {
  id: "q1",
  question: "Which river is known as the Dakshin Ganga?",
  lang: "en",
  options: ["Krishna", "Godavari", "Kaveri", "Tungabhadra"],
  correct_option: "Godavari",
  explanation: "The Godavari is called the Dakshin Ganga.",
  topic: "Rivers",
  subject: "Geography",
  published_date: "2026-05-01",
  source_url: null,
  slug: "dakshin-ganga-river",
};

describe("CAQuestionCard", () => {
  it("renders the question, all options, the correct answer, and the explanation", () => {
    const { container } = render(<CAQuestionCard q={baseQuestion} num={3} lang="en" variant="unit" />);
    expect(screen.getByText(baseQuestion.question)).toBeInTheDocument();
    for (const opt of baseQuestion.options) {
      expect(container.textContent).toContain(opt);
    }
    expect(screen.getByText("✅ Correct Answer").nextElementSibling).toHaveTextContent("Godavari");
    expect(screen.getByText(baseQuestion.explanation!)).toBeInTheDocument();
  });

  it("omits the explanation block when explanation is null", () => {
    render(<CAQuestionCard q={{ ...baseQuestion, explanation: null }} num={1} lang="en" variant="unit" />);
    expect(screen.queryByText("📖 Explanation")).not.toBeInTheDocument();
  });

  it("shows the topic pill only for unit + English", () => {
    render(<CAQuestionCard q={baseQuestion} num={1} lang="en" variant="unit" />);
    expect(screen.getByText("Rivers")).toBeInTheDocument();
  });

  it("never shows the topic pill for the hub variant, even in English", () => {
    render(<CAQuestionCard q={baseQuestion} num={1} lang="en" variant="hub" />);
    expect(screen.queryByText("Rivers")).not.toBeInTheDocument();
  });

  it("never shows the topic pill for unit + Tamil", () => {
    render(<CAQuestionCard q={baseQuestion} num={1} lang="ta" variant="unit" />);
    expect(screen.queryByText("Rivers")).not.toBeInTheDocument();
  });

  it("uses Tamil question label and option letters when lang is ta", () => {
    render(<CAQuestionCard q={baseQuestion} num={2} lang="ta" variant="unit" />);
    expect(screen.getByText("வினா 2")).toBeInTheDocument();
    expect(screen.getByText("அ")).toBeInTheDocument();
  });

  it("uses English question label and A/B/C/D option letters when lang is en", () => {
    render(<CAQuestionCard q={baseQuestion} num={2} lang="en" variant="hub" />);
    expect(screen.getByText("Question 2")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("D")).toBeInTheDocument();
  });

  it("sets an anchor id from the slug for the unit variant", () => {
    const { container } = render(<CAQuestionCard q={baseQuestion} num={1} lang="en" variant="unit" />);
    expect(container.querySelector("#dakshin-ganga-river")).toBeInTheDocument();
  });

  it("falls back to the question id for the anchor when slug is missing", () => {
    const { container } = render(
      <CAQuestionCard q={{ ...baseQuestion, slug: null }} num={1} lang="en" variant="unit" />
    );
    expect(container.querySelector("#q1")).toBeInTheDocument();
  });

  it("does not render an anchor id for the hub variant", () => {
    const { container } = render(<CAQuestionCard q={baseQuestion} num={1} lang="en" variant="hub" />);
    expect(container.querySelector("#dakshin-ganga-river")).not.toBeInTheDocument();
    expect(container.querySelector("#q1")).not.toBeInTheDocument();
  });
});
