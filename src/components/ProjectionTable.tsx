import Card from "./Card";
import type { ProjectionRow } from "../lib/model";
import { formatCompactUsd, formatCompactVnd } from "../lib/format";

export default function ProjectionTable(props: {
  rows: ProjectionRow[];
  currency: "USD" | "VND";
  tableStep: 1 | 5 | 10;
  fxVndPerUsd: number;
}) {
  const step = props.tableStep;

  const sampled = props.rows.filter((_, idx) => idx % step === 0);
  // always include last row
  const last = props.rows.at(-1);
  if (last && sampled.at(-1)?.year !== last.year) sampled.push(last);

  const fmtNW = (r: ProjectionRow, scenario: "bear" | "base" | "bull") => {
    return props.currency === "USD"
      ? formatCompactUsd(r.nwUsd[scenario])
      : formatCompactVnd(r.nwVnd[scenario]);
  };

  const fmtMoney = (vnd: number) =>
    props.currency === "USD" ? formatCompactUsd(vnd / (props.rows[0]?.nwVnd.base ? (props.rows[0].nwVnd.base / props.rows[0].nwUsd.base) : props.fxVndPerUsd)) : formatCompactVnd(vnd);

  // ^ trick này hơi hack; tốt nhất truyền fx vào. Nếu muốn sạch: truyền fxVndPerUsd từ cfg.
  // Em sẽ đưa bản sạch bên dưới để anh dùng luôn.

  return (
    <Card title="Projection table" subtitle={`Step = ${step} year(s). End-of-year values.`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-neutral-500">
            <tr className="border-b border-neutral-100">
              <th className="py-2 text-left font-medium">Year</th>
              <th className="py-2 text-left font-medium">Age</th>
              <th className="py-2 text-right font-medium">Saving</th>
              <th className="py-2 text-right font-medium">Contrib</th>
              <th className="py-2 text-right font-medium">NW Bear</th>
              <th className="py-2 text-right font-medium">NW Base</th>
              <th className="py-2 text-right font-medium">NW Bull</th>
            </tr>
          </thead>

          <tbody>
            {sampled.map((r) => (
              <tr key={r.year} className="border-b border-neutral-50 hover:bg-neutral-50/60">
                <td className="py-3">{r.year}</td>
                <td className="py-3">{r.age}</td>
                <td className="py-3 text-right text-neutral-700">
                  {props.currency === "USD" ? formatCompactUsd(r.saving / props.fxVndPerUsd) : formatCompactVnd(r.saving)}
                </td>
                <td className="py-3 text-right text-neutral-700">
                  {props.currency === "USD" ? formatCompactUsd(r.contrib / props.fxVndPerUsd) : formatCompactVnd(r.contrib)}
                </td>
                <td className="py-3 text-right text-neutral-700">{fmtNW(r, "bear")}</td>
                <td className="py-3 text-right font-medium">{fmtNW(r, "base")}</td>
                <td className="py-3 text-right text-neutral-700">{fmtNW(r, "bull")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}