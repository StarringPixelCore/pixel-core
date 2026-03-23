"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import styles from "@/app/products/products.module.css";
import useAuth from "@/hooks/useAuth";

export default function ProductCard({ product }) {
  const { user, router } = useAuth();
  const [isFeatured, setIsFeatured] = useState(product.isHomepageFeatured === 1);
  const [isTogglingFeatured, setIsTogglingFeatured] = useState(false);

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

  const handleToggleFeatured = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsTogglingFeatured(true);
    try {
      const res = await fetch("/api/products/toggle-featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, isFeatured: !isFeatured }),
      });

      const data = await res.json();
      if (data.success) {
        setIsFeatured(!isFeatured);
        window.dispatchEvent(
          new CustomEvent("showToast", {
            detail: {
              title: !isFeatured ? "Featured" : "Removed from Featured",
              message: !isFeatured
                ? "Product featured on homepage!"
                : "Product removed from homepage!",
              type: "success",
            },
          })
        );
      }
    } catch (error) {
      console.error("Error toggling featured status:", error);
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: "Failed to update featured status", type: "error" },
        })
      );
    } finally {
      setIsTogglingFeatured(false);
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

          {/* Seller controls */}
          {user?.role === "Seller" && (
            <button
              onClick={handleToggleFeatured}
              disabled={isTogglingFeatured}
              className={styles.featuredToggleBtn}
              title={isFeatured ? "Remove from homepage" : "Add to homepage"}
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                background: isFeatured ? "#9b673e" : "rgba(255, 255, 255, 0.9)",
                color: isFeatured ? "white" : "#9b673e",
                border: isFeatured ? "none" : "2px solid #9b673e",
                padding: "8px 12px",
                borderRadius: "20px",
                cursor: isTogglingFeatured ? "not-allowed" : "pointer",
                fontSize: "18px",
                fontWeight: "600",
                opacity: isTogglingFeatured ? 0.6 : 1,
                transition: "all 0.3s",
                zIndex: 10,
              }}
            >
              {isFeatured ? "⭐" : "☆"}
            </button>
          )}
        </div>

        <div className={styles.cardContent}>
          {product.badge 
            ? <span className={styles.badge}>{product.badge}</span>
            : <span className={styles.badgePlaceholder} />
          }

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
