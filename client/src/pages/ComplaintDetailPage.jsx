import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Tag, AlertCircle, Clock } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../services/api";
import { STATUS_COLORS } from "../constants/complaint.constants";

function ComplaintDetailPage() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
    fetchData();
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

  const photoUrl = complaint.photoUrl ? `http://localhost:5000${complaint.photoUrl}` : null;

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
        <div className="lg:col-span-2 bg-white border border-line rounded-2xl overflow-hidden h-fit">
          {photoUrl && (
            <img src={photoUrl} alt={complaint.title} className="w-full max-h-80 object-cover" />
          )}

          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs text-slate">{complaint.complaintNumber}</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full ${STATUS_COLORS[complaint.status]}`}>
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