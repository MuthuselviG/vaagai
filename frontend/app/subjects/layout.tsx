import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Subjects | Polity, History, Geography, Tamil & More",
  description: "Browse TNPSC Group 4 subjects — Polity, History, Geography, Economy, Science, Tamil — and practice Samacheer Kalvi Class 6–10 MCQs chapter by chapter, free.",
  alternates: { canonical: "https://mcqpalagu.in/subjects" },
};

export default function SubjectsLayout({ children }: { children: ReactNode }) {
  return children;
}
