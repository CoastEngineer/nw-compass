export function formatCompactVnd(x: number) {
  return new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 2 }).format(x);
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