"use client";

import { useState } from "react";

export default function AdminPage() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const addBadgeColumn = async () => {
    setLoading(true);
    setStatus("Adding badge column...");
    try {
      const res = await fetch("/api/admin/add-badge-column", { method: "POST" });
      const data = await res.json();
      setStatus(data.message || "Badge column added!");
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  const restoreProducts = async () => {
    setLoading(true);
    setStatus("Restoring products...");
    try {
      const res = await fetch("/api/admin/restore-products", { method: "POST" });
      const data = await res.json();
      setStatus(data.message || "Products restored!");
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Admin - Restore Products</h1>
      <p>This page will add the badge column and restore deleted products with badges.</p>
      
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={addBadgeColumn}
          disabled={loading}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#666",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            marginRight: "10px",
          }}
        >
          {loading ? "Adding..." : "Step 1: Add Badge Column"}
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={restoreProducts}
          disabled={loading}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#8b5e3c",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Restoring..." : "Step 2: Restore Products"}
        </button>
      </div>

      {status && (
        <p style={{ marginTop: "20px", fontSize: "18px", color: "#333" }}>
          {status}
        </p>
      )}

      <hr style={{ marginTop: "30px" }} />
      <ol style={{ fontSize: "14px", color: "#666" }}>
        <li>Click "Add Badge Column" first</li>
        <li>Then click "Restore Products"</li>
        <li>Finally, visit <a href="/products"><strong>/products</strong></a> to see the products with badges!</li>
      </ol>
    </div>
  );
}
