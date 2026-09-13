// Session handling for the /admin/pyq-correct tool. Uses a simple
// password-derived token (no separate secret) — the cookie never carries
// the plaintext password.
export const ADMIN_PYQ_SESSION_COOKIE = "pyq_admin_session";
export const ADMIN_PYQ_SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function adminPyqSessionToken(): Promise<string> {
  return sha256Hex(process.env.ADMIN_PASSWORD ?? "");
}

export async function isValidAdminPyqSessionCookie(
  cookieValue: string | undefined
): Promise<boolean> {
  if (!cookieValue) return false;
  const expected = await adminPyqSessionToken();
  return cookieValue === expected;
}
