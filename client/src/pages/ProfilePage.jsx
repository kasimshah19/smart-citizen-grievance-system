import { useState } from "react";
import { User, Mail, Phone, MapPin, CheckCircle2, Edit2, X } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

function ProfilePage() {
  const { citizen, updateCitizen } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: citizen?.fullName || "",
    district: citizen?.district || "",
    taluka: citizen?.taluka || "",
    city: citizen?.city || "",
    area: citizen?.area || "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    setFormData({
      fullName: citizen?.fullName || "",
      district: citizen?.district || "",
      taluka: citizen?.taluka || "",
      city: citizen?.city || "",
      area: citizen?.area || "",
    });
    setEditing(false);
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!formData.fullName.trim()) {
      setError("Full name cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const res = await api.put("/api/auth/me", formData);
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

  const initials = citizen?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-2xl text-ink mb-1">My Profile</h1>
        <p className="text-slate text-sm mb-8">View and manage your account information.</p>

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
          {/* Header */}
          <div className="bg-ink px-6 py-8 flex items-center gap-4">
            <span className="w-16 h-16 rounded-full bg-signal text-paper text-xl font-medium flex items-center justify-center shrink-0">
              {initials}
            </span>
            <div>
              <h2 className="font-display text-xl text-paper">{citizen?.fullName}</h2>
              <p className="text-paper/60 text-sm">{citizen?.role}</p>
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
                    <Edit2 size={14} /> Edit Profile
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
                    <MapPin size={16} className="text-slate mt-0.5" />
                    <div>
                      <p className="text-xs text-slate">Address</p>
                      <p className="text-sm text-ink">
                        {[citizen?.area, citizen?.city, citizen?.taluka, citizen?.district]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-line grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate">Account Status</p>
                      <p className="text-sm text-success">Active</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate">Member Since</p>
                      <p className="text-sm text-ink">
                        {citizen?.createdAt
                          ? new Date(citizen.createdAt).toLocaleDateString("en-IN", {
                              month: "long",
                              year: "numeric",
                            })
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-base text-ink">Edit Details</h3>
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
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-ink mb-1.5">District</label>
                    <input
                      className={inputClass}
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-ink mb-1.5">Taluka</label>
                    <input
                      className={inputClass}
                      name="taluka"
                      value={formData.taluka}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-ink mb-1.5">City</label>
                    <input
                      className={inputClass}
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-ink mb-1.5">Area</label>
                    <input
                      className={inputClass}
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="bg-ink/5 rounded-lg px-4 py-3">
                  <p className="text-xs text-slate">
                    Email and mobile number cannot be changed here for security reasons.
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
    </DashboardLayout>
  );
}

export default ProfilePage;