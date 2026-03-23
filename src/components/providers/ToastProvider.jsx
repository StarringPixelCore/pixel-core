"use client";

import { useEffect, useState } from "react";

export default function ToastProvider() {
  const [toast, setToast] = useState({
    show: false,
    message: "",
    title: "",
    type: "success",
  });

  useEffect(() => {
    let timer;

    const handleToast = (event) => {
      const { message, title, type = "success" } = event.detail || {};

      setToast({
        show: true,
        message: message || "Done",
        title: title,
        type,
      });

      clearTimeout(timer);
      timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 2500);
    };

    window.addEventListener("showToast", handleToast);

    return () => {
      window.removeEventListener("showToast", handleToast);
      clearTimeout(timer);
    };
  }, []);

  if (!toast.show) return null;

  return (
    <div style={styles.wrapper}>
      <div
        style={{
          ...styles.toast,
          ...(toast.type === "error" ? styles.error : styles.success),
        }}
      >
        <div style={styles.icon}>{toast.type === "error" ? "!" : "✓"}</div>

        <div>
          <p style={styles.title}>
            {toast.title || (toast.type === "error" ? "Something went wrong" : "Added to cart")}
          </p>
          <p style={styles.message}>{toast.message}</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    position: "fixed",
    top: "24px",
    right: "24px",
    zIndex: 9999,
  },
  toast: {
    minWidth: "320px",
    maxWidth: "420px",
    padding: "14px 16px",
    borderRadius: "16px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    animation: "slideIn 0.25s ease",
    border: "1px solid #eadfd6",
    background: "#fff",
  },
  success: {
    borderLeft: "5px solid #9b673e",
  },
  error: {
    borderLeft: "5px solid #d9534f",
  },
  icon: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "#f3e7dc",
    color: "#9b673e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "700",
    color: "#2f1a0f",
  },
  message: {
    margin: "4px 0 0 0",
    fontSize: "14px",
    color: "#6f5c50",
    lineHeight: 1.4,
  },
};
