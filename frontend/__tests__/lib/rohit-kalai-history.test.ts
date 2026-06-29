import { describe, it, expect, vi, beforeEach } from "vitest";
import { sortByIdOrder, findUnitBySlug } from "@/lib/supabase";
import type { ReadingUnit } from "@/lib/supabase";

describe("sortByIdOrder", () => {
  it("sorts rows according to the given id order", () => {
    const rows = [{ id: "b" }, { id: "a" }, { id: "c" }];
    const sorted = sortByIdOrder(rows, ["a", "b", "c"]);
    expect(sorted.map((r) => r.id)).toEqual(["a", "b", "c"]);
  });

  it("appends rows whose id is not in the order list, after the known ones", () => {
    const rows = [{ id: "unknown" }, { id: "b" }, { id: "a" }];
    const sorted = sortByIdOrder(rows, ["a", "b"]);
    expect(sorted.map((r) => r.id)).toEqual(["a", "b", "unknown"]);
  });

  it("does not mutate the input array", () => {
    const rows = [{ id: "b" }, { id: "a" }];
    sortByIdOrder(rows, ["a", "b"]);
    expect(rows.map((r) => r.id)).toEqual(["b", "a"]);
  });

  it("returns an empty array when given no rows", () => {
    expect(sortByIdOrder([], ["a", "b"])).toEqual([]);
  });
});

describe("findUnitBySlug", () => {
  const units: ReadingUnit[] = [
    { topic: "மனிதர்களின் பரிணாம வளர்ச்சி", slug: "மனிதர்களின்-பரிணாம-வளர்ச்சி", questions: [] },
    { topic: "எகிப்திய நாகரிகம்", slug: "எகிப்திய-நாகரிகம்", questions: [] },
  ];

  it("matches when the slug arrives percent-encoded, as Next.js passes route params", () => {
    const rawSlug = encodeURIComponent("மனிதர்களின்-பரிணாம-வளர்ச்சி");
    expect(findUnitBySlug(units, rawSlug)?.topic).toBe("மனிதர்களின் பரிணாம வளர்ச்சி");
  });

  it("matches when the slug is already decoded", () => {
    expect(findUnitBySlug(units, "எகிப்திய-நாகரிகம்")?.topic).toBe("எகிப்திய நாகரிகம்");
  });

  it("returns undefined when no unit matches", () => {
    expect(findUnitBySlug(units, "no-such-unit")).toBeUndefined();
  });
});

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

describe("fetchRohitKalaiClass6HistoryTerm1", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns rows in textbook order, with unknown rows appended at the end", async () => {
    const { fetchRohitKalaiClass6HistoryTerm1 } = await import("@/lib/supabase");

    // Out of order on purpose, plus one id that isn't in the static order list.
    const rows = [
      { id: "c70036d7-9aa3-4c5b-818c-b45fd9aa12ca", question: "Q3", explanation: "A3" },
      { id: "00000000-0000-0000-0000-000000000000", question: "Unknown", explanation: "AU" },
      { id: "17f1c3a5-340d-434b-aaca-a8b22d3253c4", question: "Q1", explanation: "A1" },
      { id: "c8d37c1e-8c34-468d-a794-5f4339f4f7fe", question: "Q2", explanation: "A2" },
    ];
    mockFrom.mockReturnValue(makeQueryChain({ data: rows, error: null }));

    const result = await fetchRohitKalaiClass6HistoryTerm1();

    expect(mockFrom).toHaveBeenCalledWith("questions");
    expect(result.map((r) => r.question)).toEqual(["Q1", "Q2", "Q3", "Unknown"]);
  });

  it("throws when the query errors", async () => {
    const { fetchRohitKalaiClass6HistoryTerm1 } = await import("@/lib/supabase");
    mockFrom.mockReturnValue(makeQueryChain({ data: null, error: { message: "DB error" } }));
    await expect(fetchRohitKalaiClass6HistoryTerm1()).rejects.toBeTruthy();
  });
});

