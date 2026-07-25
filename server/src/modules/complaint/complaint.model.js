const mongoose = require("mongoose");
const { COMPLAINT_STATUS, COMPLAINT_STATUS_LIST } = require("../../shared/constants/complaintStatus");

const complaintSchema = new mongoose.Schema(
  {
    complaintNumber: {
      type: String,
      required: true,
      unique: true,
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
      required: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Road & Potholes",
        "Garbage Collection",
        "Street Light",
        "Water Leakage",
        "Open Drainage",
        "Illegal Dumping",
        "Other",
      ],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    location: {
      address: { type: String, required: [true, "Location address is required"] },
      latitude: { type: Number },
      longitude: { type: Number },
    },
    photoUrl: {
      type: String,
      default: null,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: COMPLAINT_STATUS_LIST,
      default: COMPLAINT_STATUS.SUBMITTED,
    },
    department: {
      type: String,
      default: null,
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
      default: null,
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Complaint", complaintSchema);