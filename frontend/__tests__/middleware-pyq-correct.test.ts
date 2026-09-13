import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";

// The pyq-correct branch of the middleware never touches Supabase, but the
// module still imports it for the /admin-fun-panrom branch — mock it the
// same way middleware.test.ts does so the import doesn't hit the network.
import { vi } from "vitest";
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ auth: { getUser: vi.fn() } })),
}));

import { middleware } from "@/middleware";
import { ADMIN_PYQ_SESSION_COOKIE, adminPyqSessionToken } from "@/lib/adminPyqSession";

function makeRequest(path: string, cookies: Record<string, string> = {}) {
  const req = new NextRequest(`http://localhost${path}`);
  vi.spyOn(req.cookies, "get").mockImplementation((name: string) => {
    const value = cookies[name];
    return value !== undefined ? { name, value } : undefined;
  });
  return req;
}

describe("PYQ-correct middleware", () => {
  it("passes through the login page without a session cookie", async () => {
    const req = makeRequest("/admin/pyq-correct/login");
    const res = await middleware(req);
    expect(res.headers.get("location")).toBeNull();
  });

  it("passes through the login API without a session cookie", async () => {
    const req = makeRequest("/api/admin/pyq-correct/login");
    const res = await middleware(req);
    expect(res.status).not.toBe(401);
    expect(res.headers.get("location")).toBeNull();
  });

  it("redirects the list page to login when no session cookie is present", async () => {
    const req = makeRequest("/admin/pyq-correct");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin/pyq-correct/login");
  });

  it("redirects the list page to login when the cookie value is wrong", async () => {
    const req = makeRequest("/admin/pyq-correct", { [ADMIN_PYQ_SESSION_COOKIE]: "garbage" });
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin/pyq-correct/login");
  });

  it("allows the list page through with a valid session cookie", async () => {
    const token = await adminPyqSessionToken();
    const req = makeRequest("/admin/pyq-correct", { [ADMIN_PYQ_SESSION_COOKIE]: token });
    const res = await middleware(req);
    expect(res.headers.get("location")).toBeNull();
  });

  it("protects nested pages (e.g. /admin/pyq-correct/new)", async () => {
    const req = makeRequest("/admin/pyq-correct/new");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin/pyq-correct/login");
  });

  it("returns 401 JSON (not a redirect) for unauthenticated API calls", async () => {
    const req = makeRequest("/api/admin/pyq-correct/questions");
    const res = await middleware(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("allows API calls through with a valid session cookie", async () => {
    const token = await adminPyqSessionToken();
    const req = makeRequest("/api/admin/pyq-correct/questions", {
      [ADMIN_PYQ_SESSION_COOKIE]: token,
    });
    const res = await middleware(req);
    expect(res.status).not.toBe(401);
    expect(res.headers.get("location")).toBeNull();
  });
});
