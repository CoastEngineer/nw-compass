import Page from "../components/Page";
import Card from "../components/Card";
import { useLifeStore } from "../store/lifeStore";

export default function ConfigPage() {
    const cfg = useLifeStore((s) => s.config);
    const patchConfig = useLifeStore((s) => s.patchConfig);
    const exportConfig = useLifeStore((s) => s.exportConfig);

    return (
        <Page title="Config" subtitle="Assumptions are the product. Keep them explicit.">
            <div className="max-w-2xl">
                <Card title="Core assumptions" subtitle="Net cashflow, expense baseline, and returns.">
                    <div className="grid gap-4">
                        <div className="grid gap-4">
                            <label className="grid gap-1">
                                <div className="text-sm text-neutral-600">Net income (VND/year)</div>
                                <input
                                    className="h-11 rounded-xl border border-neutral-200 px-3"
                                    value={cfg.netIncomeY1}
                                    onChange={(e) => patchConfig({ netIncomeY1: Number(e.target.value) || 0 })}
                                />
                            </label>

                            <label className="grid gap-1">
                                <div className="text-sm text-neutral-600">Expense (VND/year)</div>
                                <input
                                    className="h-11 rounded-xl border border-neutral-200 px-3"
                                    value={cfg.expenseY1}
                                    onChange={(e) => patchConfig({ expenseY1: Number(e.target.value) || 0 })}
                                />
                            </label>

                            <label className="grid gap-1">
                                <div className="text-sm text-neutral-600">Base CAGR</div>
                                <input
                                    className="h-11 rounded-xl border border-neutral-200 px-3"
                                    value={cfg.cagr.base}
                                    onChange={(e) => patchConfig({ cagr: { ...cfg.cagr, base: Number(e.target.value) || 0 } })}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="mt-5 flex gap-3">
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