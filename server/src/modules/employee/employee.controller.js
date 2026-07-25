const Citizen = require("../auth/citizen.model");
const { hashPassword } = require("../auth/password.service");
const ROLES = require("../../shared/constants/roles");

// Admin creates a new employee account
const createEmployee = async (req, res) => {
  try {
    const { fullName, email, phone, password, department } = req.body;

    if (!fullName?.trim() || !email?.trim() || !phone?.trim() || !password || !department?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, phone, password, and department are all required",
      });
    }

    const existingEmail = await Citizen.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "This email is already registered" });
    }

    const existingPhone = await Citizen.findOne({ phone: phone.trim() });
    if (existingPhone) {
      return res.status(400).json({ success: false, message: "This phone number is already registered" });
    }

    const passwordHash = await hashPassword(password);

    const employee = await Citizen.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      passwordHash,
      phoneVerified: true,
      department: department.trim(),
      role: ROLES.EMPLOYEE,
    });

    return res.status(201).json({
      success: true,
      message: "Employee account created successfully",
      employee: {
        id: employee._id,
        fullName: employee.fullName,
        email: employee.email,
        phone: employee.phone,
        department: employee.department,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// List all employees
const getEmployees = async (req, res) => {
  try {
    const employees = await Citizen.find({ role: ROLES.EMPLOYEE })
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, employees });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Update an employee's details (name, department)
const updateEmployee = async (req, res) => {
  try {
    const { fullName, department } = req.body;

    const updates = {};
    if (fullName !== undefined) updates.fullName = fullName.trim();
    if (department !== undefined) updates.department = department.trim();

    const employee = await Citizen.findOneAndUpdate(
      { _id: req.params.id, role: ROLES.EMPLOYEE },
      updates,
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    return res.status(200).json({ success: true, message: "Employee updated successfully", employee });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Remove an employee account
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Citizen.findOneAndDelete({ _id: req.params.id, role: ROLES.EMPLOYEE });

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    return res.status(200).json({ success: true, message: "Employee removed successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

module.exports = { createEmployee, getEmployees, updateEmployee, deleteEmployee };