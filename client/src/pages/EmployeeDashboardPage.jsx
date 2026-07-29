import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Clock, Loader2, CheckCircle2, ArrowRight, Inbox } from "lucide-react";
import EmployeeLayout from "../components/layout/EmployeeLayout";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const STATUS_COLORS = {
  Assigned: "bg-slate/10 text-slate",
  Accepted: "bg-signal/10 text-signal",
  "In Progress": "bg-signal/10 text-signal",
  Resolved: "bg-success/10 text-success",
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function EmployeeDashboardPage() {
  const { citizen } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get("/api/employee/dashboard/summary");
        setSummary(res.data.summary);
      } catch (error) {
        console.error("Failed to load employee dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const statCards = [
    { label: "Total Assigned", value: summary?.stats.totalAssigned ?? 0, icon: ClipboardList },
    { label: "Pending", value: summary?.stats.pending ?? 0, icon: Clock },
    { label: "In Progress", value: summary?.stats.inProgress ?? 0, icon: Loader2 },
    { label: "Resolved", value: summary?.stats.resolved ?? 0, icon: CheckCircle2 },
  ];

  return (
    <EmployeeLayout breadcrumb="Overview">
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl text-ink mb-2">
            {getGreeting()}, {citizen?.fullName?.split(" ")[0]}
          </h1>
          <p className="text-slate">
            {citizen?.department} Department — here's what's assigned to you.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-white border border-line rounded-2xl p-5">
              <div className="w-9 h-9 rounded-lg bg-ink/5 flex items-center justify-center mb-3">
                <stat.icon size={18} className="text-ink" />
              </div>
              <p className="text-2xl font-display text-ink">{loading ? "…" : stat.value}</p>
              <p className="text-xs text-slate mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg text-ink">Recently Assigned</h2>
            <Link to="/employee/complaints" className="text-sm text-signal hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="bg-white border border-line rounded-2xl p-10 text-center text-slate text-sm">
              Loading…
            </div>
          ) : summary?.recentComplaints?.length > 0 ? (
            <div className="bg-white border border-line rounded-2xl divide-y divide-line">
              {summary.recentComplaints.map((c) => (
                <Link
                  key={c.id}
                  to={`/employee/complaints/${c.id}`}
                  className="p-4 flex items-center justify-between hover:bg-ink/5 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs text-slate">{c.complaintNumber}</span>
                    </div>
                    <p className="text-sm font-medium text-ink">{c.title}</p>
                    <p className="text-xs text-slate">{c.category} · {c.priority} priority</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${STATUS_COLORS[c.status] || "bg-ink/5 text-ink"}`}>
                    {c.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-line rounded-2xl p-10 text-center">
              <Inbox size={28} className="text-slate mx-auto mb-3" />
              <p className="text-slate text-sm">No complaints assigned to you yet.</p>
            </div>
          )}
        </div>
      </div>
    </EmployeeLayout>
  );
}

export default EmployeeDashboardPage;