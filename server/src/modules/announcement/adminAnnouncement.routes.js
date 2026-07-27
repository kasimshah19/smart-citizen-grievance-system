const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../../middleware/auth.middleware");
const ROLES = require("../../shared/constants/roles");
const {
  createAnnouncement,
  getAllAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} = require("./announcement.admin.controller");

router.use(protect, authorize(ROLES.ADMIN));

router.post("/", createAnnouncement);
router.get("/", getAllAnnouncements);
router.put("/:id", updateAnnouncement);
router.delete("/:id", deleteAnnouncement);

module.exports = router;
