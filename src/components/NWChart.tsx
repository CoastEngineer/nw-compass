import Card from "./Card";
import type { ProjectionRow } from "../lib/model";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCompactUsd, formatCompactVnd } from "../lib/format";

type Currency = "USD" | "VND";

function sampleRows(rows: ProjectionRow[], step: 1 | 5 | 10) {
  const sampled = rows.filter((_, idx) => idx % step === 0);
  const last = rows.at(-1);
  if (last && sampled.at(-1)?.year !== last.year) sampled.push(last);
  return sampled;
}

export default function NWChart(props: {
  rows: ProjectionRow[];
  currency: Currency;
  tableStep: 1 | 5 | 10;
}) {
  const sampled = sampleRows(props.rows, props.tableStep);

  const data = sampled.map((r) => ({
    year: r.year,
    age: r.age,
    bear: props.currency === "USD" ? r.nwUsd.bear : r.nwVnd.bear,
    base: props.currency === "USD" ? r.nwUsd.base : r.nwVnd.base,
    bull: props.currency === "USD" ? r.nwUsd.bull : r.nwVnd.bull,
  }));

  const fmt = (v: number) =>
    props.currency === "USD" ? formatCompactUsd(v) : formatCompactVnd(v);

  return (
    <Card
      title="Net Worth trajectory"
      subtitle={`Bear / Base / Bull — sampled every ${props.tableStep} year(s)`}
    >
      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(v) => fmt(v)}
              tickLine={false}
              axisLine={false}
              width={80}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: any, name: any) => [fmt(Number(value)), name]}
              labelFormatter={(label: any, payload: any) => {
                const row = payload?.[0]?.payload;
                if (!row) return `Year ${label}`;
                return `Year ${row.year} (age ${row.age})`;
              }}
            />
            <Legend />
            {/* Base highlight, others subtle */}
            <Line type="monotone" dataKey="bear" name="Bear" stroke="#A3A3A3" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="base" name="Base" stroke="#111827" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="bull" name="Bull" stroke="#525252" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}