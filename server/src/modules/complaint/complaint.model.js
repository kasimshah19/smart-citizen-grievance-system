const mongoose = require("mongoose");

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
      enum: ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved", "Closed"],
      default: "Submitted",
    },
    department: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Complaint", complaintSchema);