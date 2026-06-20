import { describe, it, expect, vi, beforeEach } from "vitest";

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

describe("fetchQuestionsForPack", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("queries the questions table filtered by pack_id, ordered by pack_order", async () => {
    const { fetchQuestionsForPack } = await import("@/lib/supabase");
    const chain = makeQueryChain({ data: [], error: null });
    mockFrom.mockReturnValue(chain);

    await fetchQuestionsForPack("pack-1", "ta");

    expect(mockFrom).toHaveBeenCalledWith("questions");
    expect(chain.eq).toHaveBeenCalledWith("pack_id", "pack-1");
    expect(chain.order).toHaveBeenCalledWith("pack_order", { ascending: true });
  });

  it("returns rows sorted by pack_order regardless of the order returned by the query", async () => {
    const { fetchQuestionsForPack } = await import("@/lib/supabase");
    const rows = [
      { id: "3", question: "Q3", lang: "ta", pack_order: 3 },
      { id: "1", question: "Q1", lang: "ta", pack_order: 1 },
      { id: "2", question: "Q2", lang: "ta", pack_order: 2 },
    ];
    mockFrom.mockReturnValue(makeQueryChain({ data: rows, error: null }));

    const result = await fetchQuestionsForPack("pack-1", "ta");

    expect(result.map((r) => r.question)).toEqual(["Q1", "Q2", "Q3"]);
  });

  it("prefers the requested language when a pack_order has rows in both languages", async () => {
    const { fetchQuestionsForPack } = await import("@/lib/supabase");
    const rows = [
      { id: "1en", question: "English Q1", lang: "en", pack_order: 1 },
      { id: "1ta", question: "தமிழ் வினா 1", lang: "ta", pack_order: 1 },
    ];
    mockFrom.mockReturnValue(makeQueryChain({ data: rows, error: null }));

    const taResult = await fetchQuestionsForPack("pack-1", "ta");
    expect(taResult.map((r) => r.id)).toEqual(["1ta"]);

    mockFrom.mockReturnValue(makeQueryChain({ data: rows, error: null }));
    const enResult = await fetchQuestionsForPack("pack-1", "en");
    expect(enResult.map((r) => r.id)).toEqual(["1en"]);
  });

  it("falls back to whichever language is available when the requested language is missing", async () => {
    const { fetchQuestionsForPack } = await import("@/lib/supabase");
    const rows = [{ id: "1ta", question: "தமிழ் வினா 1", lang: "ta", pack_order: 1 }];
    mockFrom.mockReturnValue(makeQueryChain({ data: rows, error: null }));

    const result = await fetchQuestionsForPack("pack-1", "en");

    expect(result.map((r) => r.id)).toEqual(["1ta"]);
  });

  it("returns an empty array when the pack has no questions", async () => {
    const { fetchQuestionsForPack } = await import("@/lib/supabase");
    mockFrom.mockReturnValue(makeQueryChain({ data: [], error: null }));

    const result = await fetchQuestionsForPack("pack-1", "ta");

    expect(result).toEqual([]);
  });

  it("throws when the query errors", async () => {
    const { fetchQuestionsForPack } = await import("@/lib/supabase");
    mockFrom.mockReturnValue(makeQueryChain({ data: null, error: { message: "DB error" } }));

    await expect(fetchQuestionsForPack("pack-1", "ta")).rejects.toBeTruthy();
  });
});
