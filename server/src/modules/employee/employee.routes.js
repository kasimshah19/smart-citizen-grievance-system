const express = require("express");
const router = express.Router();
const { protect, authorize, ROLES } = require("../../middleware/auth.middleware");
const { createEmployee, getEmployees, updateEmployee, deleteEmployee } = require("./employee.controller");

router.use(protect, authorize(ROLES.ADMIN));

router.post("/", createEmployee);
router.get("/", getEmployees);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

module.exports = router;