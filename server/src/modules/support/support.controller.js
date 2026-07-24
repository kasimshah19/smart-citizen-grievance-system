const SupportTicket = require("./supportTicket.model");

// Create a new support ticket
const createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject?.trim() || !message?.trim()) {
      return res.status(400).json({ success: false, message: "Subject and message are required" });
    }

    const ticket = await SupportTicket.create({
      citizen: req.citizen._id,
      subject: subject.trim(),
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been sent. We'll respond within 24 hours.",
      ticket,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// Get all support tickets of the logged-in citizen
const getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ citizen: req.citizen._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, tickets });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

module.exports = { createTicket, getMyTickets };