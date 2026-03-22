"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validateRegisterForm } from "@/lib/validation";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    address: "",
    mobileNumber: "",
  });

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
    const validationErrors = validateRegisterForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
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
          setErrors({ form: data.error || "Registration failed" });
        }
        setLoading(false);
        return;
      }

      setSuccessMessage(data.message);
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        confirmPassword: "",
        address: "",
        mobileNumber: "",
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ form: "An unexpected error occurred" });
      setLoading(false);
    }
  };

  return (
    <main style={styles.container}>
      <div style={styles.formWrapper}>
        <h1 style={styles.heading}>Create Account</h1>
        <p style={styles.subheading}>Join Cocoir and start shopping</p>

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

          {/* First Name */}
          <div style={styles.formGroup}>
            <label style={styles.label}>First Name *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              style={{
                ...styles.input,
                ...(errors.firstName ? styles.inputError : {}),
              }}
            />
            {errors.firstName && (
              <span style={styles.fieldError}>{errors.firstName}</span>
            )}
          </div>

          {/* Last Name */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              style={{
                ...styles.input,
                ...(errors.lastName ? styles.inputError : {}),
              }}
            />
            {errors.lastName && (
              <span style={styles.fieldError}>{errors.lastName}</span>
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

          {/* Confirm Password */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              style={{
                ...styles.input,
                ...(errors.confirmPassword ? styles.inputError : {}),
              }}
            />
            {errors.confirmPassword && (
              <span style={styles.fieldError}>{errors.confirmPassword}</span>
            )}
          </div>

          {/* Address */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main St, City, Country"
              style={{
                ...styles.input,
                ...(errors.address ? styles.inputError : {}),
                minHeight: "100px",
                fontFamily: "inherit",
              }}
            />
            {errors.address && (
              <span style={styles.fieldError}>{errors.address}</span>
            )}
          </div>

          {/* Mobile Number */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Mobile Number *</label>
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="+1234567890"
              style={{
                ...styles.input,
                ...(errors.mobileNumber ? styles.inputError : {}),
              }}
            />
            {errors.mobileNumber && (
              <span style={styles.fieldError}>{errors.mobileNumber}</span>
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
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p style={styles.loginLink}>
          Already have an account?{" "}
          <Link href="/login" style={styles.link}>
            Login here
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
    maxWidth: "500px",
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
    fontFamily: "inherit",
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
  loginLink: {
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
