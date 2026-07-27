const Announcement = require("./announcement.model");

// Citizen dashboard — most recent active announcements
const getActiveAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ active: true })
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({ success: true, announcements });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

module.exports = { getActiveAnnouncements };
