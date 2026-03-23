"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { PAYMENT_LABEL, formatDate } from "@/app/orders/orderHelpers";
import styles from "./sales.module.css";
import { pdf } from "@react-pdf/renderer";
import { showToast } from "@/utils/notifications";
import { SalesReportPdf } from "./SalesReportPdf";
import {
  formatCurrency,
  safePaymentLabel,
  formatStatusLabel,
  formatDateRange,
} from "./salesReportFormatters";

function SalesTable({ data, emptyText, loadingLists }) {
  const sales = data?.sales || [];

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Order ID</th>
            <th className={styles.th}>Buyer</th>
            <th className={styles.th}>Date</th>
            <th className={styles.th}>Payment</th>
            <th className={styles.th}>Items</th>
            <th className={styles.th}>Status</th>
            <th className={styles.th}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {loadingLists && !data ? (
            <tr>
              <td className={styles.td} colSpan={7}>
                Loading...
              </td>
            </tr>
          ) : sales.length ? (
            sales.map((s) => (
              <tr key={s.id} className={styles.tr}>
                <td className={styles.td}>{s.id}</td>
                <td className={styles.td}>
                  {s.buyer?.firstName} {s.buyer?.lastName}
                  <div style={{ color: "#8a6f5a", fontSize: "0.85rem" }}>{s.buyer?.email}</div>
                </td>
                <td className={styles.td}>{formatDate(s.createdAt)}</td>
                <td className={styles.td}>
                  {safePaymentLabel(s.paymentMethod, PAYMENT_LABEL)}
                  {s.referenceNumber ? (
                    <div style={{ color: "#8a6f5a", fontSize: "0.85rem" }}>{s.referenceNumber}</div>
                  ) : null}
                </td>
                <td className={styles.td}>
                  <div className={styles.itemsCell}>{s.itemsSummary || "-"}</div>
                </td>
                <td className={styles.td}>
                  <span className={styles.statusBadge}>{formatStatusLabel(s.orderStatus)}</span>
                </td>
                <td className={styles.td} style={{ fontWeight: 900 }}>
                  {formatCurrency(s.totalAmount)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className={styles.td} colSpan={7}>
                <div className={styles.emptyState}>{emptyText}</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SalesRangeSection({
  title,
  subtitle,
  rangeKey,
  data,
  loadingLists,
  exporting,
  onExport,
  emptyText,
}) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>{title}</h2>
          <div className={styles.sectionSubtitle}>{subtitle}</div>
        </div>
        <div className={styles.sectionActions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => onExport(rangeKey, data)}
            disabled={exporting || loadingLists || !data}
            title={`Export ${rangeKey} sales to PDF`}
          >
            {exporting ? "Exporting..." : "Export to PDF"}
          </button>
        </div>
      </div>

      <div className={styles.summaryBar}>
        <div>
          <div className={styles.summaryValue}>
            {data ? formatCurrency(data.totalSales) : formatCurrency(0)}
          </div>
          <div className={styles.summaryMeta}>
            {data ? `${data.orderCount} delivered orders` : "Loading..."}
          </div>
        </div>
        <div className={styles.summaryMeta}>{formatDateRange(data?.startAt, data?.endAt)}</div>
      </div>

      <SalesTable data={data} emptyText={emptyText} loadingLists={loadingLists} />
    </div>
  );
}

export default function SalesReportPage() {
  const { user, router, loading } = useAuth();

  const [error, setError] = useState("");
  const [dayData, setDayData] = useState(null);
  const [monthData, setMonthData] = useState(null);
  const [loadingLists, setLoadingLists] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (user === null) {
      router.replace("/login?redirect=/admin/reports/sales");
      return;
    }

    if (user?.role !== "Seller") {
      setError("Access denied. This page is only available for sellers.");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (loading || user?.role !== "Seller") return;

    setError("");
    setLoadingLists(true);

    Promise.all([
      fetch("/api/seller/reports/sales?range=day", { cache: "no-store" }).then((r) =>
        r.json()
      ),
      fetch("/api/seller/reports/sales?range=month", { cache: "no-store" }).then((r) =>
        r.json()
      ),
    ])
      .then(([dayRes, monthRes]) => {
        if (!dayRes.success) throw new Error(dayRes?.error || "Failed to load day sales");
        if (!monthRes.success)
          throw new Error(monthRes?.error || "Failed to load month sales");

        setDayData(dayRes.data);
        setMonthData(monthRes.data);
      })
      .catch((e) => {
        console.error(e);
        setError(e?.message || "Failed to load sales lists");
      })
      .finally(() => setLoadingLists(false));
  }, [loading, user?.role]);

  const handleExportPdfFor = async (rangeKey, data) => {
    if (!data) return;
    setExporting(true);
    try {
      const rangeLabel = rangeKey === "day" ? "Today" : "This Month";

      const blob = await pdf(
        <SalesReportPdf
          rangeLabel={rangeLabel}
          startAt={data.startAt}
          endAt={data.endAt}
          totalSales={data.totalSales}
          orderCount={data.orderCount}
          sales={data.sales}
          paymentLabel={PAYMENT_LABEL}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const today = new Date().toISOString().slice(0, 10);
      const filename = `sales-report-${rangeKey}-${today}.pdf`;

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error(e);
      showToast({ message: "Failed to export PDF", type: "error" });
    } finally {
      setExporting(false);
    }
  };

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
            <a href="/admin" className={styles.secondaryLink}>
              Back to admin
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.headerSection}>
          <div className={styles.detailHeaderRow}>
            <Link href="/admin/reports" className={styles.backButton}>
              ← Back to Sales Report
            </Link>

            <div>
              <h1 className={styles.title}>Detailed Sales Report</h1>
              <p className={styles.subtitle}>
                View your detailed sales for today and this month, and export them to PDF.
              </p>
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

        <SalesRangeSection
          title="Day Sales"
          subtitle="Delivered orders for today"
          rangeKey="day"
          data={dayData}
          loadingLists={loadingLists}
          exporting={exporting}
          onExport={handleExportPdfFor}
          emptyText="No sales found for today."
        />

        <SalesRangeSection
          title="Month Sales"
          subtitle="Delivered orders for this month"
          rangeKey="month"
          data={monthData}
          loadingLists={loadingLists}
          exporting={exporting}
          onExport={handleExportPdfFor}
          emptyText="No sales found for this month."
        />
      </div>
    </main>
  );
}

