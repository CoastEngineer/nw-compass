// src/lib/salaryFast.ts
export type SalaryFastV1 = {
  basicGrossMonthlyVnd: number;
  allowancesMonthlyVnd?: number;
  monthsPaidPerYear?: number;

  bonusDecMultiplier?: number; // default 1.0
  bonusMarMultiplier?: number; // default 1.8

  bonusMarChange?: {
    effectiveYear: number; // e.g. 2027
    multiplier: number; // e.g. 3.6
  };

  dependentsCount: number;

  personalDeductionMonthlyVnd: number;
  dependentDeductionMonthlyVnd: number;

  insuranceAnnualVnd: number;
  effectiveTaxRate: number; // 0..0.60

  taxChange?: {
    effectiveYear: number;
    personalDeductionMonthlyVnd?: number;
    dependentDeductionMonthlyVnd?: number;
    effectiveTaxRate?: number;
    insuranceAnnualVnd?: number;
  };

  lastApplied?: {
    year: number;
    derivedNetIncomeY1: number;
    appliedAtIso: string;
  };
};

export type SalaryDerivedY1 = {
  year: number;

  basicY1: number;
  allowancesY1: number;
  bonusesY1: number;

  grossY1: number;

  deductionsY1: number;
  insuranceY1: number;

  taxableY1: number;
  taxY1: number;

  netIncomeY1: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function marMultiplierForYear(p: SalaryFastV1, year: number) {
  const cur = p.bonusMarMultiplier ?? 1.8;
  const ch = p.bonusMarChange;
  if (ch && year >= ch.effectiveYear) return ch.multiplier;
  return cur;
}

function applyTaxChange(p: SalaryFastV1, year: number) {
  const tc = p.taxChange;
  if (!tc || year < tc.effectiveYear) return p;

  return {
    ...p,
    personalDeductionMonthlyVnd:
      tc.personalDeductionMonthlyVnd ?? p.personalDeductionMonthlyVnd,
    dependentDeductionMonthlyVnd:
      tc.dependentDeductionMonthlyVnd ?? p.dependentDeductionMonthlyVnd,
    effectiveTaxRate: tc.effectiveTaxRate ?? p.effectiveTaxRate,
    insuranceAnnualVnd: tc.insuranceAnnualVnd ?? p.insuranceAnnualVnd,
  };
}

export function deriveSalaryFastY1(
  year: number,
  profile?: SalaryFastV1
): SalaryDerivedY1 | null {
  if (!profile) return null;

  const p = applyTaxChange(profile, year);

  const months = p.monthsPaidPerYear ?? 12;
  const basicM = p.basicGrossMonthlyVnd || 0;
  const allowM = p.allowancesMonthlyVnd ?? 0;

  const decMult = p.bonusDecMultiplier ?? 1.0;
  const marMult = marMultiplierForYear(p, year);

  const basicY1 = basicM * months;
  const allowancesY1 = allowM * months;
  const bonusesY1 = basicM * (decMult + marMult);

  const grossY1 = basicY1 + allowancesY1 + bonusesY1;

  const deductionsY1 =
    (p.personalDeductionMonthlyVnd +
      p.dependentsCount * p.dependentDeductionMonthlyVnd) *
    12;

  const insuranceY1 = p.insuranceAnnualVnd || 0;

  const taxableRaw = grossY1 - deductionsY1 - insuranceY1;
  const taxableY1 = Math.max(0, taxableRaw);

  const taxRate = clamp(p.effectiveTaxRate || 0, 0, 0.6);
  const taxY1 = taxableY1 * taxRate;

  const netIncomeY1 = grossY1 - insuranceY1 - taxY1;

  return {
    year,
    basicY1,
    allowancesY1,
    bonusesY1,
    grossY1,
    deductionsY1,
    insuranceY1,
    taxableY1,
    taxY1,
    netIncomeY1,
  };
}