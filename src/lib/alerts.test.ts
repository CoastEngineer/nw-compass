import { describe, expect, it } from "vitest";
import type { LifeConfig } from "./model";
import { buildProjection } from "./model";
import { computeAlerts } from "./alerts";

function baseCfg(patch: Partial<LifeConfig> = {}): LifeConfig {
  return {
    name: "A",
    spouseName: "B",
    birthYear: 1991,
    startYear: 2026,
    horizonYears: 10,
    fxVndPerUsd: 27000,
    startNWVnd: 0,
    netIncomeY1: 3_000_000_000,
    incomeGrowth: 0.06,
    expenseY1: 2_000_000_000,
    expenseGrowth: 0.05,
    minContrib: 0,
    maxContrib: Number.POSITIVE_INFINITY,
    savingRateCap: 0.6,
    contributeYears: null,
    cagr: { bear: 0.12, base: 0.18, bull: 0.24 },
    ...patch,
  };
}

describe("folly alerts", () => {
  it("D1 lifestyle inflation watch/caution", () => {
    const cfgWatch = baseCfg({ incomeGrowth: 0.06, expenseGrowth: 0.07 });
    const rowsW = buildProjection(cfgWatch);
    const aW = computeAlerts({ cfg: cfgWatch, rows: rowsW }).find(x => x.id === "lifestyle-inflation");
    expect(aW?.status).toBe("watch");

    const cfgC = baseCfg({ incomeGrowth: 0.06, expenseGrowth: 0.09 });
    const rowsC = buildProjection(cfgC);
    const aC = computeAlerts({ cfg: cfgC, rows: rowsC }).find(x => x.id === "lifestyle-inflation");
    expect(aC?.status).toBe("caution");
  });

  it("D2 no fuel caution", () => {
    const cfg = baseCfg({ netIncomeY1: 2_000_000_000, expenseY1: 2_000_000_000, incomeGrowth: 0, expenseGrowth: 0 });
    const rows = buildProjection(cfg);
    const a = computeAlerts({ cfg, rows }).find(x => x.id === "no-fuel");
    expect(a?.status).toBe("caution");
  });

  it("D3 clamped by max contrib caution", () => {
    const cfg = baseCfg({
      netIncomeY1: 3_000_000_000,
      expenseY1: 1_000_000_000, // saving ~2B
      incomeGrowth: 0,
      expenseGrowth: 0,
      maxContrib: 1_000_000_000,
      savingRateCap: undefined,
    });
    const rows = buildProjection(cfg);
    const a = computeAlerts({ cfg, rows }).find(x => x.id === "clamped-by-max");
    expect(a?.status).toBe("caution");
  });

  it("D4 capped by saving rate caution", () => {
    const cfg = baseCfg({
      netIncomeY1: 3_000_000_000,
      expenseY1: 1_000_000_000, // saving 2B
      incomeGrowth: 0,
      expenseGrowth: 0,
      savingRateCap: 0.3, // cap 0.9B < saving
      maxContrib: Number.POSITIVE_INFINITY,
    });
    const rows = buildProjection(cfg);
    const a = computeAlerts({ cfg, rows }).find(x => x.id === "capped-by-rate");
    expect(a?.status).toBe("caution");
  });

  it("D5 high CAGR watch/caution", () => {
    const cfgW = baseCfg({ cagr: { bear: 0.1, base: 0.26, bull: 0.3 } });
    const rowsW = buildProjection(cfgW);
    const aW = computeAlerts({ cfg: cfgW, rows: rowsW }).find(x => x.id === "high-cagr");
    expect(aW?.status).toBe("watch");

    const cfgC = baseCfg({ cagr: { bear: 0.1, base: 0.31, bull: 0.35 } });
    const rowsC = buildProjection(cfgC);
    const aC = computeAlerts({ cfg: cfgC, rows: rowsC }).find(x => x.id === "high-cagr");
    expect(aC?.status).toBe("caution");
  });

  it("D7 buffer thin watch/caution", () => {
    const cfgW = baseCfg({ netIncomeY1: 10_000, expenseY1: 8_000 }); // 80%
    const rowsW = buildProjection(cfgW);
    const aW = computeAlerts({ cfg: cfgW, rows: rowsW }).find(x => x.id === "buffer-thin");
    expect(aW?.status).toBe("watch");

    const cfgC = baseCfg({ netIncomeY1: 10_000, expenseY1: 9_000 }); // 90%
    const rowsC = buildProjection(cfgC);
    const aC = computeAlerts({ cfg: cfgC, rows: rowsC }).find(x => x.id === "buffer-thin");
    expect(aC?.status).toBe("caution");
  });

  it("D6 milestone slippage watch/caution", () => {
    const cfg = baseCfg();
    const rows = buildProjection(cfg);

    const watch = computeAlerts({
      cfg, rows,
      lastSnapshotNextMilestoneBaseYear: 2032,
      currentNextMilestoneBaseYear: 2034,
    }).find(x => x.id === "milestone-slippage");
    expect(watch?.status).toBe("watch");

    const caution = computeAlerts({
      cfg, rows,
      lastSnapshotNextMilestoneBaseYear: 2032,
      currentNextMilestoneBaseYear: 2036,
    }).find(x => x.id === "milestone-slippage");
    expect(caution?.status).toBe("caution");
  });
});