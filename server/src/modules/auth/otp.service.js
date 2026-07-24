const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Otp = require("./otp.model");
const { sendSMS } = require("./sms.service");

const OTP_EXPIRY_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 30;
const MAX_ATTEMPTS = 5;

const generateOtpCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const createAndSendOtp = async (phone, purpose) => {
  const existingOtp = await Otp.findOne({ phone, purpose, verified: false }).sort({ createdAt: -1 });

  if (existingOtp) {
    const secondsSinceLastSent = (Date.now() - existingOtp.lastSentAt) / 1000;
    if (secondsSinceLastSent < RESEND_COOLDOWN_SECONDS) {
      const waitTime = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLastSent);
      throw new Error(`Please wait ${waitTime} seconds before requesting a new OTP`);
    }
  }

  const otpCode = generateOtpCode();
  const otpHash = await bcrypt.hash(otpCode, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await Otp.deleteMany({ phone, purpose, verified: false });

  await Otp.create({
    phone,
    otpHash,
    purpose,
    expiresAt,
    lastSentAt: new Date(),
  });

  await sendSMS(phone, `Your Smart Citizen Grievance System verification code is: ${otpCode}. It will expire in ${OTP_EXPIRY_MINUTES} minutes.`);

  return { success: true, message: "OTP sent successfully" };
};

const verifyOtp = async (phone, purpose, enteredOtp) => {
  const otpRecord = await Otp.findOne({ phone, purpose, verified: false }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new Error("No OTP found. Please request a new OTP.");
  }

  if (otpRecord.expiresAt < new Date()) {
    throw new Error("OTP has expired. Please request a new OTP.");
  }

  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    throw new Error("Maximum verification attempts exceeded. Please request a new OTP.");
  }

  const isMatch = await bcrypt.compare(enteredOtp, otpRecord.otpHash);

  if (!isMatch) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new Error("Invalid OTP");
  }

  otpRecord.verified = true;
  await otpRecord.save();

  return { success: true, message: "OTP verified successfully" };
};

module.exports = { createAndSendOtp, verifyOtp };