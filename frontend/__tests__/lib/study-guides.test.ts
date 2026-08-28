import { describe, it, expect } from "vitest";
import { buildStudyGuides } from "@/lib/supabase";

describe("buildStudyGuides", () => {
  it("maps a reading-only pack to its SEO page href", () => {
    const guides = buildStudyGuides(
      [{ id: "pack-1", name: "NITI Aayog", question_count: 196 }],
      { "pack-1": "/tnpsc-study-materials/er-thangamuthu/niti-aayog" }
    );
    expect(guides).toEqual([
      { href: "/tnpsc-study-materials/er-thangamuthu/niti-aayog", title: "NITI Aayog", questionCount: 196 },
    ]);
  });

  it("collapses multiple packs sharing the same href into one card with a combined count", () => {
    const guides = buildStudyGuides(
      [
        { id: "term-1", name: "History Term 1", question_count: 88 },
        { id: "term-2", name: "History Term 2", question_count: 78 },
      ],
      {
        "term-1": "/tnpsc-study-materials/rohit-kalai/class-6-history-samacheer-kalvi",
        "term-2": "/tnpsc-study-materials/rohit-kalai/class-6-history-samacheer-kalvi",
      }
    );
    expect(guides).toEqual([
      { href: "/tnpsc-study-materials/rohit-kalai/class-6-history-samacheer-kalvi", title: "History Term 1", questionCount: 166 },
    ]);
  });

  it("skips packs with no known href", () => {
    const guides = buildStudyGuides([{ id: "unknown", name: "Mystery Pack", question_count: 10 }], {});
    expect(guides).toEqual([]);
  });

  it("returns an empty list for no reading packs", () => {
    expect(buildStudyGuides([], {})).toEqual([]);
  });
});
