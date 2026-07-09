/**
 * Company legal identifiers for the Backwise Kit Raycast extension.
 *
 * `LEGAL_FIELDS` holds the public, hardcoded identifiers (safe to commit).
 * Sensitive bank details (IBAN/BIC) are NOT stored here — they come from the
 * command's Raycast preferences at runtime via `bankingFields`, so their values
 * live in the user's local Raycast config and never enter the repository.
 *
 * Imports nothing from `@raycast/api`, so it is fully unit-testable in plain
 * vitest (mirrors the `colors.ts` / `colors.test.ts` split).
 */

export interface LegalField {
  /** Stable key, e.g. "siren". */
  id: string;
  /** Human-readable label, e.g. "SIREN". */
  label: string;
  /** Value copied to the clipboard, e.g. "104158951". */
  value: string;
}

/** The public legal identifiers, in display order (committed to the repo). */
export const LEGAL_FIELDS: LegalField[] = [
  { id: "siren", label: "SIREN", value: "104158951" },
  { id: "siret", label: "SIRET", value: "10415895100012" },
  { id: "tva", label: "TVA intracommunautaire", value: "FR95104158951" },
  { id: "naf", label: "Code NAF", value: "62.01Z" },
  { id: "naf-2025", label: "Code NAF 2025", value: "58.29Y" },
];

/** Public "Annuaire des Entreprises" listing for the company. */
export const ANNUAIRE_URL = "https://annuaire-entreprises.data.gouv.fr/entreprise/backwise-104158951";

/**
 * Extra search terms so the built-in list filter matches on the raw value and
 * on the value stripped of punctuation (e.g. "6201Z" for "62.01Z"), in addition
 * to the label.
 */
export function legalKeywords(field: LegalField): string[] {
  return [field.id, field.label, field.value, field.value.replace(/[.\s]/g, "")];
}

/**
 * Raycast preference values for the sensitive bank details. Declared as command
 * preferences in `package.json`; the actual values are entered by the user in
 * Raycast and stored locally, never committed. Unset optional fields come back
 * as empty strings.
 */
export interface LegalPreferences {
  iban: string;
  bic: string;
}

/**
 * Builds the bank-detail fields from preference values, dropping any left blank.
 * Kept separate from `LEGAL_FIELDS` so no IBAN/BIC value is ever hardcoded.
 */
export function bankingFields(prefs: LegalPreferences): LegalField[] {
  const entries: Array<[string, string, string | undefined]> = [
    ["iban", "IBAN", prefs.iban],
    ["bic", "BIC", prefs.bic],
  ];
  return entries
    .map(([id, label, raw]) => ({ id, label, value: (raw ?? "").trim() }))
    .filter((field) => field.value.length > 0);
}
