import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Inbox, ChevronRight } from "lucide-react";
import EmployeeLayout from "../components/layout/EmployeeLayout";
import api from "../services/api";

const STATUS_COLORS = {
  Assigned: "bg-slate/10 text-slate",
  Accepted: "bg-signal/10 text-signal",
  "In Progress": "bg-signal/10 text-signal",
  Resolved: "bg-success/10 text-success",
};

function EmployeeComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await api.get("/api/employee/complaints", { params });
      setComplaints(res.data.complaints);
    } catch (error) {
      console.error("Failed to load complaints", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  return (
    <EmployeeLayout breadcrumb="My Assigned Complaints">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">My Assigned Complaints</h1>
        <select
          className="px-3 py-2 bg-white border border-line rounded-lg text-ink text-sm focus:outline-none focus:border-ink"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Assigned">Assigned</option>
          <option value="Accepted">Accepted</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {loading ? (
        <div className="bg-white border border-line rounded-2xl p-10 text-center text-slate text-sm">
          Loading…
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white border border-line rounded-2xl p-16 text-center">
          <Inbox size={32} className="text-slate mx-auto mb-3" />
          <p className="text-slate text-sm">No complaints match this filter.</p>
        </div>
      ) : (
        <div className="bg-white border border-line rounded-2xl divide-y divide-line">
          {complaints.map((c) => (
            <Link
              key={c._id}
              to={`/employee/complaints/${c._id}`}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-ink/5 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-slate">{c.complaintNumber}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full ${STATUS_COLORS[c.status] || "bg-ink/5 text-ink"}`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-ink">{c.title}</p>
                <p className="text-xs text-slate mt-0.5">
                  {c.category} · Citizen: {c.citizen?.fullName} ·{" "}
                  {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate">{c.priority} priority</span>
                <ChevronRight size={16} className="text-slate" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </EmployeeLayout>
  );
}

export default EmployeeComplaintsPage;