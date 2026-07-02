import { describe, it, expect, vi, beforeEach } from "vitest";
import { findUnitBySlug } from "@/lib/supabase";
import type { BilingualUnit } from "@/lib/supabase";

function makeQueryChain(resolvedValue: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const methods = ["select", "eq", "order"];
  for (const m of methods) {
    chain[m] = vi.fn(() => chain);
  }
  chain.then = (
    resolve: (v: unknown) => unknown,
    reject?: (e: unknown) => unknown
  ) => Promise.resolve(resolvedValue).then(resolve, reject);
  return chain;
}

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ from: mockFrom })),
}));

describe("fetchNitiAayogUnits", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("pairs consecutive en/ta rows by pack_order and groups by topic", async () => {
    const { fetchNitiAayogUnits } = await import("@/lib/supabase");

    const rows = [
      { id: "en-1", question: "When was it set up?", explanation: "2015", topic: "Basics", lang: "en", pack_order: 1 },
      { id: "ta-1", question: "எப்போது?", explanation: "2015", topic: "Basics", lang: "ta", pack_order: 2 },
      { id: "en-2", question: "Who is CEO?", explanation: "X", topic: "Leadership", lang: "en", pack_order: 3 },
      { id: "ta-2", question: "CEO யார்?", explanation: "X", topic: "Leadership", lang: "ta", pack_order: 4 },
    ];
    mockFrom.mockReturnValue(makeQueryChain({ data: rows, error: null }));

    const units = await fetchNitiAayogUnits();

    expect(mockFrom).toHaveBeenCalledWith("questions");
    expect(units.map((u) => ({ topic: u.topic, count: u.questions.length }))).toEqual([
      { topic: "Basics", count: 1 },
      { topic: "Leadership", count: 1 },
    ]);
    expect(units[0].questions[0]).toEqual({
      id: "en-1",
      questionEn: "When was it set up?",
      questionTa: "எப்போது?",
      explanationEn: "2015",
      explanationTa: "2015",
    });
  });

  it("pairs correctly regardless of which row (en/ta) comes first in a pair", async () => {
    const { fetchNitiAayogUnits } = await import("@/lib/supabase");

    const rows = [
      { id: "ta-1", question: "தமிழ்", explanation: "விடை", topic: "Basics", lang: "ta", pack_order: 2 },
      { id: "en-1", question: "English", explanation: "Answer", topic: "Basics", lang: "en", pack_order: 1 },
    ];
    mockFrom.mockReturnValue(makeQueryChain({ data: rows, error: null }));

    const units = await fetchNitiAayogUnits();

    expect(units[0].questions[0]).toEqual({
      id: "en-1",
      questionEn: "English",
      questionTa: "தமிழ்",
      explanationEn: "Answer",
      explanationTa: "விடை",
    });
  });

  it("drops an unpaired trailing row", async () => {
    const { fetchNitiAayogUnits } = await import("@/lib/supabase");

    const rows = [
      { id: "en-1", question: "Q1", explanation: "A1", topic: "Basics", lang: "en", pack_order: 1 },
      { id: "ta-1", question: "Q1t", explanation: "A1t", topic: "Basics", lang: "ta", pack_order: 2 },
      { id: "en-2", question: "Q2", explanation: "A2", topic: "Basics", lang: "en", pack_order: 3 },
    ];
    mockFrom.mockReturnValue(makeQueryChain({ data: rows, error: null }));

    const units = await fetchNitiAayogUnits();

    expect(units[0].questions).toHaveLength(1);
  });

  it("drops pairs with no topic", async () => {
    const { fetchNitiAayogUnits } = await import("@/lib/supabase");

    const rows = [
      { id: "en-1", question: "Q1", explanation: "A1", topic: null, lang: "en", pack_order: 1 },
      { id: "ta-1", question: "Q1t", explanation: "A1t", topic: null, lang: "ta", pack_order: 2 },
    ];
    mockFrom.mockReturnValue(makeQueryChain({ data: rows, error: null }));

    const units = await fetchNitiAayogUnits();

    expect(units).toEqual([]);
  });

  it("derives a slug from each topic", async () => {
    const { fetchNitiAayogUnits } = await import("@/lib/supabase");

    const rows = [
      { id: "en-1", question: "Q1", explanation: "A1", topic: "Vision, Mission & Core Values", lang: "en", pack_order: 1 },
      { id: "ta-1", question: "Q1t", explanation: "A1t", topic: "Vision, Mission & Core Values", lang: "ta", pack_order: 2 },
    ];
    mockFrom.mockReturnValue(makeQueryChain({ data: rows, error: null }));

    const units = await fetchNitiAayogUnits();

    expect(units[0].slug).toBe("vision-mission-core-values");
  });

  it("throws when the query errors", async () => {
    const { fetchNitiAayogUnits } = await import("@/lib/supabase");
    mockFrom.mockReturnValue(makeQueryChain({ data: null, error: { message: "DB error" } }));
    await expect(fetchNitiAayogUnits()).rejects.toBeTruthy();
  });
});

describe("findUnitBySlug (generic, used for BilingualUnit too)", () => {
  const units: BilingualUnit[] = [
    { topic: "Establishment & Basics", slug: "establishment-basics", questions: [] },
    { topic: "Leadership & Structure", slug: "leadership-structure", questions: [] },
  ];

  it("finds a bilingual unit by slug", () => {
    expect(findUnitBySlug(units, "leadership-structure")?.topic).toBe("Leadership & Structure");
  });

  it("returns undefined when no unit matches", () => {
    expect(findUnitBySlug(units, "no-such-unit")).toBeUndefined();
  });
});
