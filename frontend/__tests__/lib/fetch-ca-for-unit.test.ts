import { describe, it, expect, vi, beforeEach } from "vitest";

function makeQueryChain(resolvedValue: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const methods = ["select", "gte", "lt", "eq", "in", "order", "limit"];
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

describe("fetchCAForUnit", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("does not cap the result with .limit(), unlike fetchCAMonthlyPreview", async () => {
    const { fetchCAForUnit } = await import("@/lib/supabase");
    const chain = makeQueryChain({ data: [], error: null });
    mockFrom.mockReturnValue(chain);

    await fetchCAForUnit("2026-06", "general-science", "en");

    expect(chain.limit).not.toHaveBeenCalled();
  });

  it("filters by month range, language, and the unit's subjects", async () => {
    const { fetchCAForUnit } = await import("@/lib/supabase");
    const chain = makeQueryChain({ data: [], error: null });
    mockFrom.mockReturnValue(chain);

    await fetchCAForUnit("2026-06", "general-science", "en");

    expect(mockFrom).toHaveBeenCalledWith("current_affairs");
    expect(chain.gte).toHaveBeenCalledWith("published_date", "2026-06-01");
    expect(chain.lt).toHaveBeenCalledWith("published_date", "2026-07-01");
    expect(chain.eq).toHaveBeenCalledWith("lang", "en");
    expect(chain.in).toHaveBeenCalledWith("subject", ["General Science"]);
  });

  it("returns an empty array without querying Supabase for an unknown unitSlug", async () => {
    const { fetchCAForUnit } = await import("@/lib/supabase");

    const result = await fetchCAForUnit("2026-06", "not-a-real-unit", "en");

    expect(result).toEqual([]);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("throws when the query errors", async () => {
    const { fetchCAForUnit } = await import("@/lib/supabase");
    mockFrom.mockReturnValue(makeQueryChain({ data: null, error: { message: "DB error" } }));

    await expect(fetchCAForUnit("2026-06", "general-science", "en")).rejects.toBeTruthy();
  });
});

describe("fetchCAMonthlyPreview", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("caps the result at 2 questions via .limit(2)", async () => {
    const { fetchCAMonthlyPreview } = await import("@/lib/supabase");
    const chain = makeQueryChain({ data: [], error: null });
    mockFrom.mockReturnValue(chain);

    await fetchCAMonthlyPreview("2026-06", "general-science", "en");

    expect(chain.limit).toHaveBeenCalledWith(2);
  });
});
