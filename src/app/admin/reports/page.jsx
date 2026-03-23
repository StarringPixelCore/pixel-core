"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import styles from "./reports.module.css";

function formatCurrency(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "₱0.00";
  return `₱${n.toFixed(2)}`;
}

function formatDateRange(startIso, endIso) {
  if (!startIso || !endIso) return "";
  const start = new Date(startIso);
  const end = new Date(endIso);
  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
}

export default function SellerReportsPage() {
  const { user, router, loading } = useAuth();

  const [daySummary, setDaySummary] = useState(null);
  const [monthSummary, setMonthSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;

    if (user === null) {
      router.replace("/login?redirect=/admin/reports");
      return;
    }

    if (user?.role !== "Seller") {
      setError("Access denied. This page is only available for sellers.");
      return;
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (loading || user?.role !== "Seller") return;

    const load = async () => {
      setError("");
      try {
        const [dayRes, monthRes] = await Promise.all([
          fetch("/api/seller/reports/summary?range=day", { cache: "no-store" }),
          fetch("/api/seller/reports/summary?range=month", { cache: "no-store" }),
        ]);

        const dayData = await dayRes.json();
        const monthData = await monthRes.json();

        if (!dayRes.ok) throw new Error(dayData?.error || "Failed to load day summary");
        if (!monthRes.ok)
          throw new Error(monthData?.error || "Failed to load month summary");

        setDaySummary(dayData.data);
        setMonthSummary(monthData.data);
      } catch (e) {
        console.error(e);
        setError(e?.message || "Failed to load reports");
      }
    };

    load();
  }, [loading, user?.role]);

  if (loading || user === null) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Loading...</h1>
        </div>
      </main>
    );
  }

  if (user?.role !== "Seller") {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.accessDenied}>
            <h1 className={styles.accessDeniedTitle}>Access denied</h1>
            <p className={styles.accessDeniedText}>
              This page is only available for seller accounts.
            </p>
            <Link href="/admin" className={styles.secondaryLink}>
              Back to admin
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.headerSection}>
          <div className={styles.headerRow}>
            <div>
              <h1 className={styles.title}>Sales Reports</h1>
              <p className={styles.subtitle}>
                Quick view of your total sales for today and this month.
              </p>
            </div>

            <div className={styles.headerActions}>
              <Link href="/admin/reports/sales" className={styles.primaryButton}>
                Sales Report
              </Link>
            </div>
          </div>
        </section>

        {error ? (
          <div className={styles.accessDenied} style={{ padding: "0 0 18px 0" }}>
            <p className={styles.accessDeniedText} style={{ color: "#b42318" }}>
              {error}
            </p>
          </div>
        ) : null}

        <div className={styles.cardsRow}>
          <div className={styles.card}>
            <div className={styles.cardLabel}>Today's Sales</div>
            <div className={styles.cardValue}>
              {daySummary ? formatCurrency(daySummary.totalSales) : "₱0.00"}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>This Month's Sales</div>
            <div className={styles.cardValue}>
              {monthSummary ? formatCurrency(monthSummary.totalSales) : "₱0.00"}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

