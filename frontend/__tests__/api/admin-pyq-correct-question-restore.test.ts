import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/admin/pyq-correct/questions/[id]/restore/route";

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

const originalVersion = {
  question: "Original question text",
  options: ["A", "B", "C", "D"],
  correct_option: "A",
  explanation: "Original explanation",
  subject: "History",
  topic: "Original topic",
  lang: "en",
  pyq_years: [2019],
  pyq_groups: ["group4"],
  status: "approved",
};

describe("POST /api/admin/pyq-correct/questions/[id]/restore", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 404 when the question doesn't exist", async () => {
    mockFrom.mockReturnValue(makeQueryChain({ data: null, error: new Error("not found") }));
    const res = await POST(new NextRequest("http://localhost/x", { method: "POST" }), ctx("missing"));
    expect(res.status).toBe(404);
  });

  it("returns 400 when no original_version is stored", async () => {
    mockFrom.mockReturnValue(makeQueryChain({ data: { original_version: null }, error: null }));
    const res = await POST(new NextRequest("http://localhost/x", { method: "POST" }), ctx("q1"));
    expect(res.status).toBe(400);
  });

  it("returns 500 when the restore update errors", async () => {
    const fetchChain = makeQueryChain({ data: { original_version: originalVersion }, error: null });
    const updateChain = makeQueryChain({ data: null, error: new Error("boom") });
    mockFrom.mockReturnValueOnce(fetchChain).mockReturnValueOnce(updateChain);

    const res = await POST(new NextRequest("http://localhost/x", { method: "POST" }), ctx("q1"));
    expect(res.status).toBe(500);
  });

  it("writes every snapshotted field back onto the row", async () => {
    const fetchChain = makeQueryChain({ data: { original_version: originalVersion }, error: null });
    const updateChain = makeQueryChain({ data: { id: "q1", ...originalVersion }, error: null });
    mockFrom.mockReturnValueOnce(fetchChain).mockReturnValueOnce(updateChain);

    const res = await POST(new NextRequest("http://localhost/x", { method: "POST" }), ctx("q1"));
    expect(res.status).toBe(200);

    const updateArg = (updateChain.update as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(updateArg).toMatchObject(originalVersion);
    expect(updateArg.updated_at).toBeDefined();
  });

  it("scopes both the fetch and the restore update to source_type=pyq", async () => {
    const fetchChain = makeQueryChain({ data: { original_version: originalVersion }, error: null });
    const updateChain = makeQueryChain({ data: { id: "q1" }, error: null });
    mockFrom.mockReturnValueOnce(fetchChain).mockReturnValueOnce(updateChain);

    await POST(new NextRequest("http://localhost/x", { method: "POST" }), ctx("q1"));

    expect(fetchChain.eq).toHaveBeenCalledWith("id", "q1");
    expect(fetchChain.eq).toHaveBeenCalledWith("source_type", "pyq");
    expect(updateChain.eq).toHaveBeenCalledWith("id", "q1");
    expect(updateChain.eq).toHaveBeenCalledWith("source_type", "pyq");
  });
});
