"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package } from "lucide-react";
import {
  PAYMENT_LABEL,
  formatDate,
  formatStatusLabel,
} from "../orderHelpers";
import styles from "./order-detail.module.css";

function badgeClassForOrder(status, css) {
  if (status === "cancelled") return css.badgeCancelled;
  return css.badgeOrder;
}

function badgeClassForPayment(status, css) {
  if (status === "paid") return css.badgePay;
  if (status === "pending") return css.badgePayPending;
  return css.badgePay;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/orders/${id}`, { cache: "no-store" });
        const data = await res.json();

        if (cancelled) return;

        if (res.status === 401) {
          router.replace(`/login?redirect=/orders/${id}`);
          return;
        }

        if (res.status === 403) {
          setError("forbidden");
          return;
        }

        if (res.status === 404) {
          setError("notfound");
          return;
        }

        if (!res.ok) {
          setError("load");
          return;
        }

        setPayload(data.order);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, router]);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingBox}>
          <div className={styles.spinner} aria-hidden />
          <p style={{ marginTop: 16 }}>Loading order…</p>
        </div>
      </main>
    );
  }

  if (error === "forbidden") {
    return (
      <main className={styles.page}>
        <div className={styles.errorBox}>
          <p className={styles.errorTitle}>Access denied</p>
          <Link href="/orders" className={styles.browseBtn}>
            Back to My Orders
          </Link>
        </div>
      </main>
    );
  }

  if (error === "notfound" || error === "load" || !payload) {
    return (
      <main className={styles.page}>
        <div className={styles.errorBox}>
          <p className={styles.errorTitle}>
            {error === "notfound" ? "Order not found" : "Could not load order"}
          </p>
          <Link href="/orders" className={styles.browseBtn}>
            Back to My Orders
          </Link>
        </div>
      </main>
    );
  }

  const o = payload;
  const pd = o.paymentDetail;
  const txn = o.transaction;

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.backRow}>
          <Link href="/orders" className={styles.backLink}>
            <ArrowLeft size={18} />
            My Orders
          </Link>
        </div>

        <h1 className={styles.title}>Order #{o.id}</h1>
        <p className={styles.subId}>
          Placed {formatDate(o.createdAt)}
          {o.referenceNumber ? (
            <>
              {" "}
              · Ref: <span className={styles.ref}>{o.referenceNumber}</span>
            </>
          ) : null}
        </p>

        <section className={styles.section}>
          <div className={styles.badges}>
            <span
              className={`${styles.badge} ${badgeClassForOrder(o.orderStatus, styles)}`}
            >
              {formatStatusLabel(o.orderStatus)}
            </span>
            <span
              className={`${styles.badge} ${badgeClassForPayment(o.paymentStatus, styles)}`}
            >
              Payment: {formatStatusLabel(o.paymentStatus)}
            </span>
          </div>
          <div className={styles.metaGrid}>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Receive method</span>
              <span>
                {o.receiveMethod === "delivery" ? "Delivery" : "Store pickup"}
              </span>
            </div>
            {o.receiveMethod === "delivery" && o.deliveryAddress ? (
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Address</span>
                <span style={{ textAlign: "right", maxWidth: "70%" }}>
                  {o.deliveryAddress}
                </span>
              </div>
            ) : null}
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Payment method</span>
              <span>
                {PAYMENT_LABEL[o.paymentMethod] || o.paymentMethod}
              </span>
            </div>
            {txn ? (
              <>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Transaction status</span>
                  <span>{formatStatusLabel(txn.status)}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Recorded amount</span>
                  <span>₱{Number(txn.amount).toFixed(2)}</span>
                </div>
              </>
            ) : null}
          </div>
        </section>

        {pd &&
        (pd.cardLast4 ||
          pd.ewalletNumber ||
          pd.amountTendered != null) ? (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Payment details</h2>
            <div className={styles.paymentGrid}>
              {pd.cardLast4 ? (
                <>
                  <div className={styles.paymentRow}>
                    <span className={styles.metaLabel}>Name on card</span>
                    <span>{pd.cardholderName || "—"}</span>
                  </div>
                  <div className={styles.paymentRow}>
                    <span className={styles.metaLabel}>Card (last 4)</span>
                    <span>•••• {pd.cardLast4}</span>
                  </div>
                  <div className={styles.paymentRow}>
                    <span className={styles.metaLabel}>Expiry</span>
                    <span>{pd.cardExpiry || "—"}</span>
                  </div>
                </>
              ) : null}
              {pd.ewalletNumber ? (
                <>
                  <div className={styles.paymentRow}>
                    <span className={styles.metaLabel}>Mobile / wallet</span>
                    <span>{pd.ewalletNumber}</span>
                  </div>
                  {pd.ewalletReference ? (
                    <div className={styles.paymentRow}>
                      <span className={styles.metaLabel}>Reference</span>
                      <span>{pd.ewalletReference}</span>
                    </div>
                  ) : null}
                </>
              ) : null}
              {pd.amountTendered != null ? (
                <>
                  <div className={styles.paymentRow}>
                    <span className={styles.metaLabel}>Amount tendered</span>
                    <span>₱{Number(pd.amountTendered).toFixed(2)}</span>
                  </div>
                  {pd.changeDue != null ? (
                    <div className={styles.paymentRow}>
                      <span className={styles.metaLabel}>Change</span>
                      <span>₱{Number(pd.changeDue).toFixed(2)}</span>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </section>
        ) : null}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Items</h2>
          <div className={styles.items}>
            {o.items.map((item) => (
              <div className={styles.itemRow} key={item.id}>
                {item.productImage ? (
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    width={64}
                    height={64}
                    className={styles.itemImage}
                  />
                ) : (
                  <div className={styles.itemImagePlaceholder} aria-hidden>
                    <Package size={28} strokeWidth={1.5} />
                  </div>
                )}
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.productName}</div>
                  <div className={styles.itemMeta}>
                    ₱{Number(item.unitPrice).toFixed(2)} × {item.quantity}
                  </div>
                </div>
                <div className={styles.itemLine}>
                  ₱{Number(item.subtotal).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.totals}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span>₱{Number(o.subtotal).toFixed(2)}</span>
            </div>
            <div className={styles.totalRow}>
              <span>Shipping</span>
              <span>₱{Number(o.shippingFee).toFixed(2)}</span>
            </div>
            <div className={styles.totalGrand}>
              <span>Total</span>
              <span>₱{Number(o.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </section>

        {o.notes ? (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Order notes</h2>
            <p className={styles.notes}>{o.notes}</p>
          </section>
        ) : null}

        <p className={styles.subId} style={{ marginTop: 8 }}>
          Last updated {formatDate(o.updatedAt)}
        </p>
      </div>
    </main>
  );
}
