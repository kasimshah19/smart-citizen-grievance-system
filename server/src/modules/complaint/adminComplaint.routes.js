const express = require("express");
const router = express.Router();
const { protect, authorize, ROLES } = require("../../middleware/auth.middleware");
const {
  getAllComplaints,
  getComplaintByIdAdmin,
  assignComplaint,
  updateComplaintStatus,
} = require("./complaint.admin.controller");

router.use(protect, authorize(ROLES.ADMIN));

router.get("/", getAllComplaints);
router.get("/:id", getComplaintByIdAdmin);
router.put("/:id/assign", assignComplaint);
router.put("/:id/status", updateComplaintStatus);

module.exports = router;