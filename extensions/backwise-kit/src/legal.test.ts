import { describe, expect, it } from "vitest";
import { ANNUAIRE_URL, bankingFields, LEGAL_FIELDS, legalKeywords } from "./legal";

describe("legal data", () => {
  it("exposes the five public identifiers in order", () => {
    expect(LEGAL_FIELDS.map((f) => f.id)).toEqual(["siren", "siret", "tva", "naf", "naf-2025"]);
  });

  it("does not hardcode any bank details", () => {
    expect(LEGAL_FIELDS.some((f) => f.id === "iban" || f.id === "bic")).toBe(false);
  });

  it("has no duplicate ids", () => {
    const ids = LEGAL_FIELDS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has a non-empty label and value for every field", () => {
    for (const f of LEGAL_FIELDS) {
      expect(f.label.length).toBeGreaterThan(0);
      expect(f.value.length).toBeGreaterThan(0);
    }
  });

  it("carries the exact identifier values", () => {
    const byId = Object.fromEntries(LEGAL_FIELDS.map((f) => [f.id, f.value]));
    expect(byId.siren).toBe("104158951");
    expect(byId.siret).toBe("10415895100012");
    expect(byId.tva).toBe("FR95104158951");
    expect(byId.naf).toBe("62.01Z");
    expect(byId["naf-2025"]).toBe("58.29Y");
  });

  it("points the annuaire URL at the company SIREN over https", () => {
    expect(ANNUAIRE_URL).toMatch(/^https:\/\//);
    expect(ANNUAIRE_URL).toContain("104158951");
  });
});

describe("bankingFields", () => {
  it("builds IBAN and BIC fields from preference values", () => {
    // Dummy values only — real bank details live in Raycast preferences, never in the repo.
    const fields = bankingFields({ iban: "FR00 0000 0000 0000", bic: "BANKFRPPXXX" });
    expect(fields).toEqual([
      { id: "iban", label: "IBAN", value: "FR00 0000 0000 0000" },
      { id: "bic", label: "BIC", value: "BANKFRPPXXX" },
    ]);
  });

  it("drops blank or whitespace-only values", () => {
    expect(bankingFields({ iban: "", bic: "   " })).toEqual([]);
  });

  it("keeps only the filled field and trims it", () => {
    const fields = bankingFields({ iban: "  FR76 …  ", bic: "" });
    expect(fields).toEqual([{ id: "iban", label: "IBAN", value: "FR76 …" }]);
  });
});

describe("legalKeywords", () => {
  const field = { id: "naf", label: "Code NAF", value: "62.01Z" } as const;

  it("includes the value and its punctuation-free form", () => {
    const kw = legalKeywords(field);
    expect(kw).toContain("62.01Z");
    expect(kw).toContain("6201Z");
    expect(kw).toContain("Code NAF");
  });
});
