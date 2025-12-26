import type { LifeConfig } from "./model";
import { buildProjection, findMilestones } from "./model";
import { buildMilestoneGrid } from "./milestoneHelpers";
import { computeAlerts } from "./alerts";

export type AlertStatus = "ok" | "watch" | "caution";

export type MilestoneGridRow = {
  target: string;
  bear?: string;
  base?: string;
  bull?: string;
};

export type SnapshotSummary = {
  end: {
    vnd: { bear: number; base: number; bull: number };
    usd: { bear: number; base: number; bull: number };
  };
  milestones: MilestoneGridRow[];
  alerts: {
    worst: AlertStatus;
    counts: { caution: number; watch: number; ok: number };
  };
};

export type Snapshot = {
  id: string;
  createdAt: number; // epoch ms
  name: string;
  config: LifeConfig;
  summary: SnapshotSummary;
};

const KEY = "nw-compass:snapshots:v1";

function uid() {
  // good enough for local snapshots
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function computeSnapshotSummary(cfg: LifeConfig): SnapshotSummary {
  const rows = buildProjection(cfg);
  const last = rows.at(-1);

  const endVnd = {
    bear: last?.nwVnd.bear ?? 0,
    base: last?.nwVnd.base ?? 0,
    bull: last?.nwVnd.bull ?? 0,
  };
  const endUsd = {
    bear: last?.nwUsd.bear ?? 0,
    base: last?.nwUsd.base ?? 0,
    bull: last?.nwUsd.bull ?? 0,
  };

  const hits = findMilestones(rows);
  const milestones = buildMilestoneGrid(hits) as MilestoneGridRow[];

  const alerts = computeAlerts({ cfg, rows });
  const counts = alerts.reduce(
    (acc, a) => {
      acc[a.status] += 1;
      return acc;
    },
    { caution: 0, watch: 0, ok: 0 } as { caution: number; watch: number; ok: number }
  );

  const worst: AlertStatus =
    alerts.find((a) => a.status === "caution")?.status ??
    alerts.find((a) => a.status === "watch")?.status ??
    "ok";

  return {
    end: { vnd: endVnd, usd: endUsd },
    milestones,
    alerts: { worst, counts },
  };
}

export function createSnapshot(cfg: LifeConfig, name?: string): Snapshot {
  const createdAt = Date.now();
  const defaultName = new Date(createdAt).toLocaleString("vi-VN");
  return {
    id: uid(),
    createdAt,
    name: (name?.trim() || defaultName),
    config: cfg,
    summary: computeSnapshotSummary(cfg),
  };
}

export function loadSnapshots(): Snapshot[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Snapshot[];
  } catch {
    return [];
  }
}

export function saveSnapshots(list: Snapshot[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function addSnapshot(s: Snapshot): Snapshot[] {
  const cur = loadSnapshots();
  const next = [s, ...cur].slice(0, 200); // cap
  saveSnapshots(next);
  return next;
}

export function deleteSnapshot(id: string): Snapshot[] {
  const cur = loadSnapshots();
  const next = cur.filter((x) => x.id !== id);
  saveSnapshots(next);
  return next;
}