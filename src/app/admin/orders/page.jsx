"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { PAYMENT_LABEL, formatDate, formatStatusLabel } from "@/app/orders/orderHelpers";
import styles from "./manage-orders.module.css";

const ORDER_STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "processing",
  "ready_for_pickup",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUS_OPTIONS = ["pending", "paid", "failed", "refunded"];

function badgeClassForOrder(status) {
  if (status === "cancelled") return styles.badgeCancelled;
  return styles.badgeOrder;
}

function badgeClassForPayment(status) {
  if (status === "paid") return styles.badgePay;
  if (status === "pending") return styles.badgePayPending;
  return styles.badgePay;
}

export default function ManageOrdersPage() {
  const { user, router, loading } = useAuth();

  const [orderIdInput, setOrderIdInput] = useState("");
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  useEffect(() => {
    // If we don't have a user, the API will treat this as unauthenticated; redirect early.
    if (!loading && user === null) {
      router.replace("/login?redirect=/admin/orders");
    }
  }, [user, router, loading]);

  useEffect(() => {
    if (!order) return;
    setOrderStatus(order.orderStatus);
    setPaymentStatus(order.paymentStatus);
  }, [order]);

  const orderId = useMemo(() => {
    const n = Number(orderIdInput);
    if (!Number.isInteger(n) || n < 1) return null;
    return n;
  }, [orderIdInput]);

  const isSeller = user?.role === "Seller";

  if (loading || user === null) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.accessDenied}>
            <h1 className={styles.accessDeniedTitle}>Loading...</h1>
            <p className={styles.accessDeniedText}>Checking your account</p>
          </div>
        </div>
      </main>
    );
  }

  const loadOrder = async () => {
    if (!orderId) {
      setError("Please enter a valid Order ID.");
      setOrder(null);
      return;
    }

    setError("");
    setLoadingOrder(true);
    try {
      const res = await fetch(`/api/seller/orders/${orderId}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (res.status === 401) {
        router.replace(`/login?redirect=/admin/orders`);
        return;
      }

      if (res.status === 403) {
        setError("Access denied. Only sellers can manage orders.");
        return;
      }

      if (!res.ok) {
        setError(data.error || "Failed to load order.");
        return;
      }

      setOrder(data.order);
    } catch (e) {
      console.error(e);
      setError("Failed to load order.");
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleUpdate = async () => {
    if (!order) return;
    if (!orderStatus || !paymentStatus) {
      setError("Please select both order status and payment status.");
      return;
    }

    setError("");
    setUpdatingOrder(true);
    try {
      const res = await fetch(`/api/seller/orders/${order.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus, paymentStatus }),
      });

      const data = await res.json();

      if (res.status === 401) {
        router.replace(`/login?redirect=/admin/orders`);
        return;
      }

      if (res.status === 403) {
        setError("Access denied. Only sellers can manage orders.");
        return;
      }

      if (!res.ok) {
        setError(data.error || "Failed to update order.");
        window.dispatchEvent(
          new CustomEvent("showToast", {
            detail: { message: data.error || "Failed to update order", type: "error" },
          })
        );
        return;
      }

      setOrder(data.order);
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: "Order updated successfully", type: "success" },
        })
      );
    } catch (e) {
      console.error(e);
      setError("Failed to update order.");
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: "Failed to update order", type: "error" },
        })
      );
    } finally {
      setUpdatingOrder(false);
    }
  };

  if (!isSeller) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.accessDenied}>
            <h1 className={styles.accessDeniedTitle}>Access denied</h1>
            <p className={styles.accessDeniedText}>
              This page is only available for seller accounts.
            </p>
            <div style={{ marginTop: 16 }}>
              <Link href="/admin" className={styles.secondaryButton + " " + styles.button}>
                Back to admin
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.headerSection}>
          <h1 className={styles.title}>Manage Orders</h1>
          <p className={styles.subtitle}>
            Load a buyer&apos;s order by Order ID, then manually update order and payment status.
          </p>
        </section>

        <div className={styles.formRow}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="orderId">
              Order ID
            </label>
            <input
              id="orderId"
              className={styles.input}
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              placeholder="e.g. 123"
              inputMode="numeric"
            />
          </div>

          <div className={styles.actionsRow}>
            <button
              type="button"
              className={styles.button}
              onClick={loadOrder}
              disabled={loadingOrder}
            >
              {loadingOrder ? "Loading..." : "Load order"}
            </button>
            <button
              type="button"
              className={`${styles.button} ${styles.secondaryButton}`}
              onClick={() => {
                setOrder(null);
                setOrderIdInput("");
                setError("");
              }}
              disabled={loadingOrder || updatingOrder}
            >
              Clear
            </button>
          </div>
        </div>

        {error ? <div className={styles.errorBox}>{error}</div> : null}

        {order ? (
          <section className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <div className={styles.orderMeta}>
                <div className={styles.orderTitle}>Order #{order.id}</div>
                <div className={styles.metaLine}>
                  Buyer:{" "}
                  {order.buyer
                    ? `${order.buyer.firstName} ${order.buyer.lastName}`.trim()
                    : "Unknown"}
                  {order.buyer?.email ? ` (${order.buyer.email})` : null}
                </div>
                <div className={styles.metaLine}>
                  Placed {formatDate(order.createdAt)}
                </div>
              </div>

              <div className={styles.badgeRow}>
                <span
                  className={`${styles.badge} ${badgeClassForOrder(
                    order.orderStatus
                  )}`}
                >
                  {formatStatusLabel(order.orderStatus)}
                </span>
                <span
                  className={`${styles.badge} ${badgeClassForPayment(
                    order.paymentStatus
                  )}`}
                >
                  Payment: {formatStatusLabel(order.paymentStatus)}
                </span>
              </div>
            </div>

            <div className={styles.orderBody}>
              <div className={styles.grid2}>
                <div>
                  <label className={styles.label} htmlFor="orderStatus">
                    Order status
                  </label>
                  <select
                    id="orderStatus"
                    className={styles.select}
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    disabled={updatingOrder}
                  >
                    {ORDER_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {formatStatusLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={styles.label} htmlFor="paymentStatus">
                    Payment status
                  </label>
                  <select
                    id="paymentStatus"
                    className={styles.select}
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    disabled={updatingOrder}
                  >
                    {PAYMENT_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {formatStatusLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.noteRow}>
                <div className={styles.infoText}>
                  Receive method:{" "}
                  {order.receiveMethod === "delivery"
                    ? "Delivery"
                    : "Store pickup"}{" "}
                  · Payment method:{" "}
                  {PAYMENT_LABEL[order.paymentMethod] ||
                    order.paymentMethod}
                </div>

                <div className={styles.actionsRow}>
                  <button
                    type="button"
                    className={styles.button}
                    onClick={handleUpdate}
                    disabled={updatingOrder || !orderStatus || !paymentStatus}
                  >
                    {updatingOrder ? "Updating..." : "Save changes"}
                  </button>
                </div>
              </div>

              {order.items?.length ? (
                <div>
                  <div className={styles.infoText} style={{ marginBottom: 10 }}>
                    Items ({order.items.length})
                  </div>
                  <div
                    style={{
                      border: "1px solid #ddd1c7",
                      borderRadius: 16,
                      padding: 14,
                      background: "#fffdfb",
                    }}
                  >
                    <div style={{ display: "grid", gap: 10 }}>
                      {order.items.slice(0, 10).map((i) => (
                        <div
                          key={i.id}
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            justifyContent: "space-between",
                            gap: 12,
                          }}
                        >
                          <div style={{ color: "#2f1a0f", fontWeight: 700 }}>
                            {i.productName}
                          </div>
                          <div style={{ color: "#8a6f5a", fontSize: 14 }}>
                            {i.quantity} × ₱{Number(i.unitPrice).toFixed(2)}
                          </div>
                        </div>
                      ))}
                      {order.items.length > 10 ? (
                        <div style={{ color: "#8b6c57" }}>
                          Showing first 10 items…
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

