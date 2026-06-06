import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/slugify";

describe("slugify", () => {
  it("converts uppercase to lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("replaces spaces with hyphens", () => {
    expect(slugify("Tamil Nadu History")).toBe("tamil-nadu-history");
  });

  it("collapses multiple spaces into a single hyphen", () => {
    expect(slugify("foo   bar")).toBe("foo-bar");
  });

  it("trims leading and trailing whitespace", () => {
    expect(slugify("  padded  ")).toBe("padded");
  });

  it("removes special characters except hyphens and word chars", () => {
    expect(slugify("hello@world!")).toBe("helloworld");
    expect(slugify("test & case")).toBe("test-case");
  });

  it("preserves Tamil unicode characters", () => {
    const result = slugify("தமிழ் நாடு");
    expect(result).toContain("தமிழ்");
    expect(result).toContain("நாடு");
  });

  it("collapses multiple hyphens into one", () => {
    expect(slugify("a--b---c")).toBe("a-b-c");
  });

  it("handles a plain alphanumeric string unchanged", () => {
    expect(slugify("simplename")).toBe("simplename");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(slugify("   ")).toBe("");
  });
});
