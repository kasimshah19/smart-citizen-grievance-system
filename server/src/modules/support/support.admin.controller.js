const SupportTicket = require("./supportTicket.model");
const Citizen = require("../auth/citizen.model");
const Notification = require("../notification/notification.model");
const { notifyCitizen } = require("../../socket");

// List support tickets for the Admin Support Tickets page — filter + search + pagination
const getAllTickets = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 15 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    let citizenIds = null;
    if (search?.trim()) {
      const matchingCitizens = await Citizen.find({
        fullName: { $regex: search.trim(), $options: "i" },
      }).select("_id");
      citizenIds = matchingCitizens.map((c) => c._id);

      filter.$or = [
        { subject: { $regex: search.trim(), $options: "i" } },
        { citizen: { $in: citizenIds } },
      ];
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.max(parseInt(limit) || 15, 1);

    const [tickets, total, openCount] = await Promise.all([
      SupportTicket.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate("citizen", "fullName email phone"),
      SupportTicket.countDocuments(filter),
      SupportTicket.countDocuments({ status: "Open" }),
    ]);

    return res.status(200).json({
      success: true,
      tickets,
      openCount,
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

// Admin replies to a ticket — saves the reply, updates status, and notifies the citizen
const replyToTicket = async (req, res) => {
  try {
    const { reply, status } = req.body;

    if (!reply?.trim()) {
      return res.status(400).json({ success: false, message: "Reply message is required" });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const statusEnum = SupportTicket.schema.path("status").enumValues;
    if (status && !statusEnum.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    ticket.adminReply = reply.trim();
    ticket.repliedAt = new Date();
    ticket.repliedBy = req.citizen._id;
    ticket.status = status || (ticket.status === "Open" ? "In Progress" : ticket.status);

    await ticket.save();

    await Notification.create({
      citizen: ticket.citizen,
      title: "Support Ticket Reply",
      message: `You have a reply on your ticket "${ticket.subject}": ${reply.trim().slice(0, 100)}${
        reply.trim().length > 100 ? "…" : ""
      }`,
      type: "general",
    });

    notifyCitizen(ticket.citizen, "notification:new");

    const updated = await SupportTicket.findById(ticket._id).populate("citizen", "fullName email phone");

    return res.status(200).json({ success: true, message: "Reply sent successfully", ticket: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Admin-only status update without a reply (e.g., marking Closed directly)
const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const statusEnum = SupportTicket.schema.path("status").enumValues;

    if (!status || !statusEnum.includes(status)) {
      return res.status(400).json({ success: false, message: "A valid status is required" });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    ticket.status = status;
    await ticket.save();

    return res.status(200).json({ success: true, message: "Status updated", ticket });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

module.exports = { getAllTickets, replyToTicket, updateTicketStatus };
