import { useMemo, useState } from "react";
import Card from "./Card";
import type { Alert } from "../lib/alerts";

function Badge({ status }: { status: Alert["status"] }) {
  const cls =
    status === "caution"
      ? "bg-neutral-900 text-white"
      : status === "watch"
      ? "bg-neutral-100 text-neutral-900 border border-neutral-200"
      : "bg-white text-neutral-500 border border-neutral-200";

  const label = status === "caution" ? "Caution" : status === "watch" ? "Watch" : "OK";

  return <span className={`px-2 py-1 rounded-lg text-xs font-medium ${cls}`}>{label}</span>;
}

export default function AlertList(props: { alerts: Alert[] }) {
  const [showAll, setShowAll] = useState(false);

  const { visible, hiddenCount, worst } = useMemo(() => {
    const sorted = props.alerts; // already sorted in computeAlerts
    const max = showAll ? sorted.length : 5;
    return {
      visible: sorted.slice(0, max),
      hiddenCount: Math.max(0, sorted.length - max),
      worst: sorted[0]?.status ?? "ok",
    };
  }, [props.alerts, showAll]);

  const subtitle =
    worst === "caution"
      ? "A few assumptions are doing damage. Fix the levers."
      : worst === "watch"
      ? "Nothing urgent, but a couple of drifts deserve attention."
      : "Clean. Keep the system simple and repeatable.";

  return (
    <Card
      title="Folly Alerts"
      subtitle={subtitle}
      rightSlot={
        <button
          className="text-xs px-3 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition"
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? "Show less" : hiddenCount > 0 ? `Show all (${props.alerts.length})` : "Show all"}
        </button>
      }
    >
      <div className="space-y-3">
        {visible.map((a) => (
          <div
            key={a.id}
            className="rounded-2xl border border-neutral-100 bg-neutral-50/40 px-4 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium">{a.title}</div>
                <div className="mt-1 text-xs text-neutral-600">{a.message}</div>
                {a.hint && <div className="mt-2 text-xs text-neutral-500">Hint: {a.hint}</div>}
              </div>
              <Badge status={a.status} />
            </div>
          </div>
        ))}

        {visible.length === 0 && (
          <div className="text-sm text-neutral-500">No alerts.</div>
        )}
      </div>
    </Card>
  );
}