import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import pool from "@/lib/db";
import styles from "./product-detail.module.css";
import ProductDetailActions from "./ProductDetailActions";

export default async function ProductDetailPage({ params }) {
  const {id: productId} = await params;

  // Fetch the product from the database by id
  const [rows] = await pool.query(
    `
    SELECT id, name, description, price, badge, category, image_url
    FROM products
    WHERE id = ?
    AND isEnabled = 1
    LIMIT 1
    `,
    [productId]
  );

  // If product not found, show 404
  if (!rows || rows.length === 0) {
    notFound();
  }

  const product = rows[0];

  return (
    <main className={styles.page}>
      {/* Back button */}
      <Link href="/products" className={styles.backLink}>
        <ArrowLeft size={16} />
        <span>Back to products</span>
      </Link>

      <div className={styles.wrapper}>
        {/* Image panel */}
        <div className={styles.imagePanel}>
          <div className={styles.imageBox}>
            <Image
              src={product.image_url}
              alt={product.name}
               width={400}   // fixed size
               height={400}
              className={styles.productImage}
            />
          </div>
        </div>

        {/* Details panel */}
        <div className={styles.detailsPanel}>
          {product.badge && <span className={styles.badge}>{product.badge}</span>}

          <h1 className={styles.title}>{product.name}</h1>

          <p className={styles.price}>₱{Number(product.price).toFixed(2)}</p>

          <p className={styles.description}>{product.description}</p>

          <p className={styles.category}>
            <strong>Category:</strong> {product.category}
          </p>

          {/* Add to Cart and Buy Now actions */}
          <ProductDetailActions product={product} />
        </div>
      </div>
    </main>
  );
}