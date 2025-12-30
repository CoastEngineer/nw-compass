import { useEffect, useState, type HTMLAttributes } from "react";
import Page from "../components/Page";
import Card from "../components/Card";
import SegmentedToggle from "../components/SegmentedToggle";
import SalaryTaxFastInputsCard from "../components/SalaryTaxFastInputsCard";
import SalaryTaxFastDerivedCard from "../components/SalaryTaxFastDerivedCard";
import { useLifeStore } from "../store/lifeStore";
import { formatInt, formatPercent01, parseLooseNumber } from "../lib/input";
import type { SalaryFastV1 } from "../lib/salaryFast";
import { toastAutoSaved } from "../components/toastBus";

// Extended config type with optional salary fields
type ExtendedConfig = {
  incomeMode?: string;
  salaryFast?: SalaryFastV1;
};

function Field({
  label,
  hint,
  value,
  onChange,
  onBlur,
  suffix,
  inputMode = "numeric",
  pulseToken,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (next: string) => void;
  onBlur?: () => void;
  suffix?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  pulseToken?: number;
}) {
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (!pulseToken) return;
    // Delay setState to avoid synchronous state update
    const immediate = window.setTimeout(() => setJustSaved(true), 0);
    const delayed = window.setTimeout(() => setJustSaved(false), 900);
    return () => {
      window.clearTimeout(immediate);
      window.clearTimeout(delayed);
    };
  }, [pulseToken]);

  return (
    <label className="grid gap-1">
      <div className="text-sm text-neutral-600 flex items-center justify-between">
        <span>{label}</span>
        <span className="flex items-center gap-2">
          {justSaved && <span className="text-xs text-emerald-600">Saved</span>}
          {hint && <span className="text-xs text-neutral-400">{hint}</span>}
        </span>
      </div>

      <div className="relative">
        <input
          className={[
            "h-10 w-full rounded-xl border px-3 pr-10 transition",
            justSaved
              ? "border-emerald-300 ring-2 ring-emerald-100"
              : "border-neutral-200 focus:border-neutral-300 focus:ring-2 focus:ring-neutral-100",
          ].join(" ")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          inputMode={inputMode}
        />
        {suffix && (
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
            {suffix}
          </div>
        )}
      </div>
    </label>
  );
}

function defaultSalaryFast(cfgYear: number): SalaryFastV1 {
  return {
    basicGrossMonthlyVnd: 234_520_000,
    allowancesMonthlyVnd: 700_000,
    monthsPaidPerYear: 12,
    bonusDecMultiplier: 1.0,
    bonusMarMultiplier: 1.8,
    bonusMarChange: { effectiveYear: Math.max(cfgYear + 1, 2027), multiplier: 3.6 },
    dependentsCount: 4,
    insuranceAnnualVnd: 65_256_000,
    personalDeductionMonthlyVnd: 15_500_000,
    dependentDeductionMonthlyVnd: 6_200_000,
    effectiveTaxRate: 0.30,
  };
}

function looksEmptySalaryFast(sf?: SalaryFastV1) {
  if (!sf) return true;
  const basic = sf.basicGrossMonthlyVnd ?? 0;
  const allow = sf.allowancesMonthlyVnd ?? 0;
  const ins = sf.insuranceAnnualVnd ?? 0;
  return basic === 0 && allow === 0 && ins === 0;
}

