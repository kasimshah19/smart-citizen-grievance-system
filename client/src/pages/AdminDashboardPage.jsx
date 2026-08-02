import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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
  AlertTriangle,
} from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import api from "../services/api";

const CHART_COLORS = { signal: "#C1552C", ink: "#142330", slate: "#5B6B74", line: "#DEDACD" };

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
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [summaryRes, recentRes, statusRes, analyticsRes] = await Promise.all([
          api.get("/api/admin/dashboard/summary"),
          api.get("/api/admin/dashboard/recent-complaints"),
          api.get("/api/admin/dashboard/system-status"),
          api.get("/api/admin/analytics"),
        ]);
        setKpis(summaryRes.data.summary.kpis);
        setRecentComplaints(recentRes.data.complaints);
        setSystemStatus(statusRes.data.status);
        setAnalytics(analyticsRes.data.analytics);
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

  const overdueCount = kpis?.overdue ?? 0;

  return (
    <AdminLayout breadcrumb="Overview">
      <div className="space-y-8">
        {/* Overdue Alert Banner */}
        {!loading && overdueCount > 0 && (
          <Link
            to="/admin/complaints"
            className="flex items-center gap-3 bg-error/10 border border-error/30 rounded-2xl px-5 py-4 hover:bg-error/15 transition-colors"
          >
            <AlertTriangle size={20} className="text-error shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-error">
                {overdueCount} complaint{overdueCount === 1 ? " has" : "s have"} been pending for over 7 days
              </p>
              <p className="text-xs text-error/80 mt-0.5">
                These complaints are still "Submitted" with no action taken. Click to review them.
              </p>
            </div>
            <ArrowRight size={16} className="text-error shrink-0" />
          </Link>
        )}

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

            {/* Overdue card, styled distinctly since it needs attention */}
            <div
              className={`bg-white border rounded-2xl p-4 ${
                overdueCount > 0 ? "border-error/40 bg-error/5" : "border-line"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                  overdueCount > 0 ? "bg-error/15" : "bg-ink/5"
                }`}
              >
                <AlertTriangle size={16} className={overdueCount > 0 ? "text-error" : "text-ink"} />
              </div>
              <p className={`text-xl font-display ${overdueCount > 0 ? "text-error" : "text-ink"}`}>
                {loading ? "…" : overdueCount}
              </p>
              <p className="text-xs text-slate mt-1">Overdue</p>
              <p className="text-[10px] text-slate/50 mt-1">7+ days, no action</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg text-ink">Analytics</h2>
            <Link
              to="/admin/analytics"
              className="text-xs text-signal hover:text-signal-dark flex items-center gap-1"
            >
              Full analytics <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white border border-line rounded-2xl p-5">
              <p className="text-sm font-medium text-ink mb-4">Complaints by Category</p>
              {loading || !analytics?.byCategory?.length ? (
                <div className="h-40 rounded-lg bg-ink/5 flex items-center justify-center">
                  <p className="text-xs text-slate">{loading ? "Loading…" : "No complaint data yet"}</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={analytics.byCategory}>
                    <CartesianGrid stroke={CHART_COLORS.line} vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: CHART_COLORS.slate }} axisLine={{ stroke: CHART_COLORS.line }} interval={0} angle={-20} textAnchor="end" height={40} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: CHART_COLORS.slate }} axisLine={{ stroke: CHART_COLORS.line }} width={24} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${CHART_COLORS.line}` }} />
                    <Bar dataKey="value" fill={CHART_COLORS.signal} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white border border-line rounded-2xl p-5">
              <p className="text-sm font-medium text-ink mb-4">Complaints by Department</p>
              {loading || !analytics?.byDepartment?.length ? (
                <div className="h-40 rounded-lg bg-ink/5 flex items-center justify-center">
                  <p className="text-xs text-slate">{loading ? "Loading…" : "No complaint data yet"}</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={analytics.byDepartment}>
                    <CartesianGrid stroke={CHART_COLORS.line} vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: CHART_COLORS.slate }} axisLine={{ stroke: CHART_COLORS.line }} interval={0} angle={-20} textAnchor="end" height={40} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: CHART_COLORS.slate }} axisLine={{ stroke: CHART_COLORS.line }} width={24} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${CHART_COLORS.line}` }} />
                    <Bar dataKey="value" fill={CHART_COLORS.ink} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white border border-line rounded-2xl p-5">
              <p className="text-sm font-medium text-ink mb-4">Monthly Complaints</p>
              {loading || !analytics?.monthlyTrend?.length ? (
                <div className="h-40 rounded-lg bg-ink/5 flex items-center justify-center">
                  <p className="text-xs text-slate">{loading ? "Loading…" : "No complaint data yet"}</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={analytics.monthlyTrend}>
                    <CartesianGrid stroke={CHART_COLORS.line} vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: CHART_COLORS.slate }} axisLine={{ stroke: CHART_COLORS.line }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: CHART_COLORS.slate }} axisLine={{ stroke: CHART_COLORS.line }} width={24} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${CHART_COLORS.line}` }} />
                    <Line type="monotone" dataKey="count" stroke={CHART_COLORS.signal} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white border border-line rounded-2xl p-5">
              <p className="text-sm font-medium text-ink mb-4">Average Resolution Time</p>
              <div className="h-40 rounded-lg bg-ink/5 flex flex-col items-center justify-center">
                {loading ? (
                  <p className="text-xs text-slate">Loading…</p>
                ) : analytics?.avgResolutionDays !== null ? (
                  <>
                    <p className="font-display text-4xl text-ink">{analytics.avgResolutionDays}</p>
                    <p className="text-xs text-slate mt-1">days on average</p>
                    <p className="text-[10px] text-slate/60 mt-2">
                      Based on {analytics.resolvedCount} resolved complaint{analytics.resolvedCount === 1 ? "" : "s"}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-slate">No resolved complaints yet</p>
                )}
              </div>
            </div>
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