const mongoose = require("mongoose");
const ROLES = require("../../shared/constants/roles");

const citizenSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    taluka: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    area: {
      type: String,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    department: {
      type: String,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CITIZEN,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Citizen", citizenSchema);