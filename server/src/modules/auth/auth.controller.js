const Citizen = require("./citizen.model");
const Otp = require("./otp.model");
const { validateRegistration } = require("./auth.validation");
const { hashPassword, comparePassword } = require("./password.service");
const { createAndSendOtp, verifyOtp } = require("./otp.service");
const { generateAccessToken } = require("./token.service");

// STEP 1: Send OTP for registration (before account is created)
const sendRegistrationOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "A valid email address is required" });
    }

    const lowerEmail = email.trim().toLowerCase();
    const existingCitizen = await Citizen.findOne({ email: lowerEmail });
    if (existingCitizen) {
      return res.status(400).json({ success: false, message: "This email is already registered" });
    }

    const result = await createAndSendOtp(lowerEmail, "registration");
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// STEP 2: Verify OTP for registration
const verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const result = await verifyOtp(email.trim().toLowerCase(), "registration", otp);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// STEP 3: Complete registration (only after email is verified)
const register = async (req, res) => {
  try {
    const { isValid, errors } = validateRegistration(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, errors });
    }

    const { fullName, email, phone, district, taluka, city, area, password } = req.body;
    const lowerEmail = email.trim().toLowerCase();

    const verifiedOtp = await Otp.findOne({
      email: lowerEmail,
      purpose: "registration",
      verified: true,
    }).sort({ createdAt: -1 });

    if (!verifiedOtp) {
      return res.status(400).json({
        success: false,
        message: "Email is not verified. Please verify your email first.",
      });
    }

    const existingEmail = await Citizen.findOne({ email: lowerEmail });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "This email is already registered" });
    }

    const existingPhone = await Citizen.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ success: false, message: "This phone number is already registered" });
    }

    const passwordHash = await hashPassword(password);

    const citizen = await Citizen.create({
      fullName,
      email: lowerEmail,
      phone,
      district,
      taluka,
      city,
      area,
      passwordHash,
      emailVerified: true,
      role: "Citizen",
    });

    await Otp.deleteMany({ email: lowerEmail, purpose: "registration" });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      citizen: {
        id: citizen._id,
        fullName: citizen.fullName,
        email: citizen.email,
        phone: citizen.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// STEP 1: Verify email & password, then send OTP for login
const loginSendOtp = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const lowerEmail = email.trim().toLowerCase();
    const citizen = await Citizen.findOne({ email: lowerEmail });

    if (!citizen) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await comparePassword(password, citizen.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (citizen.active === false) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated. Please contact support.",
      });
    }

    const result = await createAndSendOtp(citizen.email, "login");

    return res.status(200).json({
      success: true,
      message: result.message,
      email: citizen.email,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// STEP 2: Verify login OTP and issue JWT
const loginVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const lowerEmail = email.trim().toLowerCase();
    const citizen = await Citizen.findOne({ email: lowerEmail });
    if (!citizen) {
      return res.status(401).json({ success: false, message: "Invalid request" });
    }

    await verifyOtp(citizen.email, "login", otp.trim());

    const token = generateAccessToken(citizen._id);

    await Otp.deleteMany({ email: citizen.email, purpose: "login" });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      citizen: {
        id: citizen._id,
        fullName: citizen.fullName,
        email: citizen.email,
        phone: citizen.phone,
        role: citizen.role,
        department: citizen.department,
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Get the currently logged-in citizen's profile
const getMe = async (req, res) => {
  try {
    return res.status(200).json({ success: true, citizen: req.citizen });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Update the logged-in citizen's profile (excludes email, phone, password)
const updateProfile = async (req, res) => {
  try {
    const { fullName, district, taluka, city, area } = req.body;

    const updates = {};
    if (fullName !== undefined) updates.fullName = fullName.trim();
    if (district !== undefined) updates.district = district.trim();
    if (taluka !== undefined) updates.taluka = taluka.trim();
    if (city !== undefined) updates.city = city.trim();
    if (area !== undefined) updates.area = area.trim();

    if (updates.fullName === "") {
      return res.status(400).json({ success: false, message: "Full name cannot be empty" });
    }

    const citizen = await Citizen.findByIdAndUpdate(req.citizen._id, updates, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      citizen,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// Change the logged-in citizen's password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new password are required" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      });
    }

    const citizen = await Citizen.findById(req.citizen._id);

    const isMatch = await comparePassword(currentPassword, citizen.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    citizen.passwordHash = await hashPassword(newPassword);
    await citizen.save();

    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// Update the logged-in citizen's notification preferences
const updateNotificationPreferences = async (req, res) => {
  try {
    const { smsUpdates, emailUpdates, statusChanges } = req.body;

    const updates = {};
    if (smsUpdates !== undefined) updates["notificationPreferences.smsUpdates"] = smsUpdates;
    if (emailUpdates !== undefined) updates["notificationPreferences.emailUpdates"] = emailUpdates;
    if (statusChanges !== undefined) updates["notificationPreferences.statusChanges"] = statusChanges;

    const citizen = await Citizen.findByIdAndUpdate(req.citizen._id, updates, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");

    return res.status(200).json({
      success: true,
      message: "Notification preferences updated",
      citizen,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// FORGOT PASSWORD — STEP 1: Look up the account by email, send OTP to its registered email
const forgotPasswordSendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const lowerEmail = email.trim().toLowerCase();
    const citizen = await Citizen.findOne({ email: lowerEmail });
    if (!citizen) {
      return res.status(404).json({ success: false, message: "No account found with this email" });
    }

    const result = await createAndSendOtp(citizen.email, "forgot-password");

    const [user, domain] = citizen.email.split("@");
    const maskedEmail = user.length > 2
      ? `${user.charAt(0)}****${user.charAt(user.length - 1)}@${domain}`
      : `*@${domain}`;

    return res.status(200).json({ success: true, message: result.message, maskedPhone: maskedEmail });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ success: false, message: error.message || "Something went wrong" });
  }
};

// FORGOT PASSWORD — STEP 2: Verify the OTP and set the new password in one step
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email?.trim() || !otp?.trim() || !newPassword) {
      return res.status(400).json({ success: false, message: "Email, OTP, and new password are all required" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const lowerEmail = email.trim().toLowerCase();
    const citizen = await Citizen.findOne({ email: lowerEmail });
    if (!citizen) {
      return res.status(404).json({ success: false, message: "No account found with this email" });
    }

    await verifyOtp(citizen.email, "forgot-password", otp.trim());

    citizen.passwordHash = await hashPassword(newPassword);
    await citizen.save();

    await Otp.deleteMany({ email: citizen.email, purpose: "forgot-password" });

    return res.status(200).json({ success: true, message: "Password reset successfully. You can now log in." });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Something went wrong" });
  }
};

module.exports = {
  sendRegistrationOtp,
  verifyRegistrationOtp,
  register,
  loginSendOtp,
  loginVerifyOtp,
  getMe,
  updateProfile,
  changePassword,
  updateNotificationPreferences,
  forgotPasswordSendOtp,
  resetPassword,
};