"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Main Footer Content */}
      <div className={styles.container}>
        {/* Section 1: Brand & About */}
        <div className={styles.section}>
          <div className={styles.brandSection}>
            <Image
              src="/images/logo.png"
              alt="PixelCore Logo"
              width={60}
              height={60}
              className={styles.logoImage}
            />
            <h3 className={styles.brandName}>PixelCore</h3>
            <p className={styles.tagline}>Natural. Sustainable. Handcrafted.</p>
            <p className={styles.about}>
              Transforming coconut fiber into premium, eco-friendly products for sustainable living.
            </p>
          </div>
        </div>

        {/* Section 2: Quick Links */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Quick Links</h4>
          <ul className={styles.linkList}>
            <li>
              <Link href="/" className={styles.link}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/products" className={styles.link}>
                Products
              </Link>
            </li>
            <li>
              <Link href="/about" className={styles.link}>
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className={styles.link}>
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Section 3: Contact Info */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Contact</h4>
          <div className={styles.contactInfo}>
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:starringpixelcore@gmail.com" className={styles.link}>
                starringpixelcore@gmail.com
              </a>
            </p>
            <p>
              <strong>Phone:</strong>{" "}
              <a href="tel:+1234567890" className={styles.link}>
                +1 (234) 567-890
              </a>
            </p>
            <div className={styles.socialMedia}>
              <p className={styles.socialTitle}>Follow Us</p>
              <div className={styles.socialIcons}>
                <a href="#" className={styles.socialIcon} title="Facebook">
                  f
                </a>
                <a href="#" className={styles.socialIcon} title="Instagram">
                  📷
                </a>
                <a href="#" className={styles.socialIcon} title="Twitter">
                  𝕏
                </a>
                <a href="#" className={styles.socialIcon} title="LinkedIn">
                  in
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Newsletter */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Stay Updated</h4>
          <p className={styles.newsletterText}>Stay in the loop with our latest products and updates</p>
          <form className={styles.newsletterForm}>
            <input
              type="email"
              placeholder="Your email"
              className={styles.emailInput}
              required
            />
            <button type="submit" className={styles.subscribeBtn}>
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Section: Copyright & Disclaimer */}
      <div className={styles.bottomSection}>
        <p className={styles.disclaimer}>
          For educational purposes only. No copyright infringement intended.
        </p>
        <p className={styles.copyright}>
          © 2025 PixelCore. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
