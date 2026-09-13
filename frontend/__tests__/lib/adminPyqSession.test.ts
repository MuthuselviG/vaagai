import { describe, it, expect } from "vitest";
import {
  ADMIN_PYQ_SESSION_COOKIE,
  adminPyqSessionToken,
  isValidAdminPyqSessionCookie,
} from "@/lib/adminPyqSession";

// Matches what vitest.setup.ts injects before modules load
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

describe("adminPyqSessionToken", () => {
  it("derives a stable token from ADMIN_PASSWORD", async () => {
    const a = await adminPyqSessionToken();
    const b = await adminPyqSessionToken();
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/); // sha256 hex digest
  });

  it("never equals the plaintext password", async () => {
    const token = await adminPyqSessionToken();
    expect(token).not.toBe(ADMIN_PASSWORD);
  });
});

describe("isValidAdminPyqSessionCookie", () => {
  it("returns false for an undefined cookie", async () => {
    expect(await isValidAdminPyqSessionCookie(undefined)).toBe(false);
  });

  it("returns false for an empty string", async () => {
    expect(await isValidAdminPyqSessionCookie("")).toBe(false);
  });

  it("returns false for a wrong value", async () => {
    expect(await isValidAdminPyqSessionCookie("not_the_right_token")).toBe(false);
  });

  it("returns true for the expected token", async () => {
    const token = await adminPyqSessionToken();
    expect(await isValidAdminPyqSessionCookie(token)).toBe(true);
  });
});

describe("ADMIN_PYQ_SESSION_COOKIE", () => {
  it("is a stable, non-empty cookie name", () => {
    expect(ADMIN_PYQ_SESSION_COOKIE).toBe("pyq_admin_session");
  });
});
