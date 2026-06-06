import { describe, it, expect } from "vitest";
import { monthRange } from "@/lib/supabase";

describe("monthRange", () => {
  it("returns correct start date for a mid-year month", () => {
    const { start } = monthRange("2024-06");
    expect(start).toBe("2024-06-01");
  });

  it("returns first day of next month as endExclusive for a mid-year month", () => {
    const { endExclusive } = monthRange("2024-06");
    expect(endExclusive).toBe("2024-07-01");
  });

  it("handles January correctly (month 01)", () => {
    const { start, endExclusive } = monthRange("2024-01");
    expect(start).toBe("2024-01-01");
    expect(endExclusive).toBe("2024-02-01");
  });

  it("rolls over to next year for December (month 12)", () => {
    const { start, endExclusive } = monthRange("2024-12");
    expect(start).toBe("2024-12-01");
    expect(endExclusive).toBe("2025-01-01");
  });

  it("pads single-digit months correctly in endExclusive", () => {
    const { endExclusive } = monthRange("2024-08");
    expect(endExclusive).toBe("2024-09-01");
  });

  it("endExclusive is strictly after start", () => {
    const months = ["2024-01", "2024-06", "2024-12", "2023-11"];
    for (const m of months) {
      const { start, endExclusive } = monthRange(m);
      expect(new Date(endExclusive) > new Date(start)).toBe(true);
    }
  });

  it("start and endExclusive are exactly one month apart", () => {
    const cases: Array<[string, string, string]> = [
      ["2024-01", "2024-01-01", "2024-02-01"],
      ["2024-09", "2024-09-01", "2024-10-01"],
      ["2025-05", "2025-05-01", "2025-06-01"],
    ];
    for (const [month, expectedStart, expectedEnd] of cases) {
      const { start, endExclusive } = monthRange(month);
      expect(start).toBe(expectedStart);
      expect(endExclusive).toBe(expectedEnd);
    }
  });
});
