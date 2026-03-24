"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Boxes, Package, ShoppingCart, User } from "lucide-react";
import {
  notifyAuthChanged,
  notifyCartUpdated,
  showToast,
} from "@/utils/notifications";
import styles from "./navbar.module.css";

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
      if (res.status === 401) {
        setCartCount(0);
        return;
      }
      const data = await res.json();
      setCartCount(data.count || 0);
    } catch (error) {
      console.error("Failed to fetch cart count:", error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        if (data.authenticated) setUser(data.user);
        else setUser(null);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchCartCount();
  }, [pathname]);

  useEffect(() => {
    const refreshNavbarState = () => {
      setLoading(true);
      (async () => {
        try {
          const res = await fetch("/api/auth/me", { cache: "no-store" });
          if (!res.ok) {
            setUser(null);
          } else {
            const data = await res.json();
            setUser(data.authenticated ? data.user : null);
          }
        } catch {
          setUser(null);
        } finally {
          setLoading(false);
        }
      })();
      fetchCartCount();
    };
    window.addEventListener("cartUpdated", refreshNavbarState);
    window.addEventListener("authChanged", refreshNavbarState);
    return () => {
      window.removeEventListener("cartUpdated", refreshNavbarState);
      window.removeEventListener("authChanged", refreshNavbarState);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setCartCount(0);
      notifyAuthChanged();
      notifyCartUpdated();
      showToast({
        title: "Logged out",
        message: "Logged out successfully!",
        type: "success",
      });
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className={styles.nav}>
      {/* Logo image + site name */}
      <Link href="/" className={styles.logoContainer}>
        <Image
          src="/images/cocoir_logo.png"
          alt="Cocoir Logo"
          width={67}
          height={67}
          className={styles.logoImage}
        />
        <span className={styles.siteName}>Cocoir</span>
      </Link>

      {/* Navigation links */}
      <div className={styles.leftLinks}>
        {navigationLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.navLink} ${pathname === link.href ? styles.activeLink : ""}`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Right side - Cart and User/Login */}
      <div className={styles.rightLinks}>
        <Link
          href="/cart"
          className={`${styles.iconButton} ${pathname === "/cart" ? styles.iconButtonActive : ""}`}
        >
          <ShoppingCart size={20} />
          {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
        </Link>

        {!loading && (
          <>
            {user ? (
              <>
                {user.role === "Buyer" && (
                  <Link
                    href="/orders"
                    className={`${styles.iconButton} ${pathname === "/orders" ? styles.iconButtonActive : ""}`}
                    title="My Orders"
                  >
                    <Package size={20} />
                  </Link>
                )}
                {user.role === "Seller" && (
                  <Link
                    href="/admin/orders"
                    className={`${styles.iconButton} ${
                      pathname === "/admin/orders" ||
                      pathname?.startsWith("/admin/orders")
                        ? styles.iconButtonActive
                        : ""
                    }`}
                    title="Manage Orders"
                  >
                    <Package size={20} />
                  </Link>
                )}
                {user.role === "Seller" && (
                  <Link
                    href="/admin/inventory"
                    className={`${styles.iconButton} ${
                      pathname === "/admin/inventory" ||
                      pathname?.startsWith("/admin/inventory")
                        ? styles.iconButtonActive
                        : ""
                    }`}
                    title="Manage Inventory"
                  >
                    <Boxes size={20} />
                  </Link>
                )}
                {user.role === "Seller" && (
                  <Link
                    href="/admin/reports"
                    className={`${styles.iconButton} ${
                      pathname === "/admin/reports" ||
                      pathname?.startsWith("/admin/reports")
                        ? styles.iconButtonActive
                        : ""
                    }`}
                    title="Reports"
                  >
                    <BarChart3 size={20} />
                  </Link>
                )}
                <Link
                  href="/profile"
                  className={`${styles.iconButton} ${pathname === "/profile" ? styles.iconButtonActive : ""}`}
                  title="Profile"
                >
                  <User size={20} />
                </Link>
              </>
            ) : (
              <Link href="/login" className={styles.loginButton}>
                Login
              </Link>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
