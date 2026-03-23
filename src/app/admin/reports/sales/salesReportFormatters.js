export function parseCurrencyNumber(value) {
  if (value === null || value === undefined) return 0;
  const normalized = String(value)
    .normalize("NFKC")
    .replace(/[±+]/g, "")
    .replace(/,/g, "")
    .replace(/\s+/g, "");
  const match = normalized.match(/-?\d*\.?\d+/);
  const n = Number(match ? match[0] : "");
  return Number.isFinite(n) ? n : 0;
}

export function formatCurrency(value) {
  return `₱${parseCurrencyNumber(value).toFixed(2)}`;
}

export function safePaymentLabel(method, paymentLabel = {}) {
  if (!method) return "Unknown";
  const key = String(method);
  return paymentLabel[key] || key.replace(/_/g, " ");
}

export function formatStatusLabel(status) {
  if (!status) return "—";
  return String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatDateRange(startAt, endAt, locale = undefined) {
  if (!startAt || !endAt) return "";
  return `${new Date(startAt).toLocaleDateString(locale)} - ${new Date(endAt).toLocaleDateString(locale)}`;
}
