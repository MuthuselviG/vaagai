import { describe, it, expect } from "vitest";
import { UNIT_COLORS, UNIT_NUMERALS, getCountForUnit } from "@/lib/caUnits";
import { CA_UNIT_ORDER } from "@/lib/supabase";

describe("UNIT_COLORS", () => {
  it("has an entry for every unit slug", () => {
    for (const slug of CA_UNIT_ORDER) {
      expect(UNIT_COLORS).toHaveProperty(slug);
    }
  });

  it("every entry defines bg, border, text, and btn", () => {
    for (const [slug, colors] of Object.entries(UNIT_COLORS)) {
      expect(typeof colors.bg, `${slug}.bg`).toBe("string");
      expect(typeof colors.border, `${slug}.border`).toBe("string");
      expect(typeof colors.text, `${slug}.text`).toBe("string");
      expect(typeof colors.btn, `${slug}.btn`).toBe("string");
    }
  });
});

describe("UNIT_NUMERALS", () => {
  it("has a roman numeral for each of the 6 units, in order", () => {
    expect(UNIT_NUMERALS).toEqual(["I", "II", "III", "IV", "V", "VI"]);
    expect(UNIT_NUMERALS).toHaveLength(CA_UNIT_ORDER.length);
  });
});

describe("getCountForUnit", () => {
  it("sums counts across all subjects mapped to a unit", () => {
    const counts = [
      { subject: "History", count: 3 },
      { subject: "Indian National Movement", count: 2 },
      { subject: "Indian History", count: 1 },
      { subject: "Geography", count: 10 },
    ];
    expect(getCountForUnit("indian-history", counts)).toBe(6);
  });

  it("ignores subjects that don't belong to the requested unit", () => {
    const counts = [
      { subject: "General Science", count: 5 },
      { subject: "Geography", count: 7 },
    ];
    expect(getCountForUnit("geography", counts)).toBe(7);
  });

  it("returns 0 when no counts match", () => {
    expect(getCountForUnit("welfare-schemes", [{ subject: "General Science", count: 4 }])).toBe(0);
  });

  it("returns 0 for an unknown unit slug", () => {
    expect(getCountForUnit("not-a-real-unit", [{ subject: "General Science", count: 4 }])).toBe(0);
  });
});
