"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function EmailVerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link");
        return;
      }

      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "Verification failed");
          return;
        }

        setStatus("success");
        setMessage(data.message);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("An error occurred during verification");
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        {status === "loading" && (
          <>
            <div style={styles.spinner}></div>
            <p style={styles.message}>Verifying your email...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={styles.successIcon}>✓</div>
            <h1 style={styles.heading}>Email Verified!</h1>
            <p style={styles.message}>{message}</p>
            <p style={styles.redirectText}>
              Redirecting to login page in 3 seconds...
            </p>
            <Link href="/login" style={styles.button}>
              Go to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div style={styles.errorIcon}>✕</div>
            <h1 style={styles.heading}>Verification Failed</h1>
            <p style={styles.message}>{message}</p>
            <Link href="/register" style={styles.button}>
              Try Again
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div style={styles.container}>Loading...</div>}>
      <EmailVerificationContent />
    </Suspense>
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
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    maxWidth: "400px",
    width: "100%",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3e7dc",
    borderTop: "4px solid #8b5e3c",
    borderRadius: "50%",
    margin: "0 auto 20px",
    animation: "spin 1s linear infinite",
  },
  successIcon: {
    fontSize: "48px",
    color: "#2e7d32",
    marginBottom: "16px",
  },
  errorIcon: {
    fontSize: "48px",
    color: "#d32f2f",
    marginBottom: "16px",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#333",
    marginBottom: "12px",
  },
  message: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "16px",
    lineHeight: "1.6",
  },
  redirectText: {
    fontSize: "12px",
    color: "#999",
    marginBottom: "20px",
  },
  button: {
    display: "inline-block",
    padding: "12px 32px",
    backgroundColor: "#8b5e3c",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "4px",
    fontWeight: "600",
    fontSize: "14px",
  },
};
