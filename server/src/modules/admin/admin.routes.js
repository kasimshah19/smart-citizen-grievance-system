const express = require("express");
const router = express.Router();
const { protect, authorize, ROLES } = require("../../middleware/auth.middleware");
const {
  getDashboardSummary,
  getRecentComplaints,
  getSystemStatus,
  getAllCitizens,
  getCitizenDetail,
  toggleCitizenStatus,
} = require("./admin.controller");

// Every route here requires a valid token AND the Admin role
router.use(protect, authorize(ROLES.ADMIN));

router.get("/dashboard/summary", getDashboardSummary);
router.get("/dashboard/recent-complaints", getRecentComplaints);
router.get("/dashboard/system-status", getSystemStatus);

router.get("/users", getAllCitizens);
router.get("/users/:id", getCitizenDetail);
router.patch("/users/:id/toggle-status", toggleCitizenStatus);

module.exports = router;