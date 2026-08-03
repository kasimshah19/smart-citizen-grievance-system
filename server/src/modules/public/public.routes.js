const express = require("express");
const router = express.Router();
const { getPublicComplaints, getPublicStats } = require("./public.controller");

// No auth middleware on this router — these endpoints are intentionally public
router.get("/complaints", getPublicComplaints);
router.get("/stats", getPublicStats);

module.exports = router;
