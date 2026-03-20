"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Trash2 } from "lucide-react";
import styles from "./cart.module.css";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);

  const fetchCart = async () => {
    const res = await fetch("/api/cart");
    const data = await res.json();
    setCartItems(data.items || []);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (itemId, action) => {
    await fetch("/api/cart/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, action }),
    });

    fetchCart();
  };

  const removeItem = async (itemId) => {
    await fetch("/api/cart/remove", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });

    fetchCart();
  };

  const clearCart = async () => {
    await fetch("/api/cart/clear", {
      method: "DELETE",
    });

    fetchCart();
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const shipping = cartItems.length > 0 ? 50 : 0;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <main className={styles.emptyPage}>
        <ShoppingBag size={64} className={styles.emptyIcon} />
        <h1 className={styles.emptyTitle}>Your cart is empty</h1>
        <p className={styles.emptyText}>
          Start shopping and add some eco-friendly products!
        </p>
        <Link href="/products" className={styles.browseBtn}>
          Browse Products
        </Link>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Shopping Cart</h1>

      <div className={styles.container}>
        <div className={styles.left}>
          {cartItems.map((item) => (
            <div className={styles.cartCard} key={item.id}>
              <div className={styles.itemInfo}>
                <div className={styles.imageBox}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={90}
                    height={90}
                    className={styles.productImage}
                  />
                </div>

                <div>
                  <h3 className={styles.productName}>{item.name}</h3>
                  <p className={styles.category}>{item.category}</p>
                  <p className={styles.price}>₱{Number(item.price).toFixed(2)}</p>
                </div>
              </div>

              <div className={styles.itemActions}>
                <button
                  className={styles.deleteBtn}
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 size={18} />
                </button>

                <div className={styles.qtyBox}>
                  <button onClick={() => updateQuantity(item.id, "decrease")}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, "increase")}>
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button className={styles.clearBtn} onClick={clearCart}>
            Clear cart
          </button>
        </div>

        <div className={styles.right}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>

          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>₱{subtotal.toFixed(2)}</span>
          </div>

          <div className={styles.summaryRow}>
            <span>Shipping</span>
            <span>₱{shipping.toFixed(2)}</span>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.summaryTotal}>
            <span>Total</span>
            <span>₱{total.toFixed(2)}</span>
          </div>

          <button className={styles.checkoutBtn}>Proceed to Checkout</button>
        </div>
      </div>
    </main>
  );
}