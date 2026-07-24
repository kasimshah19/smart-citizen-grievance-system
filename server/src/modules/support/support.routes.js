const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth.middleware");
const { createTicket, getMyTickets } = require("./support.controller");

router.post("/", protect, createTicket);
router.get("/my", protect, getMyTickets);

module.exports = router;