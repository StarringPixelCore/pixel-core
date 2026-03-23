// Form validation utilities for both frontend and backend

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return "";
};

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  return "";
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return "Confirm Password is required";
  if (password !== confirmPassword) return "Passwords do not match";
  return "";
};

export const validateFirstName = (firstName) => {
  if (!firstName) return "First Name is required";
  const trimmed = firstName.trim();
  if (trimmed.length < 2) return "First Name must be at least 2 characters";
  if (!/^[A-Z]/.test(trimmed)) return "First Name must start with a capital letter";
  if (/\d/.test(trimmed)) return "First Name cannot contain numbers";
  return "";
};

export const validateLastName = (lastName) => {
  if (!lastName) return "Last Name is required";
  const trimmed = lastName.trim();
  if (trimmed.length < 2) return "Last Name must be at least 2 characters";
  if (!/^[A-Z]/.test(trimmed)) return "Last Name must start with a capital letter";
  if (/\d/.test(trimmed)) return "Last Name cannot contain numbers";
  return "";
};

export const validateAddress = (address) => {
  if (!address) return "Address is required";
  if (address.trim().length < 5) return "Address must be at least 5 characters";
  return "";
};

export const validateMobileNumber = (mobileNumber) => {
  const phoneRegex = /^[0-9]{10,15}$/;
  if (!mobileNumber) return "Mobile Number is required";
  if (!phoneRegex.test(mobileNumber.replace(/\D/g, ""))) 
    return "Please enter a valid mobile number";
  return "";
};

// Validates all register fields
export const validateRegisterForm = (formData) => {
  const errors = {};

  errors.email = validateEmail(formData.email);
  errors.firstName = validateFirstName(formData.firstName);
  errors.lastName = validateLastName(formData.lastName);
  errors.password = validatePassword(formData.password);
  errors.confirmPassword = validateConfirmPassword(
    formData.password,
    formData.confirmPassword
  );
  errors.address = validateAddress(formData.address);
  errors.mobileNumber = validateMobileNumber(formData.mobileNumber);

  // Remove empty error messages
  Object.keys(errors).forEach((key) => !errors[key] && delete errors[key]);

  return errors;
};

// Validates login fields
export const validateLoginForm = (formData) => {
  const errors = {};

  errors.email = validateEmail(formData.email);
  errors.password = validatePassword(formData.password);

  Object.keys(errors).forEach((key) => !errors[key] && delete errors[key]);

  return errors;
};

export const validatePasswordChange = (oldPassword, newPassword, confirmPassword) => {
  const errors = {};

  if (!oldPassword) errors.oldPassword = "Current Password is required";
  errors.newPassword = validatePassword(newPassword);
  errors.confirmPassword = validateConfirmPassword(newPassword, confirmPassword);

  Object.keys(errors).forEach((key) => !errors[key] && delete errors[key]);

  return errors;
};

export const validateProductName = (name) => {
  if (!name) return "Product name is required";
  const trimmed = name.trim();
  if (trimmed.length < 2) return "Product name must be at least 2 characters";
  if (trimmed.length > 100) return "Product name must be less than 100 characters";
  if (!/^[A-Z]/.test(trimmed)) return "Product name must start with a capital letter";
  return "";
};

export const validateProductDescription = (description) => {
  if (!description) return ""; // optional
  const trimmed = description.trim();
  if (trimmed.length > 500) return "Description must be less than 500 characters";
  return "";
};

export const validateProductPrice = (price) => {
  if (price === undefined || price === null || price === "") return "Price is required";
  const num = Number(price);
  if (isNaN(num) || !isFinite(num)) return "Price must be a valid number";
  if (num <= 0) return "Price must be greater than 0";
  if (num > 10000) return "Price must be less than or equal to 10000";
  return "";
};

export const validateProductBadge = (badge) => {
  if (!badge) return ""; // optional
  const trimmed = badge.trim();
  if (trimmed.length > 50) return "Badge must be less than 50 characters";
  return "";
};

export const validateProductCategory = (category) => {
  if (!category) return ""; // optional
  const trimmed = category.trim();
  if (trimmed.length < 2) return "Category must be at least 2 characters";
  if (trimmed.length > 50) return "Category must be less than 50 characters";
  return "";
};

export const validateProductImageUrl = (imageUrl) => {
  if (!imageUrl) return ""; // optional
  const trimmed = imageUrl.trim();
  if (trimmed.length > 200) return "Image URL must be less than 200 characters";
  try {
    new URL(trimmed);
  } catch {
    return "Image URL must be a valid URL";
  }
  return "";
};

export const validateProductForm = (formData) => {
  const errors = {};

  errors.name = validateProductName(formData.name);
  errors.description = validateProductDescription(formData.description);
  errors.price = validateProductPrice(formData.price);
  errors.badge = validateProductBadge(formData.badge);
  errors.category = validateProductCategory(formData.category);
  errors.image_url = validateProductImageUrl(formData.image_url);

  Object.keys(errors).forEach((key) => !errors[key] && delete errors[key]);

  return errors;
};
