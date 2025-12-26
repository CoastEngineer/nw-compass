import { describe, expect, it } from "vitest";
import { buildProjection, findMilestones } from "./model";
import type { LifeConfig } from "./model";

describe("projection engine", () => {
  it("A1 baseline 1-year sanity", () => {
    const cfg: LifeConfig = {
      name: "A",
      spouseName: "B",
      birthYear: 1991,
      startYear: 2026,
      horizonYears: 1,

      fxVndPerUsd: 27000,
      startNWVnd: 8_490_000_000,

      netIncomeY1: 3_000_000_000,
      incomeGrowth: 0,
      expenseY1: 2_000_000_000,
      expenseGrowth: 0,

      minContrib: 0,
      maxContrib: Number.POSITIVE_INFINITY,
      savingRateCap: undefined,
      contributeYears: null,

      cagr: { bear: 0.10, base: 0.10, bull: 0.10 },
    };

    const rows = buildProjection(cfg);
    expect(rows).toHaveLength(1);

    const r = rows[0];
    expect(r.year).toBe(2026);
    expect(r.age).toBe(35);

    expect(r.saving).toBe(1_000_000_000);
    expect(r.contrib).toBe(1_000_000_000);

    const expectedNw = 8_490_000_000 * 1.10 + 1_000_000_000;
    expect(r.nwVnd.base).toBeCloseTo(expectedNw, 6);
    expect(r.nwUsd.base).toBeCloseTo(expectedNw / 27000, 6);
  });

  it("A4 contributeYears stops after N years", () => {
    const cfg: LifeConfig = {
      name: "A",
      spouseName: "B",
      birthYear: 1991,
      startYear: 2026,
      horizonYears: 4,

      fxVndPerUsd: 1,
      startNWVnd: 0,

      netIncomeY1: 1000,
      incomeGrowth: 0,
      expenseY1: 0,
      expenseGrowth: 0,

      minContrib: 0,
      maxContrib: Number.POSITIVE_INFINITY,
      savingRateCap: undefined,
      contributeYears: 2,

      cagr: { bear: 0, base: 0, bull: 0 },
    };

    const rows = buildProjection(cfg);
    expect(rows.map((x) => x.contrib)).toEqual([1000, 1000, 0, 0]);
    expect(rows[3].nwVnd.base).toBe(2000);
  });

  it("C1 milestone hit at end-of-year", () => {
    const cfg: LifeConfig = {
      name: "A",
      spouseName: "B",
      birthYear: 1991,
      startYear: 2026,
      horizonYears: 1,

      fxVndPerUsd: 1,
      startNWVnd: 900_000,

      netIncomeY1: 0,
      incomeGrowth: 0,
      expenseY1: 0,
      expenseGrowth: 0,

      minContrib: 0,
      maxContrib: Number.POSITIVE_INFINITY,
      savingRateCap: undefined,
      contributeYears: null,

      cagr: { bear: 0.20, base: 0.20, bull: 0.20 },
    };

    const rows = buildProjection(cfg);
    const hits = findMilestones(rows);
    const hit1m = hits.find((h) => h.thresholdUsd === 1e6 && h.scenario === "base");
    expect(hit1m?.year).toBe(2026);
  });
});