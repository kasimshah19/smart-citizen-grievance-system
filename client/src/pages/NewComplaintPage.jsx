import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Upload, CheckCircle2, Sparkles, X, Users } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../services/api";
import { COMPLAINT_CATEGORIES, PRIORITY_LEVELS } from "../constants/complaint.constants";
import { suggestCategory } from "../utils/categorySuggestion";

function NewComplaintPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    address: "",
  });
  const [coords, setCoords] = useState({ latitude: null, longitude: null });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [dismissedSuggestion, setDismissedSuggestion] = useState(null);
  const [duplicateMatch, setDuplicateMatch] = useState(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [duplicateDismissed, setDuplicateDismissed] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinedComplaint, setJoinedComplaint] = useState(null);

  // As the citizen types the title/description, suggest a category based on
  // keyword matching — but never override a category they've already chosen.
  useEffect(() => {
    const timer = setTimeout(() => {
      const combinedText = `${formData.title} ${formData.description}`;
      const result = suggestCategory(combinedText);

      if (
        result &&
        result.category !== formData.category &&
        result.category !== dismissedSuggestion
      ) {
        setSuggestion(result.category);
      } else {
        setSuggestion(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.title, formData.description, formData.category, dismissedSuggestion]);

  const applySuggestion = () => {
    setFormData((prev) => ({ ...prev, category: suggestion }));
    setSuggestion(null);
  };

  const dismissSuggestion = () => {
    setDismissedSuggestion(suggestion);
    setSuggestion(null);
  };

  // Once both a category and GPS coordinates are available, check whether a
  // similar open complaint already exists nearby — so the citizen can add
  // their voice to it instead of filing a separate one.
  useEffect(() => {
    if (!formData.category || !coords.latitude || !coords.longitude) {
      setDuplicateMatch(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingDuplicate(true);
      try {
        const res = await api.get("/api/complaints/check-duplicate", {
          params: {
            category: formData.category,
            latitude: coords.latitude,
            longitude: coords.longitude,
          },
        });
        setDuplicateMatch(res.data.duplicate);
        setDuplicateDismissed(false);
      } catch (err) {
        console.error("Duplicate check failed", err);
      } finally {
        setCheckingDuplicate(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [formData.category, coords.latitude, coords.longitude]);

  const handleJoinComplaint = async () => {
    if (!duplicateMatch) return;
    setJoining(true);
    setMessage("");
    try {
      const res = await api.post(`/api/complaints/${duplicateMatch.complaintId}/join`);
      setJoinedComplaint(res.data.complaint);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to join this report");
    } finally {
      setJoining(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Convert GPS coordinates into a readable area/city/pincode address
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    setMessage("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();

          if (data && data.address) {
            const a = data.address;

            const areaPart = a.suburb || a.neighbourhood || a.city_district || a.road;
            const cityPart = a.city || a.town || a.village || a.county;
            const statePart = a.state;
            const pincode = a.postcode;

            let readableAddress = [areaPart, cityPart, statePart].filter(Boolean).join(", ");
            if (pincode) {
              readableAddress += ` - ${pincode}`;
            }

            setFormData((prev) => ({
              ...prev,
              address: readableAddress || data.display_name || "",
            }));
          }
        } catch (err) {
          setMessage("Location detected, but couldn't fetch address name. Please type it manually.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setMessage("Unable to fetch your location. Please enter the address manually.");
        setLocating(false);
      }
    );
  };

  const isFormValid = useMemo(() => {
    return (
      formData.category.trim() !== "" &&
      formData.title.trim() !== "" &&
      formData.description.trim() !== "" &&
      formData.address.trim() !== ""
    );
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrors({});

    const newErrors = {};
    if (!formData.category) newErrors.category = "Please select a category";
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.address.trim()) newErrors.address = "Location address is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMessage("Please fill in all required fields before submitting.");
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("category", formData.category);
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("address", formData.address);
      if (coords.latitude) payload.append("latitude", coords.latitude);
      if (coords.longitude) payload.append("longitude", coords.longitude);
      if (photo) payload.append("photo", photo);

      const res = await api.post("/api/complaints", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(res.data.complaint);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-paper border border-line rounded-lg text-ink placeholder:text-slate/60 focus:outline-none focus:border-ink transition-colors text-sm";

  if (joinedComplaint) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto bg-white border border-line rounded-2xl p-10 text-center">
          <Users size={40} className="text-success mx-auto mb-4" />
          <h1 className="font-display text-2xl text-ink mb-2">Voice Added</h1>
          <p className="text-slate text-sm mb-1">
            You've been added as a reporter on this existing complaint — no need to file a separate one.
          </p>
          <p className="font-mono text-sm bg-ink/5 inline-block px-3 py-1 rounded-full mt-3 mb-2">
            {joinedComplaint.complaintNumber}
          </p>
          <p className="text-xs text-slate mb-6">
            Now reported by {joinedComplaint.reportCount} citizen{joinedComplaint.reportCount === 1 ? "" : "s"}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(`/dashboard/complaints/${joinedComplaint._id}`)}
              className="px-5 py-2.5 bg-ink text-paper rounded-full text-sm font-medium hover:bg-signal transition-colors"
            >
              View Complaint
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-5 py-2.5 border border-line rounded-full text-sm text-ink hover:border-ink transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (success) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto bg-white border border-line rounded-2xl p-10 text-center">
          <CheckCircle2 size={40} className="text-success mx-auto mb-4" />
          <h1 className="font-display text-2xl text-ink mb-2">Complaint Registered</h1>
          <p className="text-slate text-sm mb-1">Your complaint has been submitted successfully.</p>
          <p className="font-mono text-sm bg-ink/5 inline-block px-3 py-1 rounded-full mt-3 mb-6">
            {success.complaintNumber}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/dashboard/complaints")}
              className="px-5 py-2.5 bg-ink text-paper rounded-full text-sm font-medium hover:bg-signal transition-colors"
            >
              View My Complaints
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-5 py-2.5 border border-line rounded-full text-sm text-ink hover:border-ink transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-2xl text-ink mb-1">Register New Complaint</h1>
        <p className="text-slate text-sm mb-8">
          Provide details about the civic issue you'd like to report. All fields are required unless marked optional.
        </p>

        {message && (
          <div className="mb-5 text-sm bg-error/5 border border-error/30 rounded-lg px-4 py-3 text-error">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-line rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-sm text-ink mb-1.5">
              Category <span className="text-error">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">Select a category</option>
              {COMPLAINT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="text-error text-xs mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm text-ink mb-1.5">
              Title <span className="text-error">*</span>
            </label>
            <input
              className={inputClass}
              name="title"
              placeholder="Brief title of the issue"
              value={formData.title}
              onChange={handleChange}
              required
            />
            {errors.title && <p className="text-error text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm text-ink mb-1.5">
              Description <span className="text-error">*</span>
            </label>
            <textarea
              className={`${inputClass} resize-none`}
              name="description"
              rows={4}
              placeholder="Describe the issue in detail"
              value={formData.description}
              onChange={handleChange}
              required
            />
            {errors.description && <p className="text-error text-xs mt-1">{errors.description}</p>}

            {suggestion && (
              <div className="mt-3 flex items-center justify-between gap-3 bg-signal/5 border border-signal/30 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles size={16} className="text-signal shrink-0" />
                  <p className="text-sm text-ink">
                    This looks like a <span className="font-medium">{suggestion}</span> complaint
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={applySuggestion}
                    className="text-xs px-3 py-1.5 bg-ink text-paper rounded-full font-medium hover:bg-signal transition-colors"
                  >
                    Use this
                  </button>
                  <button
                    type="button"
                    onClick={dismissSuggestion}
                    className="p-1 text-slate hover:text-ink transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-ink mb-1.5">
              Location Address <span className="text-error">*</span>
            </label>
            <p className="text-xs text-slate mb-2">
              You can type your address directly, or use GPS as a starting point and edit it for accuracy.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className={inputClass}
                name="address"
                placeholder="Street, landmark, area — or use GPS"
                value={formData.address}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locating}
                className="shrink-0 w-full sm:w-auto px-4 py-3 border border-line rounded-lg text-sm text-ink hover:border-ink transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <MapPin size={15} />
                {locating ? "Detecting…" : "Use GPS"}
              </button>
            </div>
            {coords.latitude && (
              <p className="text-xs text-slate mt-1">
                GPS suggested this address — please verify and edit it if it doesn't match your exact location.
              </p>
            )}
            {errors.address && <p className="text-error text-xs mt-1">{errors.address}</p>}

            {checkingDuplicate && (
              <p className="text-xs text-slate mt-2">Checking for similar reports nearby…</p>
            )}

            {duplicateMatch && !duplicateDismissed && (
              <div className="mt-3 bg-signal/5 border border-signal/30 rounded-lg px-4 py-3">
                <div className="flex items-start gap-2">
                  <Users size={16} className="text-signal shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink">
                      <span className="font-medium">{duplicateMatch.reportCount}</span> citizen
                      {duplicateMatch.reportCount === 1 ? " has" : "s have"} already reported "
                      <span className="font-medium">{duplicateMatch.title}</span>" about{" "}
                      {duplicateMatch.distanceMeters}m from here.
                    </p>
                    <p className="text-xs text-slate mt-1">
                      If this is the same issue, add your voice to it instead of filing a new one — it helps us prioritize.
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={handleJoinComplaint}
                        disabled={joining}
                        className="text-xs px-3 py-1.5 bg-ink text-paper rounded-full font-medium hover:bg-signal transition-colors disabled:opacity-50"
                      >
                        {joining ? "Adding…" : "Yes, add my voice to it"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDuplicateDismissed(true)}
                        className="text-xs px-3 py-1.5 text-slate hover:text-ink transition-colors"
                      >
                        No, this is different
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-signal/5 border-l-4 border-signal rounded-r-lg px-4 py-3 flex items-start gap-3 mt-4">
            <Sparkles size={18} className="text-signal shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-ink">Smart Priority Detection</p>
              <p className="text-xs text-slate mt-0.5">
                Our AI will read your title and description to automatically assign the appropriate urgency level (Low to Emergency).
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-ink mb-1.5">Photo (optional)</label>
            <label className="flex items-center gap-3 border border-dashed border-line rounded-lg px-4 py-4 cursor-pointer hover:border-ink transition-colors">
              <Upload size={18} className="text-slate" />
              <span className="text-sm text-slate">
                {photo ? photo.name : "Click to upload a photo (JPG, PNG, WEBP — max 5MB)"}
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
            {photoPreview && (
              <img src={photoPreview} alt="Preview" className="mt-3 w-full max-h-48 object-cover rounded-lg" />
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full py-3 bg-ink text-paper rounded-lg font-medium hover:bg-signal transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting…" : "Submit Complaint"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default NewComplaintPage;