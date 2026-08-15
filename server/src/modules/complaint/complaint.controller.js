const Complaint = require("./complaint.model");
const ComplaintHistory = require("./complaintHistory.model");
const Notification = require("../notification/notification.model");
const { generateComplaintNumber, distanceInMeters } = require("./complaint.utils");
const { analyzeComplaintPriority } = require("../../shared/services/ai.service");

// How close two complaints need to be (in meters) to be considered the same real-world issue
const DUPLICATE_RADIUS_METERS = 200;

// Create a new complaint
const createComplaint = async (req, res) => {
  try {
    const { category, title, description, address, latitude, longitude, priority } = req.body;

    if (!category || !title || !description || !address) {
      return res.status(400).json({
        success: false,
        message: "Category, title, description, and location address are required",
      });
    }

    const photoUrl = req.file ? req.file.path : null;

    let complaintNumber;
    let isUnique = false;
    while (!isUnique) {
      complaintNumber = generateComplaintNumber();
      const existing = await Complaint.findOne({ complaintNumber });
      if (!existing) isUnique = true;
    }

    // AI-Powered Priority Assignment (Groq API)
    // Runs dynamically based on Title and Description
    const detectedPriority = await analyzeComplaintPriority(title, description);

    const complaint = await Complaint.create({
      complaintNumber,
      citizen: req.citizen._id,
      category,
      title,
      description,
      location: { address, latitude, longitude },
      photoUrl,
      priority: detectedPriority,
    });

    // Record the initial history entry — the single source of truth for this complaint's timeline
    await ComplaintHistory.create({
      complaint: complaint._id,
      status: "Submitted",
      action: "Complaint Submitted",
      performedBy: req.citizen._id,
      performerRole: "Citizen",
      remarks: `Complaint registered by citizen. AI auto-assigned priority as: ${detectedPriority}`,
    });

    await Notification.create({
      citizen: req.citizen._id,
      title: "Complaint Submitted",
      message: `Your complaint "${title}" has been registered successfully with number ${complaintNumber}.`,
      type: "complaint_submitted",
      relatedComplaint: complaint._id,
    });

    return res.status(201).json({
      success: true,
      message: "Complaint registered successfully",
      complaint,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// Before submitting, check whether a similar open complaint already exists
// nearby (same category, within DUPLICATE_RADIUS_METERS) — so the citizen can
// add their voice to it instead of creating a separate one.
const checkDuplicate = async (req, res) => {
  try {
    const { category, latitude, longitude } = req.query;

    if (!category || !latitude || !longitude) {
      return res.status(200).json({ success: true, duplicate: null });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(200).json({ success: true, duplicate: null });
    }

    const candidates = await Complaint.find({
      category,
      citizen: { $ne: req.citizen._id },
      status: { $nin: ["Resolved", "Closed"] },
      "location.latitude": { $exists: true, $ne: null },
      "location.longitude": { $exists: true, $ne: null },
    }).select("complaintNumber title location reportCount duplicateReporters");

    let closest = null;
    let closestDistance = Infinity;

    for (const c of candidates) {
      // Skip complaints this citizen has already joined
      const alreadyJoined = c.duplicateReporters.some(
        (r) => r.citizen.toString() === req.citizen._id.toString()
      );
      if (alreadyJoined) continue;

      const distance = distanceInMeters(lat, lng, c.location.latitude, c.location.longitude);
      if (distance <= DUPLICATE_RADIUS_METERS && distance < closestDistance) {
        closest = c;
        closestDistance = distance;
      }
    }

    if (!closest) {
      return res.status(200).json({ success: true, duplicate: null });
    }

    return res.status(200).json({
      success: true,
      duplicate: {
        complaintId: closest._id,
        complaintNumber: closest.complaintNumber,
        title: closest.title,
        reportCount: closest.reportCount,
        distanceMeters: Math.round(closestDistance),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Instead of filing a new complaint, add this citizen's voice to an existing one
const joinComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    if (complaint.citizen.toString() === req.citizen._id.toString()) {
      return res.status(400).json({ success: false, message: "This is already your own complaint" });
    }

    const alreadyJoined = complaint.duplicateReporters.some(
      (r) => r.citizen.toString() === req.citizen._id.toString()
    );
    if (alreadyJoined) {
      return res.status(400).json({ success: false, message: "You've already reported this issue" });
    }

    complaint.duplicateReporters.push({ citizen: req.citizen._id });
    complaint.reportCount = (complaint.reportCount || 1) + 1;

    // Auto-escalate priority as more citizens report the same issue —
    // never downgrades, only raises it if the new level is higher.
    const PRIORITY_ORDER = ["Low", "Medium", "High", "Emergency"];
    const ESCALATION_THRESHOLDS = [
      { minReports: 8, level: "Emergency" },
      { minReports: 5, level: "High" },
      { minReports: 3, level: "Medium" },
    ];
    const currentRank = PRIORITY_ORDER.indexOf(complaint.priority);
    const earnedLevel = ESCALATION_THRESHOLDS.find((t) => complaint.reportCount >= t.minReports)?.level;
    const priorityEscalated = earnedLevel && PRIORITY_ORDER.indexOf(earnedLevel) > currentRank;

    if (priorityEscalated) {
      complaint.priority = earnedLevel;
    }

    await complaint.save();

    await ComplaintHistory.create({
      complaint: complaint._id,
      status: complaint.status,
      action: priorityEscalated
        ? `Additional citizen reported this issue — priority auto-raised to ${complaint.priority}`
        : "Additional citizen reported this issue",
      performedBy: req.citizen._id,
      performerRole: "Citizen",
      remarks: priorityEscalated
        ? `Now reported by ${complaint.reportCount} citizens — priority raised to ${complaint.priority} due to high impact`
        : `Now reported by ${complaint.reportCount} citizens`,
    });

    return res.status(200).json({
      success: true,
      message: "You've added your voice to this report",
      complaint,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Get all complaints of the logged-in citizen — including ones they've joined, not just filed
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      $or: [{ citizen: req.citizen._id }, { "duplicateReporters.citizen": req.citizen._id }],
    }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, complaints });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Powers the citizen top nav search bar — quick matches within the citizen's own complaints
const searchMyComplaints = async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q || q.length < 2) {
      return res.status(200).json({ success: true, complaints: [] });
    }

    const complaints = await Complaint.find({
      citizen: req.citizen._id,
      $or: [{ complaintNumber: { $regex: q, $options: "i" } }, { title: { $regex: q, $options: "i" } }],
    })
      .select("complaintNumber title status")
      .limit(5);

    return res.status(200).json({ success: true, complaints });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Get a single complaint by ID (must belong to, or be joined by, the logged-in citizen)
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      $or: [{ citizen: req.citizen._id }, { "duplicateReporters.citizen": req.citizen._id }],
    });

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    return res.status(200).json({ success: true, complaint });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Get the full workflow timeline for a complaint, sourced entirely from ComplaintHistory
const getComplaintHistory = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      $or: [{ citizen: req.citizen._id }, { "duplicateReporters.citizen": req.citizen._id }],
    });

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    const history = await ComplaintHistory.find({ complaint: req.params.id })
      .sort({ createdAt: 1 })
      .populate("performedBy", "fullName");

    return res.status(200).json({ success: true, history });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Citizen rates how their (already resolved) complaint was handled — one-time only
const submitRating = async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const complaint = await Complaint.findOne({ _id: req.params.id, citizen: req.citizen._id });
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    if (!["Resolved", "Closed"].includes(complaint.status)) {
      return res.status(400).json({
        success: false,
        message: "You can only rate a complaint after it has been resolved",
      });
    }

    if (complaint.rating) {
      return res.status(400).json({ success: false, message: "You've already rated this complaint" });
    }

    complaint.rating = numericRating;
    complaint.ratingFeedback = feedback?.trim() || "";
    complaint.ratedAt = new Date();
    await complaint.save();

    await ComplaintHistory.create({
      complaint: complaint._id,
      status: complaint.status,
      action: `Citizen rated this complaint ${numericRating}/5`,
      performedBy: req.citizen._id,
      performerRole: "Citizen",
      remarks: feedback?.trim() || "",
    });

    return res.status(200).json({ success: true, message: "Thank you for your feedback", complaint });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  searchMyComplaints,
  checkDuplicate,
  joinComplaint,
  getComplaintById,
  getComplaintHistory,
  submitRating,
};