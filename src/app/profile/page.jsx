"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    mobileNumber: "",
  });

  const [passwordFormData, setPasswordFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (!res.ok || !data.authenticated) {
          router.push("/login");
          return;
        }

        setUser(data.user);
        setEditFormData({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          address: data.user.address || "",
          mobileNumber: data.user.mobileNumber || "",
        });
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ form: data.error });
        }
        return;
      }

      setSuccessMessage("Profile updated successfully!");
      setUser((prev) => ({
        ...prev,
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        address: editFormData.address,
        mobileNumber: editFormData.mobileNumber,
      }));
      setEditing(false);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrors({ form: "Failed to update profile" });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "change-password",
          ...passwordFormData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ form: data.error });
        }
        return;
      }

      setSuccessMessage("Password changed successfully!");
      setPasswordFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setChangingPassword(false);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error changing password:", error);
      setErrors({ form: "Failed to change password" });
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    )) {
      return;
    }

    setIsDeleting(true);
    setErrors({});

    try {
      const res = await fetch("/api/profile", {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ form: data.error });
        setIsDeleting(false);
        return;
      }

      setSuccessMessage("Account deleted successfully. Redirecting...");
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Error deleting account:", error);
      setErrors({ form: "Failed to delete account" });
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return <main style={styles.container}>Loading...</main>;
  }

  if (!user) {
    return <main style={styles.container}>Redirecting to login...</main>;
  }

  return (
    <main style={styles.container}>
      <div style={styles.profileWrapper}>
        <div style={styles.header}>
          <h1 style={styles.heading}>My Profile</h1>
          <p style={styles.userRole}>Role: {user.role}</p>
        </div>

        {successMessage && (
          <div style={styles.successMessage}>{successMessage}</div>
        )}
        {errors.form && <div style={styles.errorMessage}>{errors.form}</div>}

        <div style={styles.sectionsContainer}>
          {/* User Information Section */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>User Information</h2>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>First Name:</span>
                <span style={styles.infoValue}>{user.firstName}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Last Name:</span>
                <span style={styles.infoValue}>{user.lastName}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Email:</span>
                <span style={styles.infoValue}>{user.email}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Address:</span>
                <span style={styles.infoValue}>{user.address || "N/A"}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Mobile Number:</span>
                <span style={styles.infoValue}>{user.mobileNumber || "N/A"}</span>
              </div>
            </div>
          </section>

          {/* Edit Information Section */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Edit Information</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  style={styles.actionButton}
                >
                  Edit
                </button>
              )}
            </div>

            {editing && (
              <form onSubmit={handleUpdateProfile} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={editFormData.firstName}
                    onChange={handleEditChange}
                    style={{
                      ...styles.input,
                      ...(errors.firstName ? styles.inputError : {}),
                    }}
                  />
                  {errors.firstName && (
                    <span style={styles.fieldError}>{errors.firstName}</span>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={editFormData.lastName}
                    onChange={handleEditChange}
                    style={{
                      ...styles.input,
                      ...(errors.lastName ? styles.inputError : {}),
                    }}
                  />
                  {errors.lastName && (
                    <span style={styles.fieldError}>{errors.lastName}</span>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Address</label>
                  <textarea
                    name="address"
                    value={editFormData.address}
                    onChange={handleEditChange}
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

                <div style={styles.formGroup}>
                  <label style={styles.label}>Mobile Number</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={editFormData.mobileNumber}
                    onChange={handleEditChange}
                    style={{
                      ...styles.input,
                      ...(errors.mobileNumber ? styles.inputError : {}),
                    }}
                  />
                  {errors.mobileNumber && (
                    <span style={styles.fieldError}>{errors.mobileNumber}</span>
                  )}
                </div>

                <div style={styles.buttonGroup}>
                  <button type="submit" style={styles.saveButton}>
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Change Password Section */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Change Password</h2>
              {!changingPassword && (
                <button
                  onClick={() => setChangingPassword(true)}
                  style={styles.actionButton}
                >
                  Change
                </button>
              )}
            </div>

            {changingPassword && (
              <form onSubmit={handleChangePassword} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Current Password</label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={passwordFormData.oldPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    style={{
                      ...styles.input,
                      ...(errors.oldPassword ? styles.inputError : {}),
                    }}
                  />
                  {errors.oldPassword && (
                    <span style={styles.fieldError}>{errors.oldPassword}</span>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordFormData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    style={{
                      ...styles.input,
                      ...(errors.newPassword ? styles.inputError : {}),
                    }}
                  />
                  {errors.newPassword && (
                    <span style={styles.fieldError}>{errors.newPassword}</span>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordFormData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    style={{
                      ...styles.input,
                      ...(errors.confirmPassword ? styles.inputError : {}),
                    }}
                  />
                  {errors.confirmPassword && (
                    <span style={styles.fieldError}>
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>

                <div style={styles.buttonGroup}>
                  <button type="submit" style={styles.saveButton}>
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setChangingPassword(false)}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Delete Account Section - Only for Buyers */}
          {user.role === "Buyer" && (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Delete Account</h2>
              <p style={styles.warningText}>
                Deleting your account will permanently remove all your data and
                cannot be undone.
              </p>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                style={{
                  ...styles.deleteButton,
                  ...(isDeleting ? styles.deleteButtonDisabled : {}),
                }}
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </button>
            </section>
          )}
        </div>

        <div style={styles.footer}>
          <Link href="/" style={styles.backLink}>
            ← Back to Home
          </Link>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    padding: "20px",
  },
  profileWrapper: {
    maxWidth: "800px",
    margin: "0 auto",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    padding: "40px",
  },
  header: {
    marginBottom: "30px",
    borderBottom: "2px solid #eee",
    paddingBottom: "20px",
  },
  heading: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#333",
    margin: "0 0 8px 0",
  },
  userRole: {
    fontSize: "14px",
    color: "#666",
    margin: "0",
  },
  sectionsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
    margin: "30px 0",
  },
  section: {
    border: "1px solid #eee",
    borderRadius: "6px",
    padding: "20px",
    backgroundColor: "#fafafa",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#333",
    margin: "0",
  },
  actionButton: {
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: "600",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "16px",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  infoLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: "14px",
    color: "#333",
    wordBreak: "break-word",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
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
  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
  },
  saveButton: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    flex: 1,
  },
  cancelButton: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    flex: 1,
  },
  deleteButton: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    backgroundColor: "#d32f2f",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  deleteButtonDisabled: {
    backgroundColor: "#ccc",
    cursor: "not-allowed",
  },
  warningText: {
    color: "#d32f2f",
    fontSize: "13px",
    marginBottom: "16px",
    lineHeight: "1.5",
  },
  successMessage: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    padding: "12px",
    borderRadius: "4px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  errorMessage: {
    backgroundColor: "#ffebee",
    color: "#d32f2f",
    padding: "12px",
    borderRadius: "4px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  footer: {
    marginTop: "40px",
    paddingTop: "20px",
    borderTop: "2px solid #eee",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backLink: {
    fontSize: "14px",
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "600",
  },
  logoutButton: {
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: "600",
    backgroundColor: "#d32f2f",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
