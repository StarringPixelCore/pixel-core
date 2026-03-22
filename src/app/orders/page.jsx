"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";
import {
  PAYMENT_LABEL,
  ORDER_TABS,
  deriveOrderTab,
  orderMatchesSearch,
  formatDate,
  formatStatusLabel,
  totalItemQty,
} from "./orderHelpers";
import styles from "./orders.module.css";

function badgeClassForOrder(status) {
  if (status === "cancelled") return styles.badgeCancelled;
  return styles.badgeOrder;
}

function badgeClassForPayment(status) {
  if (status === "paid") return styles.badgePay;
  if (status === "pending") return styles.badgePayPending;
  return styles.badgePay;
}

export default function OrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        const data = await res.json();

        if (cancelled) return;

        if (res.status === 401) {
          router.replace("/login?redirect=/orders");
          return;
        }

        if (res.status === 403) {
          setForbidden(true);
          return;
        }

        if (!res.ok) {
          setOrders([]);
          return;
        }

        setOrders(data.orders || []);
      } catch (e) {
        console.error(e);
        if (!cancelled) router.replace("/login?redirect=/orders");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const filteredByTab = useMemo(() => {
    if (activeTab === "All") return orders;
    return orders.filter((o) => deriveOrderTab(o) === activeTab);
  }, [orders, activeTab]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return filteredByTab.filter((o) => orderMatchesSearch(o, q));
  }, [filteredByTab, search]);

  const emptyListMessage = useMemo(() => {
    if (orders.length === 0) return "";
    const q = search.trim();
    if (q && filteredByTab.length > 0) return "No orders match your search.";
    if (activeTab !== "All" && filteredByTab.length === 0) {
      return "No orders in this category.";
    }
    if (q) return "No orders match your search.";
    return "No orders in this category.";
  }, [orders.length, activeTab, search, filteredByTab.length]);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingBox}>
          <div className={styles.spinner} aria-hidden />
          <p style={{ marginTop: 16, color: "#8b6c57" }}>Loading orders…</p>
        </div>
      </main>
    );
  }

  if (forbidden) {
    return (
      <main className={styles.page}>
        <div className={styles.forbidden}>
          <h1 className={styles.forbiddenTitle}>My Orders</h1>
          <p className={styles.forbiddenText}>
            This page is only available for buyer accounts.
          </p>
          <Link href="/profile" className={styles.browseBtn}>
            Back to profile
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.headerSection}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>My Orders</h1>
        </div>

        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            type="text"
            placeholder="You can search by Order #, Reference, or Product name."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
            aria-label="Search orders"
          />
        </div>

        <div className={styles.categories}>
          {ORDER_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`${styles.categoryBtn} ${
                activeTab === tab ? styles.activeCategory : ""
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <Package size={56} className={styles.emptyIcon} strokeWidth={1.25} />
          <h2 className={styles.emptyTitle}>No orders yet</h2>
          <p className={styles.emptyText}>
            When you place an order, it will show up here with status and
            details.
          </p>
          <Link href="/products" className={styles.browseBtn}>
            Browse products
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <p className={styles.noResults}>{emptyListMessage}</p>
      ) : (
        <div className={styles.list}>
          {filtered.map((order) => {
            const qty = totalItemQty(order);
            const preview = (order.items || []).slice(0, 3);
            const extra = Math.max(0, (order.items || []).length - 3);

            return (
              <Link
                href={`/orders/${order.id}`}
                key={order.id}
                className={styles.summaryCard}
              >
                <div className={styles.summaryTop}>
                  <div>
                    <div className={styles.orderId}>Order #{order.id}</div>
                    <div className={styles.metaLine}>
                      {formatDate(order.createdAt)}
                    </div>
                    {order.referenceNumber ? (
                      <div className={styles.metaLine}>
                        Ref:{" "}
                        <span className={styles.ref}>
                          {order.referenceNumber}
                        </span>
                      </div>
                    ) : null}
                  </div>
                  <div className={styles.badges}>
                    <span
                      className={`${styles.badge} ${badgeClassForOrder(order.orderStatus)}`}
                    >
                      {formatStatusLabel(order.orderStatus)}
                    </span>
                    <span
                      className={`${styles.badge} ${badgeClassForPayment(order.paymentStatus)}`}
                    >
                      Payment: {formatStatusLabel(order.paymentStatus)}
                    </span>
                  </div>
                </div>

                <div className={styles.summaryLine}>
                  <span className={styles.summaryStrong}>
                    {order.receiveMethod === "delivery"
                      ? "Delivery"
                      : "Store pickup"}
                  </span>
                  <span className={styles.summaryDot}>·</span>
                  <span>
                    {qty} {qty === 1 ? "item" : "items"}
                  </span>
                  <span className={styles.summaryDot}>·</span>
                  <span>
                    {PAYMENT_LABEL[order.paymentMethod] ||
                      order.paymentMethod}
                  </span>
                </div>

                {preview.length > 0 ? (
                  <div className={styles.thumbRow}>
                    {preview.map((item) =>
                      item.productImage ? (
                        <Image
                          key={item.id}
                          src={item.productImage}
                          alt=""
                          width={44}
                          height={44}
                          className={styles.thumb}
                        />
                      ) : (
                        <div
                          key={item.id}
                          className={styles.thumbPlaceholder}
                          aria-hidden
                        >
                          <Package size={20} strokeWidth={1.5} />
                        </div>
                      )
                    )}
                    {extra > 0 ? (
                      <span className={styles.thumbMore}>+{extra}</span>
                    ) : null}
                  </div>
                ) : null}

                <div className={styles.summaryFooter}>
                  <span className={styles.summaryTotal}>
                    ₱{Number(order.totalAmount).toFixed(2)}
                  </span>
                  <span className={styles.viewDetails}>View details</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
