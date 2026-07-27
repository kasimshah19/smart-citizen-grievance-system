const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth.middleware");
const { getActiveAnnouncements } = require("./announcement.controller");

// Any logged-in citizen (or employee/admin) can view active announcements
router.get("/", protect, getActiveAnnouncements);

module.exports = router;
