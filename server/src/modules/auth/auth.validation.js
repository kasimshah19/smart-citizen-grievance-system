const validateRegistration = (data) => {
  const errors = {};

  if (!data.fullName || data.fullName.trim().length === 0) {
    errors.fullName = "Full name is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.email = "A valid email address is required";
  }

  const phoneRegex = /^[0-9]{10}$/;
  if (!data.phone || !phoneRegex.test(data.phone)) {
    errors.phone = "Phone number must be exactly 10 digits";
  }

  if (!data.district) errors.district = "District is required";
  if (!data.taluka) errors.taluka = "Taluka is required";
  if (!data.city) errors.city = "City is required";
  if (!data.area) errors.area = "Area is required";

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=]).{8,}$/;
  if (!data.password || !passwordRegex.test(data.password)) {
    errors.password =
      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

module.exports = { validateRegistration };