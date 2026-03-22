"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      const data = await res.json();
      setCartCount(data.count || 0);
    } catch (error) {
      console.error("Failed to fetch cart count:", error);
    }
  };

  useEffect(() => {
    fetchCartCount();

    const handleCartUpdated = () => {
      fetchCartCount();
    };

    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, []);

  const links = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Cart", href: "/cart", isCart: true },
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>temp navbar</div>

      <div style={styles.links}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              ...styles.link,
              ...(pathname === link.href ? styles.activeLink : {}),
              ...(link.isCart ? styles.cartLink : {}),
            }}
          >
            {link.isCart ? (
              <>
                <ShoppingCart size={20} />
                {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
              </>
            ) : (
              link.name
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: "1px solid #ddd",
    backgroundColor: "#fff",
  },
  logo: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#8b5e3c",
  },
  links: {
    display: "flex",
    gap: "18px",
    alignItems: "center",
  },
  link: {
    textDecoration: "none",
    color: "#333",
    fontWeight: "500",
    padding: "8px 12px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  activeLink: {
    backgroundColor: "#8b5e3c",
    color: "#fff",
  },
  cartLink: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    backgroundColor: "#f3e7dc",
  },
  badge: {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    backgroundColor: "#9b673e",
    color: "#fff",
    fontSize: "12px",
    minWidth: "18px",
    height: "18px",
    borderRadius: "999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 5px",
    fontWeight: "700",
    lineHeight: 1,
  },
};