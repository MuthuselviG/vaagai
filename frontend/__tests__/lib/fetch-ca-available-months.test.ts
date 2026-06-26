import { describe, it, expect, vi, beforeEach } from "vitest";

function makeQueryChain(resolvedValue: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const methods = ["select", "order", "limit"];
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

describe("fetchCAAvailableMonths", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  function mockRange(earliestDate: string, latestDate: string) {
    mockFrom.mockImplementation(() => {
      const chain: Record<string, unknown> = {};
      chain.select = vi.fn(() => chain);
      chain.order = vi.fn((_col: string, opts: { ascending: boolean }) => {
        chain.__ascending = opts.ascending;
        return chain;
      });
      chain.limit = vi.fn(() => {
        const date = chain.__ascending ? earliestDate : latestDate;
        return Promise.resolve({ data: [{ published_date: date }], error: null });
      });
      return chain;
    });
  }

  it("returns a single month when earliest and latest fall in the same month", async () => {
    const { fetchCAAvailableMonths } = await import("@/lib/supabase");
    mockRange("2026-06-01", "2026-06-25");

    const months = await fetchCAAvailableMonths();

    expect(months).toEqual(["june-2026"]);
  });

  it("returns every month between earliest and latest, most recent first", async () => {
    const { fetchCAAvailableMonths } = await import("@/lib/supabase");
    // June alone has >1000 rows in production; a naive unbounded query would
    // never reach May's older rows. This only ever fetches 2 rows total.
    mockRange("2026-05-03", "2026-06-25");

    const months = await fetchCAAvailableMonths();

    expect(months).toEqual(["june-2026", "may-2026"]);
  });

  it("rolls over a year boundary correctly", async () => {
    const { fetchCAAvailableMonths } = await import("@/lib/supabase");
    mockRange("2025-12-10", "2026-01-15");

    const months = await fetchCAAvailableMonths();

    expect(months).toEqual(["january-2026", "december-2025"]);
  });

  it("returns an empty array when there is no current affairs data", async () => {
    const { fetchCAAvailableMonths } = await import("@/lib/supabase");
    mockFrom.mockReturnValue(makeQueryChain({ data: [], error: null }));

    const months = await fetchCAAvailableMonths();

    expect(months).toEqual([]);
  });

  it("throws when the earliest-date query errors", async () => {
    const { fetchCAAvailableMonths } = await import("@/lib/supabase");
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount += 1;
      const isErrorCall = callCount === 1;
      return makeQueryChain(
        isErrorCall
          ? { data: null, error: { message: "DB error" } }
          : { data: [{ published_date: "2026-06-01" }], error: null }
      );
    });

    await expect(fetchCAAvailableMonths()).rejects.toBeTruthy();
  });
});
