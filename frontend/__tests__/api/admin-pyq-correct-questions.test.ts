import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/admin/pyq-correct/questions/route";

function makeQueryChain(resolvedValue: { data: unknown; error: unknown; count?: number | null }) {
  const chain: Record<string, unknown> = {};
  const methods = ["select", "eq", "contains", "order", "range", "insert", "single"];
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

function makeGetRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost/api/admin/pyq-correct/questions");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new NextRequest(url.toString());
}

function makePostRequest(body: unknown) {
  return new NextRequest("http://localhost/api/admin/pyq-correct/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validQuestion = {
  question: "Which article abolishes untouchability?",
  options: ["Article 15", "Article 17", "Article 21", "Article 25"],
  correct_option: "Article 17",
  explanation: "Article 17 abolishes untouchability.",
  subject: "Indian Polity",
  topic: "Fundamental Rights",
  lang: "en",
  pyq_years: [2017, 2021],
  pyq_groups: ["group2", "group4"],
};

describe("GET /api/admin/pyq-correct/questions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 500 when the query errors", async () => {
    mockFrom.mockReturnValue(makeQueryChain({ data: null, error: new Error("boom"), count: null }));
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(500);
  });

  it("returns paginated questions with defaults", async () => {
    mockFrom.mockReturnValue(makeQueryChain({ data: [{ id: "q1" }], error: null, count: 42 }));
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.questions).toEqual([{ id: "q1" }]);
    expect(json.total).toBe(42);
    expect(json.page).toBe(1);
    expect(json.pageSize).toBe(20);
  });

  it("applies year/group/lang/subject filters without erroring", async () => {
    const chain = makeQueryChain({ data: [], error: null, count: 0 });
    mockFrom.mockReturnValue(chain);
    const res = await GET(makeGetRequest({ year: "2021", group: "group4", lang: "ta", subject: "History", page: "2" }));
    expect(res.status).toBe(200);
    expect(chain.contains).toHaveBeenCalledWith("pyq_years", [2021]);
    expect(chain.contains).toHaveBeenCalledWith("pyq_groups", ["group4"]);
    expect(chain.eq).toHaveBeenCalledWith("lang", "ta");
    expect(chain.eq).toHaveBeenCalledWith("subject", "History");
  });

  it("ignores a non-numeric year param instead of erroring", async () => {
    mockFrom.mockReturnValue(makeQueryChain({ data: [], error: null, count: 0 }));
    const res = await GET(makeGetRequest({ year: "not-a-year" }));
    expect(res.status).toBe(200);
  });
});

describe("POST /api/admin/pyq-correct/questions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await POST(makePostRequest({ question: "Q only" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when a fifth/short options array is given", async () => {
    const res = await POST(makePostRequest({ ...validQuestion, options: ["A", "B", "C"] }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when correct_option doesn't match any option", async () => {
    const res = await POST(makePostRequest({ ...validQuestion, correct_option: "Article 99" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("correct_option");
  });

  it("returns 500 when the insert errors", async () => {
    mockFrom.mockReturnValue(makeQueryChain({ data: null, error: new Error("boom") }));
    const res = await POST(makePostRequest(validQuestion));
    expect(res.status).toBe(500);
  });

  it("creates the question with source_type=pyq and status=approved", async () => {
    const chain = makeQueryChain({ data: { id: "new-id", ...validQuestion }, error: null });
    mockFrom.mockReturnValue(chain);

    const res = await POST(makePostRequest(validQuestion));
    expect(res.status).toBe(201);

    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        question: validQuestion.question,
        correct_option: validQuestion.correct_option,
        source_type: "pyq",
        status: "approved",
      })
    );
  });
});
