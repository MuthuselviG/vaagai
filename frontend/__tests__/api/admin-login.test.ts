import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { POST, DELETE } from "@/app/api/admin/login/route";

// These match what vitest.setup.ts injects before modules load
const ADMIN_EMAIL = "muthu.111.44@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

function makeLoginRequest(body: unknown) {
  return new NextRequest("http://localhost/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/login", () => {
  it("returns 400 when both email and password are missing", async () => {
    const res = await POST(makeLoginRequest({}));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Missing credentials");
  });

  it("returns 400 when only password is provided", async () => {
    const res = await POST(makeLoginRequest({ password: ADMIN_PASSWORD }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Missing credentials");
  });

  it("returns 400 when only email is provided", async () => {
    const res = await POST(makeLoginRequest({ email: ADMIN_EMAIL }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Missing credentials");
  });

  it("returns 401 for wrong email with correct password", async () => {
    const res = await POST(makeLoginRequest({ email: "attacker@evil.com", password: ADMIN_PASSWORD }));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Invalid credentials");
  });

  it("returns 401 for correct email with wrong password", async () => {
    const res = await POST(makeLoginRequest({ email: ADMIN_EMAIL, password: "wrong_password" }));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Invalid credentials");
  });

  it("returns 401 for completely wrong credentials", async () => {
    const res = await POST(makeLoginRequest({ email: "x@x.com", password: "nope" }));
    expect(res.status).toBe(401);
  });

  it("does not reveal which field is wrong (same error for bad email vs bad password)", async () => {
    const badEmailRes = await POST(makeLoginRequest({ email: "bad@bad.com", password: ADMIN_PASSWORD }));
    const badPassRes = await POST(makeLoginRequest({ email: ADMIN_EMAIL, password: "bad" }));
    const [j1, j2] = await Promise.all([badEmailRes.json(), badPassRes.json()]);
    expect(j1.error).toBe(j2.error);
  });

  it("returns 200 and sets admin_session cookie for valid credentials", async () => {
    const res = await POST(makeLoginRequest({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).not.toBeNull();
    expect(setCookie).toContain("admin_session=1");
    expect(setCookie).toContain("HttpOnly");
  });

  it("returns 500 for malformed JSON body", async () => {
    const req = new NextRequest("http://localhost/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ invalid json }",
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Internal server error");
  });
});

describe("DELETE /api/admin/login", () => {
  it("returns 200 with success true", async () => {
    const res = await DELETE();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it("clears the admin_session cookie via Set-Cookie header", async () => {
    const res = await DELETE();
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).not.toBeNull();
    expect(setCookie).toContain("admin_session");
  });
});
