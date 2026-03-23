"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import styles from "./inventory.module.css";

function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return `₱${n.toFixed(2)}`;
}

function statusLabel(isEnabled) {
  return isEnabled === 1 || isEnabled === true ? "Enabled" : "Disabled";
}

function safeString(value) {
  return typeof value === "string" ? value : "";
}

export default function SellerInventoryPage() {
  const { user, router, loading } = useAuth();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState("");

  const [toggleLoadingById, setToggleLoadingById] = useState({});

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [editingProductId, setEditingProductId] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    badge: "",
    category: "",
    image_url: "",
  });

  const isSeller = user?.role === "Seller";

  useEffect(() => {
    if (loading) return;

    if (user === null) {
      router.replace("/login?redirect=/admin/inventory");
      return;
    }

    if (user?.role !== "Seller") return;

    (async () => {
      setLoadingProducts(true);
      setError("");
      try {
        const res = await fetch("/api/seller/inventory", { cache: "no-store" });
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
      } catch (e) {
        console.error(e);
        setError("Failed to load inventory.");
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    })();
  }, [loading, user, router]);

  const openAddModal = () => {
    setModalMode("add");
    setEditingProductId(null);
    setForm({
      name: "",
      description: "",
      price: "",
      badge: "",
      category: "",
      image_url: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setModalMode("edit");
    setEditingProductId(product.id);
    setForm({
      name: safeString(product.name),
      description: safeString(product.description),
      price:
        product.price !== null && product.price !== undefined
          ? String(product.price)
          : "",
      badge: safeString(product.badge),
      category: safeString(product.category),
      image_url: safeString(product.image_url),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (savingProduct) return;
    setModalOpen(false);
    setEditingProductId(null);
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    setError("");
    setSavingProduct(true);

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        badge: form.badge.trim(),
        category: form.category.trim(),
        image_url: form.image_url.trim(),
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
          return;
        }

        window.dispatchEvent(
          new CustomEvent("showToast", {
            detail: { message: "Product added", type: "success" },
          })
        );

        setModalOpen(false);
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
          return;
        }

        const updated = data.product;
        setProducts((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );

        window.dispatchEvent(
          new CustomEvent("showToast", {
            detail: { message: "Product updated", type: "success" },
          })
        );

        setModalOpen(false);
      }

      // Re-sync list after create (and after edit, it's cheap enough).
      const res = await fetch("/api/seller/inventory", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setProducts(data.data || data.products || []);
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
      const nextEnabled = currentEnabled === 1 || currentEnabled === true ? 0 : 1;
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

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, isEnabled: nextEnabled } : p
        )
      );

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: {
            message: nextEnabled === 1 ? "Product enabled" : "Product disabled",
            type: "success",
          },
        })
      );
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
    return "No products yet. Use “Add product” to create your first inventory item.";
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
                  const enabled = p.isEnabled === 1 || p.isEnabled === true;
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
                      <td className={styles.td}>{formatPrice(p.price)}</td>
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
        ) : (
          <div className={styles.emptyState}>
            <p>{emptyStateText}</p>
          </div>
        )}

        {modalOpen ? (
          <div className={styles.modalOverlay} role="dialog" aria-modal="true">
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <div>
                  <div className={styles.modalTitle}>
                    {modalMode === "add" ? "Add product" : "Edit product"}
                  </div>
                  <div className={styles.modalSubtitle}>
                    {modalMode === "add"
                      ? "Create a new inventory item."
                      : "Update product details (name, description, price, etc.)."}
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.iconClose}
                  onClick={closeModal}
                  disabled={savingProduct}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <form onSubmit={submitProduct}>
                <div className={styles.modalBody}>
                  <div className={styles.formGrid}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="name">
                        Product Name
                      </label>
                      <input
                        id="name"
                        className={styles.input}
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="price">
                        Price
                      </label>
                      <input
                        id="price"
                        className={styles.input}
                        value={form.price}
                        onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                        required
                        inputMode="decimal"
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="category">
                        Category
                      </label>
                      <input
                        id="category"
                        className={styles.input}
                        value={form.category}
                        onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="badge">
                        Badge (optional)
                      </label>
                      <input
                        id="badge"
                        className={styles.input}
                        value={form.badge}
                        onChange={(e) => setForm((prev) => ({ ...prev, badge: e.target.value }))}
                      />
                    </div>

                    <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                      <label className={styles.label} htmlFor="description">
                        Description
                      </label>
                      <textarea
                        id="description"
                        className={styles.textarea}
                        value={form.description}
                        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                        rows={4}
                      />
                    </div>

                    <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                      <label className={styles.label} htmlFor="image_url">
                        Image URL
                      </label>
                      <input
                        id="image_url"
                        className={styles.input}
                        value={form.image_url}
                        onChange={(e) => setForm((prev) => ({ ...prev, image_url: e.target.value }))}
                      />
                      <div className={styles.helpText}>
                        Use a valid URL (for example `/images/foo.jpg`).
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton + " " + styles.button}
                    onClick={closeModal}
                    disabled={savingProduct}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.button} disabled={savingProduct}>
                    {savingProduct ? "Saving..." : modalMode === "add" ? "Add product" : "Save changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

