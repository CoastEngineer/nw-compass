import { useEffect, useState } from "react";
import Card from "./Card";
import { useLifeStore } from "../store/lifeStore";
import type { SalaryFastV1 } from "../lib/salaryFast";
import { formatInt, formatPercent01, parseLooseNumber } from "../lib/input";
import { toastAutoSaved } from "./toastBus";

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

function looksEmpty(sf?: SalaryFastV1) {
  if (!sf) return true;
  const basic = sf.basicGrossMonthlyVnd ?? 0;
  const allow = sf.allowancesMonthlyVnd ?? 0;
  const ins = sf.insuranceAnnualVnd ?? 0;
  return basic === 0 && allow === 0 && ins === 0;
}

export default function SalaryTaxFastInputsCard() {
  const cfg = useLifeStore((s) => s.config);
  const patchConfig = useLifeStore((s) => s.patchConfig);

  const sf = (cfg as any).salaryFast as SalaryFastV1 | undefined;

  const [draft, setDraft] = useState<Record<string, string>>({});
  const hasDraftKey = (k: string) => Object.prototype.hasOwnProperty.call(draft, k);

  const patchSF = (patch: Partial<SalaryFastV1>) => {
    const base = sf ?? defaultSalaryFast(cfg.startYear ?? 2026);
    patchConfig({ salaryFast: { ...base, ...patch } as any });
  };

  useEffect(() => {
    if (!looksEmpty(sf)) return;
    patchConfig({ salaryFast: defaultSalaryFast(cfg.startYear ?? 2026) } as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.startYear]);

  const setDraftKey = (k: string, v: string) => setDraft((p) => ({ ...p, [k]: v }));

  // ✅ IMPORTANT FIX: commit only if edited (draft key exists)
  const commitMoney = (k: string, current: number, apply: (n: number) => void) => {
    if (!hasDraftKey(k)) return;
    const raw = (draft[k] ?? "").trim();
    const n = raw === "" ? 0 : parseLooseNumber(raw);
    if (Number.isFinite(n) && n !== current) apply(n);
    setDraft((p) => ({ ...p, [k]: formatInt(n) }));
    toastAutoSaved();
  };

  const commitInt = (k: string, current: number, apply: (n: number) => void) => {
    if (!hasDraftKey(k)) return;
    const raw = (draft[k] ?? "").trim();
    const n = raw === "" ? 0 : Math.max(0, Math.floor(parseLooseNumber(raw)));
    if (Number.isFinite(n) && n !== current) apply(n);
    setDraft((p) => ({ ...p, [k]: String(n) }));
    toastAutoSaved();
  };

  const commitFloat = (k: string, current: number, apply: (n: number) => void) => {
    if (!hasDraftKey(k)) return;
    const raw = (draft[k] ?? "").trim();
    const n = raw === "" ? 0 : parseLooseNumber(raw);
    if (Number.isFinite(n) && n !== current) apply(n);
    setDraft((p) => ({ ...p, [k]: String(n) }));
    toastAutoSaved();
  };

  const commitPercent = (k: string, currentV01: number, apply: (v01: number) => void) => {
    if (!hasDraftKey(k)) return;
    const raw = (draft[k] ?? "").trim();
    const pct = raw === "" ? 0 : parseLooseNumber(raw);
    const v01 = pct / 100;
    if (Number.isFinite(v01) && v01 !== currentV01) apply(v01);
    setDraft((p) => ({ ...p, [k]: formatPercent01(v01, 1) }));
    toastAutoSaved();
  };

  const effectiveYear = sf?.bonusMarChange?.effectiveYear ?? 2027;
  const effectiveMult = sf?.bonusMarChange?.multiplier ?? 3.6;

  return (
    <Card title="Salary & Tax (fast)" subtitle="Auto-saves on blur. Assumes 12 months/year (fixed).">
      <div className="grid gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="grid gap-1">
            <div className="text-sm text-neutral-600">Basic gross / month (VND)</div>
            <input
              className="h-10 rounded-xl border border-neutral-200 px-3"
              inputMode="numeric"
              value={draft.basicGrossMonthlyVnd ?? formatInt(sf?.basicGrossMonthlyVnd ?? 0)}
              onChange={(e) => setDraftKey("basicGrossMonthlyVnd", e.target.value)}
              onBlur={() =>
                commitMoney("basicGrossMonthlyVnd", sf?.basicGrossMonthlyVnd ?? 0, (n) =>
                  patchSF({ basicGrossMonthlyVnd: n })
                )
              }
            />
          </label>

          <label className="grid gap-1">
            <div className="text-sm text-neutral-600">Allowances / month (VND)</div>
            <input
              className="h-10 rounded-xl border border-neutral-200 px-3"
              inputMode="numeric"
              value={draft.allowancesMonthlyVnd ?? formatInt(sf?.allowancesMonthlyVnd ?? 0)}
              onChange={(e) => setDraftKey("allowancesMonthlyVnd", e.target.value)}
              onBlur={() =>
                commitMoney("allowancesMonthlyVnd", sf?.allowancesMonthlyVnd ?? 0, (n) =>
                  patchSF({ allowancesMonthlyVnd: n })
                )
              }
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="grid gap-1">
            <div className="text-sm text-neutral-600">December bonus (x Basic)</div>
            <input
              className="h-10 rounded-xl border border-neutral-200 px-3"
              inputMode="decimal"
              value={draft.bonusDecMultiplier ?? String(sf?.bonusDecMultiplier ?? 1)}
              onChange={(e) => setDraftKey("bonusDecMultiplier", e.target.value)}
              onBlur={() =>
                commitFloat("bonusDecMultiplier", sf?.bonusDecMultiplier ?? 1, (n) =>
                  patchSF({ bonusDecMultiplier: n })
                )
              }
            />
          </label>

          <label className="grid gap-1">
            <div className="text-sm text-neutral-600">March bonus (x Basic)</div>
            <input
              className="h-10 rounded-xl border border-neutral-200 px-3"
              inputMode="decimal"
              value={draft.bonusMarMultiplier ?? String(sf?.bonusMarMultiplier ?? 1.8)}
              onChange={(e) => setDraftKey("bonusMarMultiplier", e.target.value)}
              onBlur={() =>
                commitFloat("bonusMarMultiplier", sf?.bonusMarMultiplier ?? 1.8, (n) =>
                  patchSF({ bonusMarMultiplier: n })
                )
              }
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="grid gap-1">
            <div className="text-sm text-neutral-600">March bonus change — from year</div>
            <input
              className="h-10 rounded-xl border border-neutral-200 px-3"
              inputMode="numeric"
              value={draft.marChangeYear ?? String(effectiveYear)}
              onChange={(e) => setDraftKey("marChangeYear", e.target.value)}
              onBlur={() => {
                if (!hasDraftKey("marChangeYear")) return; // ✅ tab-through safe
                const raw = (draft.marChangeYear ?? "").trim();
                const y =
                  raw === ""
                    ? effectiveYear
                    : Math.max(1900, Math.floor(parseLooseNumber(raw)));
                patchSF({ bonusMarChange: { effectiveYear: y, multiplier: effectiveMult } });
                setDraft((p) => ({ ...p, marChangeYear: String(y) }));
                toastAutoSaved();
              }}
            />
          </label>

          <label className="grid gap-1">
            <div className="text-sm text-neutral-600">March bonus change — multiplier</div>
            <input
              className="h-10 rounded-xl border border-neutral-200 px-3"
              inputMode="decimal"
              value={draft.marChangeMult ?? String(effectiveMult)}
              onChange={(e) => setDraftKey("marChangeMult", e.target.value)}
              onBlur={() => {
                if (!hasDraftKey("marChangeMult")) return; // ✅ tab-through safe
                const raw = (draft.marChangeMult ?? "").trim();
                const m = raw === "" ? effectiveMult : parseLooseNumber(raw);
                patchSF({ bonusMarChange: { effectiveYear, multiplier: m } });
                setDraft((p) => ({ ...p, marChangeMult: String(m) }));
                toastAutoSaved();
              }}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="grid gap-1">
            <div className="text-sm text-neutral-600">Dependents count</div>
            <input
              className="h-10 rounded-xl border border-neutral-200 px-3"
              inputMode="numeric"
              value={draft.dependentsCount ?? String(sf?.dependentsCount ?? 4)}
              onChange={(e) => setDraftKey("dependentsCount", e.target.value)}
              onBlur={() =>
                commitInt("dependentsCount", sf?.dependentsCount ?? 4, (n) =>
                  patchSF({ dependentsCount: n })
                )
              }
            />
          </label>

          <label className="grid gap-1">
            <div className="text-sm text-neutral-600">Insurance estimate / year (VND)</div>
            <input
              className="h-10 rounded-xl border border-neutral-200 px-3"
              inputMode="numeric"
              value={draft.insuranceAnnualVnd ?? formatInt(sf?.insuranceAnnualVnd ?? 0)}
              onChange={(e) => setDraftKey("insuranceAnnualVnd", e.target.value)}
              onBlur={() =>
                commitMoney("insuranceAnnualVnd", sf?.insuranceAnnualVnd ?? 0, (n) =>
                  patchSF({ insuranceAnnualVnd: n })
                )
              }
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="grid gap-1">
            <div className="text-sm text-neutral-600">Personal deduction / month (VND)</div>
            <input
              className="h-10 rounded-xl border border-neutral-200 px-3"
              inputMode="numeric"
              value={draft.personalDeductionMonthlyVnd ?? formatInt(sf?.personalDeductionMonthlyVnd ?? 0)}
              onChange={(e) => setDraftKey("personalDeductionMonthlyVnd", e.target.value)}
              onBlur={() =>
                commitMoney(
                  "personalDeductionMonthlyVnd",
                  sf?.personalDeductionMonthlyVnd ?? 0,
                  (n) => patchSF({ personalDeductionMonthlyVnd: n })
                )
              }
            />
          </label>

          <label className="grid gap-1">
            <div className="text-sm text-neutral-600">Dependent deduction / month (VND)</div>
            <input
              className="h-10 rounded-xl border border-neutral-200 px-3"
              inputMode="numeric"
              value={draft.dependentDeductionMonthlyVnd ?? formatInt(sf?.dependentDeductionMonthlyVnd ?? 0)}
              onChange={(e) => setDraftKey("dependentDeductionMonthlyVnd", e.target.value)}
              onBlur={() =>
                commitMoney(
                  "dependentDeductionMonthlyVnd",
                  sf?.dependentDeductionMonthlyVnd ?? 0,
                  (n) => patchSF({ dependentDeductionMonthlyVnd: n })
                )
              }
            />
          </label>
        </div>

        <label className="grid gap-1">
          <div className="text-sm text-neutral-600">Effective tax rate on taxable income</div>
          <div className="relative">
            <input
              className="h-10 w-full rounded-xl border border-neutral-200 px-3 pr-10"
              inputMode="decimal"
              value={draft.effectiveTaxRate ?? formatPercent01(sf?.effectiveTaxRate ?? 0.3, 1)}
              onChange={(e) => setDraftKey("effectiveTaxRate", e.target.value)}
              onBlur={() =>
                commitPercent("effectiveTaxRate", sf?.effectiveTaxRate ?? 0.3, (v01) =>
                  patchSF({ effectiveTaxRate: v01 })
                )
              }
            />
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
              %
            </div>
          </div>
        </label>
      </div>
    </Card>
  );
}