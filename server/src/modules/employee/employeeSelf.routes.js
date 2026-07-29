const express = require("express");
const router = express.Router();
const { protect, authorize, ROLES } = require("../../middleware/auth.middleware");
const { getEmployeeDashboardSummary } = require("./employee.dashboard.controller");
const {
  getMyAssignedComplaints,
  getAssignedComplaintById,
  updateAssignedComplaintStatus,
} = require("../complaint/employeeComplaint.controller");

// Every route here requires a valid token AND the Employee role
router.use(protect, authorize(ROLES.EMPLOYEE));

router.get("/dashboard/summary", getEmployeeDashboardSummary);
router.get("/complaints", getMyAssignedComplaints);
router.get("/complaints/:id", getAssignedComplaintById);
router.put("/complaints/:id/status", updateAssignedComplaintStatus);

module.exports = router;