import { useEffect, useRef, useState } from "react";
import { TOAST_EVENT, type ToastPayload } from "./toastBus";

type ToastState = ToastPayload & { id: number };

export default function ToastHost() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [open, setOpen] = useState(false);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    const onToast = (e: Event) => {
      const ce = e as CustomEvent<ToastPayload>;
      const payload = ce.detail;

      // reset timers
      if (hideTimer.current) window.clearTimeout(hideTimer.current);

      const id = Date.now();
      setToast({ id, ...payload });
      // next tick for transition
      requestAnimationFrame(() => setOpen(true));

      const duration = payload.durationMs ?? 1100;
      hideTimer.current = window.setTimeout(() => setOpen(false), duration);
    };

    window.addEventListener(TOAST_EVENT, onToast);
    return () => {
      window.removeEventListener(TOAST_EVENT, onToast);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, []);

  // unmount after close animation
  useEffect(() => {
    if (open) return;
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 220);
    return () => window.clearTimeout(t);
  }, [open, toast]);

  if (!toast) return null;

  const tone =
    toast.tone ?? "success"; // success | info | error

  const toneClasses =
    tone === "success"
      ? "border-emerald-200 bg-white"
      : tone === "error"
      ? "border-rose-200 bg-white"
      : "border-neutral-200 bg-white";

  const dotClasses =
    tone === "success"
      ? "bg-emerald-500"
      : tone === "error"
      ? "bg-rose-500"
      : "bg-neutral-500";

  return (
    <div className="fixed bottom-5 right-5 z-50 pointer-events-none">
      <div
        className={[
          "pointer-events-auto",
          "rounded-2xl border shadow-sm",
          "px-4 py-3 min-w-[220px] max-w-[320px]",
          "transition-all duration-200 ease-out",
          open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
          toneClasses,
        ].join(" ")}
        key={toast.id}
      >
        <div className="flex items-start gap-3">
          <div className={["mt-1 h-2.5 w-2.5 rounded-full", dotClasses].join(" ")} />
          <div className="flex-1">
            <div className="text-sm font-medium text-neutral-900">
              {toast.title ?? "Done"}
            </div>
            {toast.message && (
              <div className="mt-0.5 text-xs text-neutral-600">{toast.message}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}