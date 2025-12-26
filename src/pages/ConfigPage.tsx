import { useEffect, useState } from "react";
import Page from "../components/Page";
import Card from "../components/Card";
import { useLifeStore } from "../store/lifeStore";

// ---------- helpers ----------
function formatWithCommas(n: number) {
  const x = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(x);
}

function parseCommaNumber(s: string) {
  const cleaned = String(s).replace(/[,\s]/g, "");
  if (cleaned === "" || cleaned === "-") return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function formatPercentInput(decimal: number) {
  const pct = (Number.isFinite(decimal) ? decimal : 0) * 100;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(pct);
}

function parsePercentInput(s: string) {
  const cleaned = String(s).replace(/[,\s]/g, "");
  if (cleaned === "" || cleaned === "-") return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export default function ConfigPage() {
  const cfg = useLifeStore((s) => s.config);
  const patchConfig = useLifeStore((s) => s.patchConfig);
  const exportConfig = useLifeStore((s) => s.exportConfig);

  // local display strings (so we can show commas / % nicely)
  const [netIncomeStr, setNetIncomeStr] = useState(() => formatWithCommas(cfg.netIncomeY1));
  const [expenseStr, setExpenseStr] = useState(() => formatWithCommas(cfg.expenseY1));

  const [bearStr, setBearStr] = useState(() => formatPercentInput(cfg.cagr.bear));
  const [baseStr, setBaseStr] = useState(() => formatPercentInput(cfg.cagr.base));
  const [bullStr, setBullStr] = useState(() => formatPercentInput(cfg.cagr.bull));

  // keep strings in sync if cfg changes elsewhere
  useEffect(() => setNetIncomeStr(formatWithCommas(cfg.netIncomeY1)), [cfg.netIncomeY1]);
  useEffect(() => setExpenseStr(formatWithCommas(cfg.expenseY1)), [cfg.expenseY1]);

  useEffect(() => setBearStr(formatPercentInput(cfg.cagr.bear)), [cfg.cagr.bear]);
  useEffect(() => setBaseStr(formatPercentInput(cfg.cagr.base)), [cfg.cagr.base]);
  useEffect(() => setBullStr(formatPercentInput(cfg.cagr.bull)), [cfg.cagr.bull]);

  return (
    <Page title="Config" subtitle="Assumptions are the product. Keep them explicit.">
      <div className="max-w-2xl">
        <Card title="Core assumptions" subtitle="Net cashflow, expense baseline, and returns.">
          <div className="grid gap-6">
            {/* Cashflow */}
            <div className="grid gap-4">
              <label className="grid gap-1">
                <div className="text-sm text-neutral-600">Net income (VND/year)</div>
                <input
                  className="h-11 rounded-xl border border-neutral-200 px-3"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={netIncomeStr}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setNetIncomeStr(raw);
                    patchConfig({ netIncomeY1: parseCommaNumber(raw) });
                  }}
                  onBlur={() => setNetIncomeStr(formatWithCommas(cfg.netIncomeY1))}
                />
              </label>

              <label className="grid gap-1">
                <div className="text-sm text-neutral-600">Expense (VND/year)</div>
                <input
                  className="h-11 rounded-xl border border-neutral-200 px-3"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={expenseStr}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setExpenseStr(raw);
                    patchConfig({ expenseY1: parseCommaNumber(raw) });
                  }}
                  onBlur={() => setExpenseStr(formatWithCommas(cfg.expenseY1))}
                />
              </label>
            </div>

            {/* Returns */}
            <div className="grid gap-3">
              <div>
                <div className="text-sm font-medium text-neutral-900">Return assumptions</div>
                <div className="text-xs text-neutral-500">
                  Enter percent. Example: <span className="font-medium">18</span> means 18%/year.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="grid gap-1">
                  <div className="text-sm text-neutral-600">Bear CAGR (%)</div>
                  <input
                    className="h-11 rounded-xl border border-neutral-200 px-3"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={bearStr}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setBearStr(raw);
                      const pct = parsePercentInput(raw);
                      patchConfig({ cagr: { ...cfg.cagr, bear: pct / 100 } });
                    }}
                    onBlur={() => setBearStr(formatPercentInput(cfg.cagr.bear))}
                  />
                </label>

                <label className="grid gap-1">
                  <div className="text-sm text-neutral-600">Base CAGR (%)</div>
                  <input
                    className="h-11 rounded-xl border border-neutral-200 px-3"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={baseStr}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setBaseStr(raw);
                      const pct = parsePercentInput(raw);
                      patchConfig({ cagr: { ...cfg.cagr, base: pct / 100 } });
                    }}
                    onBlur={() => setBaseStr(formatPercentInput(cfg.cagr.base))}
                  />
                </label>

                <label className="grid gap-1">
                  <div className="text-sm text-neutral-600">Bull CAGR (%)</div>
                  <input
                    className="h-11 rounded-xl border border-neutral-200 px-3"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={bullStr}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setBullStr(raw);
                      const pct = parsePercentInput(raw);
                      patchConfig({ cagr: { ...cfg.cagr, bull: pct / 100 } });
                    }}
                    onBlur={() => setBullStr(formatPercentInput(cfg.cagr.bull))}
                  />
                </label>
              </div>

              <div className="text-xs text-neutral-500">
                Stored as decimals: bear {cfg.cagr.bear.toFixed(4)}, base {cfg.cagr.base.toFixed(4)}, bull{" "}
                {cfg.cagr.bull.toFixed(4)}
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              className="h-11 rounded-xl bg-neutral-900 text-white px-4 text-sm"
              onClick={() => {
                navigator.clipboard.writeText(exportConfig());
                alert("Copied config JSON to clipboard");
              }}
            >
              Export JSON (copy)
            </button>
          </div>
        </Card>
      </div>
    </Page>
  );
}