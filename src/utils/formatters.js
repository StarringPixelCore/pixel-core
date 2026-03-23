export function formatCurrency(value, fallback = "₱0.00") {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return `₱${n.toFixed(2)}`;
}

export function isEnabledFlag(value) {
  return value === 1 || value === true;
}
