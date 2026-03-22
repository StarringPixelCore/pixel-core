"use client";

import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import styles from "@/app/products/products.module.css";

export default function ProductCard({ product }) {
  const addToCart = async () => {
  try {
    const res = await fetch("/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: product.id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: {
            message: data.error || "Failed to add item to cart",
            type: "error",
          },
        })
      );
      return;
    }

    window.dispatchEvent(new Event("cartUpdated"));

    window.dispatchEvent(
      new CustomEvent("showToast", {
        detail: {
          message: `${product.name} added to cart`,
          type: "success",
        },
      })
    );
  } catch (error) {
    console.error("Add to cart error:", error);

    window.dispatchEvent(
      new CustomEvent("showToast", {
        detail: {
          message: "Something went wrong while adding to cart",
          type: "error",
        },
      })
    );
  }
};

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className={styles.productImage}
        />
      </div>

      <div className={styles.cardContent}>
        {product.badge && <span className={styles.badge}>{product.badge}</span>}

        <h3 className={styles.productTitle}>{product.name}</h3>
        <p className={styles.productDesc}>{product.description}</p>

        <div className={styles.cardFooter}>
          <p className={styles.price}>₱{Number(product.price).toFixed(2)}</p>

          <button
            type="button"
            className={styles.cartBtn}
            onClick={addToCart}
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}