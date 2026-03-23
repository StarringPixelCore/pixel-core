"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import styles from "./home.module.css";

export default function HomePage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredToggling, setFeaturedToggling] = useState({});

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const res = await fetch("/api/products/featured");
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleToggleFeatured = async (productId, currentStatus) => {
    setFeaturedToggling((prev) => ({ ...prev, [productId]: true }));
    try {
      const res = await fetch("/api/products/toggle-featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, isFeatured: !currentStatus }),
      });

      const data = await res.json();
      if (data.success) {
        // Update local state
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId
              ? { ...p, isHomepageFeatured: !currentStatus }
              : p
          )
        );
      }
    } catch (error) {
      console.error("Error toggling featured status:", error);
    } finally {
      setFeaturedToggling((prev) => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <main className={styles.wrapper}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <div className={styles.heroBadge}>
              <span>🥥</span>
              <span>100% Natural Coir Products</span>
            </div>
            <h1 className={styles.heroHeading}>
              Step into Nature: <span className={styles.highlight}>Your Ultimate Coir Destination</span>
            </h1>
            <p className={styles.heroDescription}>
              Sustainably sourced and handcrafted from natural coconut fiber, our coir products bring warmth, durability, and eco-friendly living right to your doorstep.
            </p>
            <Link href="/products" className={styles.shopButton}>
              Shop Now →
            </Link>
          </div>
          <div className={styles.heroImage}>
            <img src="/images/S1.png" alt="Coir Products" className={styles.heroImg} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.featureContainer}>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📦</div>
              <h3 className={styles.featureTitle}>Free Shipping</h3>
              <p className={styles.featureText}>Free shipping for order above $180</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>💳</div>
              <h3 className={styles.featureTitle}>Flexible Payment</h3>
              <p className={styles.featureText}>Multiple secure payment options</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🎧</div>
              <h3 className={styles.featureTitle}>24x7 Support</h3>
              <p className={styles.featureText}>We support online all days</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className={styles.productsSection}>
        <div className={styles.productsHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Featured Products</h2>
            <p className={styles.sectionSubtitle}>
              Discover our bestselling coir products
            </p>
          </div>
        </div>

        {loading ? (
          <div className={styles.noProducts}>Loading featured products...</div>
        ) : products.length > 0 ? (
          <div className={styles.productsGrid}>
            {products.map((product) => (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.productImageContainer}>
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className={styles.productImage}
                  />
                  {product.badge && (
                    <div className={styles.bestSellerBadge}>
                      {product.badge}
                    </div>
                  )}
                </div>
                <div className={styles.productContent}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.productPrice}>
                    ₱{Number(product.price).toFixed(2)}
                  </p>
                  <div className={styles.productActions}>
                    <Link
                      href={`/products/${product.id}`}
                      className={styles.viewButton}
                    >
                      View Details
                    </Link>
                    {user?.role === "Seller" && (
                      <button
                        className={`${styles.toggleFeaturedButton} ${
                          product.isHomepageFeatured
                            ? styles.active
                            : ""
                        }`}
                        onClick={() =>
                          handleToggleFeatured(
                            product.id,
                            product.isHomepageFeatured
                          )
                        }
                        disabled={featuredToggling[product.id]}
                        title={
                          product.isHomepageFeatured
                            ? "Remove from homepage"
                            : "Add to homepage"
                        }
                      >
                        {featuredToggling[product.id] ? "..." : "⭐"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noProducts}>
            No featured products yet. Check back soon!
          </div>
        )}

        {products.length > 0 && (
          <div style={{ textAlign: "center" }}>
            <Link href="/products" className={styles.viewAllButton}>
              View All Products
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}