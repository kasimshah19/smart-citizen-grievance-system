const express = require("express");
const router = express.Router();
const { getPublicComplaints, getPublicStats, getLeaderboard } = require("./public.controller");

// No auth middleware on this router — these endpoints are intentionally public
router.get("/complaints", getPublicComplaints);
router.get("/stats", getPublicStats);
router.get("/leaderboard", getLeaderboard);

module.exports = router;
