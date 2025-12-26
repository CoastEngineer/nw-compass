import type { ReactNode } from "react";

type Density = "default" | "compact";

export default function Card(props: {
  title?: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;

  className?: string;
  density?: Density;
}) {
  const density: Density = props.density ?? "default";
  const hasHeader = Boolean(props.title || props.rightSlot);

  const root = "rounded-2xl border border-neutral-200 bg-white shadow-sm";

  const headerPad =
    density === "compact" ? "px-4 pt-4 pb-2" : "px-5 pt-5 pb-3";

  // ✅ KEY FIX:
  // - if no header => give full vertical padding (py)
  // - if header exists => keep body slimmer (pb only)
  const bodyPad = hasHeader
    ? density === "compact"
      ? "px-4 pb-4"
      : "px-5 pb-5"
    : density === "compact"
      ? "px-4 py-4"
      : "px-5 py-5";

  const footerPad =
    density === "compact" ? "px-4 py-3" : "px-5 py-4";

  return (
    <div className={[root, props.className ?? ""].join(" ").trim()}>
      {hasHeader && (
        <div className={[headerPad, "flex items-start justify-between gap-4"].join(" ")}>
          <div>
            {props.title && <div className="text-sm font-medium">{props.title}</div>}
            {props.subtitle && <div className="mt-1 text-xs text-neutral-500">{props.subtitle}</div>}
          </div>
          {props.rightSlot}
        </div>
      )}

      <div className={bodyPad}>{props.children}</div>

      {props.footer && (
        <div className={[footerPad, "border-t border-neutral-100"].join(" ")}>
          {props.footer}
        </div>
      )}
    </div>
  );
}