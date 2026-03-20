import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import styles from "@/app/products/products.module.css";

export default function ProductCard({ product }) {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image
          src={product.image}
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
          <p className={styles.price}>₱{product.price.toFixed(2)}</p>
          <button className={styles.cartBtn}>
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}