const express = require("express");
const router = express.Router();
const { protect, authorize, ROLES } = require("../../middleware/auth.middleware");
const {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
} = require("./department.controller");

router.use(protect, authorize(ROLES.ADMIN));

router.post("/", createDepartment);
router.get("/", getDepartments);
router.put("/:id", updateDepartment);
router.delete("/:id", deleteDepartment);

module.exports = router;