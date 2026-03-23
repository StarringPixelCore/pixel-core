"use client";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.errorCode}>
          <span className={styles.four}>4</span>
          <div className={styles.circle}>
            <span className={styles.zero}>0</span>
          </div>
          <span className={styles.four}>4</span>
        </div>

        <h1 className={styles.heading}>Page Not Found</h1>

        <p className={styles.description}>
          Oops! It looks like the page you're looking for has disappeared into
          the digital void. Don't worry, let's get you back on track.
        </p>

        <div className={styles.suggestions}>
          <p className={styles.suggestionsLabel}>What you can do:</p>
          <ul className={styles.suggestionsList}>
            <li>Check the URL for typos</li>
            <li>Return to the homepage</li>
            <li>Browse our products</li>
            <li>Contact support if you need help</li>
          </ul>
        </div>

        <div className={styles.actions}>
          <Link href="/" className={styles.primaryButton}>
            <Home size={18} />
            Go to Homepage
          </Link>
          <button
            className={styles.secondaryButton}
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>

        <div className={styles.decorative}>
          <div className={styles.blob1}></div>
          <div className={styles.blob2}></div>
        </div>
      </div>
    </div>
  );
}
