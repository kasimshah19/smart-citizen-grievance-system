const Citizen = require("./citizen.model");
const Otp = require("./otp.model");
const { validateRegistration } = require("./auth.validation");
const { hashPassword, comparePassword } = require("./password.service");
const { createAndSendOtp, verifyOtp } = require("./otp.service");
const { generateAccessToken } = require("./token.service");

// STEP 1: Send OTP for registration (before account is created)
const sendRegistrationOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: "A valid 10-digit phone number is required" });
    }

    const existingCitizen = await Citizen.findOne({ phone });
    if (existingCitizen) {
      return res.status(400).json({ success: false, message: "This phone number is already registered" });
    }

    const result = await createAndSendOtp(phone, "registration");
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// STEP 2: Verify OTP for registration
const verifyRegistrationOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: "Phone and OTP are required" });
    }

    const result = await verifyOtp(phone, "registration", otp);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// STEP 3: Complete registration (only after phone is verified)
const register = async (req, res) => {
  try {
    const { isValid, errors } = validateRegistration(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, errors });
    }

    const { fullName, email, phone, district, taluka, city, area, password } = req.body;

    const verifiedOtp = await Otp.findOne({
      phone,
      purpose: "registration",
      verified: true,
    }).sort({ createdAt: -1 });

    if (!verifiedOtp) {
      return res.status(400).json({
        success: false,
        message: "Phone number is not verified. Please verify your phone number first.",
      });
    }

    const existingEmail = await Citizen.findOne({ email });
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
      email,
      phone,
      district,
      taluka,
      city,
      area,
      passwordHash,
      phoneVerified: true,
      role: "Citizen",
    });

    await Otp.deleteMany({ phone, purpose: "registration" });

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

    const citizen = await Citizen.findOne({ email });

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

    const result = await createAndSendOtp(citizen.phone, "login");

    return res.status(200).json({
      success: true,
      message: result.message,
      phone: citizen.phone,
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

    const citizen = await Citizen.findOne({ email });
    if (!citizen) {
      return res.status(401).json({ success: false, message: "Invalid request" });
    }

    await verifyOtp(citizen.phone, "login", otp);

    const token = generateAccessToken(citizen._id);

    await Otp.deleteMany({ phone: citizen.phone, purpose: "login" });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      citizen: {
        id: citizen._id,
        fullName: citizen.fullName,
        email: citizen.email,
        phone: citizen.phone,
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

module.exports = {
  sendRegistrationOtp,
  verifyRegistrationOtp,
  register,
  loginSendOtp,
  loginVerifyOtp,
  getMe,
  updateProfile,
  changePassword,
};