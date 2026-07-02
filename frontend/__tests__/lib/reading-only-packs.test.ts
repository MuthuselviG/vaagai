import { describe, it, expect } from "vitest";
import { READING_ONLY_PACK_IDS } from "@/lib/supabase";

describe("READING_ONLY_PACK_IDS", () => {
  it("lists Rohit Kalai's Class 6 History Term 1/2 and the NITI Aayog pack ids", () => {
    expect(READING_ONLY_PACK_IDS).toEqual([
      "a84ca4fc-efe7-45c8-b84d-47647d15cce8",
      "7fd3ce12-6147-40cb-8b64-9cef49236935",
      "7378c007-de39-4362-8f72-6c8787bdf2ec",
    ]);
  });

  it("produces a valid PostgREST not-in filter list", () => {
    const filter = `(${READING_ONLY_PACK_IDS.join(",")})`;
    expect(filter).toBe(
      "(a84ca4fc-efe7-45c8-b84d-47647d15cce8,7fd3ce12-6147-40cb-8b64-9cef49236935,7378c007-de39-4362-8f72-6c8787bdf2ec)"
    );
  });
});
