import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Tag, AlertCircle, Clock, Radio, Users, Star } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import api, { API_BASE_URL } from "../services/api";
import { connectSocket } from "../services/socket";
import { STATUS_COLORS } from "../constants/complaint.constants";

function ComplaintDetailPage() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [justUpdated, setJustUpdated] = useState(false);

  const fetchData = async () => {
    try {
      const [complaintRes, historyRes] = await Promise.all([
        api.get(`/api/complaints/${id}`),
        api.get(`/api/complaints/${id}/history`),
      ]);
      setComplaint(complaintRes.data.complaint);
      setHistory(historyRes.data.history);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load complaint");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Live updates: if the admin changes this complaint while we're looking at
  // it, refresh automatically instead of making the citizen hit reload.
  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return;

    const handleUpdate = (payload) => {
      if (payload.complaintId === id) {
        fetchData();
        setJustUpdated(true);
        setTimeout(() => setJustUpdated(false), 3000);
      }
    };

    socket.on("complaint:updated", handleUpdate);
    return () => socket.off("complaint:updated", handleUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="bg-white border border-line rounded-2xl p-10 text-center text-slate text-sm">
          Loading…
        </div>
      </DashboardLayout>
    );
  }

  if (error || !complaint) {
    return (
      <DashboardLayout>
        <div className="bg-white border border-line rounded-2xl p-10 text-center">
          <AlertCircle size={28} className="text-error mx-auto mb-3" />
          <p className="text-slate text-sm mb-4">{error || "Complaint not found"}</p>
          <Link
            to="/dashboard/complaints"
            className="inline-block px-5 py-2.5 bg-ink text-paper rounded-full text-sm font-medium hover:bg-signal transition-colors"
          >
            Back to My Complaints
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const photoUrl = complaint.photoUrl ? `${API_BASE_URL}${complaint.photoUrl}` : null;

  return (
    <DashboardLayout>
      <Link
        to="/dashboard/complaints"
        className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-ink transition-colors mb-4"
      >
        <ArrowLeft size={15} />
        Back to My Complaints
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Complaint details */}
        <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-line rounded-2xl overflow-hidden h-fit">
          {photoUrl && (
            <img src={photoUrl} alt={complaint.title} className="w-full max-h-80 object-cover" />
          )}

          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs text-slate">{complaint.complaintNumber}</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full ${STATUS_COLORS[complaint.status]}`}>
                {complaint.status}
              </span>
              {justUpdated && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-success/10 text-success flex items-center gap-1">
                  <Radio size={11} /> Updated just now
                </span>
              )}
              {complaint.reportCount > 1 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-signal/10 text-signal flex items-center gap-1">
                  <Users size={11} /> Reported by {complaint.reportCount} citizens
                </span>
              )}
            </div>

            <h1 className="font-display text-2xl text-ink mb-2">{complaint.title}</h1>
            <p className="text-slate text-sm leading-relaxed mb-6">{complaint.description}</p>

            <div className="grid sm:grid-cols-2 gap-4 pt-6 border-t border-line">
              <div className="flex items-start gap-3">
                <Tag size={16} className="text-slate mt-0.5" />
                <div>
                  <p className="text-xs text-slate">Category</p>
                  <p className="text-sm text-ink">{complaint.category}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle size={16} className="text-slate mt-0.5" />
                <div>
                  <p className="text-xs text-slate">Priority</p>
                  <p className="text-sm text-ink">{complaint.priority}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:col-span-2">
                <MapPin size={16} className="text-slate mt-0.5" />
                <div>
                  <p className="text-xs text-slate">Location</p>
                  <p className="text-sm text-ink">{complaint.location?.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-slate mt-0.5" />
                <div>
                  <p className="text-xs text-slate">Submitted On</p>
                  <p className="text-sm text-ink">
                    {new Date(complaint.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {complaint.department && (
                <div className="flex items-start gap-3">
                  <Tag size={16} className="text-slate mt-0.5" />
                  <div>
                    <p className="text-xs text-slate">Assigned Department</p>
                    <p className="text-sm text-ink">{complaint.department}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <RatingCard complaint={complaint} onRated={fetchData} />
        </div>

        {/* Right: Timeline */}
        <div className="bg-white border border-line rounded-2xl p-6 h-fit">
          <h2 className="font-display text-lg text-ink mb-5">Complaint Timeline</h2>

          {history.length === 0 ? (
            <p className="text-sm text-slate">No history available yet.</p>
          ) : (
            <div className="space-y-6">
              {history.map((h, index) => (
                <div key={h._id} className="relative pl-6">
                  {index !== history.length - 1 && (
                    <span className="absolute left-[5px] top-3 bottom-[-24px] w-px bg-line" />
                  )}
                  <span
                    className={`absolute left-0 top-1 w-2.5 h-2.5 rounded-full ${
                      index === history.length - 1 ? "bg-signal" : "bg-ink/20"
                    }`}
                  />
                  <p className="text-sm font-medium text-ink">{h.action}</p>
                  <p className="text-xs text-slate mt-0.5">
                    {h.status} · {h.performerRole}
                    {h.performedBy?.fullName ? ` (${h.performedBy.fullName})` : ""}
                  </p>
                  {h.remarks && <p className="text-xs text-slate mt-1">{h.remarks}</p>}
                  <p className="text-xs text-slate/70 mt-1 flex items-center gap-1">
                    <Clock size={11} />
                    {new Date(h.createdAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ComplaintDetailPage;

// A small, self-contained card for rating a resolved complaint. Kept as its
// own component (own state, own submit handler) so it doesn't touch or
// depend on anything inside ComplaintDetailPage itself.
function RatingCard({ complaint, onRated }) {
  const [hoverValue, setHoverValue] = useState(0);
  const [selectedValue, setSelectedValue] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isRateable = ["Resolved", "Closed"].includes(complaint.status);
  if (!isRateable) return null;

  // Already rated — show it as a simple read-only summary
  if (complaint.rating) {
    return (
      <div className="bg-white border border-line rounded-2xl p-6">
        <h2 className="font-display text-lg text-ink mb-3">Your Feedback</h2>
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              size={20}
              className={n <= complaint.rating ? "fill-signal text-signal" : "text-line"}
            />
          ))}
        </div>
        {complaint.ratingFeedback && (
          <p className="text-sm text-slate">{complaint.ratingFeedback}</p>
        )}
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedValue === 0) {
      setError("Please select a star rating");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.post(`/api/complaints/${complaint._id}/rate`, {
        rating: selectedValue,
        feedback,
      });
      onRated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-line rounded-2xl p-6">
      <h2 className="font-display text-lg text-ink mb-1">How did we do?</h2>
      <p className="text-sm text-slate mb-4">Your complaint has been resolved — let us know how it went.</p>

      {error && (
        <div className="mb-4 text-sm bg-error/5 border border-error/30 rounded-lg px-4 py-3 text-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setSelectedValue(n)}
              onMouseEnter={() => setHoverValue(n)}
              onMouseLeave={() => setHoverValue(0)}
              className="p-0.5"
            >
              <Star
                size={28}
                className={
                  n <= (hoverValue || selectedValue) ? "fill-signal text-signal" : "text-line"
                }
              />
            </button>
          ))}
        </div>

        <textarea
          rows={2}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Optional comment about how it was handled…"
          className="w-full px-4 py-3 bg-paper border border-line rounded-lg text-ink placeholder:text-slate/60 focus:outline-none focus:border-ink transition-colors text-sm resize-none mb-4"
        />

        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 bg-ink text-paper rounded-lg text-sm font-medium hover:bg-signal transition-colors disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
}