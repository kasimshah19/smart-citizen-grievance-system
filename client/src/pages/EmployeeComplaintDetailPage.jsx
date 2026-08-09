import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Tag, AlertCircle, Clock, User } from "lucide-react";
import EmployeeLayout from "../components/layout/EmployeeLayout";
import api, { API_BASE_URL } from "../services/api";

const STATUS_COLORS = {
  Assigned: "bg-slate/10 text-slate",
  Accepted: "bg-signal/10 text-signal",
  "In Progress": "bg-signal/10 text-signal",
  Resolved: "bg-success/10 text-success",
};

const ALLOWED_STATUSES = ["Accepted", "In Progress", "Resolved"];

function EmployeeComplaintDetailPage() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [newStatus, setNewStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get(`/api/employee/complaints/${id}`);
      setComplaint(res.data.complaint);
      setHistory(res.data.history);
    } catch (err) {
      console.error("Failed to load complaint", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!newStatus) {
      setMessage("Please select a status");
      return;
    }
    setUpdating(true);
    try {
      await api.put(`/api/employee/complaints/${id}/status`, { status: newStatus, remarks });
      setMessage("Status updated successfully");
      setRemarks("");
      setNewStatus("");
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-paper border border-line rounded-lg text-ink placeholder:text-slate/60 focus:outline-none focus:border-ink transition-colors text-sm";

  if (loading) {
    return (
      <EmployeeLayout breadcrumb="Complaint Detail">
        <div className="bg-white border border-line rounded-2xl p-10 text-center text-slate text-sm">
          Loading…
        </div>
      </EmployeeLayout>
    );
  }

  if (!complaint) {
    return (
      <EmployeeLayout breadcrumb="Complaint Detail">
        <div className="bg-white border border-line rounded-2xl p-10 text-center">
          <AlertCircle size={28} className="text-error mx-auto mb-3" />
          <p className="text-slate text-sm">Complaint not found or not assigned to you.</p>
        </div>
      </EmployeeLayout>
    );
  }

  const photoUrl = complaint.photoUrl ? `${API_BASE_URL}${complaint.photoUrl}` : null;

  return (
    <EmployeeLayout breadcrumb="Complaint Detail">
      <Link
        to="/employee/complaints"
        className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-ink transition-colors mb-4"
      >
        <ArrowLeft size={15} />
        Back to My Complaints
      </Link>

      {message && (
        <div className="mb-5 text-sm bg-ink/5 border border-line rounded-lg px-4 py-3 text-ink">
          {message}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-line rounded-2xl overflow-hidden">
            {photoUrl && (
              <img src={photoUrl} alt={complaint.title} className="w-full max-h-72 object-cover" />
            )}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-xs text-slate">{complaint.complaintNumber}</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full ${STATUS_COLORS[complaint.status] || "bg-ink/5 text-ink"}`}>
                  {complaint.status}
                </span>
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
                <div className="flex items-start gap-3">
                  <User size={16} className="text-slate mt-0.5" />
                  <div>
                    <p className="text-xs text-slate">Citizen</p>
                    <p className="text-sm text-ink">{complaint.citizen?.fullName}</p>
                    <p className="text-xs text-slate">{complaint.citizen?.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status update section */}
          <div className="bg-white border border-line rounded-2xl p-6">
            <h2 className="font-display text-lg text-ink mb-4">Update Status</h2>
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-sm text-ink mb-1.5">New Status</label>
                <select className={inputClass} value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  <option value="">Select status</option>
                  {ALLOWED_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-ink mb-1.5">Remarks</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={3}
                  placeholder="Describe the work done or current progress"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={updating}
                className="px-6 py-2.5 bg-ink text-paper rounded-lg text-sm font-medium hover:bg-signal transition-colors disabled:opacity-50"
              >
                {updating ? "Updating…" : "Update Status"}
              </button>
            </form>
          </div>
        </div>

        {/* Timeline */}
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
    </EmployeeLayout>
  );
}

export default EmployeeComplaintDetailPage;