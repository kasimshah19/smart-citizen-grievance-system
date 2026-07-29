const Complaint = require("../complaint/complaint.model");

// KPI summary for the logged-in employee's own assigned complaints
const getEmployeeDashboardSummary = async (req, res) => {
  try {
    const employeeId = req.citizen._id;

    const complaints = await Complaint.find({ assignedEmployee: employeeId }).sort({ createdAt: -1 });

    const stats = {
      totalAssigned: complaints.length,
      pending: complaints.filter((c) => c.status === "Assigned").length,
      inProgress: complaints.filter((c) => ["Accepted", "In Progress"].includes(c.status)).length,
      resolved: complaints.filter((c) => c.status === "Resolved").length,
    };

    const recentComplaints = complaints.slice(0, 5).map((c) => ({
      id: c._id,
      complaintNumber: c.complaintNumber,
      title: c.title,
      category: c.category,
      priority: c.priority,
      status: c.status,
      createdAt: c.createdAt,
    }));

    return res.status(200).json({
      success: true,
      summary: { stats, recentComplaints, department: req.citizen.department },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

module.exports = { getEmployeeDashboardSummary };