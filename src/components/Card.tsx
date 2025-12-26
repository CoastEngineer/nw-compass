import type { ReactNode } from "react";

export default function Card(props: {
  title?: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
      {(props.title || props.rightSlot) && (
        <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-4">
          <div>
            {props.title && <div className="text-sm font-medium">{props.title}</div>}
            {props.subtitle && <div className="mt-1 text-xs text-neutral-500">{props.subtitle}</div>}
          </div>
          {props.rightSlot}
        </div>
      )}
      <div className="px-5 pb-5">{props.children}</div>
      {props.footer && <div className="px-5 py-4 border-t border-neutral-100">{props.footer}</div>}
    </div>
  );
}