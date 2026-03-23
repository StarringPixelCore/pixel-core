import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

function formatCurrency(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "₱0.00";
  return `₱${n.toFixed(2)}`;
}

export function InventoryPdf({ products }) {
  const s = pdfStyles;
  const generatedAt = new Date().toLocaleString();

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.title}>Inventory List</Text>
          <Text style={s.meta}>Generated: {generatedAt}</Text>
          <Text style={s.meta}>Items: {products?.length || 0}</Text>
        </View>

        <View style={s.table}>
          <View style={[s.row, s.rowHeader]}>
            <Text style={[s.cell, s.colId]}>ID</Text>
            <Text style={[s.cell, s.colName]}>Name</Text>
            <Text style={[s.cell, s.colPrice]}>Price</Text>
            <Text style={[s.cell, s.colCategory]}>Category</Text>
            <Text style={[s.cell, s.colStatus]}>Status</Text>
          </View>

          {products?.length ? (
            products.map((p) => {
              const enabled = p.isEnabled === 1 || p.isEnabled === true;
              return (
                <View key={p.id} style={s.row} wrap={false}>
                  <Text style={[s.cell, s.colId]}>{String(p.id)}</Text>
                  <Text style={[s.cell, s.colName]}>{p.name || ""}</Text>
                  <Text style={[s.cell, s.colPrice]}>{formatCurrency(p.price)}</Text>
                  <Text style={[s.cell, s.colCategory]}>{p.category || "—"}</Text>
                  <Text style={[s.cell, s.colStatus]}>
                    {enabled ? "Enabled" : "Disabled"}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={s.empty}>No products.</Text>
          )}
        </View>
      </Page>
    </Document>
  );
}

const pdfStyles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.3,
  },
  header: {
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: 900,
    color: "#2f1a0f",
    marginBottom: 4,
  },
  meta: {
    fontSize: 10,
    color: "#8a6f5a",
    marginBottom: 2,
  },
  table: {
    borderWidth: 1,
    borderColor: "#ddd1c7",
    borderRadius: 6,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eadfd6",
  },
  rowHeader: {
    backgroundColor: "#f0e6dc",
  },
  cell: {
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  colId: { width: "8%" },
  colName: { width: "44%" },
  colPrice: { width: "16%" },
  colCategory: { width: "18%" },
  colStatus: { width: "14%" },
  empty: {
    padding: 10,
    color: "#8a6f5a",
  },
});

