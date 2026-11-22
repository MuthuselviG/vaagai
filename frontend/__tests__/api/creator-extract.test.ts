import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Chainable Supabase query mock resolving to the given value
function makeQueryChain(resolvedValue: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  for (const m of ["select", "eq", "order", "insert", "update", "maybeSingle"]) {
    chain[m] = vi.fn(() => chain);
  }
  chain.then = (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
    Promise.resolve(resolvedValue).then(resolve, reject);
  return chain;
}

const { mockFrom, mockGetUser, mockGenerate } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockGetUser: vi.fn(),
  mockGenerate: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ from: mockFrom, auth: { getUser: mockGetUser } })),
}));

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return { generateContent: mockGenerate };
    }
  },
}));

import { POST } from "@/app/api/creator/extract/route";

const VALID_TEXT = "Q1. What is the capital of Tamil Nadu? A) Chennai B) Madurai C) Salem D) Trichy";

function makeRequest(token?: string) {
  const fd = new FormData();
  fd.append("pack_id", "pack-1");
  fd.append("creator_id", "creator-1");
  fd.append("subject", "Geography");
  fd.append("exams", JSON.stringify(["group4"]));
  fd.append("text", VALID_TEXT);
  fd.append("text_lang", "en");
  fd.append("text_format", "with_options");
  const headers: Record<string, string> = {};
  if (token) headers.authorization = `Bearer ${token}`;
  return new NextRequest("http://localhost/api/creator/extract", { method: "POST", body: fd, headers });
}

function mockTables(opts: { creator: unknown; pack: unknown }) {
  mockFrom.mockImplementation((table: string) => {
    if (table === "creators") return makeQueryChain({ data: opts.creator, error: null });
    if (table === "packs") return makeQueryChain({ data: opts.pack, error: null });
    if (table === "questions") return makeQueryChain({ data: [{ id: "q1" }], error: null });
    return makeQueryChain({ data: null, error: null });
  });
}

describe("POST /api/creator/extract auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no Authorization header is sent", async () => {
    const res = await POST(makeRequest());
    expect(res.status).toBe(401);
    expect(mockGenerate).not.toHaveBeenCalled();
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("returns 401 when the token is invalid", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "bad jwt" } });
    const res = await POST(makeRequest("bad-token"));
    expect(res.status).toBe(401);
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it("returns 403 when the creator does not belong to the user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    mockTables({ creator: null, pack: { id: "pack-1" } });
    const res = await POST(makeRequest("good-token"));
    expect(res.status).toBe(403);
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it("returns 403 when the pack does not belong to the creator", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    mockTables({ creator: { id: "creator-1" }, pack: null });
    const res = await POST(makeRequest("good-token"));
    expect(res.status).toBe(403);
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it("proceeds to extraction when user owns creator and pack", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    mockTables({ creator: { id: "creator-1" }, pack: { id: "pack-1" } });
    mockGenerate.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify([
            { question: "Capital of Tamil Nadu?", options: ["Chennai", "Madurai", "Salem", "Trichy"], correct_option: "A", explanation: null },
          ]),
      },
    });
    const res = await POST(makeRequest("good-token"));
    expect(mockGetUser).toHaveBeenCalledWith("good-token");
    expect(mockGenerate).toHaveBeenCalled();
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});
