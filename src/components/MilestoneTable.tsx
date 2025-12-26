import Card from "./Card";

type Hit = { year: number; age: number } | null;

export default function MilestoneTable(props: {
  rows: {
    label: string;
    bear: Hit;
    base: Hit;
    bull: Hit;
  }[];
}) {
  return (
    <Card title="Milestones" subtitle="$1M / $10M / $100M / $1B by scenario">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-neutral-500">
            <tr className="border-b border-neutral-100">
              <th className="py-2 text-left font-medium">Target</th>
              <th className="py-2 text-right font-medium">Bear</th>
              <th className="py-2 text-right font-medium">Base</th>
              <th className="py-2 text-right font-medium">Bull</th>
            </tr>
          </thead>
          <tbody>
            {props.rows.map((r) => (
              <tr key={r.label} className="border-b border-neutral-50 hover:bg-neutral-50/60">
                <td className="py-3 font-medium">{r.label}</td>
                <td className="py-3 text-right text-neutral-700">
                  {r.bear ? `${r.bear.year} (age ${r.bear.age})` : "—"}
                </td>
                <td className="py-3 text-right text-neutral-900">
                  {r.base ? `${r.base.year} (age ${r.base.age})` : "—"}
                </td>
                <td className="py-3 text-right text-neutral-700">
                  {r.bull ? `${r.bull.year} (age ${r.bull.age})` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}