export default function ConfigPage() {
  const cfg = useLifeStore((s) => s.config);
  const patchConfig = useLifeStore((s) => s.patchConfig);
  const exportConfig = useLifeStore((s) => s.exportConfig);

  const [draft, setDraft] = useState<Record<string, string>>({});
  const hasDraftKey = (k: string) => Object.prototype.hasOwnProperty.call(draft, k);

  const [savedPulse, setSavedPulse] = useState<Record<string, number>>({});
  const markSaved = (key: string) => setSavedPulse((p) => ({ ...p, [key]: (p[key] ?? 0) + 1 }));

  const incomeMode = (cfg as ExtendedConfig).incomeMode ?? "simple";
  const salaryFast: SalaryFastV1 | undefined = (cfg as ExtendedConfig).salaryFast;
  const showSalary = incomeMode === "salary_fast";

  useEffect(() => {
    if (!showSalary) return;
    if (!looksEmptySalaryFast(salaryFast)) return;
    patchConfig({ salaryFast: defaultSalaryFast(cfg.startYear ?? 2026) } as ExtendedConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSalary, cfg.startYear]);

  const setDraftKey = (k: string, v: string) => setDraft((p) => ({ ...p, [k]: v }));

  // ✅ IMPORTANT FIX: only commit if user edited this field (key exists in draft)
  const commitMoney = (key: string, currentValue: number, apply: (n: number) => void) => {
    if (!hasDraftKey(key)) return; // user just tabbed through

    const raw = (draft[key] ?? "").trim();

    // if user cleared the field intentionally -> set 0
    const n = raw === "" ? 0 : parseLooseNumber(raw);

    // optionally avoid redundant patch
    if (Number.isFinite(n) && n !== currentValue) apply(n);

    setDraft((p) => ({ ...p, [key]: formatInt(n) }));
    markSaved(key);
    toastAutoSaved();
  };

  const commitPercent = (key: string, currentV01: number, apply: (v01: number) => void) => {
    if (!hasDraftKey(key)) return;

    const raw = (draft[key] ?? "").trim();
    const pct = raw === "" ? 0 : parseLooseNumber(raw);
    const v01 = pct / 100;

    if (Number.isFinite(v01) && v01 !== currentV01) apply(v01);

    setDraft((p) => ({ ...p, [key]: formatPercent01(v01, 1) }));
    markSaved(key);
    toastAutoSaved();
  };

  // commit helper for positive-only fields (like fxVndPerUsd)
  const commitPositive = (key: string, currentValue: number, apply: (n: number) => void) => {
    if (!hasDraftKey(key)) return;

    const raw = (draft[key] ?? "").trim();
    const n = raw === "" ? 0 : parseLooseNumber(raw);

    // only commit if valid (finite and positive)
    if (Number.isFinite(n) && n > 0 && n !== currentValue) {
      apply(n);
      setDraft((p) => ({ ...p, [key]: formatInt(n) }));
      markSaved(key);
      toastAutoSaved();
    } else {
      // revert to current value if invalid
      setDraft((p) => ({ ...p, [key]: formatInt(currentValue) }));
    }
  };

  return (
    <Page title="Config" subtitle="Assumptions are the product. Keep them explicit.">
      <div className="mx-auto max-w-7xl">
        <div
          className={[
            "grid gap-6",
            showSalary ? "lg:grid-cols-[1.05fr_1.35fr_0.85fr] lg:gap-8" : "",
          ].join(" ")}
        >
          <div className="space-y-6">
            <Card title="Income mode" subtitle="Simple is fast. Salary mode is explainable.">
              <div className="flex items-center justify-between gap-3">
                <SegmentedToggle
                  value={incomeMode}
                  onChange={(v) => {
                    if (v === "salary_fast") {
                      const nextSF = looksEmptySalaryFast(salaryFast)
                        ? defaultSalaryFast(cfg.startYear ?? 2026)
                        : salaryFast;

                      patchConfig({ incomeMode: "salary_fast", salaryFast: nextSF } as ExtendedConfig);
                    } else {
                      patchConfig({ incomeMode: v } as ExtendedConfig);
                    }
                  }}
                  options={[
                    { label: "Simple", value: "simple" },
                    { label: "Salary (fast)", value: "salary_fast" },
                  ]}
                />
                <div className="text-xs text-neutral-500">
                  Output feeds <span className="font-medium text-neutral-900">Net income (Y1)</span>
                </div>
              </div>
            </Card>

            <Card title="Core assumptions" subtitle="Auto-saves on blur. Projection engine reads these.">
              <div className="grid gap-4">
                <Field
                  label="Net income (VND/year)"
                  hint={showSalary ? "Core value (can be derived)" : "Core value"}
                  value={draft.netIncomeY1 ?? formatInt(cfg.netIncomeY1)}
                  onChange={(v) => setDraftKey("netIncomeY1", v)}
                  onBlur={() =>
                    commitMoney("netIncomeY1", cfg.netIncomeY1, (n) =>
                      patchConfig({ netIncomeY1: n })
                    )
                  }
                  pulseToken={savedPulse.netIncomeY1}
                />

                <Field
                  label="Expense (VND/year)"
                  value={draft.expenseY1 ?? formatInt(cfg.expenseY1)}
                  onChange={(v) => setDraftKey("expenseY1", v)}
                  onBlur={() =>
                    commitMoney("expenseY1", cfg.expenseY1, (n) =>
                      patchConfig({ expenseY1: n })
                    )
                  }
                  pulseToken={savedPulse.expenseY1}
                />

                <Field
                  label="FX rate (VND per USD)"
                  hint="Used to convert VND ↔ USD in projections"
                  value={draft.fxVndPerUsd ?? formatInt(cfg.fxVndPerUsd)}
                  onChange={(v) => setDraftKey("fxVndPerUsd", v)}
                  onBlur={() =>
                    commitPositive("fxVndPerUsd", cfg.fxVndPerUsd, (n) =>
                      patchConfig({ fxVndPerUsd: n })
                    )
                  }
                  pulseToken={savedPulse.fxVndPerUsd}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field
                    label="CAGR — Bear"
                    suffix="%"
                    inputMode="decimal"
                    value={draft.cagrBear ?? formatPercent01(cfg.cagr.bear, 1)}
                    onChange={(v) => setDraftKey("cagrBear", v)}
                    onBlur={() =>
                      commitPercent("cagrBear", cfg.cagr.bear, (v01) =>
                        patchConfig({ cagr: { ...cfg.cagr, bear: v01 } })
                      )
                    }
                    pulseToken={savedPulse.cagrBear}
                  />
                  <Field
                    label="CAGR — Base"
                    suffix="%"
                    inputMode="decimal"
                    value={draft.cagrBase ?? formatPercent01(cfg.cagr.base, 1)}
                    onChange={(v) => setDraftKey("cagrBase", v)}
                    onBlur={() =>
                      commitPercent("cagrBase", cfg.cagr.base, (v01) =>
                        patchConfig({ cagr: { ...cfg.cagr, base: v01 } })
                      )
                    }
                    pulseToken={savedPulse.cagrBase}
                  />
                  <Field
                    label="CAGR — Bull"
                    suffix="%"
                    inputMode="decimal"
                    value={draft.cagrBull ?? formatPercent01(cfg.cagr.bull, 1)}
                    onChange={(v) => setDraftKey("cagrBull", v)}
                    onBlur={() =>
                      commitPercent("cagrBull", cfg.cagr.bull, (v01) =>
                        patchConfig({ cagr: { ...cfg.cagr, bull: v01 } })
                      )
                    }
                    pulseToken={savedPulse.cagrBull}
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  className="h-10 rounded-xl bg-neutral-900 text-white px-4 text-sm"
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

          {showSalary && (
            <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <SalaryTaxFastInputsCard />
            </div>
          )}

          {showSalary && (
            <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <SalaryTaxFastDerivedCard />
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}