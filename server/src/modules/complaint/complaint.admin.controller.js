const Complaint = require("./complaint.model");
const ComplaintHistory = require("./complaintHistory.model");
const Notification = require("../notification/notification.model");
const { COMPLAINT_STATUS_LIST } = require("../../shared/constants/complaintStatus");
const { notifyCitizen, broadcastGlobal } = require("../../socket");
const { isComplaintOverdue } = require("../../shared/utils/sla");
const { sendEmail } = require("../../shared/services/email.service");
const Citizen = require("../auth/citizen.model");

// List all complaints across every citizen, with optional filters
const getAllComplaints = async (req, res) => {
  try {
    const { status, department, priority, search, overdueOnly } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (priority) filter.priority = priority;

    let complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .populate("citizen", "fullName email")
      .populate("assignedEmployee", "fullName");

    if (search) {
      const term = search.toLowerCase();
      complaints = complaints.filter(
        (c) =>
          c.complaintNumber.toLowerCase().includes(term) ||
          c.title.toLowerCase().includes(term) ||
          c.citizen?.fullName?.toLowerCase().includes(term)
      );
    }

    let withOverdueFlag = complaints.map((c) => ({
      ...c.toObject(),
      isOverdue: isComplaintOverdue(c),
    }));

    if (overdueOnly === "true") {
      withOverdueFlag = withOverdueFlag.filter((c) => c.isOverdue);
    }

    return res.status(200).json({ success: true, complaints: withOverdueFlag });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Get one complaint (any citizen's) plus its full history — for the admin detail view
const getComplaintByIdAdmin = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("citizen", "fullName email phone")
      .populate("assignedEmployee", "fullName department");

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    const history = await ComplaintHistory.find({ complaint: req.params.id })
      .sort({ createdAt: 1 })
      .populate("performedBy", "fullName");

    return res.status(200).json({ success: true, complaint, history });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Assign a complaint to a department and (optionally) a specific employee
const assignComplaint = async (req, res) => {
  try {
    const { department, employeeId } = req.body;

    if (!department?.trim()) {
      return res.status(400).json({ success: false, message: "Department is required" });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    complaint.department = department.trim();
    complaint.assignedEmployee = employeeId || null;
    complaint.status = "Assigned";
    await complaint.save();

    await ComplaintHistory.create({
      complaint: complaint._id,
      status: "Assigned",
      action: employeeId ? "Assigned to Employee" : "Assigned to Department",
      performedBy: req.citizen._id,
      performerRole: "Admin",
      department: department.trim(),
      employee: employeeId || null,
      remarks: `Assigned to ${department.trim()}${employeeId ? " department team" : ""}`,
    });

    await Notification.create({
      citizen: complaint.citizen,
      title: "Complaint Assigned",
      message: `Your complaint ${complaint.complaintNumber} has been assigned to the ${department.trim()} department.`,
      type: "status_update",
      relatedComplaint: complaint._id,
    });

    notifyCitizen(complaint.citizen, "complaint:updated", {
      complaintId: complaint._id.toString(),
      complaintNumber: complaint.complaintNumber,
      status: complaint.status,
      department: complaint.department,
    });
    notifyCitizen(complaint.citizen, "notification:new");
    broadcastGlobal("feed:update");

    // Send an email to the citizen — never let an email failure block the response
    Citizen.findById(complaint.citizen)
      .select("email fullName")
      .then((citizenDoc) => {
        if (citizenDoc?.email) {
          sendEmail(
            citizenDoc.email,
            `Complaint ${complaint.complaintNumber} Assigned`,
            `Hi ${citizenDoc.fullName}, your complaint <b>${complaint.complaintNumber}</b> has been assigned to the <b>${department.trim()}</b> department.`
          );
        }
      })
      .catch((err) => console.error("Email lookup failed:", err.message));

    return res.status(200).json({ success: true, message: "Complaint assigned successfully", complaint });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Update a complaint's workflow status
const updateComplaintStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    if (!status || !COMPLAINT_STATUS_LIST.includes(status)) {
      return res.status(400).json({ success: false, message: "A valid status is required" });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    complaint.status = status;
    if (remarks !== undefined) complaint.remarks = remarks;
    await complaint.save();

    await ComplaintHistory.create({
      complaint: complaint._id,
      status,
      action: `Status Updated to ${status}`,
      performedBy: req.citizen._id,
      performerRole: "Admin",
      remarks: remarks || "",
    });

    await Notification.create({
      citizen: complaint.citizen,
      title: "Complaint Status Updated",
      message: `Your complaint ${complaint.complaintNumber} is now "${status}".`,
      type: "status_update",
      relatedComplaint: complaint._id,
    });

    notifyCitizen(complaint.citizen, "complaint:updated", {
      complaintId: complaint._id.toString(),
      complaintNumber: complaint.complaintNumber,
      status: complaint.status,
      department: complaint.department,
    });
    notifyCitizen(complaint.citizen, "notification:new");

    // Send an email to the citizen — never let an email failure block the response
    Citizen.findById(complaint.citizen)
      .select("email fullName")
      .then((citizenDoc) => {
        if (citizenDoc?.email) {
          sendEmail(
            citizenDoc.email,
            `Complaint ${complaint.complaintNumber} Status Updated`,
            `Hi ${citizenDoc.fullName}, your complaint <b>${complaint.complaintNumber}</b> is now <b>${status}</b>.`
          );
        }
      })
      .catch((err) => console.error("Email lookup failed:", err.message));

    return res.status(200).json({ success: true, message: "Status updated successfully", complaint });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

module.exports = { getAllComplaints, getComplaintByIdAdmin, assignComplaint, updateComplaintStatus };