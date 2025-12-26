// src/lib/input.ts
export function formatInt(n: number) {
  if (!Number.isFinite(n)) return "0";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

export function formatPercent01(x: number, digits = 1) {
  const v = (Number.isFinite(x) ? x : 0) * 100;
  return `${v.toFixed(digits)}%`;
}

export function parseLooseNumber(s: string) {
  const cleaned = String(s)
    .replace(/[%\s,]/g, "")
    .replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}