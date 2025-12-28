// src/lib/validation.test.ts
import { describe, expect, it } from "vitest";
import {
  validateYear,
  validateHorizonYears,
  validateCurrency,
  validateGrowthRate,
  validateCAGR,
  validateFxRate,
  validateSavingRateCap,
} from "./validation";

describe("validateYear", () => {
  it("accepts valid years >= 1900", () => {
    expect(validateYear(1900).valid).toBe(true);
    expect(validateYear(2000).valid).toBe(true);
    expect(validateYear(2026).valid).toBe(true);
    expect(validateYear(2100).valid).toBe(true);
  });

  it("rejects years < 1900", () => {
    const result = validateYear(1899);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("1900");
  });

  it("rejects non-integer years", () => {
    const result = validateYear(2026.5);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("nguyên");
  });

  it("rejects non-finite numbers", () => {
    expect(validateYear(NaN).valid).toBe(false);
    expect(validateYear(Infinity).valid).toBe(false);
    expect(validateYear(-Infinity).valid).toBe(false);
  });
});

describe("validateHorizonYears", () => {
  it("accepts valid horizon years (1-120)", () => {
    expect(validateHorizonYears(1).valid).toBe(true);
    expect(validateHorizonYears(10).valid).toBe(true);
    expect(validateHorizonYears(60).valid).toBe(true);
    expect(validateHorizonYears(120).valid).toBe(true);
  });

  it("rejects horizon years < 1", () => {
    const result = validateHorizonYears(0);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("> 0");
  });

  it("rejects horizon years > 120", () => {
    const result = validateHorizonYears(121);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("120");
  });

  it("rejects non-integer horizon years", () => {
    const result = validateHorizonYears(10.5);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("nguyên");
  });

  it("rejects non-finite numbers", () => {
    expect(validateHorizonYears(NaN).valid).toBe(false);
    expect(validateHorizonYears(Infinity).valid).toBe(false);
  });
});

describe("validateCurrency", () => {
  it("accepts non-negative currency amounts", () => {
    expect(validateCurrency(0).valid).toBe(true);
    expect(validateCurrency(1000).valid).toBe(true);
    expect(validateCurrency(1_000_000_000).valid).toBe(true);
    expect(validateCurrency(3.5e9).valid).toBe(true);
  });

  it("rejects negative currency amounts", () => {
    const result = validateCurrency(-100);
    expect(result.valid).toBe(false);
    expect(result.error).toContain(">= 0");
  });

  it("rejects non-finite numbers", () => {
    expect(validateCurrency(NaN).valid).toBe(false);
    expect(validateCurrency(Infinity).valid).toBe(false);
    expect(validateCurrency(-Infinity).valid).toBe(false);
  });
});

describe("validateGrowthRate", () => {
  it("accepts valid growth rates > -1", () => {
    expect(validateGrowthRate(0).valid).toBe(true);
    expect(validateGrowthRate(0.05).valid).toBe(true);
    expect(validateGrowthRate(0.5).valid).toBe(true);
    expect(validateGrowthRate(-0.5).valid).toBe(true);
    expect(validateGrowthRate(-0.99).valid).toBe(true);
  });

  it("rejects growth rates <= -1 (worse than -100%)", () => {
    const result1 = validateGrowthRate(-1);
    expect(result1.valid).toBe(false);
    expect(result1.error).toContain("-100%");

    const result2 = validateGrowthRate(-1.5);
    expect(result2.valid).toBe(false);
    expect(result2.error).toContain("-100%");
  });

  it("rejects non-finite numbers", () => {
    expect(validateGrowthRate(NaN).valid).toBe(false);
    expect(validateGrowthRate(Infinity).valid).toBe(false);
    expect(validateGrowthRate(-Infinity).valid).toBe(false);
  });
});

describe("validateCAGR", () => {
  it("accepts reasonable CAGR values (-50% to 100%)", () => {
    expect(validateCAGR(0).valid).toBe(true);
    expect(validateCAGR(0.15).valid).toBe(true);
    expect(validateCAGR(0.25).valid).toBe(true);
    expect(validateCAGR(0.5).valid).toBe(true);
    expect(validateCAGR(1.0).valid).toBe(true);
    expect(validateCAGR(-0.5).valid).toBe(true);
    expect(validateCAGR(-0.25).valid).toBe(true);
  });

  it("rejects CAGR <= -1 (worse than -100%)", () => {
    const result1 = validateCAGR(-1);
    expect(result1.valid).toBe(false);
    expect(result1.error).toContain("-100%");

    const result2 = validateCAGR(-2);
    expect(result2.valid).toBe(false);
  });

  it("rejects unreasonably low CAGR (< -50%)", () => {
    const result = validateCAGR(-0.51);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("-50%");
  });

  it("rejects unreasonably high CAGR (> 100%)", () => {
    const result = validateCAGR(1.01);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("100%");
  });

  it("rejects non-finite numbers", () => {
    expect(validateCAGR(NaN).valid).toBe(false);
    expect(validateCAGR(Infinity).valid).toBe(false);
    expect(validateCAGR(-Infinity).valid).toBe(false);
  });
});

describe("validateFxRate", () => {
  it("accepts positive FX rates", () => {
    expect(validateFxRate(1).valid).toBe(true);
    expect(validateFxRate(27000).valid).toBe(true);
    expect(validateFxRate(30000).valid).toBe(true);
  });

  it("rejects zero FX rate", () => {
    const result = validateFxRate(0);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("> 0");
  });

  it("rejects negative FX rate", () => {
    const result = validateFxRate(-100);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("> 0");
  });

  it("rejects non-finite numbers", () => {
    expect(validateFxRate(NaN).valid).toBe(false);
    expect(validateFxRate(Infinity).valid).toBe(false);
    expect(validateFxRate(-Infinity).valid).toBe(false);
  });
});

describe("validateSavingRateCap", () => {
  it("accepts valid saving rate caps (0-1)", () => {
    expect(validateSavingRateCap(0).valid).toBe(true);
    expect(validateSavingRateCap(0.5).valid).toBe(true);
    expect(validateSavingRateCap(0.6).valid).toBe(true);
    expect(validateSavingRateCap(1).valid).toBe(true);
  });

  it("rejects negative saving rate cap", () => {
    const result = validateSavingRateCap(-0.1);
    expect(result.valid).toBe(false);
    expect(result.error).toContain(">= 0%");
  });

  it("rejects saving rate cap > 1 (> 100%)", () => {
    const result = validateSavingRateCap(1.1);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("<= 100%");
  });

  it("rejects non-finite numbers", () => {
    expect(validateSavingRateCap(NaN).valid).toBe(false);
    expect(validateSavingRateCap(Infinity).valid).toBe(false);
    expect(validateSavingRateCap(-Infinity).valid).toBe(false);
  });
});
