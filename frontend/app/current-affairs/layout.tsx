import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Today's Current Affairs | TNPSC Group 4",
  description: "Daily current affairs MCQs for TNPSC Group 4, updated every day in Tamil & English. Covers General Science, Polity, Economy, Geography & more.",
  alternates: { canonical: "https://mcqpalagu.in/current-affairs" },
};

export default function CurrentAffairsLayout({ children }: { children: ReactNode }) {
  return children;
}
