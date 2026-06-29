import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import UnitPath from "@/components/UnitPath";

const units = [
  { slug: "unit-1", topic: "Unit 1", count: 5 },
  { slug: "unit-2", topic: "Unit 2", count: 6 },
  { slug: "unit-3", topic: "Unit 3", count: 7 },
];

function renderPath() {
  return render(
    <UnitPath
      termTag="Term 1"
      title="History"
      subtitle="3 units"
      backHref="/back"
      backLabel="← Back"
      basePath="/units"
      units={units}
      countLabel={(count) => `${count} Q&A`}
    />
  );
}

describe("UnitPath", () => {
  it("places unit 1 below later units, climbing upward", () => {
    const { container } = renderPath();
    const links = units.map((u) => container.querySelector(`a[href="/units/${u.slug}"]`) as HTMLElement);
    const tops = links.map((link) => parseFloat(link.style.top));

    // Unit 1 (index 0) should be positioned furthest down the page (largest top),
    // with each later unit positioned above the previous one.
    expect(tops[0]).toBeGreaterThan(tops[1]);
    expect(tops[1]).toBeGreaterThan(tops[2]);
  });

  it("links each badge to the correct unit slug", () => {
    renderPath();
    for (const u of units) {
      expect(screen.getByRole("link", { name: new RegExp(u.topic) })).toHaveAttribute("href", `/units/${u.slug}`);
    }
  });

  it("shows an empty-state message and no spacer crash when there are no units", () => {
    render(
      <UnitPath
        termTag="Term 1"
        title="History"
        subtitle="0 units"
        backHref="/back"
        backLabel="← Back"
        basePath="/units"
        units={[]}
        countLabel={(count) => `${count} Q&A`}
      />
    );
    expect(screen.getByText(/அலகுகள் இன்னும் சேர்க்கப்படவில்லை/)).toBeInTheDocument();
  });
});
