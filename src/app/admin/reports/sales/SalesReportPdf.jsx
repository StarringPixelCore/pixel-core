import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import {
  parseCurrencyNumber,
  safePaymentLabel,
  formatStatusLabel,
  formatDateRange,
} from "./salesReportFormatters";

const S = StyleSheet.create({
  page: {
    padding: 36,
    paddingTop: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  headerBand: {
    backgroundColor: "#2f1a0f",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    flexDirection: "column",
    gap: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#c8a98a",
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
  },
  headerMeta: {
    fontSize: 9,
    color: "#a07858",
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  headerOrders: {
    fontSize: 9,
    color: "#c8a98a",
  },
  summaryStrip: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fdf8f4",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e8d9ce",
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  summaryCardLabel: {
    fontSize: 8,
    color: "#9b7b63",
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  summaryCardValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#2f1a0f",
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#9b7b63",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  orderCard: {
    borderWidth: 1,
    borderColor: "#e8d9ce",
    borderRadius: 6,
    marginBottom: 8,
    overflow: "hidden",
  },
  orderCardHeader: {
    backgroundColor: "#f5ede6",
    paddingVertical: 7,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e8d9ce",
  },
  orderCardTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#2f1a0f",
  },
  currencyRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currencySymbol: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#2f1a0f",
  },
  currencyValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#2f1a0f",
  },
  currencySymbolHeader: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  currencyValueHeader: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  currencySymbolOrder: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#7a4a24",
  },
  currencyValueOrder: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#7a4a24",
  },
  orderCardBody: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    gap: 20,
  },
  orderCardCol: {
    flex: 1,
    gap: 3,
  },
  orderCardRow: {
    flexDirection: "row",
    gap: 4,
    alignItems: "flex-start",
  },
  orderCardRowLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#9b7b63",
    width: 52,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingTop: 0.5,
  },
  orderCardRowValue: {
    fontSize: 9,
    color: "#3f2819",
    flex: 1,
  },
  orderCardItems: {
    fontSize: 8.5,
    color: "#7a5c40",
    fontFamily: "Helvetica-Oblique",
    paddingTop: 4,
    paddingBottom: 2,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#efe5dc",
    backgroundColor: "#fdfaf8",
  },
  statusText: {
    fontSize: 8.5,
    color: "#5c4030",
    fontFamily: "Helvetica-Bold",
    textTransform: "capitalize",
  },
  refCode: {
    fontSize: 8,
    color: "#a07858",
    fontFamily: "Helvetica-Oblique",
  },
  emptyBox: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 10,
    color: "#9b7b63",
    fontFamily: "Helvetica-Oblique",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e8d9ce",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: "#b09080",
  },
});

export function SalesReportPdf({
  rangeLabel,
  startAt,
  endAt,
  totalSales,
  orderCount,
  sales,
  paymentLabel = {},
}) {
  const dateRange = formatDateRange(startAt, endAt, "en-PH");
  const generatedAt = new Date().toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Document>
      <Page size="A4" style={S.page}>
        <View style={S.headerBand}>
          <View style={S.headerLeft}>
            <Text style={S.headerTitle}>Sales Report</Text>
            <Text style={S.headerSubtitle}>{rangeLabel}</Text>
            {dateRange ? <Text style={S.headerMeta}>{dateRange}</Text> : null}
          </View>
          <View style={S.headerRight}>
            <View style={S.currencyRow}>
              <Text style={S.currencySymbolHeader}>P</Text>
              <Text style={S.currencyValueHeader}>
                {parseCurrencyNumber(totalSales).toFixed(2)}
              </Text>
            </View>
            <Text style={S.headerOrders}>{orderCount ?? 0} orders</Text>
          </View>
        </View>

        <View style={S.summaryStrip}>
          <View style={S.summaryCard}>
            <Text style={S.summaryCardLabel}>Total Revenue</Text>
            <View style={S.currencyRow}>
              <Text style={S.currencySymbol}>P</Text>
              <Text style={S.currencyValue}>
                {parseCurrencyNumber(totalSales).toFixed(2)}
              </Text>
            </View>
          </View>
          <View style={S.summaryCard}>
            <Text style={S.summaryCardLabel}>Orders</Text>
            <Text style={S.summaryCardValue}>{orderCount ?? 0}</Text>
          </View>
          <View style={S.summaryCard}>
            <Text style={S.summaryCardLabel}>Avg. Order</Text>
            <View style={S.currencyRow}>
              <Text style={S.currencySymbol}>P</Text>
              <Text style={S.currencyValue}>
                {orderCount > 0
                  ? (parseCurrencyNumber(totalSales) / orderCount).toFixed(2)
                  : "0.00"}
              </Text>
            </View>
          </View>
        </View>

        <Text style={S.sectionLabel}>Order Details</Text>
        {sales?.length ? (
          sales.map((s) => (
            <View key={s.id} style={S.orderCard} wrap={false}>
              <View style={S.orderCardHeader}>
                <Text style={S.orderCardTitle}>
                  Order #{s.id}{"  "}
                  {s.buyer?.firstName || ""} {s.buyer?.lastName || ""}
                </Text>
                <View style={S.currencyRow}>
                  <Text style={S.currencySymbolOrder}>P</Text>
                  <Text style={S.currencyValueOrder}>
                    {parseCurrencyNumber(s.totalAmount).toFixed(2)}
                  </Text>
                </View>
              </View>
              <View style={S.orderCardBody}>
                <View style={S.orderCardCol}>
                  <View style={S.orderCardRow}>
                    <Text style={S.orderCardRowLabel}>Date</Text>
                    <Text style={S.orderCardRowValue}>
                      {s.createdAt
                        ? new Date(s.createdAt).toLocaleString("en-PH", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "—"}
                    </Text>
                  </View>
                  <View style={S.orderCardRow}>
                    <Text style={S.orderCardRowLabel}>Status</Text>
                    <Text style={[S.orderCardRowValue, S.statusText]}>
                      {formatStatusLabel(s.orderStatus)}
                    </Text>
                  </View>
                </View>
                <View style={S.orderCardCol}>
                  <View style={S.orderCardRow}>
                    <Text style={S.orderCardRowLabel}>Payment</Text>
                    <Text style={S.orderCardRowValue}>
                      {safePaymentLabel(s.paymentMethod, paymentLabel)}
                    </Text>
                  </View>
                  {s.referenceNumber ? (
                    <View style={S.orderCardRow}>
                      <Text style={S.orderCardRowLabel}>Ref #</Text>
                      <Text style={[S.orderCardRowValue, S.refCode]}>{s.referenceNumber}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
              {s.itemsSummary ? (
                <Text style={S.orderCardItems}>Items: {s.itemsSummary}</Text>
              ) : null}
            </View>
          ))
        ) : (
          <View style={S.emptyBox}>
            <Text style={S.emptyText}>No sales for this period.</Text>
          </View>
        )}

        <View style={S.footer} fixed>
          <Text style={S.footerText}>Generated {generatedAt}</Text>
          <Text
            style={S.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
