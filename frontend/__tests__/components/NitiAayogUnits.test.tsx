import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import NitiAayogUnits from "@/components/NitiAayogUnits";
import type { BilingualUnit } from "@/lib/supabase";

const units: BilingualUnit[] = [
  {
    topic: "Establishment",
    questions: [
      { id: "q1", questionEn: "When was NITI Aayog established?", questionTa: "NITI Aayog எப்போது நிறுவப்பட்டது?", explanationEn: "2015", explanationTa: "2015" },
    ],
  },
];

describe("NitiAayogUnits", () => {
  // Regression test for a real production 500: the page previously passed a
  // `qa` formatter *function* from the server component down to this client
  // component as a prop, which Next.js can't serialize across the RSC
  // boundary ("Functions cannot be passed directly to Client Components").
  // The component now derives the label from `lang` internally instead.
  it("renders without a qa function prop, deriving the Q&A count label from lang", () => {
    render(<NitiAayogUnits units={units} lang="en" answerLabel="Answer" tapHint="Tap to open" />);
    expect(screen.getByText("1 Q&A")).toBeInTheDocument();
  });

  it("renders the Tamil Q&A count label when lang is ta", () => {
    render(<NitiAayogUnits units={units} lang="ta" answerLabel="விடை" tapHint="தொடவும்" />);
    expect(screen.getByText("1 வினா-விடை")).toBeInTheDocument();
  });
});
