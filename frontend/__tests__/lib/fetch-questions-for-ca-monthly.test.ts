import { describe, it, expect, vi, beforeEach } from "vitest";

function makeQueryChain(resolvedValue: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const methods = ["select", "gte", "lt", "eq", "in", "order"];
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

describe("fetchQuestionsForCAMonthly", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("queries the full month range without an .in() filter when no unitSlug is given", async () => {
    const { fetchQuestionsForCAMonthly } = await import("@/lib/supabase");
    const chain = makeQueryChain({ data: [], error: null });
    mockFrom.mockReturnValue(chain);

    await fetchQuestionsForCAMonthly("2026-05", "en");

    expect(mockFrom).toHaveBeenCalledWith("current_affairs");
    expect(chain.gte).toHaveBeenCalledWith("published_date", "2026-05-01");
    expect(chain.lt).toHaveBeenCalledWith("published_date", "2026-06-01");
    expect(chain.in).not.toHaveBeenCalled();
  });

  it("filters by the unit's subjects when a valid unitSlug is given", async () => {
    const { fetchQuestionsForCAMonthly } = await import("@/lib/supabase");
    const chain = makeQueryChain({ data: [], error: null });
    mockFrom.mockReturnValue(chain);

    await fetchQuestionsForCAMonthly("2026-05", "en", "general-science");

    expect(chain.in).toHaveBeenCalledWith("subject", ["General Science"]);
  });

  it("returns an empty array without querying Supabase for an unknown unitSlug", async () => {
    const { fetchQuestionsForCAMonthly } = await import("@/lib/supabase");

    const result = await fetchQuestionsForCAMonthly("2026-05", "en", "not-a-real-unit");

    expect(result).toEqual([]);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("throws when the query errors", async () => {
    const { fetchQuestionsForCAMonthly } = await import("@/lib/supabase");
    mockFrom.mockReturnValue(makeQueryChain({ data: null, error: { message: "DB error" } }));

    await expect(fetchQuestionsForCAMonthly("2026-05", "en")).rejects.toBeTruthy();
  });
});
