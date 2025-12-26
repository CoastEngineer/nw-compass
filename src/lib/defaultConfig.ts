import type { LifeConfig } from "./model";

export const defaultConfig: LifeConfig = {
  name: "Hoàng",
  spouseName: "Ngân",
  birthYear: 1991,
  startYear: 2026,
  horizonYears: 60,

  fxVndPerUsd: 27000,
  startNWVnd: 8.49e9,

  netIncomeY1: 3.0e9,
  incomeGrowth: 0.06,

  expenseY1: 2.0e9,
  expenseGrowth: 0.05,

  minContrib: 0,
  maxContrib: Number.POSITIVE_INFINITY,
  savingRateCap: 0.6,
  contributeYears: null,

  cagr: { bear: 0.15, base: 0.18, bull: 0.22 },
};