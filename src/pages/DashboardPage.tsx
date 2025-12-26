import { useMemo } from "react";
import Page from "../components/Page";
import Card from "../components/Card";
import { buildProjection, findMilestones } from "../lib/model";
import { useLifeStore } from "../store/lifeStore";

export default function DashboardPage() {
  const cfg = useLifeStore((s) => s.config);
  const rows = useMemo(() => buildProjection(cfg), [cfg]);
  const milestones = useMemo(() => findMilestones(rows), [rows]);

  return (
    <Page title="Dashboard" subtitle="A calm, precise cockpit for your family plan">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Projection coverage">
          <div className="text-sm text-neutral-600">Rows</div>
          <div className="mt-1 text-xl font-semibold">{rows.length}</div>
          <div className="mt-4 text-sm text-neutral-600">Range</div>
          <div className="mt-1 text-sm">
            {rows[0]?.year} → {rows.at(-1)?.year} (age {rows[0]?.age} → {rows.at(-1)?.age})
          </div>
        </Card>

        <Card title="Milestones">
          <div className="text-sm text-neutral-600">Hits</div>
          <div className="mt-1 text-xl font-semibold">{milestones.length}</div>
          <div className="mt-4 text-xs text-neutral-500">
            (Sẽ show bảng $1M/$10M/$100M/$1B ở commit kế tiếp)
          </div>
        </Card>
      </div>
    </Page>
  );
}