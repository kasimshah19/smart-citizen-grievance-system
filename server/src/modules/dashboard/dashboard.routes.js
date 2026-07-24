const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth.middleware");
const { getDashboardSummary } = require("./dashboard.controller");

router.get("/summary", protect, getDashboardSummary);

module.exports = router;