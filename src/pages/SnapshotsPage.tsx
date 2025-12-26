import { useMemo, useState } from "react";
import Page from "../components/Page";
import Card from "../components/Card";
import MilestoneTable from "../components/MilestoneTable";
import { useLifeStore } from "../store/lifeStore";
import { formatCompactUsd } from "../lib/format";
import {
  addSnapshot,
  createSnapshot,
  deleteSnapshot,
  loadSnapshots,
  renameSnapshot,
  type Snapshot,
} from "../lib/snapshots";

function MiniKPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-neutral-50/40 px-4 py-3">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

/** Milestone values can be string ("2030 (age 39)") OR object ({year, age}) */
function milestoneToText(v: any): string {
  if (v == null) return "—";
  if (typeof v === "string") return v;

  if (typeof v === "object") {
    const year = (v as any).year;
    const age = (v as any).age;
    if (typeof year === "number" && typeof age === "number") return `${year} (age ${age})`;
    if (typeof year === "number") return String(year);
    return "—";
  }

  return String(v);
}

function milestoneToYear(v: any): number | null {
  if (v == null) return null;
  if (typeof v === "object" && typeof (v as any).year === "number") return (v as any).year;

  const s = milestoneToText(v);
  const m = s.match(/\b(19|20)\d{2}\b/);
  return m ? Number(m[0]) : null;
}

