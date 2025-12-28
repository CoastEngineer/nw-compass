import { MILESTONE_THRESHOLDS } from "./constants";

export type Scenario = "bear" | "base" | "bull";

export type LifeConfig = {
  name: string;
  spouseName: string;
  birthYear: number;
  startYear: number;
  horizonYears: number;

  fxVndPerUsd: number;
  startNWVnd: number;

  // NET cashflow (yearly)
  netIncomeY1: number;   // VND/year
  incomeGrowth: number;  // decimal
  expenseY1: number;     // VND/year
  expenseGrowth: number; // decimal

  // contribution engine (v1)
  minContrib: number;
  maxContrib: number;        // can be Infinity
  savingRateCap?: number;    // 0..1 optional
  contributeYears?: number | null;

  // returns
  cagr: Record<Scenario, number>;
};

export type ProjectionRow = {
  year: number;
  age: number;
  income: number;
  expense: number;
  saving: number;
  contrib: number;
  nwVnd: Record<Scenario, number>;
  nwUsd: Record<Scenario, number>;
};

export type MilestoneHit = {
  thresholdUsd: number;
  scenario: Scenario;
  year: number;
  age: number;
  nwUsd: number;
};

function clamp(x: number, lo: number, hi: number) {
  return Math.min(Math.max(x, lo), hi);
}

export function computeSaving(income: number, expense: number) {
  return Math.max(0, income - expense);
}

/**
 * Contribution rule v1 (locked):
 * - contrib = saving
 * - optional cap: contrib <= income * savingRateCap
 * - clamp to [minContrib, maxContrib]
 * - contributeYears: after N years => 0
 * - NO borrowing: if saving<=0 OR income<=0 => 0 (even if minContrib>0)
 */
export function computeContrib(cfg: LifeConfig, income: number, expense: number, i: number): number {
  const saving = computeSaving(income, expense);

  if (cfg.contributeYears != null && cfg.contributeYears !== null && i >= cfg.contributeYears) return 0;
  if (saving <= 0 || income <= 0) return 0;

  let raw = saving;

  if (cfg.savingRateCap != null) {
    raw = Math.min(raw, income * cfg.savingRateCap);
  }

  const hi = Number.isFinite(cfg.maxContrib) ? cfg.maxContrib : Number.POSITIVE_INFINITY;
  const contrib = clamp(raw, cfg.minContrib, hi);

  // re-apply no borrowing
  return contrib > 0 ? contrib : 0;
}

export function buildProjection(cfg: LifeConfig): ProjectionRow[] {
  const rows: ProjectionRow[] = [];

  const nw: Record<Scenario, number> = {
    bear: cfg.startNWVnd,
    base: cfg.startNWVnd,
    bull: cfg.startNWVnd,
  };

  for (let i = 0; i < cfg.horizonYears; i++) {
    const year = cfg.startYear + i;
    const age = year - cfg.birthYear;

    const income = cfg.netIncomeY1 * Math.pow(1 + cfg.incomeGrowth, i);
    const expense = cfg.expenseY1 * Math.pow(1 + cfg.expenseGrowth, i);
    const saving = computeSaving(income, expense);

    const contrib = computeContrib(cfg, income, expense, i);

    (["bear", "base", "bull"] as Scenario[]).forEach((s) => {
      nw[s] = nw[s] * (1 + cfg.cagr[s]) + contrib;
    });

    rows.push({
      year,
      age,
      income,
      expense,
      saving,
      contrib,
      nwVnd: { ...nw },
      nwUsd: {
        bear: nw.bear / cfg.fxVndPerUsd,
        base: nw.base / cfg.fxVndPerUsd,
        bull: nw.bull / cfg.fxVndPerUsd,
      },
    });
  }

  return rows;
}

export function findMilestones(rows: ProjectionRow[]): MilestoneHit[] {
  const out: MilestoneHit[] = [];

  for (const scenario of ["bear", "base", "bull"] as Scenario[]) {
    for (const t of MILESTONE_THRESHOLDS) {
      const hit = rows.find((r) => r.nwUsd[scenario] >= t);
      if (hit) out.push({ thresholdUsd: t, scenario, year: hit.year, age: hit.age, nwUsd: hit.nwUsd[scenario] });
    }
  }

  return out;
}