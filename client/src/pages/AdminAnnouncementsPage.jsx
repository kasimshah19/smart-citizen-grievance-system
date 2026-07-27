import { useEffect, useState } from "react";
import { Plus, X, Edit2, Trash2, Megaphone, Eye, EyeOff } from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import api from "../services/api";

function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: "", message: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get("/api/admin/announcements");
      setAnnouncements(res.data.announcements);
    } catch (err) {
      console.error("Failed to load announcements", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const openCreateForm = () => {
    setFormData({ title: "", message: "" });
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (a) => {
    setFormData({ title: a.title, message: a.message });
    setEditingId(a._id);
    setError("");
    setShowForm(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim() || !formData.message.trim()) {
      setError("Title and message are both required");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/api/admin/announcements/${editingId}`, formData);
      } else {
        await api.post("/api/admin/announcements", formData);
      }
      setShowForm(false);
      fetchAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete announcement "${title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/admin/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete announcement");
    }
  };

  const toggleActive = async (a) => {
    setBusyId(a._id);
    try {
      const res = await api.put(`/api/admin/announcements/${a._id}`, { active: !a.active });
      setAnnouncements((prev) => prev.map((x) => (x._id === a._id ? res.data.announcement : x)));
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setBusyId(null);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-paper border border-line rounded-lg text-ink placeholder:text-slate/60 focus:outline-none focus:border-ink transition-colors text-sm";

  return (
    <AdminLayout breadcrumb="Announcements">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Announcements</h1>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-ink text-paper rounded-full text-sm font-medium hover:bg-signal transition-colors"
        >
          <Plus size={16} /> New Announcement
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-line rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-ink">
              {editingId ? "Edit Announcement" : "New Announcement"}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-slate hover:text-ink">
              <X size={18} />
            </button>
          </div>

          {error && (
            <div className="mb-4 text-sm bg-error/5 border border-error/30 rounded-lg px-4 py-3 text-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-ink mb-1.5">Title</label>
              <input
                className={inputClass}
                name="title"
                placeholder="e.g. Water Supply Maintenance on Sunday"
                value={formData.title}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm text-ink mb-1.5">Message</label>
              <textarea
                className={`${inputClass} resize-none`}
                name="message"
                rows={3}
                placeholder="Details citizens should know…"
                value={formData.message}
                onChange={handleChange}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-ink text-paper rounded-lg text-sm font-medium hover:bg-signal transition-colors disabled:opacity-50"
            >
              {submitting ? "Saving…" : editingId ? "Update Announcement" : "Publish Announcement"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-line rounded-2xl p-10 text-center text-slate text-sm">
          Loading…
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white border border-line rounded-2xl p-16 text-center">
          <Megaphone size={32} className="text-slate mx-auto mb-3" />
          <p className="text-slate text-sm">No announcements yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-line rounded-2xl divide-y divide-line">
          {announcements.map((a) => (
            <div key={a._id} className="p-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-signal/10 text-signal flex items-center justify-center shrink-0">
                  <Megaphone size={16} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-ink">{a.title}</p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        a.active ? "bg-success/10 text-success" : "bg-slate/10 text-slate"
                      }`}
                    >
                      {a.active ? "Published" : "Unpublished"}
                    </span>
                  </div>
                  <p className="text-sm text-slate mt-1">{a.message}</p>
                  <p className="text-[11px] text-slate/70 mt-1.5">
                    {new Date(a.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => toggleActive(a)}
                  disabled={busyId === a._id}
                  title={a.active ? "Unpublish" : "Publish"}
                  className="p-1.5 rounded-lg hover:bg-ink/5 text-slate hover:text-ink disabled:opacity-50"
                >
                  {a.active ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  onClick={() => openEditForm(a)}
                  className="p-1.5 rounded-lg hover:bg-ink/5 text-slate hover:text-ink"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(a._id, a.title)}
                  className="p-1.5 rounded-lg hover:bg-error/10 text-slate hover:text-error"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminAnnouncementsPage;
