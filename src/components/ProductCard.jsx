"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import styles from "@/app/products/products.module.css";
import useAuth from "@/hooks/useAuth";

export default function ProductCard({ product }) {
  const { user, router } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();

    if (!user) {
      router.push("/login");
      return;
    }

    try {
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

      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `${product.name} added to cart`, type: "success" },
        })
      );
    } catch (err) {
      console.error(err);
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: "Something went wrong", type: "error" },
        })
      );
    }
  };

  return (
    <Link href={`/products/${product.id}`} className={styles.cardLink}>
      <div className={styles.card}>
        <div className={styles.imageWrapper}>
          <Image
            src={product.image_url}
            alt={product.name}
            width={300}
            height={300}
            className={styles.productImage}
          />
        </div>

        <div className={styles.cardContent}>
          {product.badge && <span className={styles.badge}>{product.badge}</span>}

          <h2 className={styles.productTitle}>{product.name}</h2>

          <p className={styles.productDesc}>{product.description}</p>

          <div className={styles.cardFooter}>
            <span className={styles.price}>₱{Number(product.price).toFixed(2)}</span>

            <button className={styles.cartBtn} onClick={handleAddToCart}>
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}