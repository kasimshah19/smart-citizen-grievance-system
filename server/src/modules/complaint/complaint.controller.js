const Complaint = require("./complaint.model");
const ComplaintHistory = require("./complaintHistory.model");
const Notification = require("../notification/notification.model");
const { generateComplaintNumber } = require("./complaint.utils");

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

    const photoUrl = req.file ? `/uploads/complaints/${req.file.filename}` : null;

    let complaintNumber;
    let isUnique = false;
    while (!isUnique) {
      complaintNumber = generateComplaintNumber();
      const existing = await Complaint.findOne({ complaintNumber });
      if (!existing) isUnique = true;
    }

    const complaint = await Complaint.create({
      complaintNumber,
      citizen: req.citizen._id,
      category,
      title,
      description,
      location: { address, latitude, longitude },
      photoUrl,
      priority: priority || "Medium",
    });

    // Record the initial history entry — the single source of truth for this complaint's timeline
    await ComplaintHistory.create({
      complaint: complaint._id,
      status: "Submitted",
      action: "Complaint Submitted",
      performedBy: req.citizen._id,
      performerRole: "Citizen",
      remarks: "Complaint registered by citizen",
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

// Get all complaints of the logged-in citizen
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ citizen: req.citizen._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, complaints });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Get a single complaint by ID (must belong to the logged-in citizen)
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ _id: req.params.id, citizen: req.citizen._id });

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
    const complaint = await Complaint.findOne({ _id: req.params.id, citizen: req.citizen._id });

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

module.exports = { createComplaint, getMyComplaints, getComplaintById, getComplaintHistory };