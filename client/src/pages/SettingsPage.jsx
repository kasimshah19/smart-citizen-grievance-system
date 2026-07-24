import { useState } from "react";
import { Lock, Bell, Eye, EyeOff, Shield } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../services/api";

function SettingsPage() {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [notifPrefs, setNotifPrefs] = useState({
    smsUpdates: true,
    emailUpdates: true,
    statusChanges: true,
  });

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleToggle = (key) => {
    setNotifPrefs({ ...notifPrefs, [key]: !notifPrefs[key] });
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

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl text-ink mb-1">Settings</h1>
          <p className="text-slate text-sm">Manage your account security and preferences.</p>
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

        {/* Notification Preferences */}
        <div className="bg-white border border-line rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <Bell size={18} className="text-ink" />
            <h2 className="font-display text-lg text-ink">Notification Preferences</h2>
          </div>
          <p className="text-slate text-sm mb-5">Choose how you'd like to be notified about updates.</p>

          <div className="space-y-4">
            {[
              { key: "smsUpdates", label: "SMS Updates", desc: "Get OTPs and alerts via SMS" },
              { key: "emailUpdates", label: "Email Updates", desc: "Receive updates via email" },
              { key: "statusChanges", label: "Complaint Status Changes", desc: "Notify me when a complaint status changes" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-ink">{item.label}</p>
                  <p className="text-xs text-slate">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(item.key)}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    notifPrefs[item.key] ? "bg-signal" : "bg-line"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      notifPrefs[item.key] ? "translate-x-5.5 left-0.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate mt-4 pt-4 border-t border-line">
            Note: Preferences are saved locally for now. Full notification delivery will be available once the Notifications module is complete.
          </p>
        </div>

        {/* Account Security Info */}
        <div className="bg-ink text-paper rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={18} />
            <h2 className="font-display text-lg">Account Security</h2>
          </div>
          <p className="text-paper/70 text-sm">
            Your account is protected with two-step verification (password + OTP) on every login.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default SettingsPage;