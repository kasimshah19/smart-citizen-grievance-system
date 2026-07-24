const generateComplaintNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `SCG-${year}-${random}`;
};

module.exports = { generateComplaintNumber };