const express = require("express");
const router = express.Router();
const { protect, authorize, ROLES } = require("../../middleware/auth.middleware");
const { getDashboardSummary, getRecentComplaints, getSystemStatus } = require("./admin.controller");

// Every route here requires a valid token AND the Admin role
router.use(protect, authorize(ROLES.ADMIN));

router.get("/dashboard/summary", getDashboardSummary);
router.get("/dashboard/recent-complaints", getRecentComplaints);
router.get("/dashboard/system-status", getSystemStatus);

module.exports = router;