export const PAYMENT_LABEL = {
  cash: "Cash",
  credit_debit_card: "Card",
  gcash: "GCash",
  maya: "Maya",
};

export const ORDER_TABS = [
  "All",
  "To Pay",
  "To Ship",
  "To Receive",
  "Completed",
  "Cancelled",
  "Refunded",
];

export function deriveOrderTab(order) {
  const ps = order.paymentStatus;
  const os = order.orderStatus;

  if (ps === "refunded") return "Refunded";
  if (os === "cancelled") return "Cancelled";
  if (os === "delivered") return "Completed";
  if (os === "ready_for_pickup" || os === "out_for_delivery") {
    return "To Receive";
  }
  if (os === "confirmed" || os === "processing") return "To Ship";
  if (ps === "paid" && os === "pending") return "To Ship";
  if (ps === "pending" || ps === "failed") return "To Pay";
  return "To Ship";
}

export function orderMatchesSearch(order, q) {
  if (!q) return true;
  const blob = [
    String(order.id),
    order.referenceNumber || "",
    ...(order.items || []).map((i) => i.productName || ""),
  ]
    .join(" ")
    .toLowerCase();
  return blob.includes(q);
}

export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatStatusLabel(status) {
  return String(status).replace(/_/g, " ");
}

export function totalItemQty(order) {
  if (!order.items?.length) return 0;
  return order.items.reduce((sum, i) => sum + Number(i.quantity), 0);
}
