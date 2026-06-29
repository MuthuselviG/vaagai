import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Mock Tests | TNPSC Group 4 Full-Length Practice",
  description: "Free 200-question, 3-hour TNPSC Group 4 mock tests and previous year question papers (2012–2025). Practice in exam format, no login needed.",
  alternates: { canonical: "https://mcqpalagu.in/mock" },
};

export default function MockLayout({ children }: { children: ReactNode }) {
  return children;
}
