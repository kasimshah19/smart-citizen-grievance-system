const Department = require("./department.model");
const Citizen = require("../auth/citizen.model");
const Complaint = require("../complaint/complaint.model");

// Create a new department
const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Department name is required" });
    }

    const existing = await Department.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: "A department with this name already exists" });
    }

    const department = await Department.create({ name: name.trim(), description: description?.trim() || "" });

    return res.status(201).json({ success: true, message: "Department created successfully", department });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// List all departments with employee count and complaint count
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });

    const withCounts = await Promise.all(
      departments.map(async (dept) => {
        const employeeCount = await Citizen.countDocuments({ role: "Employee", department: dept.name });
        const complaintCount = await Complaint.countDocuments({ department: dept.name });
        return {
          ...dept.toObject(),
          employeeCount,
          complaintCount,
        };
      })
    );

    return res.status(200).json({ success: true, departments: withCounts });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Update a department
const updateDepartment = async (req, res) => {
  try {
    const { name, description, active } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();
    if (active !== undefined) updates.active = active;

    const department = await Department.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    return res.status(200).json({ success: true, message: "Department updated successfully", department });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Delete a department
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    return res.status(200).json({ success: true, message: "Department deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

module.exports = { createDepartment, getDepartments, updateDepartment, deleteDepartment };