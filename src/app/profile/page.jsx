"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./profile.module.css";

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
    return <main className={styles.container}>Loading...</main>;
  }

  if (!user) {
    return <main className={styles.container}>Redirecting to login...</main>;
  }

  return (
    <main className={styles.container}>
      <div className={styles.profileWrapper}>
        <div className={styles.header}>
          <h1 className={styles.heading}>{user.firstName} {user.lastName}</h1>
          {user.role === "Buyer" && (
            <p className={styles.ordersLinkWrap}>
              <Link href="/orders" className={styles.ordersLink}>
                My Orders →
              </Link>
            </p>
          )}
          {user.role === "Seller" && (
            <p className={styles.ordersLinkWrap}>
              <Link href="/products" className={styles.ordersLink}>
                My Products →
              </Link>
            </p>
          )}
        </div>

        {successMessage && (
          <div className={styles.successMessage}>{successMessage}</div>
        )}
        {errors.form && <div className={styles.errorMessage}>{errors.form}</div>}

        <div className={styles.sectionsContainer}>
          {/* User Information Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>User Information</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>First Name:</span>
                <span className={styles.infoValue}>{user.firstName}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Last Name:</span>
                <span className={styles.infoValue}>{user.lastName}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Email:</span>
                <span className={styles.infoValue}>{user.email}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Address:</span>
                <span className={styles.infoValue}>{user.address || "N/A"}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Mobile Number:</span>
                <span className={styles.infoValue}>{user.mobileNumber || "N/A"}</span>
              </div>
            </div>
          </section>

          {/* Edit Information Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Edit Information</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className={styles.actionButton}
                >
                  Edit
                </button>
              )}
            </div>

            {editing && (
              <form onSubmit={handleUpdateProfile} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={editFormData.firstName}
                    onChange={handleEditChange}
                    className={`${styles.input} ${errors.firstName ? styles.inputError : ""}`}
                  />
                  {errors.firstName && (
                    <span className={styles.fieldError}>{errors.firstName}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={editFormData.lastName}
                    onChange={handleEditChange}
                    className={`${styles.input} ${errors.lastName ? styles.inputError : ""}`}
                  />
                  {errors.lastName && (
                    <span className={styles.fieldError}>{errors.lastName}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Address</label>
                  <textarea
                    name="address"
                    value={editFormData.address}
                    onChange={handleEditChange}
                    className={`${styles.input} ${errors.address ? styles.inputError : ""}`}
                    style={{ minHeight: "100px", fontFamily: "inherit" }}
                  />
                  {errors.address && (
                    <span className={styles.fieldError}>{errors.address}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Mobile Number</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={editFormData.mobileNumber}
                    onChange={handleEditChange}
                    className={`${styles.input} ${errors.mobileNumber ? styles.inputError : ""}`}
                  />
                  {errors.mobileNumber && (
                    <span className={styles.fieldError}>{errors.mobileNumber}</span>
                  )}
                </div>

                <div className={styles.buttonGroup}>
                  <button type="submit" className={styles.saveButton}>
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Change Password Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Change Password</h2>
              {!changingPassword && (
                <button
                  onClick={() => setChangingPassword(true)}
                  className={styles.actionButton}
                >
                  Change
                </button>
              )}
            </div>

            {changingPassword && (
              <form onSubmit={handleChangePassword} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Current Password</label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={passwordFormData.oldPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className={`${styles.input} ${errors.oldPassword ? styles.inputError : ""}`}
                  />
                  {errors.oldPassword && (
                    <span className={styles.fieldError}>{errors.oldPassword}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordFormData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className={`${styles.input} ${errors.newPassword ? styles.inputError : ""}`}
                  />
                  {errors.newPassword && (
                    <span className={styles.fieldError}>{errors.newPassword}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordFormData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ""}`}
                  />
                  {errors.confirmPassword && (
                    <span className={styles.fieldError}>
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>

                <div className={styles.buttonGroup}>
                  <button type="submit" className={styles.saveButton}>
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setChangingPassword(false)}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Delete Account Section - Only for Buyers */}
          {user.role === "Buyer" && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Delete Account</h2>
              <p className={styles.warningText}>
                Deleting your account will permanently remove all your data and
                cannot be undone.
              </p>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className={`${styles.deleteButton} ${isDeleting ? styles.deleteButtonDisabled : ""}`}
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </button>
            </section>
          )}
        </div>

        <div className={styles.footer}>
          <Link href="/" className={styles.backLink}>
            ← Back to Home
          </Link>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}