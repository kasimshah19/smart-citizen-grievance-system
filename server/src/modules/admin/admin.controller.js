const Complaint = require("../complaint/complaint.model");
const ComplaintHistory = require("../complaint/complaintHistory.model");
const Citizen = require("../auth/citizen.model");
const SupportTicket = require("../support/supportTicket.model");
const Department = require("../department/department.model");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const moment = require("moment");
const { COMPLAINT_STATUS } = require("../../shared/constants/complaintStatus");
const ROLES = require("../../shared/constants/roles");
const { isComplaintOverdue } = require("../../shared/utils/sla");

// KPI cards for the Admin Dashboard
const getDashboardSummary = async (req, res) => {
  try {
    const complaints = await Complaint.find();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayCount = complaints.filter((c) => new Date(c.createdAt) >= startOfToday).length;

    const countByStatus = (status) => complaints.filter((c) => c.status === status).length;

    const overdueCount = complaints.filter((c) => isComplaintOverdue(c)).length;

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
      overdue: overdueCount,
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

// Aggregated data for the Admin Analytics page — category/department/status/priority
// breakdowns, a 6-month trend, and average resolution time
const getAnalytics = async (req, res) => {
  try {
    const complaints = await Complaint.find().select("category department status priority createdAt");

    const tally = (getKey) => {
      const map = {};
      complaints.forEach((c) => {
        const key = getKey(c) || "Unassigned";
        map[key] = (map[key] || 0) + 1;
      });
      return Object.entries(map).map(([name, value]) => ({ name, value }));
    };

    const byCategory = tally((c) => c.category);
    const byDepartment = tally((c) => c.department);
    const byStatus = tally((c) => c.status);
    const byPriority = tally((c) => c.priority);

    // Last 6 months, oldest to newest, filled with zero so empty months still show
    const monthlyMap = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthlyMap[d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })] = 0;
    }
    complaints.forEach((c) => {
      const key = new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (key in monthlyMap) monthlyMap[key] += 1;
    });
    const monthlyTrend = Object.entries(monthlyMap).map(([month, count]) => ({ month, count }));

    // Average resolution time, in days, based on each complaint's first "Resolved" history entry
    const resolvedComplaints = complaints.filter((c) => ["Resolved", "Closed"].includes(c.status));
    let avgResolutionDays = null;

    if (resolvedComplaints.length > 0) {
      const resolutionEntries = await ComplaintHistory.find({
        complaint: { $in: resolvedComplaints.map((c) => c._id) },
        status: "Resolved",
      }).sort({ createdAt: 1 });

      const firstResolvedAt = {};
      resolutionEntries.forEach((entry) => {
        const key = entry.complaint.toString();
        if (!firstResolvedAt[key]) firstResolvedAt[key] = entry.createdAt;
      });

      const durations = resolvedComplaints
        .filter((c) => firstResolvedAt[c._id.toString()])
        .map((c) => (firstResolvedAt[c._id.toString()] - c.createdAt) / (1000 * 60 * 60 * 24));

      if (durations.length > 0) {
        avgResolutionDays = Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10;
      }
    }

    return res.status(200).json({
      success: true,
      analytics: {
        byCategory,
        byDepartment,
        byStatus,
        byPriority,
        monthlyTrend,
        avgResolutionDays,
        totalComplaints: complaints.length,
        resolvedCount: resolvedComplaints.length,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Powers the top nav search bar — quick matches across complaints and citizens
const adminSearch = async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q || q.length < 2) {
      return res.status(200).json({ success: true, complaints: [], citizens: [] });
    }

    const regex = { $regex: q, $options: "i" };

    const [complaints, citizens] = await Promise.all([
      Complaint.find({ $or: [{ complaintNumber: regex }, { title: regex }] })
        .select("complaintNumber title status")
        .limit(5),
      Citizen.find({ role: ROLES.CITIZEN, $or: [{ fullName: regex }, { email: regex }] })
        .select("fullName email")
        .limit(5),
    ]);

    return res.status(200).json({ success: true, complaints, citizens });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Returns complaints that have GPS coordinates, for the Admin Map View
const getComplaintsForMap = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      "location.latitude": { $ne: null },
      "location.longitude": { $ne: null },
    })
      .select("complaintNumber title category status priority location createdAt")
      .sort({ createdAt: -1 });

    const points = complaints.map((c) => ({
      id: c._id,
      complaintNumber: c.complaintNumber,
      title: c.title,
      category: c.category,
      status: c.status,
      priority: c.priority,
      latitude: c.location.latitude,
      longitude: c.location.longitude,
      address: c.location.address,
    }));

    return res.status(200).json({ success: true, points });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// --- NEW EXPORT FUNCTIONS ---
const exportComplaintsExcel = async (req, res) => {
  try {
    const thirtyDaysAgo = moment().subtract(30, "days").toDate();
    const complaints = await Complaint.find({ createdAt: { $gte: thirtyDaysAgo } })
      .populate("citizen", "fullName")
      .sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Last 30 Days");

    worksheet.columns = [
      { header: "ID", key: "complaintNumber", width: 15 },
      { header: "Citizen Name", key: "citizen", width: 25 },
      { header: "Title", key: "title", width: 40 },
      { header: "Category", key: "category", width: 20 },
      { header: "Priority", key: "priority", width: 15 },
      { header: "Date", key: "createdAt", width: 15 },
      { header: "Status", key: "status", width: 15 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };

    complaints.forEach((c) => {
      worksheet.addRow({
        complaintNumber: c.complaintNumber,
        citizen: c.citizen?.fullName || "Unregistered",
        title: c.title,
        category: c.category,
        priority: c.priority,
        createdAt: moment(c.createdAt).format("YYYY-MM-DD"),
        status: c.status,
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="complaints-report.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Excel Export Error", error);
    res.status(500).json({ success: false, message: "Excel export failed" });
  }
};

const exportComplaintsPDF = async (req, res) => {
  try {
    const thirtyDaysAgo = moment().subtract(30, "days").toDate();
    const complaints = await Complaint.find({ createdAt: { $gte: thirtyDaysAgo } })
      .populate("citizen", "fullName")
      .sort({ createdAt: -1 });

    const doc = new PDFDocument({ margin: 30, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="complaints-report.pdf"');

    doc.pipe(res);

    // Title
    doc.fontSize(18).text("Smart Citizen Grievance System", { align: "center" });
    doc.fontSize(12).text(`Generated: ${moment().format("YYYY-MM-DD HH:mm:ss")}`, { align: "center", color: "grey" });
    doc.moveDown(2);

    doc.fontSize(14).fillColor("black").text("Analytics Report: Complaints in Last 30 Days");
    doc.moveDown(1);

    const tableTop = doc.y;
    const col1 = 30;  // ID
    const col2 = 120; // Citizen
    const col3 = 240; // Title
    const col4 = 420; // Status
    const col5 = 490; // Date

    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("Req ID", col1, tableTop);
    doc.text("Citizen", col2, tableTop);
    doc.text("Complaint Title", col3, tableTop);
    doc.text("Status", col4, tableTop);
    doc.text("Date", col5, tableTop);

    doc.moveTo(30, doc.y + 5).lineTo(565, doc.y + 5).stroke();

    let y = doc.y + 15;
    doc.font("Helvetica");

    complaints.forEach((c) => {
      if (y > 750) {
        doc.addPage();
        y = 30;
      }

      const title = c.title.length > 25 ? c.title.substring(0, 25) + "..." : c.title;

      doc.fontSize(9);
      doc.text(c.complaintNumber, col1, y);
      doc.text(c.citizen?.fullName || "Unregistered", col2, y);
      doc.text(title, col3, y);
      doc.text(c.status, col4, y);
      doc.text(moment(c.createdAt).format("YYYY-MM-DD"), col5, y);

      y += 20;
    });

    doc.end();
  } catch (error) {
    console.error("PDF Export Error", error);
    if (!res.headersSent) res.status(500).json({ success: false, message: "PDF export failed" });
  }
};

module.exports = {
  getDashboardSummary,
  getRecentComplaints,
  getSystemStatus,
  getAllCitizens,
  getCitizenDetail,
  toggleCitizenStatus,
  getAnalytics,
  adminSearch,
  getComplaintsForMap,
  exportComplaintsExcel,
  exportComplaintsPDF,
};