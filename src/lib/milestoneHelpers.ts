import type { MilestoneHit, Scenario } from "./model";

const thresholds = [
  { usd: 1e6, label: "$1M" },
  { usd: 1e7, label: "$10M" },
  { usd: 1e8, label: "$100M" },
  { usd: 1e9, label: "$1B" },
] as const;

export function buildMilestoneGrid(hits: MilestoneHit[]) {
  const by = new Map<string, { year: number; age: number }>();
  for (const h of hits) {
    by.set(`${h.scenario}:${h.thresholdUsd}`, { year: h.year, age: h.age });
  }

  return thresholds.map((t) => ({
    label: t.label,
    bear: by.get(`bear:${t.usd}`) ?? null,
    base: by.get(`base:${t.usd}`) ?? null,
    bull: by.get(`bull:${t.usd}`) ?? null,
  }));
}

export function nextMilestoneBase(hits: MilestoneHit[], currentYear: number) {
  const base = hits
    .filter((h) => h.scenario === "base")
    .sort((a, b) => a.thresholdUsd - b.thresholdUsd);

  // next = first milestone whose year >= currentYear (rough) OR first that exists
  // v1: just return smallest threshold hit (if any) else null
  return base.length ? base[0] : null;
}