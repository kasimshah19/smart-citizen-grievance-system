import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

function SignupPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    district: "",
    taluka: "",
    city: "",
    area: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("form"); // form -> otp -> done
  const [emailVerified, setEmailVerified] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    setMessage("");
    setErrors({});
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors({ email: "Enter a valid email address" });
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/auth/send-otp", { email: formData.email });
      setMessage(res.data.message);
      setStep("otp");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setMessage("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/verify-otp", {
        email: formData.email,
        otp,
      });
      setMessage(res.data.message);
      setEmailVerified(true);
    } catch (err) {
      setMessage(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrors({});

    if (!emailVerified) {
      setMessage("Please verify your email address first");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/auth/register", formData);
      setMessage(res.data.message);
      setStep("done");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setMessage(err.response?.data?.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-paper border border-line rounded-lg text-ink placeholder:text-slate/60 focus:outline-none focus:border-ink transition-colors text-sm";

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 py-12">
      <Helmet htmlAttributes={{ lang: i18n.language }}>
        <title>Create Citizen Account | Nagrik</title>
        <meta name="description" content="Register as a citizen on Nagrik to report, track, and resolve civic governance issues in your neighborhood." />
        <link rel="canonical" href="https://nagrik.vercel.app/signup" />
      </Helmet>

      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="font-display text-2xl text-paper">
            Nagrik<span className="text-signal">.</span>
          </Link>
        </div>

        <div className="relative bg-paper rounded-2xl shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-3 flex justify-center gap-2 pt-1">
            {Array.from({ length: 18 }).map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-ink/10" />
            ))}
          </div>

          <div className="px-8 pt-10 pb-8">
            <div className="flex items-center justify-between mb-1">
              <h1 className="font-display text-2xl text-ink">{t("auth.signup_title")}</h1>
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate border border-line rounded-full px-2 py-1">
                {t("auth.citizen_badge")}
              </span>
            </div>
            <p className="text-slate text-sm mb-8">{t("auth.signup_subtitle")}</p>

            {message && (
              <div className="mb-5 text-sm bg-ink/5 border border-line rounded-lg px-4 py-3 text-ink">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input className={inputClass} name="fullName" placeholder={t("auth.full_name_label")} value={formData.fullName} onChange={handleChange} />
                {errors.fullName && <p className="text-error text-xs mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <div className="flex gap-2">
                  <input
                    className={inputClass}
                    name="email"
                    type="email"
                    placeholder={t("auth.email_label")}
                    value={formData.email}
                    onChange={handleChange}
                    disabled={emailVerified}
                  />
                  {!emailVerified && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading || step === "otp"}
                      className="shrink-0 px-4 py-3 bg-ink text-paper rounded-lg text-sm font-medium hover:bg-signal transition-colors disabled:opacity-50"
                    >
                      {step === "otp" ? t("auth.otp_sent") : t("auth.send_otp")}
                    </button>
                  )}
                  {emailVerified && (
                    <span className="shrink-0 flex items-center gap-1 px-3 py-3 text-success text-sm font-medium -rotate-3">
                      {t("auth.verified_text")}
                    </span>
                  )}
                </div>
                {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
              </div>

              {step === "otp" && !emailVerified && (
                <div className="flex gap-2 bg-signal/5 border border-signal/30 rounded-lg p-3">
                  <input
                    className={`${inputClass} font-mono tracking-widest`}
                    placeholder={t("auth.enter_6_digit_code")}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="shrink-0 px-4 py-3 bg-signal text-paper rounded-lg text-sm font-medium hover:bg-signal-dark transition-colors"
                  >
                    {t("auth.verify_btn")}
                  </button>
                </div>
              )}

              <div>
                <input
                  className={inputClass}
                  name="phone"
                  placeholder={t("auth.mobile_number_label")}
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone && <p className="text-error text-xs mt-1">{errors.phone}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input className={inputClass} name="district" placeholder={t("auth.district_label")} value={formData.district} onChange={handleChange} />
                  {errors.district && <p className="text-error text-xs mt-1">{errors.district}</p>}
                </div>
                <div>
                  <input className={inputClass} name="taluka" placeholder={t("auth.taluka_label")} value={formData.taluka} onChange={handleChange} />
                  {errors.taluka && <p className="text-error text-xs mt-1">{errors.taluka}</p>}
                </div>
                <div>
                  <input className={inputClass} name="city" placeholder={t("auth.city_label")} value={formData.city} onChange={handleChange} />
                  {errors.city && <p className="text-error text-xs mt-1">{errors.city}</p>}
                </div>
                <div>
                  <input className={inputClass} name="area" placeholder={t("auth.area_label")} value={formData.area} onChange={handleChange} />
                  {errors.area && <p className="text-error text-xs mt-1">{errors.area}</p>}
                </div>
              </div>

              <div>
                <div className="flex gap-2">
                  <input
                    className={inputClass}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.password_label")}
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="shrink-0 px-4 py-3 border border-line rounded-lg text-sm text-slate hover:border-ink transition-colors"
                  >
                    {showPassword ? t("auth.hide") : t("auth.show")}
                  </button>
                </div>
                {errors.password && <p className="text-error text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <input
                  className={inputClass}
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth.confirm_password_label")}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && <p className="text-error text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={!emailVerified || loading}
                className="w-full py-3 bg-ink text-paper rounded-lg font-medium hover:bg-signal transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              >
                {loading ? t("auth.please_wait") : t("auth.create_account_btn")}
              </button>
            </form>

            <p className="text-center text-sm text-slate mt-6">
              {t("auth.already_have_account")} <Link to="/login" className="text-ink font-medium hover:text-signal">{t("nav.log_in")}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;