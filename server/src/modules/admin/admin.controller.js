const Complaint = require("../complaint/complaint.model");
const Citizen = require("../auth/citizen.model");
const SupportTicket = require("../support/supportTicket.model");
const Department = require("../department/department.model");
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
    const departments = await Department.countDocuments();

    return res.status(200).json({
      success: true,
      status: {
        activeCitizens,
        registeredEmployees,
        departments,
        openSupportTickets,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// List citizens for the Admin Users page — search, status filter, pagination
const getAllCitizens = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 15 } = req.query;

    const filter = { role: ROLES.CITIZEN };
    if (status === "active") filter.active = { $ne: false };
    if (status === "inactive") filter.active = false;

    if (search?.trim()) {
      filter.$or = [
        { fullName: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
        { phone: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.max(parseInt(limit) || 15, 1);

    const [citizens, total] = await Promise.all([
      Citizen.find(filter)
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Citizen.countDocuments(filter),
    ]);

    // Attach each citizen's complaint count in one aggregate query rather than N+1 queries
    const counts = await Complaint.aggregate([
      { $match: { citizen: { $in: citizens.map((c) => c._id) } } },
      { $group: { _id: "$citizen", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));

    const withCounts = citizens.map((c) => ({ ...c.toObject(), complaintCount: countMap[c._id.toString()] || 0 }));

    return res.status(200).json({
      success: true,
      citizens: withCounts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.max(Math.ceil(total / limitNum), 1),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Full profile + complaint list for a single citizen, for the expandable detail view
const getCitizenDetail = async (req, res) => {
  try {
    const citizen = await Citizen.findOne({ _id: req.params.id, role: ROLES.CITIZEN }).select("-passwordHash");
    if (!citizen) {
      return res.status(404).json({ success: false, message: "Citizen not found" });
    }

    const complaints = await Complaint.find({ citizen: citizen._id })
      .sort({ createdAt: -1 })
      .select("complaintNumber title category status createdAt");

    return res.status(200).json({ success: true, citizen, complaints });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Activate or deactivate a citizen's account — deactivated citizens can't log in
const toggleCitizenStatus = async (req, res) => {
  try {
    const citizen = await Citizen.findOne({ _id: req.params.id, role: ROLES.CITIZEN });
    if (!citizen) {
      return res.status(404).json({ success: false, message: "Citizen not found" });
    }

    citizen.active = !(citizen.active !== false); // flips true/undefined -> false, false -> true
    await citizen.save();

    return res.status(200).json({
      success: true,
      message: `Account ${citizen.active ? "activated" : "deactivated"} successfully`,
      citizen: { id: citizen._id, active: citizen.active },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

module.exports = {
  getDashboardSummary,
  getRecentComplaints,
  getSystemStatus,
  getAllCitizens,
  getCitizenDetail,
  toggleCitizenStatus,
};