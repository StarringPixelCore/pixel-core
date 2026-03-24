"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import styles from "./checkout.module.css";

const PAYMENT_OPTIONS = [
  {
    id: "cash",
    label: "Cash",
    hint: "Pay when you receive or pick up",
  },
  {
    id: "credit_debit_card",
    label: "Credit / Debit card",
    hint: "Visa, Mastercard (last 4 digits)",
  },
  {
    id: "gcash",
    label: "GCash",
    hint: "Mobile number & reference",
  },
  {
    id: "maya",
    label: "Maya",
    hint: "Mobile number & reference",
  },
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  const [receiveMethod, setReceiveMethod] = useState("delivery");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");

  const [card, setCard] = useState({
    cardholderName: "",
    last4: "",
    expiry: "",
  });
  const [ewallet, setEwallet] = useState({ number: "", reference: "" });
  const [cashAmount, setCashAmount] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [buyNowPayload, setBuyNowPayload] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();

        if (!meRes.ok || !meData.authenticated) {
          router.replace("/login?redirect=/checkout");
          return;
        }

        if (cancelled) return;

        setUser(meData.user);
        if (meData.user?.address) {
          setDeliveryAddress(meData.user.address);
        }

        const buyNowFlag = searchParams.get("buyNow") === "1";
        const productId = Number(searchParams.get("productId"));
        const parsedQty = Number(searchParams.get("qty"));
        const qty = Number.isInteger(parsedQty) && parsedQty > 0 ? parsedQty : 1;

        if (buyNowFlag && Number.isInteger(productId) && productId > 0) {
          setIsBuyNow(true);
          setBuyNowPayload({ productId, quantity: qty });

          const name = searchParams.get("name") || "Product";
          const image = searchParams.get("image") || "";
          const priceFromUrl = Number(searchParams.get("price"));
          const price = Number.isFinite(priceFromUrl) ? priceFromUrl : 0;

          setCartItems([
            {
              id: `buy-now-${productId}`,
              product_id: productId,
              name,
              image_url: image,
              price,
              quantity: qty,
            },
          ]);
          return;
        }

        const cartRes = await fetch("/api/cart", { cache: "no-store" });
        const cartData = await cartRes.json();
        const items = cartData.items || [];
        setCartItems(items);

        if (items.length === 0) {
          router.replace("/cart");
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) router.replace("/login?redirect=/checkout");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
      ),
    [cartItems]
  );

  const shippingFee = receiveMethod === "delivery" ? 50 : 0;
  const total = subtotal + shippingFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});

    const payload = {
      receiveMethod,
      deliveryAddress:
        receiveMethod === "delivery" ? deliveryAddress : null,
      paymentMethod,
      notes: notes.trim() || null,
    };
    if (isBuyNow && buyNowPayload) {
      payload.buyNow = buyNowPayload;
    }

    if (paymentMethod === "credit_debit_card") {
      payload.card = card;
    } else if (paymentMethod === "gcash" || paymentMethod === "maya") {
      payload.ewallet = ewallet;
    } else if (paymentMethod === "cash" && cashAmount.trim() !== "") {
      payload.cash = { amountTendered: cashAmount };
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 401) {
        router.replace("/login?redirect=/checkout");
        return;
      }

      if (!res.ok) {
        if (data.errors) {
          setFieldErrors(data.errors);
          setFormError("");
        } else {
          setFormError(data.error || "Could not complete your order");
        }
        return;
      }

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: {
            title: "Order placed",
            message: `Thanks for your order! We received order #${data.orderId} and we're preparing it now.`,
            type: "success",
          },
        })
      );
      window.dispatchEvent(new Event("cartUpdated"));
      router.push("/orders");
    } catch (err) {
      console.error(err);
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingBox}>
          <div className={styles.spinner} aria-hidden />
          <p style={{ marginTop: 16 }}>Loading checkout…</p>
        </div>
      </main>
    );
  }

  if (!user || cartItems.length === 0) {
    return null;
  }

  return (
    <main className={styles.page}>
      <Link
        href={isBuyNow && cartItems[0]?.product_id ? `/products/${cartItems[0].product_id}` : "/cart"}
        className={styles.backLink}
      >
        <ArrowLeft size={18} />
        {isBuyNow ? "Back to product" : "Back to cart"}
      </Link>

      <h1 className={styles.title}>Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className={styles.container}>
          <div className={styles.left}>
            {formError ? (
              <div className={styles.formError}>{formError}</div>
            ) : null}
            {Object.keys(fieldErrors).length > 0 && !formError ? (
              <div className={styles.formError}>
                Please correct the fields below.
              </div>
            ) : null}

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Receive method</h2>
              <div className={styles.radioGroup}>
                <label className={styles.radioRow}>
                  <input
                    type="radio"
                    name="receive"
                    checked={receiveMethod === "delivery"}
                    onChange={() => setReceiveMethod("delivery")}
                  />
                  <span>
                    <span className={styles.radioLabel}>Delivery</span>
                    <div className={styles.radioHint}>
                      ₱50 flat rate — we&apos;ll bring it to you
                    </div>
                  </span>
                </label>
                <label className={styles.radioRow}>
                  <input
                    type="radio"
                    name="receive"
                    checked={receiveMethod === "pickup"}
                    onChange={() => setReceiveMethod("pickup")}
                  />
                  <span>
                    <span className={styles.radioLabel}>Store pickup</span>
                    <div className={styles.radioHint}>
                      No shipping fee — collect at our location
                    </div>
                  </span>
                </label>
              </div>
              {fieldErrors.receiveMethod ? (
                <p className={styles.errorText}>{fieldErrors.receiveMethod}</p>
              ) : null}

              {receiveMethod === "delivery" ? (
                <div style={{ marginTop: 16 }}>
                  <label className={styles.fieldLabel} htmlFor="addr">
                    Delivery address
                  </label>
                  <textarea
                    id="addr"
                    className={styles.textarea}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Street, barangay, city, postal code"
                    required={receiveMethod === "delivery"}
                  />
                  {fieldErrors.deliveryAddress ? (
                    <p className={styles.errorText}>
                      {fieldErrors.deliveryAddress}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Payment</h2>
              <div className={styles.paymentGrid}>
                {PAYMENT_OPTIONS.map((opt) => (
                  <label key={opt.id} className={styles.paymentOption}>
                    <input
                      type="radio"
                      name="payment"
                      value={opt.id}
                      checked={paymentMethod === opt.id}
                      onChange={() => setPaymentMethod(opt.id)}
                    />
                    <span className={styles.paymentCard}>
                      <span className={styles.paymentName}>{opt.label}</span>
                      <div className={styles.paymentHint}>{opt.hint}</div>
                    </span>
                  </label>
                ))}
              </div>
              {fieldErrors.paymentMethod ? (
                <p className={styles.errorText}>{fieldErrors.paymentMethod}</p>
              ) : null}

              {paymentMethod === "credit_debit_card" ? (
                <div style={{ marginTop: 16 }}>
                  <div className={styles.fieldRow}>
                    <label className={styles.fieldLabel} htmlFor="ch">
                      Name on card
                    </label>
                    <input
                      id="ch"
                      className={styles.input}
                      value={card.cardholderName}
                      onChange={(e) =>
                        setCard((c) => ({
                          ...c,
                          cardholderName: e.target.value,
                        }))
                      }
                      autoComplete="cc-name"
                    />
                    {fieldErrors.cardholderName ? (
                      <p className={styles.errorText}>
                        {fieldErrors.cardholderName}
                      </p>
                    ) : null}
                  </div>
                  <div className={styles.inlineFields}>
                    <div className={styles.fieldRow}>
                      <label className={styles.fieldLabel} htmlFor="l4">
                        Last 4 digits
                      </label>
                      <input
                        id="l4"
                        className={styles.input}
                        inputMode="numeric"
                        maxLength={4}
                        value={card.last4}
                        onChange={(e) =>
                          setCard((c) => ({
                            ...c,
                            last4: e.target.value.replace(/\D/g, "").slice(0, 4),
                          }))
                        }
                      />
                      {fieldErrors.cardLast4 ? (
                        <p className={styles.errorText}>
                          {fieldErrors.cardLast4}
                        </p>
                      ) : null}
                    </div>
                    <div className={styles.fieldRow}>
                      <label className={styles.fieldLabel} htmlFor="ex">
                        Expiry (MM/YYYY)
                      </label>
                      <input
                        id="ex"
                        className={styles.input}
                        placeholder="09/2027"
                        value={card.expiry}
                        onChange={(e) =>
                          setCard((c) => ({ ...c, expiry: e.target.value }))
                        }
                      />
                      {fieldErrors.cardExpiry ? (
                        <p className={styles.errorText}>
                          {fieldErrors.cardExpiry}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}

              {paymentMethod === "gcash" || paymentMethod === "maya" ? (
                <div style={{ marginTop: 16 }}>
                  <div className={styles.fieldRow}>
                    <label className={styles.fieldLabel} htmlFor="ew">
                      Mobile number
                    </label>
                    <input
                      id="ew"
                      className={styles.input}
                      inputMode="tel"
                      value={ewallet.number}
                      onChange={(e) =>
                        setEwallet((w) => ({ ...w, number: e.target.value }))
                      }
                    />
                    {fieldErrors.ewalletNumber ? (
                      <p className={styles.errorText}>
                        {fieldErrors.ewalletNumber}
                      </p>
                    ) : null}
                  </div>
                  <div className={styles.fieldRow}>
                    <label className={styles.fieldLabel} htmlFor="ref">
                      Reference / transaction ID (optional)
                    </label>
                    <input
                      id="ref"
                      className={styles.input}
                      value={ewallet.reference}
                      onChange={(e) =>
                        setEwallet((w) => ({ ...w, reference: e.target.value }))
                      }
                    />
                  </div>
                </div>
              ) : null}

              {paymentMethod === "cash" ? (
                <div style={{ marginTop: 16 }}>
                  <label className={styles.fieldLabel} htmlFor="cash">
                    Amount you will pay with (optional)
                  </label>
                  <input
                    id="cash"
                    className={styles.input}
                    inputMode="decimal"
                    placeholder={`At least ₱${total.toFixed(2)}`}
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                  />
                  {fieldErrors.amountTendered ? (
                    <p className={styles.errorText}>
                      {fieldErrors.amountTendered}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Order notes</h2>
              <textarea
                className={styles.textarea}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Delivery instructions, gate codes, etc."
                rows={3}
              />
              {fieldErrors.notes ? (
                <p className={styles.errorText}>{fieldErrors.notes}</p>
              ) : null}
            </div>
          </div>

          <aside className={styles.right}>
            <h2 className={styles.summaryTitle}>Order summary</h2>

            <div className={styles.miniList}>
              {cartItems.map((item) => (
                <div className={styles.miniRow} key={item.id}>
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    width={52}
                    height={52}
                    className={styles.miniImage}
                  />
                  <div className={styles.miniInfo}>
                    <div className={styles.miniName}>{item.name}</div>
                    <div className={styles.miniMeta}>
                      ₱{Number(item.price).toFixed(2)} × {item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span>₱{shippingFee.toFixed(2)}</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>₱{total.toFixed(2)}</span>
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={20} className={styles.spinIcon} aria-hidden />
                  Placing order…
                </>
              ) : (
                "Place order"
              )}
            </button>
          </aside>
        </div>
      </form>
    </main>
  );
}

function CheckoutFallback() {
  return (
    <main className={styles.page}>
      <div className={styles.loadingBox}>
        <div className={styles.spinner} aria-hidden />
        <p style={{ marginTop: 16 }}>Loading checkout...</p>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutFallback />}>
      <CheckoutContent />
    </Suspense>
  );
}
