import { useState } from "react";
import { Lock, Eye, EyeOff, Shield } from "lucide-react";
import EmployeeLayout from "../components/layout/EmployeeLayout";
import api from "../services/api";

function EmployeeSettingsPage() {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
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

  return (
    <EmployeeLayout breadcrumb="Settings">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl text-ink mb-1">Settings</h1>
          <p className="text-slate text-sm">Manage your account security.</p>
        </div>

        <div className="bg-white border border-line rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <Lock size={18} className="text-ink" />
            <h2 className="font-display text-lg text-ink">Change Password</h2>
          </div>
          <p className="text-slate text-sm mb-5">
            Set your own password to replace the temporary one your administrator shared with you.
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
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
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
    </EmployeeLayout>
  );
}

export default EmployeeSettingsPage;