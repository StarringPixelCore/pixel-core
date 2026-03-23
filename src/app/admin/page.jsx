"use client";

import { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";

export default function AdminPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [toggleStates, setToggleStates] = useState({});

  // Fetch all products for sellers
  useEffect(() => {
    if (user?.role === "Seller") {
      fetchAllProducts();
    }
  }, [user]);

  const fetchAllProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success && data.data) {
        setProducts(data.data);
      } else if (data.products) {
        // Fallback for old format
        setProducts(data.products);
      }
      // Initialize toggle states
      const initialStates = {};
      (data.data || data.products || []).forEach((p) => {
        initialStates[p.id] = false;
      });
      setToggleStates(initialStates);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleToggleFeatured = async (productId, currentStatus) => {
    setToggleStates((prev) => ({ ...prev, [productId]: true }));
    try {
      const res = await fetch("/api/products/toggle-featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, isFeatured: !currentStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  isHomepageFeatured: !currentStatus,
                }
              : p
          )
        );
      }
    } catch (error) {
      console.error("Error toggling featured status:", error);
    } finally {
      setToggleStates((prev) => ({ ...prev, [productId]: false }));
    }
  };

  if (user?.role !== "Seller") {
    return (
      <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto" }}>
        <h1>Access Denied</h1>
        <p>This page is only available for sellers.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto" }}>
      {user?.role === "Seller" && (
        <>
          <h1>Seller - Manage Featured Products</h1>
          <p>Toggle products to feature them on the homepage</p>

          {loadingProducts ? (
            <p>Loading your products...</p>
          ) : products.length > 0 ? (
            <div
              style={{
                marginTop: "30px",
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  backgroundColor: "#fffdfb",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#9b673e", color: "white" }}>
                    <th style={{ padding: "12px", textAlign: "left" }}>
                      Product Name
                    </th>
                    <th style={{ padding: "12px", textAlign: "left" }}>
                      Price
                    </th>
                    <th style={{ padding: "12px", textAlign: "center" }}>
                      Category
                    </th>
                    <th style={{ padding: "12px", textAlign: "center" }}>
                      Featured on Homepage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      style={{
                        borderBottom: "1px solid #ddd1c7",
                        backgroundColor:
                          product.isHomepageFeatured === 1
                            ? "#f5ede3"
                            : "white",
                      }}
                    >
                      <td style={{ padding: "12px" }}>{product.name}</td>
                      <td style={{ padding: "12px" }}>${product.price}</td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          fontSize: "14px",
                          color: "#8a6f5a",
                        }}
                      >
                        {product.category}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <button
                          onClick={() =>
                            handleToggleFeatured(
                              product.id,
                              product.isHomepageFeatured === 1
                            )
                          }
                          disabled={toggleStates[product.id]}
                          style={{
                            padding: "8px 16px",
                            fontSize: "14px",
                            fontWeight: "600",
                            backgroundColor:
                              product.isHomepageFeatured === 1
                                ? "#9b673e"
                                : "#f8f5f2",
                            color:
                              product.isHomepageFeatured === 1
                                ? "white"
                                : "#9b673e",
                            border:
                              product.isHomepageFeatured === 1
                                ? "none"
                                : "2px solid #9b673e",
                            borderRadius: "6px",
                            cursor: toggleStates[product.id]
                              ? "not-allowed"
                              : "pointer",
                            transition: "all 0.3s",
                            opacity: toggleStates[product.id] ? 0.6 : 1,
                          }}
                        >
                          {toggleStates[product.id]
                            ? "..."
                            : product.isHomepageFeatured === 1
                            ? "⭐ Featured"
                            : "☆ Not Featured"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ marginTop: "20px", color: "#8a6f5a" }}>
              No products available. Add products from the Products page.
            </p>
          )}
        </>
      )}
    </div>
  );
}
