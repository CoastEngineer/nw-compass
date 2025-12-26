export default function SegmentedToggle(props: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex rounded-2xl border border-neutral-200 bg-white p-1 shadow-sm">
      {props.options.map((o) => {
        const active = o.value === props.value;
        return (
          <button
            key={o.value}
            onClick={() => props.onChange(o.value)}
            className={[
              "px-3 py-2 text-sm rounded-xl transition",
              active ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100",
            ].join(" ")}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}