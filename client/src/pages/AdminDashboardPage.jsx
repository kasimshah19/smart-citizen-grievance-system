import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  CalendarClock,
  Clock,
  Eye,
  UserCheck,
  Loader2,
  CheckCircle2,
  Lock,
  RotateCcw,
  Users,
  UserCog,
  Building2,
  LifeBuoy,
  Megaphone,
  ArrowRight,
} from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import api from "../services/api";

const STATUS_COLORS = {
  Submitted: "bg-slate/10 text-slate",
  "Under Review": "bg-signal/10 text-signal",
  Assigned: "bg-signal/10 text-signal",
  "In Progress": "bg-signal/10 text-signal",
  Resolved: "bg-success/10 text-success",
  Closed: "bg-ink/10 text-ink",
};

function AdminDashboardPage() {
  const [kpis, setKpis] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [summaryRes, recentRes, statusRes] = await Promise.all([
          api.get("/api/admin/dashboard/summary"),
          api.get("/api/admin/dashboard/recent-complaints"),
          api.get("/api/admin/dashboard/system-status"),
        ]);
        setKpis(summaryRes.data.summary.kpis);
        setRecentComplaints(recentRes.data.complaints);
        setSystemStatus(statusRes.data.status);
      } catch (error) {
        console.error("Failed to load admin dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const kpiCards = [
    { label: "Total Complaints", value: kpis?.total ?? 0, icon: ClipboardList },
    { label: "Today's Complaints", value: kpis?.today ?? 0, icon: CalendarClock },
    { label: "Pending", value: kpis?.pending ?? 0, icon: Clock },
    { label: "Under Review", value: kpis?.underReview ?? 0, icon: Eye },
    { label: "Assigned", value: kpis?.assigned ?? 0, icon: UserCheck },
    { label: "In Progress", value: kpis?.inProgress ?? 0, icon: Loader2 },
    { label: "Resolved", value: kpis?.resolved ?? 0, icon: CheckCircle2 },
    { label: "Closed", value: kpis?.closed ?? 0, icon: Lock },
    { label: "Reopened", value: kpis?.reopened ?? 0, icon: RotateCcw },
  ];

  const statusCards = [
    { label: "Active Citizens", value: systemStatus?.activeCitizens ?? 0, icon: Users },
    { label: "Registered Employees", value: systemStatus?.registeredEmployees ?? 0, icon: UserCog },
    { label: "Departments", value: systemStatus?.departments ?? 0, icon: Building2 },
    { label: "Open Support Tickets", value: systemStatus?.openSupportTickets ?? 0, icon: LifeBuoy },
  ];

  return (
    <AdminLayout breadcrumb="Overview">
      <div className="space-y-8">
        {/* KPI Cards */}
        <div>
          <h2 className="font-display text-lg text-ink mb-3">Complaint Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {kpiCards.map((kpi) => (
              <div key={kpi.label} className="bg-white border border-line rounded-2xl p-4">
                <div className="w-8 h-8 rounded-lg bg-ink/5 flex items-center justify-center mb-3">
                  <kpi.icon size={16} className="text-ink" />
                </div>
                <p className="text-xl font-display text-ink">{loading ? "…" : kpi.value}</p>
                <p className="text-xs text-slate mt-1">{kpi.label}</p>
                <p className="text-[10px] text-slate/50 mt-1">— vs last period</p>
              </div>
            ))}
          </div>
        </div>

        {/* Charts placeholders */}
        <div>
          <h2 className="font-display text-lg text-ink mb-3">Analytics</h2>
          <div className="grid lg:grid-cols-2 gap-4">
            {[
              "Complaints by Category",
              "Complaints by Department",
              "Monthly Complaints",
              "Average Resolution Time",
            ].map((chartTitle) => (
              <div key={chartTitle} className="bg-white border border-line rounded-2xl p-5">
                <p className="text-sm font-medium text-ink mb-4">{chartTitle}</p>
                <div className="h-40 rounded-lg bg-ink/5 flex items-center justify-center">
                  <p className="text-xs text-slate">Chart data will appear here</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Complaints table */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg text-ink">Recent Complaints</h2>
              <Link to="/admin/complaints" className="text-sm text-signal hover:underline flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>

            <div className="bg-white border border-line rounded-2xl overflow-hidden">
              {loading ? (
                <div className="p-10 text-center text-slate text-sm">Loading…</div>
              ) : recentComplaints.length === 0 ? (
                <div className="p-10 text-center text-slate text-sm">No complaints yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-line text-left">
                        <th className="px-4 py-3 text-xs text-slate font-medium">ID</th>
                        <th className="px-4 py-3 text-xs text-slate font-medium">Citizen</th>
                        <th className="px-4 py-3 text-xs text-slate font-medium hidden sm:table-cell">Category</th>
                        <th className="px-4 py-3 text-xs text-slate font-medium hidden md:table-cell">Priority</th>
                        <th className="px-4 py-3 text-xs text-slate font-medium">Status</th>
                        <th className="px-4 py-3 text-xs text-slate font-medium hidden lg:table-cell">Date</th>
                        <th className="px-4 py-3 text-xs text-slate font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentComplaints.map((c) => (
                        <tr key={c.id} className="border-b border-line last:border-0">
                          <td className="px-4 py-3 font-mono text-xs text-slate">{c.complaintNumber}</td>
                          <td className="px-4 py-3 text-ink">{c.citizenName}</td>
                          <td className="px-4 py-3 text-slate hidden sm:table-cell">{c.category}</td>
                          <td className="px-4 py-3 text-slate hidden md:table-cell">{c.priority}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2.5 py-0.5 rounded-full ${STATUS_COLORS[c.status]}`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate hidden lg:table-cell">
                            {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </td>
                          <td className="px-4 py-3">
                            <Eye size={15} className="text-slate" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* System Status */}
            <div>
              <h2 className="font-display text-base text-ink mb-3">System Status</h2>
              <div className="grid grid-cols-2 gap-3">
                {statusCards.map((s) => (
                  <div key={s.label} className="bg-white border border-line rounded-2xl p-4">
                    <s.icon size={16} className="text-ink mb-2" />
                    <p className="text-lg font-display text-ink">{loading ? "…" : s.value}</p>
                    <p className="text-[11px] text-slate">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Announcements preview */}
            <div className="bg-white border border-line rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Megaphone size={16} className="text-ink" />
                  <h2 className="font-display text-base text-ink">Announcements</h2>
                </div>
              </div>
              <p className="text-sm text-slate mb-4">No announcements published yet.</p>
              <Link
                to="/admin/announcements"
                className="inline-block text-sm text-signal hover:underline"
              >
                Manage Announcements
              </Link>
            </div>

            {/* Support tickets preview */}
            <div className="bg-white border border-line rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <LifeBuoy size={16} className="text-ink" />
                  <h2 className="font-display text-base text-ink">Support Tickets</h2>
                </div>
              </div>
              <p className="text-sm text-slate mb-4">
                {systemStatus?.openSupportTickets ?? 0} open ticket(s).
              </p>
              <Link
                to="/admin/support-tickets"
                className="inline-block text-sm text-signal hover:underline"
              >
                View All Tickets
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboardPage;