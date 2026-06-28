import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CAPrintStyles from "@/components/CAPrintStyles";

describe("CAPrintStyles", () => {
  it("hub variant includes a .pdf-only print toggle", () => {
    const { container } = render(<CAPrintStyles variant="hub" />);
    const css = container.querySelector("style")!.textContent!;
    expect(css).toContain(".pdf-only { display: none; }");
    expect(css).toContain(".pdf-only { display: block !important; }");
    expect(css).toContain(".no-print { display: none !important; }");
  });

  it("unit variant has no .pdf-only toggle", () => {
    const { container } = render(<CAPrintStyles variant="unit" />);
    const css = container.querySelector("style")!.textContent!;
    expect(css).not.toContain("pdf-only");
    expect(css).toContain(".no-print { display: none !important; }");
  });

  it("both variants hide .no-print and whiten the background under @media print", () => {
    for (const variant of ["hub", "unit"] as const) {
      const { container } = render(<CAPrintStyles variant={variant} />);
      const css = container.querySelector("style")!.textContent!;
      expect(css).toContain("@media print");
      expect(css).toContain("body { background: white; }");
    }
  });
});
