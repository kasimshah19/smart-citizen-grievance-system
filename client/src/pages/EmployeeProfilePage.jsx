import { useState } from "react";
import { User, Mail, Phone, Building2, CheckCircle2, Edit2, X } from "lucide-react";
import EmployeeLayout from "../components/layout/EmployeeLayout";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

function EmployeeProfilePage() {
  const { citizen, updateCitizen } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(citizen?.fullName || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const initials = citizen?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleCancel = () => {
    setFullName(citizen?.fullName || "");
    setEditing(false);
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!fullName.trim()) {
      setError("Full name cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const res = await api.put("/api/auth/me", { fullName });
      updateCitizen(res.data.citizen);
      setMessage("Profile updated successfully");
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-paper border border-line rounded-lg text-ink placeholder:text-slate/60 focus:outline-none focus:border-ink transition-colors text-sm";

  return (
    <EmployeeLayout breadcrumb="Profile">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-2xl text-ink mb-1">My Profile</h1>
        <p className="text-slate text-sm mb-8">
          You can update your name here. Contact your administrator to change your department, email, or phone.
        </p>

        {message && (
          <div className="mb-5 text-sm bg-success/5 border border-success/30 rounded-lg px-4 py-3 text-success">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-5 text-sm bg-error/5 border border-error/30 rounded-lg px-4 py-3 text-error">
            {error}
          </div>
        )}

        <div className="bg-white border border-line rounded-2xl overflow-hidden">
          <div className="bg-ink px-6 py-8 flex items-center gap-4">
            <span className="w-16 h-16 rounded-full bg-signal text-paper text-xl font-medium flex items-center justify-center shrink-0">
              {initials}
            </span>
            <div>
              <h2 className="font-display text-xl text-paper">{citizen?.fullName}</h2>
              <p className="text-paper/60 text-sm">{citizen?.role} — {citizen?.department}</p>
            </div>
          </div>

          <div className="p-6">
            {!editing ? (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display text-base text-ink">Account Details</h3>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 text-sm text-signal hover:underline"
                  >
                    <Edit2 size={14} /> Edit Name
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User size={16} className="text-slate mt-0.5" />
                    <div>
                      <p className="text-xs text-slate">Full Name</p>
                      <p className="text-sm text-ink">{citizen?.fullName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail size={16} className="text-slate mt-0.5" />
                    <div>
                      <p className="text-xs text-slate">Email Address</p>
                      <p className="text-sm text-ink">{citizen?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone size={16} className="text-slate mt-0.5" />
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-xs text-slate">Mobile Number</p>
                        <p className="text-sm text-ink">{citizen?.phone}</p>
                      </div>
                      {citizen?.phoneVerified && (
                        <span className="flex items-center gap-1 text-xs text-success">
                          <CheckCircle2 size={12} /> Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 size={16} className="text-slate mt-0.5" />
                    <div>
                      <p className="text-xs text-slate">Department</p>
                      <p className="text-sm text-ink">{citizen?.department}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-line">
                    <p className="text-xs text-slate">
                      To change your password, go to Settings from the sidebar.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-base text-ink">Edit Name</h3>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-1 text-sm text-slate hover:text-ink"
                  >
                    <X size={14} /> Cancel
                  </button>
                </div>

                <div>
                  <label className="block text-sm text-ink mb-1.5">Full Name</label>
                  <input
                    className={inputClass}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="bg-ink/5 rounded-lg px-4 py-3">
                  <p className="text-xs text-slate">
                    Email, phone, and department cannot be changed here. Contact your administrator for those updates.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-ink text-paper rounded-lg font-medium hover:bg-signal transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving…" : "Save Changes"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}

export default EmployeeProfilePage;