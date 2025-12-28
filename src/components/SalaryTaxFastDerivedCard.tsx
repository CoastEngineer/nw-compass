import { useMemo, useState } from "react";
import Card from "./Card";
import { useLifeStore } from "../store/lifeStore";
import { deriveSalaryFastY1, type SalaryFastV1 } from "../lib/salaryFast";
import { formatInt } from "../lib/input";
import { toastApplied } from "./toastBus";

// Extended config type with optional salary fields
type ExtendedConfig = {
  salaryFast?: SalaryFastV1;
  netIncomeY1?: number;
};

export default function SalaryTaxFastDerivedCard() {
  const [open, setOpen] = useState(false);

  const cfg = useLifeStore((s) => s.config);
  const patchConfig = useLifeStore((s) => s.patchConfig);

  const sf = (cfg as ExtendedConfig).salaryFast;
  const year = cfg.startYear ?? 2026;

  const d = useMemo(() => deriveSalaryFastY1(year, sf), [year, sf]);

  return (
    <Card
      title={`Derived (Year ${year})`}
      subtitle="Calculator output. Apply → writes into Net income (Y1)."
      rightSlot={
        <div className="flex items-center gap-2">
          <button
            className="text-xs px-3 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Hide" : "Details"}
          </button>
          <button
            className="text-xs px-3 py-2 rounded-xl bg-neutral-900 text-white hover:opacity-95 transition"
            onClick={() => {
              if (!d) return;
              patchConfig({ netIncomeY1: Math.max(0, Math.round(d.netIncomeY1)) } as ExtendedConfig);
              toastApplied();
            }}
          >
            Apply
          </button>
        </div>
      }
    >
      <div className="grid gap-3 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-600">Gross Y1</span>
          <span className="font-medium">{formatInt(d?.grossY1 ?? 0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Tax Y1</span>
          <span className="font-medium">{formatInt(d?.taxY1 ?? 0)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-neutral-100">
          <span className="text-neutral-700">Net income (Y1)</span>
          <span className="font-semibold">{formatInt(d?.netIncomeY1 ?? 0)}</span>
        </div>
      </div>

      {open && (
        <div className="mt-4 rounded-2xl border border-neutral-100 bg-neutral-50/40 px-4 py-3 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-600">Insurance Y1</span>
            <span className="font-medium">{formatInt(d?.insuranceY1 ?? 0)}</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-neutral-600">Deductions Y1</span>
            <span className="font-medium">{formatInt(d?.deductionsY1 ?? 0)}</span>
          </div>
        </div>
      )}
    </Card>
  );
}