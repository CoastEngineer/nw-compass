export const TOAST_EVENT = "nw:toast";

export type ToastPayload = {
  title?: string;
  message?: string;
  tone?: "success" | "info" | "error";
  durationMs?: number;
};

export function toast(payload: ToastPayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ToastPayload>(TOAST_EVENT, { detail: payload }));
}

// --- Helpers (throttle để khỏi spam khi blur nhiều field) ---
let lastSavedAt = 0;

export function toastAutoSaved() {
  const now = Date.now();
  if (now - lastSavedAt < 900) return; // throttle
  lastSavedAt = now;

  toast({
    title: "Auto-saved",
    message: "Your changes were saved.",
    tone: "success",
    durationMs: 1100,
  });
}

export function toastApplied() {
  toast({
    title: "Applied",
    message: "Updated Net income (Y1).",
    tone: "success",
    durationMs: 1200,
  });
}