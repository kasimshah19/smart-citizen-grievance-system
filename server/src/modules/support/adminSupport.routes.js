const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../../middleware/auth.middleware");
const ROLES = require("../../shared/constants/roles");
const { getAllTickets, replyToTicket, updateTicketStatus } = require("./support.admin.controller");

// Every route here requires a valid token AND the Admin role
router.use(protect, authorize(ROLES.ADMIN));

router.get("/", getAllTickets);
router.patch("/:id/reply", replyToTicket);
router.patch("/:id/status", updateTicketStatus);

module.exports = router;
