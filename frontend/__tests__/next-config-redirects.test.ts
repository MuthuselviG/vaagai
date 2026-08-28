import { describe, it, expect } from "vitest";
import nextConfig from "../next.config.mjs";

describe("next.config.mjs redirects", () => {
  it("redirects www.mcqpalagu.in to the apex domain, preserving the path", async () => {
    const redirects = await nextConfig.redirects();
    const wwwRedirect = redirects.find((r) =>
      r.has?.some((h) => h.type === "host" && h.value === "www.mcqpalagu.in")
    );
    expect(wwwRedirect).toBeDefined();
    expect(wwwRedirect?.destination).toBe("https://mcqpalagu.in/:path*");
    expect(wwwRedirect?.permanent).toBe(true);
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
