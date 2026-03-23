export function showToast(detail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("showToast", { detail }));
}

export function notifyCartUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("cartUpdated"));
}
