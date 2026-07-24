const Complaint = require("../complaint/complaint.model");
const Notification = require("../notification/notification.model");

const getDashboardSummary = async (req, res) => {
  try {
    const citizenId = req.citizen._id;

    const complaints = await Complaint.find({ citizen: citizenId }).sort({ createdAt: -1 });

    const stats = {
      total: complaints.length,
      pending: complaints.filter((c) => c.status === "Submitted").length,
      inProgress: complaints.filter((c) => ["Under Review", "Assigned", "In Progress"].includes(c.status)).length,
      resolved: complaints.filter((c) => c.status === "Resolved").length,
    };

    const statusOverview = {
      submitted: complaints.filter((c) => c.status === "Submitted").length,
      underReview: complaints.filter((c) => c.status === "Under Review").length,
      assigned: complaints.filter((c) => c.status === "Assigned").length,
      inProgress: complaints.filter((c) => c.status === "In Progress").length,
      resolved: complaints.filter((c) => c.status === "Resolved").length,
      closed: complaints.filter((c) => c.status === "Closed").length,
    };

    const recentComplaints = complaints.slice(0, 5).map((c) => ({
      id: c._id,
      title: c.title,
      category: c.category,
      status: c.status,
      submittedOn: new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    }));

    const recentNotifications = await Notification.find({ citizen: citizenId })
      .sort({ createdAt: -1 })
      .limit(5);

    const notifications = recentNotifications.map((n) => ({
      id: n._id,
      title: n.title,
      time: new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    }));

    const summary = {
      stats,
      statusOverview,
      recentComplaints,
      notifications,
    };

    return res.status(200).json({ success: true, summary });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

module.exports = { getDashboardSummary };