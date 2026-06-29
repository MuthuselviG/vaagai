import { describe, it, expect, vi, beforeEach } from "vitest";

function makeQueryChain(resolvedValue: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const methods = ["select", "eq", "not"];
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

describe("fetchVerifiedCreatorSlugs", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns slugs for verified creators", async () => {
    const { fetchVerifiedCreatorSlugs } = await import("@/lib/supabase");
    mockFrom.mockReturnValue(
      makeQueryChain({ data: [{ slug: "rohit-kalai" }, { slug: "er-thangamuthu" }], error: null })
    );

    const slugs = await fetchVerifiedCreatorSlugs();

    expect(slugs).toEqual(["rohit-kalai", "er-thangamuthu"]);
  });

  it("returns an empty array when there are no verified creators", async () => {
    const { fetchVerifiedCreatorSlugs } = await import("@/lib/supabase");
    mockFrom.mockReturnValue(makeQueryChain({ data: [], error: null }));

    const slugs = await fetchVerifiedCreatorSlugs();

    expect(slugs).toEqual([]);
  });

  it("throws when the query errors", async () => {
    const { fetchVerifiedCreatorSlugs } = await import("@/lib/supabase");
    mockFrom.mockReturnValue(makeQueryChain({ data: null, error: { message: "DB error" } }));

    await expect(fetchVerifiedCreatorSlugs()).rejects.toBeTruthy();
  });
});
