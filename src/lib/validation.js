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
  if (firstName.trim().length < 2) return "First Name must be at least 2 characters";
  return "";
};

export const validateLastName = (lastName) => {
  if (!lastName) return "Last Name is required";
  if (lastName.trim().length < 2) return "Last Name must be at least 2 characters";
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
