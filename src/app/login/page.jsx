"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validateLoginForm } from "@/lib/validation";

export default function LoginPage() {
  const router = useRouter();
  const [redirectTo, setRedirectTo] = useState("/");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get("redirect");
    if (r && r.startsWith("/") && !r.startsWith("//")) {
      setRedirectTo(r);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage("");

    // Frontend validation
    const validationErrors = validateLoginForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ form: data.error || "Login failed" });
        }
        setLoading(false);
        return;
      }

      setSuccessMessage("Login successful! Redirecting...");
      setFormData({ email: "", password: "" });

      setTimeout(() => {
        router.push(redirectTo);
      }, 2000);
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ form: "An unexpected error occurred" });
      setLoading(false);
    }
  };

  return (
    <main style={styles.container}>
      <div style={styles.formWrapper}>
        <h1 style={styles.heading}>Login</h1>
        <p style={styles.subheading}>Welcome back to Cocoir</p>

        {successMessage && (
          <div style={styles.successMessage}>{successMessage}</div>
        )}

        {errors.form && <div style={styles.errorMessage}>{errors.form}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Email */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              style={{
                ...styles.input,
                ...(errors.email ? styles.inputError : {}),
              }}
            />
            {errors.email && (
              <span style={styles.fieldError}>{errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={{
                ...styles.input,
                ...(errors.password ? styles.inputError : {}),
              }}
            />
            {errors.password && (
              <span style={styles.fieldError}>{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={styles.registerLink}>
          Don't have an account?{" "}
          <Link href="/register" style={styles.link}>
            Register here
          </Link>
        </p>
      </div>
    </main>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    padding: "20px",
  },
  formWrapper: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  heading: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "8px",
    color: "#333",
  },
  subheading: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "24px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
  },
  input: {
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "4px",
  },
  inputError: {
    borderColor: "#d32f2f",
    backgroundColor: "#ffebee",
  },
  fieldError: {
    fontSize: "12px",
    color: "#d32f2f",
    marginTop: "2px",
  },
  errorMessage: {
    backgroundColor: "#ffebee",
    color: "#d32f2f",
    padding: "12px",
    borderRadius: "4px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  successMessage: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    padding: "12px",
    borderRadius: "4px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  button: {
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: "600",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "8px",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
    cursor: "not-allowed",
  },
  registerLink: {
    textAlign: "center",
    fontSize: "14px",
    color: "#666",
    marginTop: "16px",
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "600",
  },
};
