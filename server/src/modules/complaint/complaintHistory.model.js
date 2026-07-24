const mongoose = require("mongoose");

const complaintHistorySchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved", "Closed"],
      required: true,
    },
    action: {
      type: String,
      required: true, // e.g. "Complaint Submitted", "Assigned to Department", "Status Updated"
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "performerRole",
    },
    performerRole: {
      type: String,
      enum: ["Citizen", "Admin", "Employee"],
      required: true,
    },
    department: {
      type: String,
      default: null,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// History records are immutable — never updated, only ever inserted
complaintHistorySchema.index({ complaint: 1, createdAt: 1 });

module.exports = mongoose.model("ComplaintHistory", complaintHistorySchema);