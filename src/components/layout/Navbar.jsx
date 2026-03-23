"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Boxes, Package, ShoppingCart, User } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  const navigationLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "About Us", href: "/about" },
  ];

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
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated) setUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchCartCount();
  }, [pathname]);

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
      {/* Logo image + site name */}
      <Link href="/" style={styles.logoContainer}>
        <Image
          src="/images/logo.png"
          alt="Cocoir Logo"
          width={67}
          height={67}
          style={{ borderRadius: "4px" }}
        />
        <span style={styles.siteName}>Cocoir</span>
      </Link>

      {/* Navigation links */}
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
        <Link
          href="/cart"
          style={{
            ...styles.iconButton,
            ...(pathname === "/cart" ? styles.iconButtonActive : {}),
          }}
        >
          <ShoppingCart size={20} />
          {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
        </Link>

        {!loading && (
          <>
            {user ? (
              <>
                {user.role === "Buyer" && (
                  <Link
                    href="/orders"
                    style={{
                      ...styles.iconButton,
                      ...(pathname === "/orders"
                        ? styles.iconButtonActive
                        : {}),
                    }}
                    title="My Orders"
                  >
                    <Package size={20} />
                  </Link>
                )}
                {user.role === "Seller" && (
                  <Link
                    href="/admin/orders"
                    style={{
                      ...styles.iconButton,
                      ...(pathname === "/admin/orders" ||
                      pathname?.startsWith("/admin/orders")
                        ? styles.iconButtonActive
                        : {}),
                    }}
                    title="Manage Orders"
                  >
                    <Package size={20} />
                  </Link>
                )}
                {user.role === "Seller" && (
                  <Link
                    href="/admin/inventory"
                    style={{
                      ...styles.iconButton,
                      ...(pathname === "/admin/inventory" ||
                      pathname?.startsWith("/admin/inventory")
                        ? styles.iconButtonActive
                        : {}),
                    }}
                    title="Manage Inventory"
                  >
                    <Boxes size={20} />
                  </Link>
                )}
                <Link
                  href="/profile"
                  style={styles.iconButton}
                  title="Profile"
                >
                  <User size={20} />
                </Link>
              </>
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
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  siteName: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#8b5e3c",
  },
  leftLinks: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    flex: 1,
    marginLeft: "32px",
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
  iconButtonActive: {
    backgroundColor: "#8b5e3c",
    color: "#fff",
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
