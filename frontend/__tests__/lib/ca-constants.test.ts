import { describe, it, expect } from "vitest";
import {
  CA_UNIT_SUBJECTS,
  CA_UNIT_LABELS,
  CA_UNIT_ORDER,
} from "@/lib/supabase";

describe("CA_UNIT_ORDER integrity", () => {
  it("contains exactly 6 unit slugs", () => {
    expect(CA_UNIT_ORDER).toHaveLength(6);
  });

  it("has no duplicate slugs", () => {
    const unique = new Set(CA_UNIT_ORDER);
    expect(unique.size).toBe(CA_UNIT_ORDER.length);
  });

  it("every slug in ORDER exists in CA_UNIT_SUBJECTS", () => {
    for (const slug of CA_UNIT_ORDER) {
      expect(CA_UNIT_SUBJECTS).toHaveProperty(slug);
    }
  });

  it("every slug in ORDER exists in CA_UNIT_LABELS", () => {
    for (const slug of CA_UNIT_ORDER) {
      expect(CA_UNIT_LABELS).toHaveProperty(slug);
    }
  });
});

describe("CA_UNIT_SUBJECTS integrity", () => {
  it("every entry has at least one subject string", () => {
    for (const [slug, subjects] of Object.entries(CA_UNIT_SUBJECTS)) {
      expect(Array.isArray(subjects), `${slug} subjects should be an array`).toBe(true);
      expect((subjects as string[]).length, `${slug} should have at least one subject`).toBeGreaterThan(0);
      for (const s of subjects as string[]) {
        expect(typeof s).toBe("string");
        expect(s.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("matches expected slug-to-subject mappings", () => {
    expect(CA_UNIT_SUBJECTS["general-science"]).toContain("General Science");
    expect(CA_UNIT_SUBJECTS["geography"]).toContain("Geography");
    expect(CA_UNIT_SUBJECTS["indian-history"]).toContain("History");
    expect(CA_UNIT_SUBJECTS["indian-polity"]).toContain("Indian Polity");
    expect(CA_UNIT_SUBJECTS["welfare-schemes"]).toContain("Economy");
    expect(CA_UNIT_SUBJECTS["archaeology-updates"]).toContain("Tamil Nadu History");
  });
});

describe("CA_UNIT_LABELS integrity", () => {
  it("every entry has non-empty en, ta, and icon fields", () => {
    for (const [slug, label] of Object.entries(CA_UNIT_LABELS)) {
      expect(typeof label.en, `${slug}.en should be a string`).toBe("string");
      expect(typeof label.ta, `${slug}.ta should be a string`).toBe("string");
      expect(typeof label.icon, `${slug}.icon should be a string`).toBe("string");
      expect(label.en.trim().length, `${slug}.en should be non-empty`).toBeGreaterThan(0);
      expect(label.ta.trim().length, `${slug}.ta should be non-empty`).toBeGreaterThan(0);
      expect(label.icon.trim().length, `${slug}.icon should be non-empty`).toBeGreaterThan(0);
    }
  });

  it("no CA_UNIT_LABELS keys are missing from CA_UNIT_ORDER", () => {
    for (const slug of Object.keys(CA_UNIT_LABELS)) {
      expect(CA_UNIT_ORDER).toContain(slug);
    }
  });
});
