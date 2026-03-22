"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, User } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  const navigationLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
  ];

  // Fetch cart count
  const fetchCartCount = async () => {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      const data = await res.json();
      setCartCount(data.count || 0);
    } catch (error) {
      console.error("Failed to fetch cart count:", error);
    }
  };

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (data.authenticated) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchCartCount();
  }, [pathname]);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdated = () => {
      fetchCartCount();
    };

    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>temp navbar</div>

      {/* Left side navigation links */}
      <div style={styles.leftLinks}>
        {navigationLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              ...styles.navLink,
              ...(pathname === link.href ? styles.activeLink : {}),
            }}
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Right side - Cart and User/Login */}
      <div style={styles.rightLinks}>
        {/* Cart Icon */}
        <Link href="/cart" style={styles.iconButton}>
          <ShoppingCart size={20} />
          {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
        </Link>

        {/* User Profile or Login */}
        {!loading && (
          <>
            {user ? (
              <div style={styles.userMenu}>
                <Link href="/profile" style={styles.iconButton} title="Profile">
                  <User size={20} />
                </Link>
              </div>
            ) : (
              <Link href="/login" style={styles.loginButton}>
                Login
              </Link>
            )}
          </>
        )}
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
    gap: "20px",
  },
  logo: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#8b5e3c",
    minWidth: "120px",
  },
  leftLinks: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flex: 1,
  },
  navLink: {
    textDecoration: "none",
    color: "#333",
    fontWeight: "500",
    padding: "8px 16px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  activeLink: {
    backgroundColor: "#8b5e3c",
    color: "#fff",
  },
  rightLinks: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    minWidth: "fit-content",
  },
  iconButton: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    backgroundColor: "#f3e7dc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    color: "#333",
    transition: "all 0.2s",
    cursor: "pointer",
    position: "relative",
  },
  userMenu: {
    display: "flex",
    alignItems: "center",
  },
  loginButton: {
    padding: "8px 24px",
    backgroundColor: "#8b5e3c",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.2s",
    cursor: "pointer",
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