import { useEffect, useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, Users, Building2, Briefcase, LifeBuoy } from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

function AdminSettingsPage() {
  const { citizen } = useAuth();

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [status, setStatus] = useState(null);

  useEffect(() => {
    api
      .get("/api/admin/dashboard/system-status")
      .then((res) => setStatus(res.data.status))
      .catch((err) => console.error("Failed to load system status", err));
  }, []);

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("New password and confirmation do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await api.put("/api/auth/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setMessage(res.data.message);
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-paper border border-line rounded-lg text-ink placeholder:text-slate/60 focus:outline-none focus:border-ink transition-colors text-sm";

  const statCards = [
    { label: "Active Citizens", value: status?.activeCitizens, icon: Users },
    { label: "Employees", value: status?.registeredEmployees, icon: Briefcase },
    { label: "Departments", value: status?.departments, icon: Building2 },
    { label: "Open Tickets", value: status?.openSupportTickets, icon: LifeBuoy },
  ];

  return (
    <AdminLayout breadcrumb="Settings">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl text-ink mb-1">Settings</h1>
          <p className="text-slate text-sm">Manage your admin account and view system status.</p>
        </div>

        {/* Admin Profile */}
        <div className="bg-white border border-line rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-11 h-11 rounded-full bg-signal text-paper flex items-center justify-center text-sm font-medium shrink-0">
              {citizen?.fullName
                ?.split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-medium text-ink">{citizen?.fullName}</p>
              <p className="text-xs text-slate">Admin Account</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-line">
            <div>
              <p className="text-xs text-slate mb-1">Email</p>
              <p className="text-sm text-ink">{citizen?.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate mb-1">Phone</p>
              <p className="text-sm text-ink">{citizen?.phone}</p>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="bg-white border border-line rounded-2xl p-6">
          <h2 className="font-display text-lg text-ink mb-4">System Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statCards.map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-paper border border-line rounded-xl p-4">
                <Icon size={16} className="text-signal mb-2" />
                <p className="text-lg text-ink font-display">{value ?? "—"}</p>
                <p className="text-[11px] text-slate">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white border border-line rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <Lock size={18} className="text-ink" />
            <h2 className="font-display text-lg text-ink">Change Password</h2>
          </div>
          <p className="text-slate text-sm mb-5">
            Choose a strong password you don't use elsewhere.
          </p>

          {message && (
            <div className="mb-4 text-sm bg-success/5 border border-success/30 rounded-lg px-4 py-3 text-success">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 text-sm bg-error/5 border border-error/30 rounded-lg px-4 py-3 text-error">
              {error}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm text-ink mb-1.5">Current Password</label>
              <input
                className={inputClass}
                type={showPasswords ? "text" : "password"}
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-ink mb-1.5">New Password</label>
              <input
                className={inputClass}
                type={showPasswords ? "text" : "password"}
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                required
              />
              <p className="text-xs text-slate mt-1">
                Minimum 8 characters, with uppercase, lowercase, number, and special character.
              </p>
            </div>

            <div>
              <label className="block text-sm text-ink mb-1.5">Confirm New Password</label>
              <input
                className={inputClass}
                type={showPasswords ? "text" : "password"}
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="flex items-center gap-1.5 text-xs text-slate hover:text-ink"
            >
              {showPasswords ? <EyeOff size={13} /> : <Eye size={13} />}
              {showPasswords ? "Hide passwords" : "Show passwords"}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-ink text-paper rounded-lg font-medium hover:bg-signal transition-colors disabled:opacity-50"
            >
              {loading ? "Updating…" : "Update Password"}
            </button>
          </form>
        </div>

        {/* Account Security Info */}
        <div className="bg-ink text-paper rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={18} />
            <h2 className="font-display text-lg">Account Security</h2>
          </div>
          <p className="text-paper/70 text-sm">
            Your admin account is protected with two-step verification (password + OTP) on every login.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminSettingsPage;
