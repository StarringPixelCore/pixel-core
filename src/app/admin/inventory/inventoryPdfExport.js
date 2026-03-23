import { pdf } from "@react-pdf/renderer";
import { InventoryPdf } from "./inventoryPdf";

export async function fetchAllInventory({ router }) {
  const limit = 100;
  let page = 1;
  let all = [];

  while (true) {
    const res = await fetch(`/api/seller/inventory?page=${page}&limit=${limit}`, {
      cache: "no-store",
    });
    const data = await res.json();

    if (res.status === 401) {
      router.replace("/login?redirect=/admin/inventory");
      return null;
    }

    if (!res.ok) {
      throw new Error(data.error || "Failed to load inventory for export.");
    }

    const pageItems = data.data || data.products || [];
    all = all.concat(pageItems);

    const totalPages = data.pagination?.totalPages || 1;
    if (page >= totalPages) break;
    page += 1;
  }

  const byId = new Map();
  for (const p of all) byId.set(p.id, p);
  return Array.from(byId.values()).sort((a, b) => Number(a.id) - Number(b.id));
}

export async function exportInventoryToPdf({ router }) {
  const products = await fetchAllInventory({ router });
  if (!products) return;

  const blob = await pdf(<InventoryPdf products={products} />).toBlob();
  const url = URL.createObjectURL(blob);
  const today = new Date().toISOString().slice(0, 10);
  const filename = `inventory-list-${today}.pdf`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

