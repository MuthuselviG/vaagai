import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, PATCH } from "@/app/api/admin/pyq-correct/questions/[id]/route";

function makeQueryChain(resolvedValue: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const methods = ["select", "eq", "single", "update"];
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

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makePatchRequest(body: unknown) {
  return new NextRequest("http://localhost/api/admin/pyq-correct/questions/q1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const currentRow = {
  question: "Old question text",
  options: ["A", "B", "C", "D"],
  correct_option: "A",
  explanation: "Old explanation",
  subject: "History",
  topic: "Old topic",
  lang: "en",
  pyq_years: [2019],
  pyq_groups: ["group4"],
  status: "approved",
};

describe("GET /api/admin/pyq-correct/questions/[id]", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 404 when the question isn't found", async () => {
    mockFrom.mockReturnValue(makeQueryChain({ data: null, error: new Error("not found") }));
    const res = await GET(new NextRequest("http://localhost/x"), ctx("missing-id"));
    expect(res.status).toBe(404);
  });

  it("returns the question when found", async () => {
    mockFrom.mockReturnValue(makeQueryChain({ data: { id: "q1", question: "Hi" }, error: null }));
    const res = await GET(new NextRequest("http://localhost/x"), ctx("q1"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.question).toEqual({ id: "q1", question: "Hi" });
  });

  it("scopes the lookup to source_type=pyq", async () => {
    const chain = makeQueryChain({ data: { id: "q1" }, error: null });
    mockFrom.mockReturnValue(chain);
    await GET(new NextRequest("http://localhost/x"), ctx("q1"));
    expect(chain.eq).toHaveBeenCalledWith("id", "q1");
    expect(chain.eq).toHaveBeenCalledWith("source_type", "pyq");
  });
});

describe("PATCH /api/admin/pyq-correct/questions/[id]", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 400 when correct_option doesn't match the given options", async () => {
    const res = await PATCH(
      makePatchRequest({ options: ["A", "B", "C", "D"], correct_option: "Z" }),
      ctx("q1")
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when the question doesn't exist", async () => {
    mockFrom.mockReturnValue(makeQueryChain({ data: null, error: new Error("not found") }));
    const res = await PATCH(makePatchRequest({ subject: "Economy" }), ctx("missing-id"));
    expect(res.status).toBe(404);
  });

  it("returns 500 when the update errors", async () => {
    const fetchChain = makeQueryChain({ data: { ...currentRow, original_version: { question: "x" } }, error: null });
    const updateChain = makeQueryChain({ data: null, error: new Error("boom") });
    mockFrom.mockReturnValueOnce(fetchChain).mockReturnValueOnce(updateChain);

    const res = await PATCH(makePatchRequest({ subject: "Economy" }), ctx("q1"));
    expect(res.status).toBe(500);
  });

  it("only sends provided fields plus updated_at when original_version is already set", async () => {
    const fetchChain = makeQueryChain({ data: { ...currentRow, original_version: { question: "already captured" } }, error: null });
    const updateChain = makeQueryChain({ data: { id: "q1", subject: "Economy" }, error: null });
    mockFrom.mockReturnValueOnce(fetchChain).mockReturnValueOnce(updateChain);

    const res = await PATCH(makePatchRequest({ subject: "Economy" }), ctx("q1"));
    expect(res.status).toBe(200);

    expect(updateChain.update).toHaveBeenCalledTimes(1);
    const updateArg = (updateChain.update as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(updateArg.subject).toBe("Economy");
    expect(updateArg.updated_at).toBeDefined();
    expect(Object.keys(updateArg).sort()).toEqual(["subject", "updated_at"]);
  });

  it("snapshots the pre-edit row into original_version on the first edit", async () => {
    const fetchChain = makeQueryChain({ data: { ...currentRow, original_version: null }, error: null });
    const updateChain = makeQueryChain({ data: { id: "q1", subject: "Economy" }, error: null });
    mockFrom.mockReturnValueOnce(fetchChain).mockReturnValueOnce(updateChain);

    const res = await PATCH(makePatchRequest({ subject: "Economy" }), ctx("q1"));
    expect(res.status).toBe(200);

    const updateArg = (updateChain.update as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(updateArg.original_version).toEqual(currentRow);
    // The new value, not the stale snapshot, is what actually gets written
    expect(updateArg.subject).toBe("Economy");
  });

  it("never overwrites an existing original_version on later edits", async () => {
    const fetchChain = makeQueryChain({
      data: { ...currentRow, original_version: { question: "the real original" } },
      error: null,
    });
    const updateChain = makeQueryChain({ data: { id: "q1" }, error: null });
    mockFrom.mockReturnValueOnce(fetchChain).mockReturnValueOnce(updateChain);

    await PATCH(makePatchRequest({ subject: "Economy" }), ctx("q1"));

    const updateArg = (updateChain.update as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(updateArg.original_version).toBeUndefined();
  });

  it("scopes the fetch and update to source_type=pyq", async () => {
    const fetchChain = makeQueryChain({ data: { ...currentRow, original_version: {} }, error: null });
    const updateChain = makeQueryChain({ data: { id: "q1" }, error: null });
    mockFrom.mockReturnValueOnce(fetchChain).mockReturnValueOnce(updateChain);

    await PATCH(makePatchRequest({ status: "approved" }), ctx("q1"));

    expect(fetchChain.eq).toHaveBeenCalledWith("id", "q1");
    expect(fetchChain.eq).toHaveBeenCalledWith("source_type", "pyq");
    expect(updateChain.eq).toHaveBeenCalledWith("id", "q1");
    expect(updateChain.eq).toHaveBeenCalledWith("source_type", "pyq");
  });
});
