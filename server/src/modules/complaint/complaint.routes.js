const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth.middleware");
const upload = require("../../middleware/upload.middleware");
const {
  createComplaint,
  getMyComplaints,
  searchMyComplaints,
  getComplaintById,
  getComplaintHistory,
} = require("./complaint.controller");

router.post("/", protect, upload.single("photo"), createComplaint);
router.get("/my", protect, getMyComplaints);
router.get("/search", protect, searchMyComplaints);
router.get("/:id", protect, getComplaintById);
router.get("/:id/history", protect, getComplaintHistory);

module.exports = router;