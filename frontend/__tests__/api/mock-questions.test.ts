import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/mock/questions/route";

// Build a chainable Supabase query mock that resolves to the given value
function makeQueryChain(resolvedValue: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const methods = [
    "select", "eq", "neq", "contains", "in",
    "gte", "lt", "order", "limit", "range", "single",
  ];
  for (const m of methods) {
    chain[m] = vi.fn(() => chain);
  }
  chain.then = (
    resolve: (v: unknown) => unknown,
    reject?: (e: unknown) => unknown
  ) => Promise.resolve(resolvedValue).then(resolve, reject);
  chain.catch = (handler: (e: unknown) => unknown) =>
    Promise.resolve(resolvedValue).catch(handler);
  return chain;
}

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
    auth: { getUser: vi.fn() },
  })),
}));

function makeRequest(params: Record<string, string>) {
  const url = new URL("http://localhost/api/mock/questions");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new NextRequest(url.toString());
}

describe("GET /api/mock/questions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 400 when year param is missing", async () => {
    const req = makeRequest({ group: "group4" });
    const res = await GET(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("year");
  });

  it("returns 400 when year is not a number", async () => {
    const req = makeRequest({ year: "notanumber" });
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("places Tamil questions before GS questions and reports correct counts", async () => {
    const tamilQ = [{ id: "t1", question: "Tamil Q", subject: "General Tamil" }];
    const gsQ = [{ id: "g1", question: "GS Q", subject: "History" }];

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      return callCount === 1
        ? makeQueryChain({ data: tamilQ, error: null })
        : makeQueryChain({ data: gsQ, error: null });
    });

    const req = makeRequest({ year: "2024", group: "group4", lang: "en" });
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.questions[0].subject).toBe("General Tamil");
    expect(json.questions[1].subject).toBe("History");
    expect(json.tamil_count).toBe(1);
    expect(json.gs_count).toBe(1);
    expect(json.total).toBe(2);
  });

  it("handles empty results from both queries (returns total = 0)", async () => {
    mockFrom.mockReturnValue(makeQueryChain({ data: [], error: null }));

    const req = makeRequest({ year: "2024" });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.total).toBe(0);
    expect(json.questions).toHaveLength(0);
  });

  it("returns 500 when the Tamil query errors", async () => {
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      return callCount === 1
        ? makeQueryChain({ data: null, error: { message: "DB error" } })
        : makeQueryChain({ data: [], error: null });
    });

    const req = makeRequest({ year: "2024" });
    const res = await GET(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toContain("Tamil");
  });

  it("returns 500 when the GS query errors", async () => {
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      return callCount === 1
        ? makeQueryChain({ data: [], error: null })
        : makeQueryChain({ data: null, error: { message: "DB error" } });
    });

    const req = makeRequest({ year: "2024" });
    const res = await GET(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toContain("GS");
  });

  it("defaults group to group4 and lang to ta when not provided", async () => {
    mockFrom.mockReturnValue(makeQueryChain({ data: [], error: null }));

    const req = makeRequest({ year: "2024" });
    const res = await GET(req);
    // Should not fail validation — defaults are applied
    expect(res.status).toBe(200);
  });
});
