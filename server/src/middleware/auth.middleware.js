const jwt = require("jsonwebtoken");
const Citizen = require("../modules/auth/citizen.model");
const ROLES = require("../shared/constants/roles");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const citizen = await Citizen.findById(decoded.id).select("-passwordHash");
    if (!citizen) {
      return res.status(401).json({ success: false, message: "Not authorized, citizen not found" });
    }

    req.citizen = citizen;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Not authorized, invalid token" });
  }
};

// Restricts a route to specific roles, e.g. authorize(ROLES.ADMIN)
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.citizen || !allowedRoles.includes(req.citizen.role)) {
      return res.status(403).json({ success: false, message: "You are not authorized to access this resource" });
    }
    next();
  };
};

module.exports = { protect, authorize, ROLES };