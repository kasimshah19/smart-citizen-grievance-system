const express = require("express");
const router = express.Router();
const { protect, authorize, ROLES } = require("../../middleware/auth.middleware");
const {
  getDashboardSummary,
  getRecentComplaints,
  getSystemStatus,
  getComplaintsForMap,
  getAllCitizens,
  getCitizenDetail,
  toggleCitizenStatus,
  getAnalytics,
  adminSearch,
  exportComplaintsExcel,
  exportComplaintsPDF,
} = require("./admin.controller");

// Every route here requires a valid token AND the Admin role
router.use(protect, authorize(ROLES.ADMIN));

router.get("/dashboard/summary", getDashboardSummary);
router.get("/dashboard/recent-complaints", getRecentComplaints);
router.get("/dashboard/system-status", getSystemStatus);
router.get("/dashboard/export-pdf", exportComplaintsPDF);
router.get("/dashboard/export-excel", exportComplaintsExcel);
router.get("/complaints-map", getComplaintsForMap);
router.get("/analytics", getAnalytics);
router.get("/search", adminSearch);
router.get("/citizens", getAllCitizens);
router.get("/citizens/:id", getCitizenDetail);
router.put("/citizens/:id/toggle-status", toggleCitizenStatus);

module.exports = router;