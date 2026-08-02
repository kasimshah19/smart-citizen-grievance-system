const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth.middleware");
const upload = require("../../middleware/upload.middleware");
const {
  createComplaint,
  getMyComplaints,
  searchMyComplaints,
  checkDuplicate,
  joinComplaint,
  getComplaintById,
  getComplaintHistory,
  submitRating,
} = require("./complaint.controller");

router.post("/", protect, upload.single("photo"), createComplaint);
router.get("/my", protect, getMyComplaints);
router.get("/search", protect, searchMyComplaints);
router.get("/check-duplicate", protect, checkDuplicate);
router.post("/:id/join", protect, joinComplaint);
router.post("/:id/rate", protect, submitRating);
router.get("/:id", protect, getComplaintById);
router.get("/:id/history", protect, getComplaintHistory);

module.exports = router;