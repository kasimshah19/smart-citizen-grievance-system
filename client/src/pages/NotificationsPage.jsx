import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck, FileText } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../services/api";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/notifications");
      setNotifications(res.data.notifications);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/api/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-ink">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-slate mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 text-sm text-signal hover:underline"
          >
            <CheckCheck size={15} /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white border border-line rounded-2xl p-10 text-center text-slate text-sm">
          Loading…
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white border border-line rounded-2xl p-16 text-center">
          <Bell size={32} className="text-slate mx-auto mb-3" />
          <p className="text-slate text-sm">You have no notifications yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-line rounded-2xl divide-y divide-line">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-5 flex items-start gap-4 ${!n.read ? "bg-signal/5" : ""}`}
            >
              <div className="w-9 h-9 rounded-lg bg-ink/5 flex items-center justify-center shrink-0">
                <FileText size={16} className="text-ink" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-ink">{n.title}</p>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-signal shrink-0 mt-1.5" />}
                </div>
                <p className="text-sm text-slate mt-0.5">{n.message}</p>
                <div className="flex items-center gap-3 mt-2">
                  <p className="text-xs text-slate/70">{timeAgo(n.createdAt)}</p>
                  {n.relatedComplaint && (
                    <Link
                      to={`/dashboard/complaints/${n.relatedComplaint}`}
                      className="text-xs text-signal hover:underline"
                    >
                      View complaint
                    </Link>
                  )}
                  {!n.read && (
                    <button
                      onClick={() => handleMarkAsRead(n._id)}
                      className="text-xs text-slate hover:text-ink"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default NotificationsPage;