export default function SnapshotsPage() {
  const cfg = useLifeStore((s) => s.config);

  const [snapshots, setSnapshots] = useState<Snapshot[]>(() => loadSnapshots());
  const [selected, setSelected] = useState<string[]>([]); // max 2 ids

  // ✅ inline rename drafts
  const [editing, setEditing] = useState<Record<string, string>>({});

  const selectedSnaps = useMemo(() => {
    const a = snapshots.find((s) => s.id === selected[0]);
    const b = snapshots.find((s) => s.id === selected[1]);
    return { a, b };
  }, [snapshots, selected]);

  const saveCurrent = () => {
    const name = window.prompt("Snapshot name (optional):", "");
    const snap = createSnapshot(cfg, name ?? undefined);
    const next = addSnapshot(snap);
    setSnapshots(next);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id]; // keep last 2
      return [...prev, id];
    });
  };

  const remove = (id: string) => {
    if (!window.confirm("Delete this snapshot?")) return;
    const next = deleteSnapshot(id);
    setSnapshots(next);
    setSelected((prev) => prev.filter((x) => x !== id));
  };

  const compare = useMemo(() => {
    const a = selectedSnaps.a;
    const b = selectedSnaps.b;
    if (!a || !b) return null;

    const aBase = a.summary.end.usd.base;
    const bBase = b.summary.end.usd.base;
    const delta = bBase - aBase;

    const targets = Array.from(
      new Set([
        ...a.summary.milestones.map((r) => r.target),
        ...b.summary.milestones.map((r) => r.target),
      ])
    );

    const mapA = new Map(a.summary.milestones.map((r) => [r.target, r]));
    const mapB = new Map(b.summary.milestones.map((r) => [r.target, r]));

    const milestoneCompare = targets.map((t) => {
      const aRaw = mapA.get(t)?.base;
      const bRaw = mapB.get(t)?.base;

      const ay = milestoneToYear(aRaw);
      const by = milestoneToYear(bRaw);
      const dy = ay != null && by != null ? by - ay : null;

      return {
        target: t,
        a: milestoneToText(aRaw),
        b: milestoneToText(bRaw),
        deltaYears: dy,
      };
    });

    return { a, b, aBase, bBase, delta, milestoneCompare };
  }, [selectedSnaps]);

  return (
    <Page
      title="Snapshots"
      subtitle="Save scenarios. Compare decisions. Make the system teachable."
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-neutral-600">
          Saved:{" "}
          <span className="font-medium text-neutral-900">{snapshots.length}</span>
        </div>
        <button
          className="px-4 py-2 rounded-2xl bg-neutral-900 text-white text-sm hover:opacity-95 transition"
          onClick={saveCurrent}
        >
          Save current snapshot
        </button>
      </div>

      {/* Compare panel */}
      {compare && (
        <div className="mt-6">
          <Card
            title="Compare"
            subtitle={`A: ${compare.a.name}  •  B: ${compare.b.name}`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <MiniKPI
                label="End NW (Base) — A"
                value={formatCompactUsd(compare.aBase)}
              />
              <MiniKPI
                label="End NW (Base) — B"
                value={formatCompactUsd(compare.bBase)}
              />
              <MiniKPI
                label="Delta (B - A)"
                value={formatCompactUsd(compare.delta)}
              />
            </div>

            <div className="mt-5">
              <div className="text-sm font-medium">Milestones (Base)</div>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-neutral-500">
                    <tr className="border-b border-neutral-100">
                      <th className="py-2 text-left font-medium">Target</th>
                      <th className="py-2 text-left font-medium">A</th>
                      <th className="py-2 text-left font-medium">B</th>
                      <th className="py-2 text-left font-medium">Δ (yrs)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compare.milestoneCompare.map((r) => (
                      <tr key={r.target} className="border-b border-neutral-50">
                        <td className="py-3 font-medium">{r.target}</td>
                        <td className="py-3 text-neutral-700">{r.a}</td>
                        <td className="py-3 text-neutral-700">{r.b}</td>
                        <td className="py-3 text-neutral-700">
                          {r.deltaYears == null
                            ? "—"
                            : r.deltaYears === 0
                            ? "0"
                            : r.deltaYears > 0
                            ? `+${r.deltaYears}`
                            : `${r.deltaYears}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MiniKPI
                  label="Alerts — A (caution/watch/ok)"
                  value={`${compare.a.summary.alerts.counts.caution}/${compare.a.summary.alerts.counts.watch}/${compare.a.summary.alerts.counts.ok}`}
                />
                <MiniKPI
                  label="Alerts — B (caution/watch/ok)"
                  value={`${compare.b.summary.alerts.counts.caution}/${compare.b.summary.alerts.counts.watch}/${compare.b.summary.alerts.counts.ok}`}
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* List */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {snapshots.map((s) => {
          const checked = selected.includes(s.id);
          const draft = editing[s.id] ?? s.name;

          return (
            <Card
              key={s.id}
              title={s.name}
              subtitle={new Date(s.createdAt).toLocaleString("vi-VN")}
              rightSlot={
                <div className="flex items-center gap-2">
                  <button
                    className={`px-3 py-2 rounded-xl text-xs border transition ${
                      checked
                        ? "bg-neutral-900 text-white border-neutral-900"
                        : "bg-white text-neutral-900 border-neutral-200 hover:bg-neutral-50"
                    }`}
                    onClick={() => toggleSelect(s.id)}
                  >
                    {checked ? "Selected" : "Select"}
                  </button>
                  <button
                    className="px-3 py-2 rounded-xl text-xs border border-neutral-200 hover:bg-neutral-50 transition"
                    onClick={() => remove(s.id)}
                  >
                    Delete
                  </button>
                </div>
              }
            >
              {/* ✅ Inline rename */}
              <div className="flex items-center gap-2">
                <input
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-sm"
                  value={draft}
                  onChange={(e) =>
                    setEditing((p) => ({ ...p, [s.id]: e.target.value }))
                  }
                />
                <button
                  className="px-3 py-2 rounded-xl text-xs border border-neutral-200 hover:bg-neutral-50 transition"
                  onClick={() => {
                    const next = renameSnapshot(s.id, draft);
                    setSnapshots(next);
                    setEditing((p) => ({ ...p, [s.id]: (draft ?? "").trim() || s.name }));
                  }}
                >
                  Rename
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MiniKPI label="End NW (Bear)" value={formatCompactUsd(s.summary.end.usd.bear)} />
                <MiniKPI label="End NW (Base)" value={formatCompactUsd(s.summary.end.usd.base)} />
                <MiniKPI label="End NW (Bull)" value={formatCompactUsd(s.summary.end.usd.bull)} />
              </div>

              <div className="mt-4">
                <MilestoneTable rows={s.summary.milestones as any} />
              </div>
            </Card>
          );
        })}
      </div>

      {snapshots.length === 0 && (
        <div className="mt-6 text-sm text-neutral-500">
          No snapshots yet. Click “Save current snapshot”.
        </div>
      )}
    </Page>
  );
}