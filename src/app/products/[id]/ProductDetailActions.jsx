"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import styles from "./product-detail.module.css";

export default function ProductDetailActions({ product }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);

  const addToCart = async () => {
    try {
      for (let i = 0; i < qty; i++) {
        const res = await fetch("/api/cart/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        });
        const data = await res.json();

        if (!res.ok) {
          window.dispatchEvent(
            new CustomEvent("showToast", {
              detail: { message: data.error || "Failed to add item", type: "error" },
            })
          );
          return;
        }
      }

      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `${product.name} added to cart`, type: "success" },
        })
      );
    } catch (error) {
      console.error(error);
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: "Something went wrong", type: "error" },
        })
      );
    }
  };

  const handleBuyNow = () => {
    // Navigate to temporary checkout page
    router.push("/checkout");
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