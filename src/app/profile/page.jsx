"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./profile.module.css";
import {
  notifyAuthChanged,
  notifyCartUpdated,
  showToast,
} from "@/utils/notifications";

function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {actionLabel ? (
        <button onClick={onAction} className={styles.actionButton}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
}) {
  return (
    <div className={styles.formGroup}>
      <label className={styles.label}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${styles.input} ${error ? styles.inputError : ""}`}
      />
      {error ? <span className={styles.fieldError}>{error}</span> : null}
    </div>
  );
}

function TextareaField({ label, name, value, onChange, error, style }) {
  return (
    <div className={styles.formGroup}>
      <label className={styles.label}>{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        className={`${styles.input} ${error ? styles.inputError : ""}`}
        style={style}
      />
      {error ? <span className={styles.fieldError}>{error}</span> : null}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  const updateFieldValue = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => ({
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

  const handleEditChange = updateFieldValue(setEditFormData);
  const handlePasswordChange = updateFieldValue(setPasswordFormData);

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

  const openDeleteModal = () => {
    setErrors((prev) => ({ ...prev, form: "" }));
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
  };

  useEffect(() => {
    if (!isDeleteModalOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeDeleteModal();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isDeleteModalOpen, isDeleting]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      notifyAuthChanged();
      notifyCartUpdated();
      showToast({
        title: "Logged out",
        message: "Logged out successfully",
        type: "success",
      });
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPicture(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/profile/upload-picture", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ picture: data.error || "Failed to upload profile picture" });
        setUploadingPicture(false);
        return;
      }

      setUser((prev) => ({
        ...prev,
        profilePicture: data.profilePicture,
      }));

      setSuccessMessage("Profile picture updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error uploading picture:", error);
      setErrors({ picture: "Failed to upload profile picture" });
    } finally {
      setUploadingPicture(false);
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
        <div className={styles.topNavigation}>
          <Link href="/" className={styles.backLink} >
            ← Back to Home
          </Link>
        </div>

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.heading}>{user.firstName} {user.lastName}</h1>
            {user.role === "Buyer" && (
              <p className={styles.ordersLinkWrap}>
                <Link href="/orders" className={styles.ordersLink}>
                  <span className={styles.linkIcon} aria-hidden="true">📦</span>
                  <span>My Orders</span>
                </Link>
              </p>
            )}
            {user.role === "Seller" && (
              <div className={styles.sellerLinks}>
                <Link href="/products" className={styles.ordersLink}>
                  <span className={styles.linkIcon} aria-hidden="true">🛍️</span>
                  <span>My Products</span>
                </Link>
                <Link href="/admin/orders" className={styles.ordersLink}>
                  <span className={styles.linkIcon} aria-hidden="true">🧾</span>
                  <span>Manage Orders</span>
                </Link>
                <Link href="/admin/inventory" className={styles.ordersLink}>
                  <span className={styles.linkIcon} aria-hidden="true">📋</span>
                  <span>Manage Inventory</span>
                </Link>
                <Link href="/admin/reports" className={styles.ordersLink}>
                  <span className={styles.linkIcon} aria-hidden="true">📊</span>
                  <span>Reports</span>
                </Link>
              </div>
            )}
          </div>

          {/* Profile Picture Section */}
          <div className={styles.profilePictureSection}>
            <img
              src={user.profilePicture ? user.profilePicture : "/images/default.jpg"}
              alt={`${user.firstName} ${user.lastName}`}
              className={styles.profilePicture}
            />
            <div className={styles.uploadPictureContainer}>
              <label htmlFor="picture-upload" className={styles.uploadButton}>
                {uploadingPicture ? "Uploading..." : "✏️"}
              </label>
              <input
                id="picture-upload"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                disabled={uploadingPicture}
                style={{ display: "none" }}
              />
            </div>
          </div>
        </div>

        {successMessage && (
          <div className={styles.successMessage}>{successMessage}</div>
        )}
        {errors.form && <div className={styles.errorMessage}>{errors.form}</div>}
        {errors.picture && <div className={styles.errorMessage}>{errors.picture}</div>}

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
            <SectionHeader
              title="Edit Information"
              actionLabel={!editing ? "Edit" : null}
              onAction={() => setEditing(true)}
            />

            {editing && (
              <form onSubmit={handleUpdateProfile} className={styles.form}>
                <FormField
                  label="First Name"
                  name="firstName"
                  value={editFormData.firstName}
                  onChange={handleEditChange}
                  error={errors.firstName}
                />
                <FormField
                  label="Last Name"
                  name="lastName"
                  value={editFormData.lastName}
                  onChange={handleEditChange}
                  error={errors.lastName}
                />
                <TextareaField
                  label="Address"
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditChange}
                  error={errors.address}
                  style={{ minHeight: "100px", fontFamily: "inherit" }}
                />
                <FormField
                  label="Mobile Number"
                  name="mobileNumber"
                  type="tel"
                  value={editFormData.mobileNumber}
                  onChange={handleEditChange}
                  error={errors.mobileNumber}
                />

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
            <SectionHeader
              title="Change Password"
              actionLabel={!changingPassword ? "Change" : null}
              onAction={() => setChangingPassword(true)}
            />

            {changingPassword && (
              <form onSubmit={handleChangePassword} className={styles.form}>
                <FormField
                  label="Current Password"
                  name="oldPassword"
                  type="password"
                  value={passwordFormData.oldPassword}
                  onChange={handlePasswordChange}
                  error={errors.oldPassword}
                  placeholder="••••••••"
                />
                <FormField
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={passwordFormData.newPassword}
                  onChange={handlePasswordChange}
                  error={errors.newPassword}
                  placeholder="••••••••"
                />
                <FormField
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={passwordFormData.confirmPassword}
                  onChange={handlePasswordChange}
                  error={errors.confirmPassword}
                  placeholder="••••••••"
                />

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
                onClick={openDeleteModal}
                disabled={isDeleting}
                className={`${styles.deleteButton} ${isDeleting ? styles.deleteButtonDisabled : ""}`}
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </button>
            </section>
          )}
        </div>

        <div className={styles.footer}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      {user?.role === "Buyer" && isDeleteModalOpen && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeDeleteModal();
          }}
          role="presentation"
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            aria-describedby="delete-account-description"
          >
            <div className={styles.modalIconWrapper}>
              <span className={styles.modalIcon} aria-hidden="true">
                !
              </span>
            </div>
            <h3 className={styles.modalTitle} id="delete-account-title">
              Are you sure?
            </h3>
            <p className={styles.modalDescription} id="delete-account-description">
              This action can’t be undone. Please confirm if you want to proceed.
            </p>
            <div className={styles.modalButtons}>
              <button
                type="button"
                className={styles.modalCancelButton}
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalConfirmButton}
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}