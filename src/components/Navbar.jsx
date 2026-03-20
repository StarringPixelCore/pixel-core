"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Cart", href: "/cart" },
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>Pixel-Core</div>

      <div style={styles.links}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              ...styles.link,
              ...(pathname === link.href ? styles.activeLink : {}),
            }}
          >
            {link.name}
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
  },
  link: {
    textDecoration: "none",
    color: "#333",
    fontWeight: "500",
    padding: "8px 12px",
    borderRadius: "8px",
  },
  activeLink: {
    backgroundColor: "#8b5e3c",
    color: "#fff",
  },
};