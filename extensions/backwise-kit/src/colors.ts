/**
 * Design system color tokens for the Backwise Kit Raycast extension.
 *
 * Tokens follow the `--color-bw-<category>-<shade>` convention. The list is
 * already de-duplicated here (the source CSS repeated a few neutral shades).
 */

export const CATEGORY_ORDER = ["neutral", "brand", "informative", "negative", "accent", "positive", "notice"] as const;

export type Category = (typeof CATEGORY_ORDER)[number];

export interface BrandColor {
  category: Category;
  /** Numeric shade as written in the token, e.g. "200", "250". */
  shade: string;
  /** Lowercase hex, e.g. "#fffcf2". */
  hex: string;
}

/** Raw tokens in source order, deduped by (category, shade). */
export const COLORS: BrandColor[] = [
  { category: "neutral", shade: "100", hex: "#ffffff" },
  { category: "neutral", shade: "200", hex: "#fffcf2" },
  { category: "neutral", shade: "250", hex: "#eaebe3" },
  { category: "neutral", shade: "300", hex: "#d5dad4" },
  { category: "neutral", shade: "400", hex: "#aab8b5" },
  { category: "neutral", shade: "600", hex: "#5c777a" },
  { category: "neutral", shade: "700", hex: "#395d64" },
  { category: "neutral", shade: "900", hex: "#00303b" },

  { category: "brand", shade: "100", hex: "#ffeded" },
  { category: "brand", shade: "200", hex: "#ffdbdb" },
  { category: "brand", shade: "400", hex: "#ff9e9e" },
  { category: "brand", shade: "500", hex: "#ff7777" },
  { category: "brand", shade: "700", hex: "#bf2b2b" },
  { category: "brand", shade: "900", hex: "#8a1e1e" },

  { category: "informative", shade: "100", hex: "#e8f2fd" },
  { category: "informative", shade: "200", hex: "#d1e5fa" },
  { category: "informative", shade: "400", hex: "#91ccff" },
  { category: "informative", shade: "700", hex: "#2160a4" },
  { category: "informative", shade: "900", hex: "#0b3860" },

  { category: "negative", shade: "100", hex: "#ffeded" },
  { category: "negative", shade: "200", hex: "#ffdbdb" },
  { category: "negative", shade: "400", hex: "#ff9e9e" },
  { category: "negative", shade: "700", hex: "#bf2b2b" },
  { category: "negative", shade: "900", hex: "#8a1e1e" },

  { category: "accent", shade: "100", hex: "#ffead1" },
  { category: "accent", shade: "200", hex: "#ffce96" },
  { category: "accent", shade: "400", hex: "#f5b262" },
  { category: "accent", shade: "700", hex: "#966627" },
  { category: "accent", shade: "900", hex: "#593f1c" },

  { category: "positive", shade: "200", hex: "#e4fbda" },
  { category: "positive", shade: "400", hex: "#b2f398" },
  { category: "positive", shade: "700", hex: "#006a00" },
  { category: "positive", shade: "900", hex: "#003405" },

  { category: "notice", shade: "200", hex: "#ffe2c6" },
  { category: "notice", shade: "400", hex: "#ffa46f" },
  { category: "notice", shade: "700", hex: "#b04203" },
  { category: "notice", shade: "900", hex: "#6c2902" },
];

/** Capitalized, human-readable label, e.g. "Neutral 200". */
export function colorTitle(color: BrandColor): string {
  const label = color.category.charAt(0).toUpperCase() + color.category.slice(1);
  return `${label} ${color.shade}`;
}

/** The CSS custom property name, e.g. "--color-bw-neutral-200". */
export function cssVariableName(color: BrandColor): string {
  return `--color-bw-${color.category}-${color.shade}`;
}

/** Ready-to-paste CSS variable reference, e.g. "var(--color-bw-neutral-200)". */
export function cssVariableReference(color: BrandColor): string {
  return `var(${cssVariableName(color)})`;
}

/**
 * Tint color for the swatch icon. Raycast adjusts raw colors for contrast with
 * the UI by default, which darkens very light shades (e.g. neutral 200 #fffcf2
 * renders grey). A swatch must show the exact brand color, so we pass a dynamic
 * color — identical in both themes — with `adjustContrast: false`.
 */
export function swatchTint(color: BrandColor): { light: string; dark: string; adjustContrast: false } {
  return { light: color.hex, dark: color.hex, adjustContrast: false };
}

/**
 * Extra search terms so the built-in list filter matches on hex, the token
 * name, and loose words like "color"/"bw" — in addition to the title.
 */
export function searchKeywords(color: BrandColor): string[] {
  return [color.category, color.shade, color.hex, color.hex.replace("#", ""), cssVariableName(color), "bw", "color"];
}

export interface CategoryGroup {
  category: Category;
  /** Display heading, e.g. "Neutral". */
  title: string;
  colors: BrandColor[];
}

/** Groups colors by category, preserving CATEGORY_ORDER and dropping empties. */
export function groupByCategory(colors: BrandColor[] = COLORS): CategoryGroup[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    title: category.charAt(0).toUpperCase() + category.slice(1),
    colors: colors.filter((c) => c.category === category),
  })).filter((group) => group.colors.length > 0);
}
