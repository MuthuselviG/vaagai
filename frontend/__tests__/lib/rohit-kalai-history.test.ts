import { describe, it, expect, vi, beforeEach } from "vitest";
import { sortByIdOrder } from "@/lib/supabase";

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
