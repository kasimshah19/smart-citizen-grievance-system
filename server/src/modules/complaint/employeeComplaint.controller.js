const Complaint = require("./complaint.model");
const ComplaintHistory = require("./complaintHistory.model");
const { COMPLAINT_STATUS } = require("../../shared/constants/complaintStatus");

// Statuses an employee is allowed to set (narrower than the full admin list)
const EMPLOYEE_ALLOWED_STATUSES = [
  COMPLAINT_STATUS.ACCEPTED,
  COMPLAINT_STATUS.IN_PROGRESS,
  COMPLAINT_STATUS.RESOLVED,
];

// List complaints assigned to the logged-in employee
const getMyAssignedComplaints = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = { assignedEmployee: req.citizen._id };
    if (status) filter.status = status;

    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .populate("citizen", "fullName email phone");

    return res.status(200).json({ success: true, complaints });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Get one assigned complaint's full detail + history (must belong to this employee)
const getAssignedComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      assignedEmployee: req.citizen._id,
    }).populate("citizen", "fullName email phone");

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found or not assigned to you" });
    }

    const history = await ComplaintHistory.find({ complaint: req.params.id })
      .sort({ createdAt: 1 })
      .populate("performedBy", "fullName");

    return res.status(200).json({ success: true, complaint, history });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Employee updates the status of their own assigned complaint (limited status options)
const updateAssignedComplaintStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    if (!status || !EMPLOYEE_ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${EMPLOYEE_ALLOWED_STATUSES.join(", ")}`,
      });
    }

    const complaint = await Complaint.findOne({
      _id: req.params.id,
      assignedEmployee: req.citizen._id,
    });

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found or not assigned to you" });
    }

    complaint.status = status;
    if (remarks !== undefined) complaint.remarks = remarks;
    await complaint.save();

    await ComplaintHistory.create({
      complaint: complaint._id,
      status,
      action: `Status Updated to ${status}`,
      performedBy: req.citizen._id,
      performerRole: "Employee",
      remarks: remarks || "",
    });

    return res.status(200).json({ success: true, message: "Status updated successfully", complaint });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

module.exports = { getMyAssignedComplaints, getAssignedComplaintById, updateAssignedComplaintStatus };