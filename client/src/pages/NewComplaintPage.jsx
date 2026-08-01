import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Upload, CheckCircle2, Sparkles } from "lucide-react";
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
    priority: "Medium",
  });
  const [coords, setCoords] = useState({ latitude: null, longitude: null });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  // Whether the current category value came from auto-suggestion (vs. the user picking it themselves)
  const [categoryAutoSuggested, setCategoryAutoSuggested] = useState(false);
  const [categoryManuallyChosen, setCategoryManuallyChosen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "category") {
      // The user is choosing a category themselves — stop auto-suggesting from now on
      setCategoryManuallyChosen(true);
      setCategoryAutoSuggested(false);
    }

    setFormData({ ...formData, [name]: value });
  };

  // Auto-suggest a category from the title + description, unless the user already picked one manually
  useEffect(() => {
    if (categoryManuallyChosen) return;

    const combinedText = `${formData.title} ${formData.description}`;
    const suggestion = suggestCategory(combinedText);

    if (suggestion && suggestion !== formData.category) {
      setFormData((prev) => ({ ...prev, category: suggestion }));
      setCategoryAutoSuggested(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.title, formData.description, categoryManuallyChosen]);

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
      payload.append("priority", formData.priority);
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
            <label className="block text-sm text-ink mb-1.5 flex items-center gap-2">
              Category <span className="text-error">*</span>
              {categoryAutoSuggested && formData.category && (
                <span className="inline-flex items-center gap-1 text-[11px] font-normal text-signal bg-signal/10 px-2 py-0.5 rounded-full">
                  <Sparkles size={11} /> Suggested for you
                </span>
              )}
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
            {categoryAutoSuggested && (
              <p className="text-xs text-slate mt-1">
                We picked this based on your description — change it if it's not quite right.
              </p>
            )}
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
          </div>

          <div>
            <label className="block text-sm text-ink mb-1.5">
              Location Address <span className="text-error">*</span>
            </label>
            <p className="text-xs text-slate mb-2">
              You can type your address directly, or use GPS as a starting point and edit it for accuracy.
            </p>
            <div className="flex gap-2">
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
                className="shrink-0 px-4 py-3 border border-line rounded-lg text-sm text-ink hover:border-ink transition-colors flex items-center gap-1.5 disabled:opacity-50"
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
          </div>

          <div>
            <label className="block text-sm text-ink mb-1.5">
              Priority <span className="text-error">*</span>
            </label>
            <div className="flex gap-2">
              {PRIORITY_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: level })}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    formData.priority === level
                      ? level === "Emergency"
                        ? "bg-error text-paper border-error"
                        : "bg-ink text-paper border-ink"
                      : "border-line text-ink hover:border-ink"
                  }`}
                >
                  {level}
                </button>
              ))}
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