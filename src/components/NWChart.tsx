import Card from "./Card";
import type { ProjectionRow } from "../lib/model";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  type TooltipProps,
} from "recharts";
import { formatCompactUsd, formatCompactVnd } from "../lib/format";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

type Currency = "USD" | "VND";
type YScale = "linear" | "log";

function sampleRows(rows: ProjectionRow[], step: 1 | 5 | 10) {
  const sampled = rows.filter((_, idx) => idx % step === 0);
  const last = rows.at(-1);
  if (last && sampled.at(-1)?.year !== last.year) sampled.push(last);
  return sampled;
}

const STROKE = {
  bear: "#A3A3A3",
  base: "#111827",
  bull: "#525252",
};

const ORDER: Array<"bear" | "base" | "bull"> = ["bear", "base", "bull"];
const LABEL: Record<typeof ORDER[number], string> = {
  bear: "Bear",
  base: "Base",
  bull: "Bull",
};

function fmt(currency: Currency, v: number) {
  return currency === "USD" ? formatCompactUsd(v) : formatCompactVnd(v);
}

// ✅ Custom legend: always Bear → Base → Bull
function LegendContent({ payload }: { payload?: Array<{ dataKey?: string; id?: string; value?: string | number; color?: string }> }) {
  if (!payload?.length) return null;

  // Map by dataKey
  const byKey = new Map<string, { dataKey?: string; id?: string; value?: string | number; color?: string }>();
  payload.forEach((p) => {
    const k = p.dataKey ?? p.id ?? (typeof p.value === "string" ? p.value.toLowerCase() : "");
    if (k) byKey.set(k, p);
  });

  const items = ORDER.map((k) => {
    // recharts payload usually has dataKey === "bear"/"base"/"bull"
    const p = byKey.get(k) ?? byKey.get(LABEL[k].toLowerCase());
    return { key: k, p };
  }).filter((x) => x.p);

  return (
    <div className="flex items-center justify-center gap-6 pt-2 text-sm">
      {items.map(({ key }) => (
        <div key={key} className="flex items-center gap-2">
          <span
            className="inline-block h-[2px] w-6 rounded"
            style={{
              background: STROKE[key],
              // match line style
              opacity: 1,
            }}
          />
          <span className={key === "base" ? "font-medium text-neutral-900" : "text-neutral-600"}>
            {LABEL[key]}
          </span>
        </div>
      ))}
    </div>
  );
}

function CustomTooltip({
  active,
  payload,
  currency,
}: TooltipProps<ValueType, NameType> & { currency: Currency }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white/95 px-3 py-2 shadow-sm">
      <div className="text-xs text-neutral-500">
        Year {row.year} (age {row.age})
      </div>
      <div className="mt-1 space-y-1 text-sm">
        {ORDER.map((k) => {
          const val = row[k];
          if (val == null) return null;
          return (
            <div key={k} className="flex items-center justify-between gap-8">
              <span className="text-neutral-700">{LABEL[k]}</span>
              <span className="font-medium text-neutral-900">
                {fmt(currency, Number(val))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function NWChart(props: {
  rows: ProjectionRow[];
  currency: Currency;
  tableStep: 1 | 5 | 10;
  yScale: YScale;
}) {
  const sampled = sampleRows(props.rows, props.tableStep);

  const data = sampled.map((r) => {
    const bearRaw = props.currency === "USD" ? r.nwUsd.bear : r.nwVnd.bear;
    const baseRaw = props.currency === "USD" ? r.nwUsd.base : r.nwVnd.base;
    const bullRaw = props.currency === "USD" ? r.nwUsd.bull : r.nwVnd.bull;

    const safe = (v: number) => (props.yScale === "log" ? (v > 0 ? v : null) : v);

    return {
      year: r.year,
      age: r.age,
      bear: safe(bearRaw),
      base: safe(baseRaw),
      bull: safe(bullRaw),
    };
  });

  // Domain padding so Bull doesn't hit the ceiling
  const vals: number[] = [];
  for (const d of data) {
    for (const k of ORDER) {
      const v = d[k];
      if (typeof v === "number" && v > 0) vals.push(v);
    }
  }
  const minPos = vals.length ? Math.min(...vals) : 1;
  const maxPos = vals.length ? Math.max(...vals) : 1;

  const domain: [number | ((min: number) => number), (max: number) => number] =
    props.yScale === "log"
      ? [minPos, (max: number) => Math.max(max, maxPos) * 1.08]
      : [0, (max: number) => Math.max(max, maxPos) * 1.08];

  const subtitle = `Bear / Base / Bull • ${props.currency} • ${props.yScale.toUpperCase()} • sampled every ${props.tableStep}y`;

  return (
    <Card title="Net Worth trajectory" subtitle={subtitle}>
      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#F3F4F6" />

            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
              minTickGap={24}
            />

            <YAxis
              scale={props.yScale}
              domain={domain}
              allowDataOverflow
              tickFormatter={(v) => fmt(props.currency, Number(v))}
              tickLine={false}
              axisLine={false}
              width={80}
              tick={{ fontSize: 12 }}
            />

            <Tooltip
              content={<CustomTooltip currency={props.currency} />}
              cursor={false} // ✅ remove vertical hover line
            />

            <Legend content={<LegendContent />} />

            {/* Draw Bear + Bull first; Base last so Base is visually on top */}
            <Line
              type="monotone"
              dataKey="bear"
              name="Bear"
              stroke={STROKE.bear}
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              activeDot={false}
              connectNulls
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="bull"
              name="Bull"
              stroke={STROKE.bull}
              strokeWidth={2}
              strokeDasharray="2 4"
              dot={false}
              activeDot={false}
              connectNulls
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="base"
              name="Base"
              stroke={STROKE.base}
              strokeWidth={3}
              dot={false}
              activeDot={false}
              connectNulls
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}