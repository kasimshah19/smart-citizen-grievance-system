const Complaint = require("../complaint/complaint.model");
const Citizen = require("../auth/citizen.model");
const SupportTicket = require("../support/supportTicket.model");
const { COMPLAINT_STATUS } = require("../../shared/constants/complaintStatus");
const ROLES = require("../../shared/constants/roles");

// KPI cards for the Admin Dashboard
const getDashboardSummary = async (req, res) => {
  try {
    const complaints = await Complaint.find();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayCount = complaints.filter((c) => new Date(c.createdAt) >= startOfToday).length;

    const countByStatus = (status) => complaints.filter((c) => c.status === status).length;

    const kpis = {
      total: complaints.length,
      today: todayCount,
      pending: countByStatus(COMPLAINT_STATUS.SUBMITTED),
      underReview: countByStatus(COMPLAINT_STATUS.UNDER_REVIEW),
      assigned: countByStatus(COMPLAINT_STATUS.ASSIGNED),
      inProgress: countByStatus(COMPLAINT_STATUS.IN_PROGRESS),
      resolved: countByStatus(COMPLAINT_STATUS.RESOLVED),
      closed: countByStatus(COMPLAINT_STATUS.CLOSED),
      reopened: countByStatus(COMPLAINT_STATUS.REOPENED),
    };

    // Chart-ready aggregates — placeholders that real chart components can consume later
    const categoryBreakdown = {};
    complaints.forEach((c) => {
      categoryBreakdown[c.category] = (categoryBreakdown[c.category] || 0) + 1;
    });

    const departmentBreakdown = {};
    complaints.forEach((c) => {
      const dept = c.department || "Unassigned";
      departmentBreakdown[dept] = (departmentBreakdown[dept] || 0) + 1;
    });

    return res.status(200).json({
      success: true,
      summary: {
        kpis,
        charts: {
          byCategory: categoryBreakdown,
          byDepartment: departmentBreakdown,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Latest complaints across all citizens, for the Admin Dashboard table
const getRecentComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("citizen", "fullName");

    const formatted = complaints.map((c) => ({
      id: c._id,
      complaintNumber: c.complaintNumber,
      citizenName: c.citizen?.fullName || "Unknown",
      category: c.category,
      priority: c.priority,
      status: c.status,
      createdAt: c.createdAt,
    }));

    return res.status(200).json({ success: true, complaints: formatted });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// System-wide counts for the Admin Dashboard
const getSystemStatus = async (req, res) => {
  try {
    const activeCitizens = await Citizen.countDocuments({ role: ROLES.CITIZEN });
    const registeredEmployees = await Citizen.countDocuments({ role: ROLES.EMPLOYEE });
    const openSupportTickets = await SupportTicket.countDocuments({ status: "Open" });

    return res.status(200).json({
      success: true,
      status: {
        activeCitizens,
        registeredEmployees,
        departments: 6, // static for now — matches the departments constant list
        openSupportTickets,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

module.exports = { getDashboardSummary, getRecentComplaints, getSystemStatus };