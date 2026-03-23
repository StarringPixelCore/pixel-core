"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { PAYMENT_LABEL, formatDate, formatStatusLabel } from "@/app/orders/orderHelpers";
import styles from "./sales.module.css";
import { pdf, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

function formatCurrency(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "₱0.00";
  return `₱${n.toFixed(2)}`;
}

function safePaymentLabel(method) {
  if (!method) return "Unknown";
  const key = String(method);
  return PAYMENT_LABEL[key] || key.replace(/_/g, " ");
}

function SalesReportPdf({ rangeLabel, startAt, endAt, totalSales, orderCount, sales }) {
  const pdfStyles = getPdfStyles();

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>Sales Report</Text>
          <Text style={pdfStyles.subtitle}>{rangeLabel}</Text>
          <Text style={pdfStyles.meta}>
            {startAt ? new Date(startAt).toLocaleDateString() : ""} -{" "}
            {endAt ? new Date(endAt).toLocaleDateString() : ""}
          </Text>
          <Text style={pdfStyles.meta}>
            Total: {formatCurrency(totalSales)} | Orders: {orderCount}
          </Text>
        </View>

        <View style={pdfStyles.list}>
          {sales?.length ? (
            sales.map((s) => (
              <View key={s.id} style={pdfStyles.item}>
                <Text style={pdfStyles.rowTitle}>
                  Order #{s.id} - {s.buyer?.firstName || ""} {s.buyer?.lastName || ""}
                </Text>
                <Text style={pdfStyles.metaSmall}>
                  Date: {s.createdAt ? new Date(s.createdAt).toLocaleString() : ""}
                </Text>
                <Text style={pdfStyles.metaSmall}>
                  Payment: {safePaymentLabel(s.paymentMethod)}{" "}
                  {s.referenceNumber ? `(${s.referenceNumber})` : ""}
                </Text>
                <Text style={pdfStyles.metaSmall}>
                  Status: {formatStatusLabel(s.orderStatus)} | Amount: {formatCurrency(s.totalAmount)}
                </Text>
                {s.itemsSummary ? (
                  <Text style={pdfStyles.items}>
                    Items: {s.itemsSummary}
                  </Text>
                ) : null}
              </View>
            ))
          ) : (
            <Text style={pdfStyles.empty}>No sales for this range.</Text>
          )}
        </View>
      </Page>
    </Document>
  );
}

function getPdfStyles() {
  return StyleSheet.create({
    page: {
      padding: 28,
      fontSize: 10,
      fontFamily: "Helvetica",
      lineHeight: 1.35,
    },
    header: {
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: 900,
      color: "#2f1a0f",
      marginBottom: 2,
    },
    subtitle: {
      fontSize: 12,
      fontWeight: 800,
      color: "#8b6c57",
      marginBottom: 6,
    },
    meta: {
      fontSize: 10,
      color: "#8a6f5a",
      marginBottom: 2,
    },
    list: {
      marginTop: 6,
    },
    item: {
      marginBottom: 12,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#eadfd6",
    },
    rowTitle: {
      fontSize: 11,
      fontWeight: 900,
      color: "#2f1a0f",
      marginBottom: 2,
    },
    metaSmall: {
      fontSize: 10,
      color: "#3f2819",
      marginBottom: 1,
    },
    items: {
      fontSize: 9.5,
      color: "#8a6f5a",
      marginTop: 2,
    },
    empty: {
      fontSize: 12,
      color: "#8a6f5a",
    },
  });
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
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: "Failed to export PDF", type: "error" },
        })
      );
    } finally {
      setExporting(false);
    }
  };

  const renderSalesTable = (data, emptyText) => {
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
                    <div style={{ color: "#8a6f5a", fontSize: "0.85rem" }}>
                      {s.buyer?.email}
                    </div>
                  </td>
                  <td className={styles.td}>{formatDate(s.createdAt)}</td>
                  <td className={styles.td}>
                    {safePaymentLabel(s.paymentMethod)}
                    {s.referenceNumber ? (
                      <div style={{ color: "#8a6f5a", fontSize: "0.85rem" }}>
                        {s.referenceNumber}
                      </div>
                    ) : null}
                  </td>
                  <td className={styles.td}>
                    <div className={styles.itemsCell}>{s.itemsSummary || "-"}</div>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.statusBadge}>
                      {formatStatusLabel(s.orderStatus)}
                    </span>
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

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Day Sales</h2>
              <div className={styles.sectionSubtitle}>Delivered orders for today</div>
            </div>
            <div className={styles.sectionActions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => handleExportPdfFor("day", dayData)}
                disabled={exporting || loadingLists || !dayData}
                title="Export day sales to PDF"
              >
                {exporting ? "Exporting..." : "Export to PDF"}
              </button>
            </div>
          </div>

          <div className={styles.summaryBar}>
            <div>
              <div className={styles.summaryValue}>
                {dayData ? formatCurrency(dayData.totalSales) : formatCurrency(0)}
              </div>
              <div className={styles.summaryMeta}>
                {dayData ? `${dayData.orderCount} delivered orders` : "Loading..."}
              </div>
            </div>
            <div className={styles.summaryMeta}>
              {dayData?.startAt && dayData?.endAt
                ? `${new Date(dayData.startAt).toLocaleDateString()} - ${new Date(
                    dayData.endAt
                  ).toLocaleDateString()}`
                : ""}
            </div>
          </div>

          {renderSalesTable(dayData, "No sales found for today.")}
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Month Sales</h2>
              <div className={styles.sectionSubtitle}>Delivered orders for this month</div>
            </div>
            <div className={styles.sectionActions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => handleExportPdfFor("month", monthData)}
                disabled={exporting || loadingLists || !monthData}
                title="Export month sales to PDF"
              >
                {exporting ? "Exporting..." : "Export to PDF"}
              </button>
            </div>
          </div>

          <div className={styles.summaryBar}>
            <div>
              <div className={styles.summaryValue}>
                {monthData ? formatCurrency(monthData.totalSales) : formatCurrency(0)}
              </div>
              <div className={styles.summaryMeta}>
                {monthData ? `${monthData.orderCount} delivered orders` : "Loading..."}
              </div>
            </div>
            <div className={styles.summaryMeta}>
              {monthData?.startAt && monthData?.endAt
                ? `${new Date(monthData.startAt).toLocaleDateString()} - ${new Date(
                    monthData.endAt
                  ).toLocaleDateString()}`
                : ""}
            </div>
          </div>

          {renderSalesTable(monthData, "No sales found for this month.")}
        </div>
      </div>
    </main>
  );
}

