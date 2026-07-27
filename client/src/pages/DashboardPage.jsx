import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FilePlus,
  FileText,
  Bell,
  UserCog,
  ClipboardList,
  Clock,
  Loader2,
  CheckCircle2,
  Inbox,
  Phone,
  HelpCircle,
  MessageCircle,
} from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const statusMeta = [
  { key: "submitted", label: "Submitted", color: "bg-slate" },
  { key: "underReview", label: "Under Review", color: "bg-signal" },
  { key: "assigned", label: "Assigned", color: "bg-signal" },
  { key: "inProgress", label: "In Progress", color: "bg-signal" },
  { key: "resolved", label: "Resolved", color: "bg-success" },
  { key: "closed", label: "Closed", color: "bg-ink" },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function DashboardPage() {
  const { citizen } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get("/api/dashboard/summary");
        setSummary(res.data.summary);
      } catch (error) {
        console.error("Failed to load dashboard summary", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();

    const fetchAnnouncements = async () => {
      try {
        const res = await api.get("/api/announcements");
        setAnnouncements(res.data.announcements);
      } catch (error) {
        console.error("Failed to load announcements", error);
      }
    };
    fetchAnnouncements();
  }, []);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const profileFields = [
    { label: "Full Name", value: citizen?.fullName },
    { label: "Email", value: citizen?.email },
    { label: "Mobile Number", value: citizen?.phone },
    { label: "District", value: citizen?.district },
    { label: "Taluka", value: citizen?.taluka },
    { label: "City", value: citizen?.city },
    { label: "Area", value: citizen?.area },
    { label: "Role", value: citizen?.role },
  ];

  const completionFields = [
    "fullName",
    "email",
    "phone",
    "district",
    "taluka",
    "city",
    "area",
  ];
  const filledCount = completionFields.filter((f) => citizen?.[f]).length;
  const completionPercent = Math.round(
    (filledCount / completionFields.length) * 100,
  );

  const statCards = [
    {
      label: "Total Complaints",
      value: summary?.stats.total ?? 0,
      icon: ClipboardList,
    },
    { label: "Pending", value: summary?.stats.pending ?? 0, icon: Clock },
    {
      label: "In Progress",
      value: summary?.stats.inProgress ?? 0,
      icon: Loader2,
    },
    {
      label: "Resolved",
      value: summary?.stats.resolved ?? 0,
      icon: CheckCircle2,
    },
  ];

  const quickActions = [
    {
      label: "Register New Complaint",
      desc: "File a new civic issue",
      icon: FilePlus,
      path: "/dashboard/new-complaint",
    },
    {
      label: "View My Complaints",
      desc: "Track submitted complaints",
      icon: FileText,
      path: "/dashboard/complaints",
    },
    {
      label: "View Notifications",
      desc: "See recent updates",
      icon: Bell,
      path: "/dashboard/notifications",
    },
    {
      label: "Update Profile",
      desc: "Manage your information",
      icon: UserCog,
      path: "/dashboard/profile",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <p className="text-slate text-sm mb-1">{today}</p>
          <h1 className="font-display text-3xl text-ink mb-2">
            {getGreeting()}, {citizen?.fullName?.split(" ")[0]}
          </h1>
          <p className="text-slate">
            Welcome back to the Smart Citizen Grievance Management System.
            Report civic issues and track their resolution here.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-line rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-ink/5 flex items-center justify-center">
                  <stat.icon size={18} className="text-ink" />
                </div>
              </div>
              <p className="text-2xl font-display text-ink">{stat.value}</p>
              <p className="text-xs text-slate mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div>
              <h2 className="font-display text-lg text-ink mb-3">
                Quick Actions
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    to={action.path}
                    className="group bg-white border border-line rounded-2xl p-5 hover:border-ink hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-signal/10 text-signal flex items-center justify-center mb-3 group-hover:bg-signal group-hover:text-paper transition-colors">
                      <action.icon size={18} />
                    </div>
                    <p className="text-sm font-medium text-ink">
                      {action.label}
                    </p>
                    <p className="text-xs text-slate mt-1">{action.desc}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Complaints */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg text-ink">
                  Recent Complaints
                </h2>
                <Link
                  to="/dashboard/complaints"
                  className="text-sm text-signal hover:underline"
                >
                  View all
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
                      to={`/dashboard/complaints/${c.id}`}
                      className="p-4 flex items-center justify-between hover:bg-ink/5 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink">
                          {c.title}
                        </p>
                        <p className="text-xs text-slate">
                          {c.category} · {c.submittedOn}
                        </p>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-ink/5 text-ink">
                        {c.status}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-line rounded-2xl p-10 text-center">
                  <Inbox size={28} className="text-slate mx-auto mb-3" />
                  <p className="text-slate text-sm mb-4">
                    You haven't filed any complaints yet.
                  </p>
                  <Link
                    to="/dashboard/new-complaint"
                    className="inline-block px-5 py-2.5 bg-ink text-paper rounded-full text-sm font-medium hover:bg-signal transition-colors"
                  >
                    Register Your First Complaint
                  </Link>
                </div>
              )}
            </div>

            {/* Status Overview */}
            <div>
              <h2 className="font-display text-lg text-ink mb-3">
                Complaint Status Overview
              </h2>
              <div className="bg-white border border-line rounded-2xl p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {statusMeta.map((status) => (
                  <div key={status.key} className="flex items-center gap-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${status.color}`}
                    />
                    <div>
                      <p className="text-sm text-ink">
                        {summary?.statusOverview?.[status.key] ?? 0}
                      </p>
                      <p className="text-xs text-slate">{status.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <div className="bg-white border border-line rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-base text-ink">
                  Profile Summary
                </h2>
                <button className="text-xs text-signal hover:underline">
                  Edit
                </button>
              </div>
              <div className="space-y-3">
                {profileFields.map((f) => (
                  <div
                    key={f.label}
                    className="flex justify-between text-sm gap-2"
                  >
                    <span className="text-slate">{f.label}</span>
                    <span className="text-ink text-right truncate max-w-[55%]">
                      {f.value || "—"}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-sm pt-2 border-t border-line">
                  <span className="text-slate">Phone Verified</span>
                  <span
                    className={
                      citizen?.phoneVerified ? "text-success" : "text-error"
                    }
                  >
                    {citizen?.phoneVerified ? "Verified" : "Not verified"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate">Member Since</span>
                  <span className="text-ink">
                    {citizen?.createdAt
                      ? new Date(citizen.createdAt).toLocaleDateString(
                          "en-IN",
                          { month: "short", year: "numeric" },
                        )
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="bg-white border border-line rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-display text-base text-ink">
                  Profile Completion
                </h2>
                <span className="text-sm text-signal font-medium">
                  {completionPercent}%
                </span>
              </div>
              <div className="w-full h-2 bg-ink/5 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-signal rounded-full transition-all"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <p className="text-xs text-slate">
                Complete your profile to speed up complaint verification.
              </p>
            </div>

            {/* Notifications Preview */}
            <div className="bg-white border border-line rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-base text-ink">
                  Notifications
                </h2>
                <Link
                  to="/dashboard/notifications"
                  className="text-xs text-signal hover:underline"
                >
                  View all
                </Link>
              </div>
              {summary?.notifications?.length > 0 ? (
                <div className="space-y-3">
                  {summary.notifications.map((n) => (
                    <div key={n.id} className="flex gap-3">
                      <Bell size={16} className="text-slate mt-0.5" />
                      <div>
                        <p className="text-sm text-ink">{n.title}</p>
                        <p className="text-xs text-slate">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate text-center py-4">
                  No notifications yet.
                </p>
              )}
            </div>

            {/* Announcements */}
            <div className="bg-white border border-line rounded-2xl p-5">
              <h2 className="font-display text-base text-ink mb-2">
                Announcements
              </h2>
              {announcements.length > 0 ? (
                <div className="space-y-3">
                  {announcements.map((a) => (
                    <div key={a._id} className="pb-3 last:pb-0 border-b last:border-0 border-line">
                      <p className="text-sm font-medium text-ink">{a.title}</p>
                      <p className="text-xs text-slate mt-0.5">{a.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate">
                  No announcements from your municipality at this time.
                </p>
              )}
            </div>

            {/* Help & Support */}
            <div className="bg-ink text-paper rounded-2xl p-5">
              <h2 className="font-display text-base mb-3">Help & Support</h2>
              <div className="space-y-2">
                <Link
                  to="/dashboard/help"
                  className="w-full flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-paper/10 hover:bg-paper/20 transition-colors"
                >
                  <Phone size={15} /> Contact Municipality
                </Link>
                <Link
                  to="/dashboard/help"
                  className="w-full flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-paper/10 hover:bg-paper/20 transition-colors"
                >
                  <HelpCircle size={15} /> Frequently Asked Questions
                </Link>
                <Link
                  to="/dashboard/help"
                  className="w-full flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-paper/10 hover:bg-paper/20 transition-colors"
                >
                  <MessageCircle size={15} /> Support Center
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;
