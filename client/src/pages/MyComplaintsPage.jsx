import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Inbox, ChevronRight } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../services/api";
import { STATUS_COLORS } from "../constants/complaint.constants";

function MyComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get("/api/complaints/my");
        setComplaints(res.data.complaints);
      } catch (error) {
        console.error("Failed to load complaints", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">My Complaints</h1>
        <Link
          to="/dashboard/new-complaint"
          className="px-4 py-2.5 bg-ink text-paper rounded-full text-sm font-medium hover:bg-signal transition-colors"
        >
          + New Complaint
        </Link>
      </div>

      {loading ? (
        <div className="bg-white border border-line rounded-2xl p-10 text-center text-slate text-sm">
          Loading…
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white border border-line rounded-2xl p-16 text-center">
          <Inbox size={32} className="text-slate mx-auto mb-3" />
          <p className="text-slate text-sm mb-4">You haven't filed any complaints yet.</p>
          <Link
            to="/dashboard/new-complaint"
            className="inline-block px-5 py-2.5 bg-ink text-paper rounded-full text-sm font-medium hover:bg-signal transition-colors"
          >
            Register Your First Complaint
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-line rounded-2xl divide-y divide-line">
          {complaints.map((c) => (
            <Link
              key={c._id}
              to={`/dashboard/complaints/${c._id}`}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-ink/5 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-slate">{c.complaintNumber}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full ${STATUS_COLORS[c.status]}`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-ink">{c.title}</p>
                <p className="text-xs text-slate mt-0.5">
                  {c.category} · {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
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
    </DashboardLayout>
  );
}

export default MyComplaintsPage;