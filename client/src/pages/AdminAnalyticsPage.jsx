import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, CheckCircle2, Clock, FileText } from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import api from "../services/api";

// Theme colors, as hex — recharts renders raw SVG so Tailwind classes won't apply to fills
const COLORS = {
  ink: "#142330",
  signal: "#C1552C",
  signalDark: "#A6431F",
  slate: "#5B6B74",
  line: "#DEDACD",
  success: "#2B6E4F",
  error: "#B3261E",
};

const PIE_COLORS = [COLORS.signal, COLORS.success, COLORS.ink, COLORS.slate, COLORS.error, COLORS.signalDark];

function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/admin/analytics")
      .then((res) => setAnalytics(res.data.analytics))
      .catch((err) => setError(err.response?.data?.message || "Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout breadcrumb="Analytics">
        <div className="bg-white border border-line rounded-2xl p-10 text-center text-slate text-sm">
          Loading…
        </div>
      </AdminLayout>
    );
  }

  if (error || !analytics) {
    return (
      <AdminLayout breadcrumb="Analytics">
        <div className="bg-white border border-line rounded-2xl p-10 text-center text-error text-sm">
          {error || "Something went wrong"}
        </div>
      </AdminLayout>
    );
  }

  const { byCategory, byDepartment, byStatus, byPriority, monthlyTrend, avgResolutionDays, totalComplaints, resolvedCount } =
    analytics;

  const statCards = [
    { label: "Total Complaints", value: totalComplaints, icon: FileText },
    { label: "Resolved / Closed", value: resolvedCount, icon: CheckCircle2 },
    {
      label: "Avg Resolution Time",
      value: avgResolutionDays !== null ? `${avgResolutionDays} days` : "—",
      icon: Clock,
    },
    {
      label: "Resolution Rate",
      value: totalComplaints > 0 ? `${Math.round((resolvedCount / totalComplaints) * 100)}%` : "—",
      icon: TrendingUp,
    },
  ];

  const tooltipStyle = {
    background: "#FFFFFF",
    border: `1px solid ${COLORS.line}`,
    borderRadius: 8,
    fontSize: 12,
  };

  return (
    <AdminLayout breadcrumb="Analytics">
      <h1 className="font-display text-2xl text-ink mb-6">Analytics</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white border border-line rounded-2xl p-5">
            <Icon size={18} className="text-signal mb-2" />
            <p className="font-display text-2xl text-ink">{value}</p>
            <p className="text-xs text-slate mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Monthly trend */}
      <div className="bg-white border border-line rounded-2xl p-6 mb-6">
        <h2 className="font-display text-lg text-ink mb-4">Complaints Over the Last 6 Months</h2>
        {monthlyTrend.every((m) => m.count === 0) ? (
          <p className="text-sm text-slate text-center py-10">No complaint data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid stroke={COLORS.line} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: COLORS.slate }} axisLine={{ stroke: COLORS.line }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: COLORS.slate }} axisLine={{ stroke: COLORS.line }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="count" name="Complaints" stroke={COLORS.signal} strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* By Category */}
        <div className="bg-white border border-line rounded-2xl p-6">
          <h2 className="font-display text-lg text-ink mb-4">Complaints by Category</h2>
          {byCategory.length === 0 ? (
            <p className="text-sm text-slate text-center py-10">No complaint data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byCategory} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke={COLORS.line} horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: COLORS.slate }} axisLine={{ stroke: COLORS.line }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 11, fill: COLORS.slate }}
                  axisLine={{ stroke: COLORS.line }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" name="Complaints" fill={COLORS.signal} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* By Department */}
        <div className="bg-white border border-line rounded-2xl p-6">
          <h2 className="font-display text-lg text-ink mb-4">Complaints by Department</h2>
          {byDepartment.length === 0 ? (
            <p className="text-sm text-slate text-center py-10">No complaint data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byDepartment} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke={COLORS.line} horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: COLORS.slate }} axisLine={{ stroke: COLORS.line }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 11, fill: COLORS.slate }}
                  axisLine={{ stroke: COLORS.line }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" name="Complaints" fill={COLORS.ink} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* By Status */}
        <div className="bg-white border border-line rounded-2xl p-6">
          <h2 className="font-display text-lg text-ink mb-4">Complaints by Status</h2>
          {byStatus.length === 0 ? (
            <p className="text-sm text-slate text-center py-10">No complaint data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={{ fontSize: 11 }}>
                  {byStatus.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* By Priority */}
        <div className="bg-white border border-line rounded-2xl p-6">
          <h2 className="font-display text-lg text-ink mb-4">Complaints by Priority</h2>
          {byPriority.length === 0 ? (
            <p className="text-sm text-slate text-center py-10">No complaint data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byPriority}>
                <CartesianGrid stroke={COLORS.line} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: COLORS.slate }} axisLine={{ stroke: COLORS.line }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: COLORS.slate }} axisLine={{ stroke: COLORS.line }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" name="Complaints" fill={COLORS.signal} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminAnalyticsPage;
