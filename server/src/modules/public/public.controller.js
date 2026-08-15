const Complaint = require("../complaint/complaint.model");
const Citizen = require("../auth/citizen.model");
const ROLES = require("../../shared/constants/roles");

// GET /api/public/complaints — no login required.
// Deliberately excludes anything identifying: no citizen name, phone, email,
// no assigned employee name, no internal IDs beyond the complaint's own.
const getPublicComplaints = async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 12 } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search?.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { "location.address": { $regex: search.trim(), $options: "i" } },
      ];
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.max(parseInt(limit) || 12, 1);

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .select("complaintNumber title category status priority department location reportCount createdAt")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Complaint.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      complaints,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.max(Math.ceil(total / limitNum), 1),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// GET /api/public/stats — small transparency summary for the feed's header
const getPublicStats = async (req, res) => {
  try {
    const [total, resolved] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: { $in: ["Resolved", "Closed"] } }),
    ]);

    return res.status(200).json({ success: true, stats: { total, resolved } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// GET /api/public/leaderboard — get top 5 citizens with highest karma points
const getLeaderboard = async (req, res) => {
  try {
    const topCitizens = await Citizen.find({ role: ROLES.CITIZEN, karmaPoints: { $gt: 0 } })
      .select("fullName karmaPoints")
      .sort({ karmaPoints: -1 })
      .limit(5);

    return res.status(200).json({ success: true, leaderboard: topCitizens });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

module.exports = { getPublicComplaints, getPublicStats, getLeaderboard };
