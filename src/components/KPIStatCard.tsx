import Card from "./Card";

export default function KPIStatCard(props: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card density="compact">
      <div className="text-xs text-neutral-500">{props.label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{props.value}</div>
      {props.sub && <div className="mt-2 text-xs text-neutral-500">{props.sub}</div>}
    </Card>
  );
}