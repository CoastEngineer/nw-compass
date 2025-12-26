import { useMemo } from "react";
import Page from "../components/Page";
import KPIStatCard from "../components/KPIStatCard";
import SegmentedToggle from "../components/SegmentedToggle";
import MilestoneTable from "../components/MilestoneTable";
import { buildProjection, findMilestones } from "../lib/model";
import { buildMilestoneGrid } from "../lib/milestoneHelpers";
import { useLifeStore } from "../store/lifeStore";
import { formatCompactUsd, formatCompactVnd } from "../lib/format";
import ProjectionTable from "../components/ProjectionTable";
import AlertList from "../components/AlertList";
import { computeAlerts } from "../lib/alerts";

export default function DashboardPage() {
    const cfg = useLifeStore((s) => s.config);
    const display = useLifeStore((s) => s.display);
    const setDisplay = useLifeStore((s) => s.setDisplay);

    const rows = useMemo(() => buildProjection(cfg), [cfg]);
    const alerts = useMemo(() => computeAlerts({ cfg, rows }), [cfg, rows]);
    const last = rows.at(-1);
    const first = rows[0];

    const hits = useMemo(() => findMilestones(rows), [rows]);
    const milestoneGrid = useMemo(() => buildMilestoneGrid(hits), [hits]);

    const startAge = cfg.startYear - cfg.birthYear;
    const endAge = (cfg.startYear + cfg.horizonYears - 1) - cfg.birthYear;

    const startNwVnd = cfg.startNWVnd;
    const startNwUsd = cfg.startNWVnd / cfg.fxVndPerUsd;

    const fmtNW = (vnd: number, usd: number) =>
        display.currency === "USD" ? formatCompactUsd(usd) : formatCompactVnd(vnd);

    const endBear = last?.nwVnd.bear ?? 0;
    const endBase = last?.nwVnd.base ?? 0;
    const endBull = last?.nwVnd.bull ?? 0;

    const endBearUsd = last?.nwUsd.bear ?? 0;
    const endBaseUsd = last?.nwUsd.base ?? 0;
    const endBullUsd = last?.nwUsd.bull ?? 0;

    return (
        <Page title="Dashboard" subtitle="A calm, precise cockpit for your family plan">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                    <SegmentedToggle
                        value={display.currency}
                        onChange={(v) => setDisplay({ currency: v as any })}
                        options={[
                            { label: "USD", value: "USD" },
                            { label: "VND", value: "VND" },
                        ]}
                    />
                    <SegmentedToggle
                        value={String(display.tableStep)}
                        onChange={(v) => setDisplay({ tableStep: Number(v) as any })}
                        options={[
                            { label: "1y", value: "1" },
                            { label: "5y", value: "5" },
                            { label: "10y", value: "10" },
                        ]}
                    />
                </div>

                <div className="text-xs text-neutral-500">
                    {first?.year} → {last?.year} (age {startAge} → {endAge})
                </div>
            </div>

            {/* KPI strip */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPIStatCard label="Current age (start)" value={`${startAge}`} sub={`Start year ${cfg.startYear}`} />
                <KPIStatCard
                    label="Start NW"
                    value={fmtNW(startNwVnd, startNwUsd)}
                    sub={`FX ${cfg.fxVndPerUsd.toLocaleString("vi-VN")} VND/USD`}
                />
                <KPIStatCard
                    label="Net income (Y1)"
                    value={display.currency === "USD" ? formatCompactUsd(cfg.netIncomeY1 / cfg.fxVndPerUsd) : formatCompactVnd(cfg.netIncomeY1)}
                    sub={`Growth ${(cfg.incomeGrowth * 100).toFixed(1)}%`}
                />
                <KPIStatCard
                    label="Expense (Y1)"
                    value={display.currency === "USD" ? formatCompactUsd(cfg.expenseY1 / cfg.fxVndPerUsd) : formatCompactVnd(cfg.expenseY1)}
                    sub={`Growth ${(cfg.expenseGrowth * 100).toFixed(1)}%`}
                />
                <KPIStatCard
                    label="Saving (Y1)"
                    value={
                        display.currency === "USD"
                            ? formatCompactUsd(Math.max(0, cfg.netIncomeY1 - cfg.expenseY1) / cfg.fxVndPerUsd)
                            : formatCompactVnd(Math.max(0, cfg.netIncomeY1 - cfg.expenseY1))
                    }
                    sub="(Income - Expense)"
                />
                <KPIStatCard
                    label="CAGR (Bear/Base/Bull)"
                    value={`${Math.round(cfg.cagr.bear * 100)} / ${Math.round(cfg.cagr.base * 100)} / ${Math.round(cfg.cagr.bull * 100)}%`}
                    sub="Assumption"
                />
                <KPIStatCard label="End NW (Base)" value={fmtNW(endBase, endBaseUsd)} sub={`Bear ${fmtNW(endBear, endBearUsd)} • Bull ${fmtNW(endBull, endBullUsd)}`} />
                <KPIStatCard label="Milestones hit" value={`${hits.length}`} sub="Across 3 scenarios" />
            </div>

            <div className="mt-6">
                <AlertList alerts={alerts} />
            </div>
            
            <div className="mt-6">
                <MilestoneTable rows={milestoneGrid} />
            </div>

            <div className="mt-6">
                <ProjectionTable
                    rows={rows}
                    currency={display.currency}
                    tableStep={display.tableStep}
                    fxVndPerUsd={cfg.fxVndPerUsd}
                />
            </div>
        </Page>
    );
}