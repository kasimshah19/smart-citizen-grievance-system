const jwt = require("jsonwebtoken");

const generateAccessToken = (citizenId) => {
  return jwt.sign({ id: citizenId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

module.exports = { generateAccessToken };