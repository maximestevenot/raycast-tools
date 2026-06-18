# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This is a collection of personal Raycast tools. Each tool is independent — there is no
workspace root tooling that ties them together.

- `extensions/brandkit/` — a full Raycast extension (TypeScript + React). Has its own
  `package.json`; run all npm commands from inside this directory.
- `scripts/random-generator.sh` — a standalone Raycast [Script Command](https://github.com/raycast/script-commands)
  (no build step; the `# @raycast.*` header comments are its manifest).

## brandkit extension

All commands run from `extensions/brandkit/`:

```sh
npm install
npm run dev        # ray develop — live reload into the local Raycast app
npm test           # vitest run
npm run lint       # ray lint
npm run fix-lint   # ray lint --fix
npm run build      # ray build -e dist
npm run publish    # publish to the Raycast store
```

Run a single test by name or file: `npx vitest run -t "builds a capitalized title"`
or `npx vitest run src/colors.test.ts`.

### Architecture

The deliberate split is **data/logic vs. view**:

- `src/colors.ts` — the color token data (`COLORS`) plus pure formatting helpers
  (`colorTitle`, `cssVariableName`, `groupByCategory`, etc.). Imports nothing from
  `@raycast/api`, so it is fully unit-testable in plain vitest.
- `src/search-colors.tsx` — the Raycast `List` view. Imports everything from `colors.ts`
  and contains no business logic worth testing.

Keep this boundary: new logic goes in `colors.ts` with a test in `src/colors.test.ts`;
`search-colors.tsx` stays a thin rendering layer.

### Non-obvious details

- **Colors are hardcoded** in the `COLORS` array, deduped by `(category, shade)`, and
  ordered by `CATEGORY_ORDER`. Editing the array is the only step to add/change a color —
  the grouped list rebuilds automatically. The test suite enforces the no-duplicates,
  lowercase-6-digit-hex, and known-category invariants.
- **Token convention** is `--color-bw-<category>-<shade>` (the `bw` is the Backwise brand
  prefix). `cssVariableName` / `cssVariableReference` are the single source of truth for it.
- **`swatchTint` sets `adjustContrast: false`** intentionally. Raycast darkens light raw
  colors for UI contrast by default, which would misrepresent a swatch — so swatches pass
  an identical light/dark dynamic color with contrast adjustment off. Don't "simplify" this
  to a plain hex string.
- **The extension icon is generated**, not hand-drawn: `node scripts/gen-icon.js` renders
  the Backwise mark to `assets/extension-icon.png` using pure Node (manual PNG encoding,
  zero dependencies). Re-run it after changing the brand artwork in that script.

## random-generator.sh

A bash Raycast Script Command that wraps an **external `randgen` Go binary** (not in this
repo). It resolves the binary from `$RANDGEN_BIN`, then `~/.local/bin/randgen`, then `$PATH`,
and fails with a build hint if none is found. Only the string generators (`pwd`,
`alpha-num`, `number`) accept a length argument; UUID modes ignore it.
