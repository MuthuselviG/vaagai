import { describe, it, expect, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Admin login must fail closed when ADMIN_EMAIL is not configured
describe("POST /api/admin/login without ADMIN_EMAIL", () => {
  const original = process.env.ADMIN_EMAIL;

  afterEach(() => {
    process.env.ADMIN_EMAIL = original;
    vi.resetModules();
  });

  it("returns 401 even with the correct password", async () => {
    delete process.env.ADMIN_EMAIL;
    vi.resetModules();
    const { POST } = await import("@/app/api/admin/login/route");
    const req = new NextRequest("http://localhost/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password: process.env.ADMIN_PASSWORD }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(res.headers.get("set-cookie")).toBeNull();
  });
});