describe("fetchRohitKalaiClass6HistoryTerm1Units", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("groups rows by topic, preserving first-seen topic order", async () => {
    const { fetchRohitKalaiClass6HistoryTerm1Units } = await import("@/lib/supabase");

    const rows = [
      { id: "17f1c3a5-340d-434b-aaca-a8b22d3253c4", question: "Q1", explanation: "A1", topic: "அலகு A" },
      { id: "c8d37c1e-8c34-468d-a794-5f4339f4f7fe", question: "Q2", explanation: "A2", topic: "அலகு B" },
      { id: "c70036d7-9aa3-4c5b-818c-b45fd9aa12ca", question: "Q3", explanation: "A3", topic: "அலகு A" },
    ];
    mockFrom.mockReturnValue(makeQueryChain({ data: rows, error: null }));

    const units = await fetchRohitKalaiClass6HistoryTerm1Units();

    expect(units.map((u) => u.topic)).toEqual(["அலகு A", "அலகு B"]);
    expect(units[0].questions.map((q) => q.question)).toEqual(["Q1", "Q3"]);
    expect(units[1].questions.map((q) => q.question)).toEqual(["Q2"]);
  });

  it("drops rows with a null or empty topic", async () => {
    const { fetchRohitKalaiClass6HistoryTerm1Units } = await import("@/lib/supabase");

    const rows = [
      { id: "17f1c3a5-340d-434b-aaca-a8b22d3253c4", question: "Q1", explanation: "A1", topic: null },
      { id: "c8d37c1e-8c34-468d-a794-5f4339f4f7fe", question: "Q2", explanation: "A2", topic: "" },
    ];
    mockFrom.mockReturnValue(makeQueryChain({ data: rows, error: null }));

    const units = await fetchRohitKalaiClass6HistoryTerm1Units();

    expect(units).toEqual([]);
  });

  it("derives a slug from each topic", async () => {
    const { fetchRohitKalaiClass6HistoryTerm1Units } = await import("@/lib/supabase");

    const rows = [
      { id: "17f1c3a5-340d-434b-aaca-a8b22d3253c4", question: "Q1", explanation: "A1", topic: "Topic One" },
    ];
    mockFrom.mockReturnValue(makeQueryChain({ data: rows, error: null }));

    const units = await fetchRohitKalaiClass6HistoryTerm1Units();

    expect(units[0].slug).toBe("topic-one");
  });

  it("throws when the query errors", async () => {
    const { fetchRohitKalaiClass6HistoryTerm1Units } = await import("@/lib/supabase");
    mockFrom.mockReturnValue(makeQueryChain({ data: null, error: { message: "DB error" } }));
    await expect(fetchRohitKalaiClass6HistoryTerm1Units()).rejects.toBeTruthy();
  });
});

describe("fetchRohitKalaiClass6HistoryTerm2Units", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("groups rows by topic in pack_order, without needing a hardcoded id order", async () => {
    const { fetchRohitKalaiClass6HistoryTerm2Units } = await import("@/lib/supabase");

    const rows = [
      { id: "1", question: "Q1", explanation: "A1", topic: "அலகு 1" },
      { id: "2", question: "Q2", explanation: "A2", topic: "அலகு 1" },
      { id: "3", question: "Q3", explanation: "A3", topic: "அலகு 2" },
    ];
    mockFrom.mockReturnValue(makeQueryChain({ data: rows, error: null }));

    const units = await fetchRohitKalaiClass6HistoryTerm2Units();

    expect(mockFrom).toHaveBeenCalledWith("questions");
    expect(units.map((u) => ({ topic: u.topic, count: u.questions.length }))).toEqual([
      { topic: "அலகு 1", count: 2 },
      { topic: "அலகு 2", count: 1 },
    ]);
  });

  it("throws when the query errors", async () => {
    const { fetchRohitKalaiClass6HistoryTerm2Units } = await import("@/lib/supabase");
    mockFrom.mockReturnValue(makeQueryChain({ data: null, error: { message: "DB error" } }));
    await expect(fetchRohitKalaiClass6HistoryTerm2Units()).rejects.toBeTruthy();
  });
});
