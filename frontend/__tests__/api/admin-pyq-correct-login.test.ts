import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { POST, DELETE } from "@/app/api/admin/pyq-correct/login/route";
import { ADMIN_PYQ_SESSION_COOKIE, adminPyqSessionToken } from "@/lib/adminPyqSession";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

function makeLoginRequest(body: unknown) {
  return new NextRequest("http://localhost/api/admin/pyq-correct/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/pyq-correct/login", () => {
  it("returns 400 when password is missing", async () => {
    const res = await POST(makeLoginRequest({}));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Password is required");
  });

  it("returns 401 for a wrong password", async () => {
    const res = await POST(makeLoginRequest({ password: "wrong_password" }));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Invalid password");
  });

  it("returns 200 and sets a hashed session cookie for the correct password", async () => {
    const res = await POST(makeLoginRequest({ password: ADMIN_PASSWORD }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).not.toBeNull();
    expect(setCookie).toContain(`${ADMIN_PYQ_SESSION_COOKIE}=`);
    expect(setCookie).toContain("HttpOnly");
    // The cookie must never carry the plaintext password
    expect(setCookie).not.toContain(ADMIN_PASSWORD);

    const expectedToken = await adminPyqSessionToken();
    expect(setCookie).toContain(`${ADMIN_PYQ_SESSION_COOKIE}=${expectedToken}`);
  });

  it("returns 500 for malformed JSON body", async () => {
    const req = new NextRequest("http://localhost/api/admin/pyq-correct/login", {
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

describe("DELETE /api/admin/pyq-correct/login", () => {
  it("returns 200 and clears the session cookie", async () => {
    const res = await DELETE();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).not.toBeNull();
    expect(setCookie).toContain(ADMIN_PYQ_SESSION_COOKIE);
  });
});
