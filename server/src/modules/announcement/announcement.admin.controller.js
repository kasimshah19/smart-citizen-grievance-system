const Announcement = require("./announcement.model");

// Create a new announcement
const createAnnouncement = async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({ success: false, message: "Title and message are required" });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      createdBy: req.citizen._id,
    });

    return res.status(201).json({ success: true, message: "Announcement published successfully", announcement });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// List all announcements (active and inactive) for the admin management page
const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, announcements });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Update an announcement's title, message, or active status
const updateAnnouncement = async (req, res) => {
  try {
    const { title, message, active } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (message !== undefined) updates.message = message.trim();
    if (active !== undefined) updates.active = active;

    const announcement = await Announcement.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    return res.status(200).json({ success: true, message: "Announcement updated successfully", announcement });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Delete an announcement
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    return res.status(200).json({ success: true, message: "Announcement deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

module.exports = { createAnnouncement, getAllAnnouncements, updateAnnouncement, deleteAnnouncement };
