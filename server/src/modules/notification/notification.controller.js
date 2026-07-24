const Notification = require("./notification.model");

// Get all notifications for the logged-in citizen
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ citizen: req.citizen._id }).sort({ createdAt: -1 });
    const unreadCount = notifications.filter((n) => !n.read).length;

    return res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Mark a single notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, citizen: req.citizen._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    return res.status(200).json({ success: true, notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ citizen: req.citizen._id, read: false }, { read: true });
    return res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };