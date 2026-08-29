import { describe, it, expect } from "vitest";
import nextConfig from "../next.config.mjs";

describe("next.config.mjs redirects", () => {
  // No www.mcqpalagu.in -> apex redirect here: Vercel's Domain settings
  // already redirect the apex to www at the edge, so adding the opposite
  // redirect in app code created an infinite loop that took the site
  // down entirely (zero visitors from 2026-08-28 08:44 UTC onward).
  // If this needs fixing again, it must be done as a Vercel domain
  // setting, not a code-level redirect.
  it("does not redirect www.mcqpalagu.in in code (would loop with Vercel's domain-level apex redirect)", async () => {
    const redirects = await nextConfig.redirects();
    const wwwRedirect = redirects.find((r) =>
      r.has?.some((h) => h.type === "host" && h.value === "www.mcqpalagu.in")
    );
    expect(wwwRedirect).toBeUndefined();
  });

  it("still redirects vaagai.vercel.app to the apex domain", async () => {
    const redirects = await nextConfig.redirects();
    const vercelRedirect = redirects.find((r) =>
      r.has?.some((h) => h.type === "host" && h.value === "vaagai.vercel.app")
    );
    expect(vercelRedirect).toBeDefined();
    expect(vercelRedirect?.destination).toBe("https://mcqpalagu.in/:path*");
    expect(vercelRedirect?.permanent).toBe(true);
  });
});
