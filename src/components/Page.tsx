import type { ReactNode } from "react";

export default function Page(props: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8">
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="text-2xl font-semibold tracking-tight">{props.title}</div>
          {props.subtitle && <div className="mt-1 text-sm text-neutral-500">{props.subtitle}</div>}
        </div>
      </div>
      <div className="mt-6">{props.children}</div>
    </div>
  );
}