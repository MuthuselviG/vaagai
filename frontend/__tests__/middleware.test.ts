import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock must be declared before middleware is imported
const mockGetUser = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

import { middleware } from "@/middleware";

// Spy on req.cookies.get — more reliable than relying on Cookie header parsing
function makeRequest(path: string, cookies: Record<string, string> = {}) {
  const req = new NextRequest(`http://localhost${path}`);
  vi.spyOn(req.cookies, "get").mockImplementation((name: string) => {
    const value = cookies[name];
    return value !== undefined ? { name, value } : undefined;
  });
  return req;
}

describe("Admin middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: valid admin session
    mockGetUser.mockResolvedValue({
      data: { user: { email: "muthu.111.44@gmail.com" } },
    });
  });

  it("passes through non-admin paths without any redirect", async () => {
    const req = makeRequest("/subjects");
    const res = await middleware(req);
    expect(res.headers.get("location")).toBeNull();
  });

  it("passes through the admin login page without redirect", async () => {
    const req = makeRequest("/admin-fun-panrom/login");
    const res = await middleware(req);
    expect(res.headers.get("location")).toBeNull();
  });

  it("redirects to login page when admin_session cookie is absent", async () => {
    const req = makeRequest("/admin-fun-panrom");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin-fun-panrom/login");
  });

  it("redirects to login page when admin_session has wrong value", async () => {
    const req = makeRequest("/admin-fun-panrom", { admin_session: "0" });
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin-fun-panrom/login");
  });

  it("redirects to login page when sb-access-token is absent", async () => {
    const req = makeRequest("/admin-fun-panrom", { admin_session: "1" });
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin-fun-panrom/login");
  });

  it("redirects non-admin email to /subjects", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { email: "other.user@example.com" } },
    });
    const req = makeRequest("/admin-fun-panrom", {
      admin_session: "1",
      "sb-access-token": "some_token",
    });
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/subjects");
  });

  it("redirects to /subjects when supabase returns no user object", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const req = makeRequest("/admin-fun-panrom", {
      admin_session: "1",
      "sb-access-token": "some_token",
    });
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/subjects");
  });

  it("allows access when all three conditions are satisfied", async () => {
    const req = makeRequest("/admin-fun-panrom", {
      admin_session: "1",
      "sb-access-token": "valid_token",
    });
    const res = await middleware(req);
    expect(res.headers.get("location")).toBeNull();
  });

  it("protects nested admin paths (e.g. /admin-fun-panrom/creators)", async () => {
    const req = makeRequest("/admin-fun-panrom/creators");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin-fun-panrom/login");
  });
});
