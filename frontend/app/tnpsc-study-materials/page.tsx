import { Metadata } from "next";
import StudyMaterialsClient from "./StudyMaterialsClient";

export const metadata: Metadata = {
  title: "TNPSC Study Materials 2026 | Free MCQ Practice",
  description:
    "TNPSC Group 4 study materials — current affairs, syllabus notes and more. Tamil & English. Free daily updates.",
  alternates: {
    canonical: "https://mcqpalagu.in/tnpsc-study-materials",
  },
};

export default function StudyMaterialsPage() {
  return <StudyMaterialsClient />;
}
