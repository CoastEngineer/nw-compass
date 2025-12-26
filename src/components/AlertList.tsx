import { useMemo, useState } from "react";
import Card from "./Card";
import type { Alert } from "../lib/alerts";

const PREVIEW_COUNT = 3;

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

  const { visible, hiddenCount, worst, total } = useMemo(() => {
    const sorted = props.alerts ?? []; // assume computeAlerts already sorts by severity
    const total = sorted.length;

    const worst =
      sorted.find((a) => a.status === "caution")?.status ??
      sorted.find((a) => a.status === "watch")?.status ??
      "ok";

    if (showAll) {
      return { visible: sorted, hiddenCount: 0, worst, total };
    }

    // Collapsed: show ALL caution, then fill with watch up to PREVIEW_COUNT. Never show OK.
    const caution = sorted.filter((a) => a.status === "caution");
    const watch = sorted.filter((a) => a.status === "watch");

    const base = [...caution];
    const needMore = Math.max(0, PREVIEW_COUNT - base.length);
    const visible = [...base, ...watch.slice(0, needMore)];

    const hiddenCount = Math.max(0, total - visible.length);

    return { visible, hiddenCount, worst, total };
  }, [props.alerts, showAll]);

  const subtitle =
    worst === "caution"
      ? "A few assumptions are doing damage. Fix the levers."
      : worst === "watch"
      ? "Nothing urgent, but a couple of drifts deserve attention."
      : "Clean. Keep the system simple and repeatable.";

  const canToggle = total > visible.length;

  return (
    <Card
      title="Folly Alerts"
      subtitle={subtitle}
      rightSlot={
        total > 0 ? (
          <button
            className="text-xs px-3 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? "Show less" : canToggle ? `Show all (${total})` : "Show all"}
          </button>
        ) : null
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

        {!showAll && hiddenCount > 0 && (
          <div className="text-xs text-neutral-500">
            Showing {visible.length}. {hiddenCount} more hidden.
          </div>
        )}

        {total === 0 && <div className="text-sm text-neutral-500">No alerts.</div>}
      </div>
    </Card>
  );
}