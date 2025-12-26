export function formatCompactVnd(x: number) {
  const abs = Math.abs(x);
  const fmt = (v: number) =>
    new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(v);

  if (abs >= 1e12) return `${fmt(x / 1e12)} nghìn tỷ`;
  if (abs >= 1e9) return `${fmt(x / 1e9)} tỷ`;
  if (abs >= 1e6) return `${fmt(x / 1e6)} triệu`;
  return new Intl.NumberFormat("vi-VN").format(x);
}

export function formatFullVnd(x: number) {
  return new Intl.NumberFormat("vi-VN").format(x) + " VND";
}

export function formatCompactUsd(x: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2, style: "currency", currency: "USD" }).format(x);
}

export function formatFullUsd(x: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(x);
}