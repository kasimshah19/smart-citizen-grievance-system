const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth.middleware");
const {
  sendRegistrationOtp,
  verifyRegistrationOtp,
  register,
  loginSendOtp,
  loginVerifyOtp,
  getMe,
  updateProfile,
  changePassword,
} = require("./auth.controller");

router.post("/send-otp", sendRegistrationOtp);
router.post("/verify-otp", verifyRegistrationOtp);
router.post("/register", register);

router.post("/login/send-otp", loginSendOtp);
router.post("/login/verify-otp", loginVerifyOtp);

router.get("/me", protect, getMe);
router.put("/me", protect, updateProfile);
router.put("/change-password", protect, changePassword);

module.exports = router;