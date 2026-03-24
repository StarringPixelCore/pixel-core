"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import styles from "./product-detail.module.css";
import useAuth from "@/hooks/useAuth"; // the hook we just created
import { notifyCartUpdated, showToast } from "@/utils/notifications";

export default function ProductDetailActions({ product }) {
  const [qty, setQty] = useState(1);
  const { user, router } = useAuth();

  const addToCart = async () => {
    if (!user) {
      router.push("/login"); // redirect to login if not logged in
      return;
    }

    try {
      for (let i = 0; i < qty; i++) {
        const res = await fetch("/api/cart/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        });
        const data = await res.json();

        if (!res.ok) {
          showToast({ message: data.error || "Failed to add item", type: "error" });
          return;
        }
      }

      notifyCartUpdated();
      showToast({ message: `${product.name} added to cart`, type: "success" });
    } catch (error) {
      console.error(error);
      showToast({ message: "Something went wrong", type: "error" });
    }
  };

  const handleBuyNow = () => {
    const params = new URLSearchParams({
      buyNow: "1",
      productId: String(product.id),
      qty: String(Math.max(1, qty)),
      name: product.name || "",
      price: String(product.price ?? ""),
      image: product.image_url || "",
    });
    const checkoutUrl = `/checkout?${params.toString()}`;

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(checkoutUrl)}`);
      return;
    }
    router.push(checkoutUrl);
  };

  return (
    <>
      <div className={styles.qtyRow}>
        <span className={styles.qtyLabel}>Qty:</span>
        <div className={styles.qtyBox}>
          <button type="button" onClick={() => setQty((prev) => Math.max(1, prev - 1))}>
            -
          </button>
          <span>{qty}</span>
          <button type="button" onClick={() => setQty((prev) => prev + 1)}>+</button>
        </div>
      </div>

      <div className={styles.actionRow}>
        <button className={styles.addBtn} onClick={addToCart}>
          <ShoppingCart size={18} />
          <span>Add to Cart</span>
        </button>

        <button className={styles.buyBtn} onClick={handleBuyNow}>
          Buy Now
        </button>
      </div>
    </>
  );
}