"use client";

import { useState } from "react";
import styles from "./inventory.module.css";

export default function ProductFormModal({
  isOpen,
  mode,
  onClose,
  onSubmit,
  initialData = null,
  isSaving = false,
}) {
  const [form, setForm] = useState(
    initialData || {
      name: "",
      description: "",
      price: "",
      badge: "",
      category: "",
      image_url: "",
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalTitle}>
              {mode === "add" ? "Add product" : "Edit product"}
            </div>
            <div className={styles.modalSubtitle}>
              {mode === "add"
                ? "Add new product to your inventory."
                : "Update product details."}
            </div>
          </div>
          <button
            type="button"
            className={styles.iconClose}
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="name">
                  Product Name
                </label>
                <input
                  id="name"
                  name="name"
                  className={styles.input}
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="price">
                  Price
                </label>
                <input
                  id="price"
                  name="price"
                  className={styles.input}
                  value={form.price}
                  onChange={handleChange}
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
                  name="category"
                  className={styles.input}
                  value={form.category}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="badge">
                  Badge (optional)
                </label>
                <input
                  id="badge"
                  name="badge"
                  className={styles.input}
                  value={form.badge}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                <label className={styles.label} htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  className={styles.textarea}
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                <label className={styles.label} htmlFor="image_url">
                  Image URL
                </label>
                <input
                  id="image_url"
                  name="image_url"
                  className={styles.input}
                  value={form.image_url}
                  onChange={handleChange}
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
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button type="submit" className={styles.button} disabled={isSaving}>
              {isSaving ? "Saving..." : mode === "add" ? "Add product" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
