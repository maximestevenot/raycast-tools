import { describe, expect, it } from "vitest";
import {
  CATEGORY_ORDER,
  COLORS,
  colorTitle,
  cssVariableName,
  cssVariableReference,
  groupByCategory,
  searchKeywords,
  swatchTint,
} from "./colors";

describe("color data", () => {
  it("has no duplicate (category, shade) pairs", () => {
    const keys = COLORS.map((c) => `${c.category}-${c.shade}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("uses lowercase 6-digit hex values", () => {
    for (const c of COLORS) {
      expect(c.hex).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("only uses known categories", () => {
    for (const c of COLORS) {
      expect(CATEGORY_ORDER).toContain(c.category);
    }
  });
});

describe("formatting helpers", () => {
  const color = { category: "neutral", shade: "200", hex: "#fffcf2" } as const;

  it("builds a capitalized title", () => {
    expect(colorTitle(color)).toBe("Neutral 200");
  });

  it("builds the css variable name and reference", () => {
    expect(cssVariableName(color)).toBe("--color-bw-neutral-200");
    expect(cssVariableReference(color)).toBe("var(--color-bw-neutral-200)");
  });

  it("includes hex, token, and loose words in keywords", () => {
    const kw = searchKeywords(color);
    expect(kw).toContain("neutral");
    expect(kw).toContain("200");
    expect(kw).toContain("#fffcf2");
    expect(kw).toContain("fffcf2");
    expect(kw).toContain("--color-bw-neutral-200");
  });

  it("builds a swatch tint that disables Raycast's contrast adjustment", () => {
    // Raycast darkens raw light colors for contrast by default; swatches must
    // reproduce the exact hex, so adjustContrast must be off in both themes.
    expect(swatchTint(color)).toEqual({ light: "#fffcf2", dark: "#fffcf2", adjustContrast: false });
  });
});

describe("groupByCategory", () => {
  it("preserves category order and covers every color", () => {
    const groups = groupByCategory();
    expect(groups.map((g) => g.category)).toEqual([...CATEGORY_ORDER]);
    const total = groups.reduce((sum, g) => sum + g.colors.length, 0);
    expect(total).toBe(COLORS.length);
  });

  it("drops categories with no colors", () => {
    const groups = groupByCategory([{ category: "brand", shade: "500", hex: "#ff7777" }]);
    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe("brand");
  });
});
