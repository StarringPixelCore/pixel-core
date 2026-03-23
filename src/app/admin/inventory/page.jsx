"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import styles from "./inventory.module.css";
import ProductFormModal from "./ProductFormModal";
import { exportInventoryToPdf } from "./inventoryPdfExport";
import { formatCurrency, isEnabledFlag } from "@/utils/formatters";
import { showToast } from "@/utils/notifications";

function statusLabel(isEnabled) {
  return isEnabledFlag(isEnabled) ? "Enabled" : "Disabled";
}

export default function SellerInventoryPage() {
  const { user, router, loading } = useAuth();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState("");
  const [exportingPdf, setExportingPdf] = useState(false);

  const [toggleLoadingById, setToggleLoadingById] = useState({});

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [editingProductId, setEditingProductId] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [modalInitialData, setModalInitialData] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const itemsPerPage = 5;

  const isSeller = user?.role === "Seller";

  useEffect(() => {
    if (loading) return;

    if (user === null) {
      router.replace("/login?redirect=/admin/inventory");
      return;
    }

    if (user?.role !== "Seller") return;

    loadProducts(currentPage);
  }, [loading, user, router, currentPage]);

  const loadProducts = async (page = 1) => {
    setLoadingProducts(true);
    setError("");
    try {
      const res = await fetch(`/api/seller/inventory?page=${page}&limit=${itemsPerPage}`, { cache: "no-store" });
      const data = await res.json();

      if (res.status === 401) {
        router.replace("/login?redirect=/admin/inventory");
        return;
      }

      if (res.status === 403) {
        setError("Access denied. Only sellers can manage inventory.");
        setProducts([]);
        return;
      }

      if (!res.ok) {
        setError(data.error || "Failed to load inventory.");
        setProducts([]);
        return;
      }

      setProducts(data.data || data.products || []);
      setPagination(data.pagination);
    } catch (e) {
      console.error(e);
      setError("Failed to load inventory.");
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    setEditingProductId(null);
    setModalInitialData(null);
    setModalOpen(true);
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      await exportInventoryToPdf({ router });
    } catch (e) {
      console.error(e);
      showToast({ message: "Failed to export inventory PDF", type: "error" });
      setError(e?.message || "Failed to export inventory PDF.");
    } finally {
      setExportingPdf(false);
    }
  };

  const openEditModal = (product) => {
    setModalMode("edit");
    setEditingProductId(product.id);
    setModalInitialData({
      name: product.name || "",
      description: product.description || "",
      price: product.price !== null && product.price !== undefined ? String(product.price) : "",
      badge: product.badge || "",
      category: product.category || "",
      image_url: product.image_url || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (savingProduct) return;
    setModalOpen(false);
    setEditingProductId(null);
    setModalInitialData(null);
  };

  const handleModalSubmit = async (formData) => {
    setError("");
    setSavingProduct(true);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        badge: formData.badge.trim(),
        category: formData.category.trim(),
        image_url: formData.image_url.trim(),
      };

      if (modalMode === "add") {
        const res = await fetch("/api/seller/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.status === 401) {
          router.replace("/login?redirect=/admin/inventory");
          return;
        }
        if (!res.ok) {
          setError(data.error || "Failed to add product.");
          setSavingProduct(false);
          return;
        }

        showToast({ message: "Product added", type: "success" });

        closeModal();
      } else {
        const res = await fetch(`/api/seller/inventory/${editingProductId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.status === 401) {
          router.replace("/login?redirect=/admin/inventory");
          return;
        }
        if (!res.ok) {
          setError(data.error || "Failed to update product.");
          setSavingProduct(false);
          return;
        }

        showToast({ message: "Product updated", type: "success" });

        closeModal();
      }

      // Re-sync list after create (and after edit, it's cheap enough).
      loadProducts(currentPage);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while saving the product.");
    } finally {
      setSavingProduct(false);
    }
  };

  const toggleEnabled = async (productId, currentEnabled) => {
    setError("");
    setToggleLoadingById((prev) => ({ ...prev, [productId]: true }));

    try {
      const nextEnabled = isEnabledFlag(currentEnabled) ? 0 : 1;
      const res = await fetch(
        `/api/seller/inventory/${productId}/toggle-enabled`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isEnabled: nextEnabled }),
        }
      );
      const data = await res.json();

      if (res.status === 401) {
        router.replace("/login?redirect=/admin/inventory");
        return;
      }
      if (!res.ok) {
        setError(data.error || "Failed to update product status.");
        return;
      }

      // Reload current page to reflect changes
      loadProducts(currentPage);

      showToast({
        title: nextEnabled === 1 ? "Product Enabled" : "Product Disabled",
        message: nextEnabled === 1 ? "Successfully enabled product!" : "Successfully disabled product!",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to update product status.");
    } finally {
      setToggleLoadingById((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const emptyStateText = useMemo(() => {
    if (loadingProducts) return "";
    if (error) return "";
    return "No products yet. Add product to create your first inventory item.";
  }, [loadingProducts, error]);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.accessDenied}>
            <h1 className={styles.accessDeniedTitle}>Loading...</h1>
            <p className={styles.accessDeniedText}>Checking your account</p>
          </div>
        </div>
      </main>
    );
  }

  if (!isSeller) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.accessDenied}>
            <h1 className={styles.accessDeniedTitle}>Access denied</h1>
            <p className={styles.accessDeniedText}>
              This page is only available for seller accounts.
            </p>
            <div style={{ marginTop: 16 }}>
              <Link href="/admin" className={styles.secondaryButton + " " + styles.button}>
                Back to admin
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.headerSection}>
          <div>
            <h1 className={styles.title}>Inventory List</h1>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.secondaryButton + " " + styles.button}
              onClick={handleExportPdf}
              disabled={exportingPdf || loadingProducts}
              title="Export inventory list to PDF"
            >
              {exportingPdf ? "Exporting..." : "Export to PDF"}
            </button>
            <button type="button" className={styles.button} onClick={openAddModal}>
              + Add product
            </button>
          </div>
        </section>

        {error ? <div className={styles.errorBox}>{error}</div> : null}

        {loadingProducts ? (
          <div className={styles.loadingBox}>
            <div className={styles.spinner} aria-hidden />
            <p style={{ marginTop: 16, color: "#8b6c57" }}>Loading inventory…</p>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th} style={{ width: 360 }}>
                      Product
                    </th>
                    <th className={styles.th}>Price</th>
                    <th className={styles.th}>Category</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th} style={{ width: 260 }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const enabled = isEnabledFlag(p.isEnabled);
                    const rowClass = enabled ? styles.rowEnabled : styles.rowDisabled;

                    return (
                      <tr key={p.id} className={rowClass}>
                        <td className={styles.td}>
                          <div className={styles.productCell}>
                            {p.image_url ? (
                              <img
                                src={p.image_url}
                                alt={p.name}
                                className={styles.thumb}
                              />
                            ) : (
                              <div className={styles.thumbPlaceholder} aria-hidden />
                            )}
                            <div>
                              <div className={styles.productName}>{p.name}</div>
                              {p.badge ? (
                                <div className={styles.badgeText}>{p.badge}</div>
                              ) : null}
                              <div className={styles.descText}>
                                {(p.description || "").slice(0, 60)}
                                {(p.description || "").length > 60 ? "…" : ""}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={styles.td}>{formatCurrency(p.price, "")}</td>
                        <td className={styles.td} style={{ color: "#8a6f5a" }}>
                          {p.category || "—"}
                        </td>
                        <td className={styles.td}>
                          <span
                            className={
                              enabled ? styles.statusEnabled : styles.statusDisabled
                            }
                          >
                            {statusLabel(p.isEnabled)}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <div className={styles.actionButtons}>
                            <button
                              type="button"
                              className={styles.smallButton}
                              onClick={() =>
                                toggleEnabled(p.id, p.isEnabled)
                              }
                              disabled={toggleLoadingById[p.id]}
                            >
                              {toggleLoadingById[p.id]
                                ? "..."
                                : enabled
                                  ? "Disable"
                                  : "Enable"}
                            </button>

                            <button
                              type="button"
                              className={styles.smallSecondaryButton}
                              onClick={() => openEditModal(p)}
                              disabled={toggleLoadingById[p.id]}
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  type="button"
                  className={styles.paginationButton}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrevPage || loadingProducts}
                >
                  ← Previous
                </button>

                <span className={styles.paginationInfo}>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>

                <button
                  type="button"
                  className={styles.paginationButton}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNextPage || loadingProducts}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <p>{emptyStateText}</p>
          </div>
        )}

        {modalOpen ? (
          <ProductFormModal
            isOpen={modalOpen}
            mode={modalMode}
            onClose={closeModal}
            onSubmit={handleModalSubmit}
            initialData={modalInitialData}
            isSaving={savingProduct}
          />
        ) : null}
      </div>
    </main>
  );
}

