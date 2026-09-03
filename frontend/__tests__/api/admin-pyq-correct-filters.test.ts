import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/admin/pyq-correct/filters/route";

function makeQueryChain(resolvedValue: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const methods = ["select", "eq", "range"];
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

describe("GET /api/admin/pyq-correct/filters", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 500 when the query errors", async () => {
    mockFrom.mockReturnValue(makeQueryChain({ data: null, error: new Error("boom") }));
    const res = await GET();
    expect(res.status).toBe(500);
  });

  it("dedupes and sorts years descending", async () => {
    mockFrom.mockReturnValue(
      makeQueryChain({
        data: [
          { pyq_years: [2019, 2012] },
          { pyq_years: [2021] },
          { pyq_years: [2019] },
          { pyq_years: null },
        ],
        error: null,
      })
    );

    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.years).toEqual([2021, 2019, 2012]);
  });

  it("returns an empty array when there is no data", async () => {
    mockFrom.mockReturnValue(makeQueryChain({ data: [], error: null }));
    const res = await GET();
    const json = await res.json();
    expect(json).toEqual({ years: [] });
  });

  it("pages past Supabase's 1000-row cap instead of silently truncating", async () => {
    // Regression test for the real bug: a single unpaginated select only
    // ever returned the first 1000 (all year 2025) of ~4000 PYQ rows, so
    // the year filter showed just "2025". A full first batch must trigger
    // a second request that picks up the remaining years.
    const firstBatch = Array.from({ length: 1000 }, () => ({ pyq_years: [2025] }));
    const secondBatch = [{ pyq_years: [2012] }];

    mockFrom
      .mockReturnValueOnce(makeQueryChain({ data: firstBatch, error: null }))
      .mockReturnValueOnce(makeQueryChain({ data: secondBatch, error: null }));

    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(mockFrom).toHaveBeenCalledTimes(2);
    expect(json.years).toEqual(expect.arrayContaining([2025, 2012]));
    expect(json.years.length).toBe(2);
  });
});
