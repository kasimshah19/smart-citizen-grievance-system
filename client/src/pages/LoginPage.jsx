import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { ROLES } from "../shared/constants/roles";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("credentials"); // credentials -> otp
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // STEP 1: Verify email + password, trigger OTP
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login/send-otp", { email, password });
      setMessage(res.data.message);
      setStep("otp");
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP, get JWT, redirect based on role
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login/verify-otp", { email, otp });
      login(res.data.citizen, res.data.token);
      setMessage(res.data.message);

      const role = res.data.citizen.role;
      let redirectPath = "/dashboard";
      if (role === ROLES.ADMIN) redirectPath = "/admin";
      else if (role === ROLES.EMPLOYEE) redirectPath = "/employee";

      setTimeout(() => navigate(redirectPath), 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-paper border border-line rounded-lg text-ink placeholder:text-slate/60 focus:outline-none focus:border-ink transition-colors text-sm";

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-4 py-12 gap-8">
      <Helmet htmlAttributes={{ lang: i18n.language }}>
        <title>Citizen Log In | Nagrik</title>
        <meta name="description" content="Log in to your Nagrik citizen account to track your submitted complaints and community points." />
        <link rel="canonical" href="https://nagrik.vercel.app/login" />
      </Helmet>

      <Link to="/" className="font-display text-2xl text-paper">
        Nagrik<span className="text-signal">.</span>
      </Link>

      <div className="relative bg-paper rounded-2xl shadow-2xl overflow-hidden w-full max-w-md">
        <div className="absolute top-0 left-0 right-0 h-3 flex justify-center gap-2 pt-1">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-ink/10" />
          ))}
        </div>

        <div className="px-8 pt-10 pb-8">
          <h1 className="font-display text-2xl text-ink mb-1">
            {step === "credentials" ? t("auth.welcome_back") : t("auth.verify_its_you")}
          </h1>
          <p className="text-slate text-sm mb-8">
            {step === "credentials"
              ? t("auth.login_subtitle")
              : t("auth.otp_subtitle")}
          </p>

          {message && (
            <div className="mb-5 text-sm bg-ink/5 border border-line rounded-lg px-4 py-3 text-ink">
              {message}
            </div>
          )}

          {step === "credentials" && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <input
                className={inputClass}
                type="email"
                placeholder={t("auth.email_label")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="flex gap-2">
                <input
                  className={inputClass}
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth.password_label")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="shrink-0 px-4 py-3 border border-line rounded-lg text-sm text-slate hover:border-ink transition-colors"
                >
                  {showPassword ? t("auth.hide") : t("auth.show")}
                </button>
              </div>

              <div className="text-right">
                <Link to="/forgot-password" className="text-xs text-slate hover:text-signal transition-colors">
                  {t("auth.forgot_password")}
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-ink text-paper rounded-lg font-medium hover:bg-signal transition-colors disabled:opacity-50 mt-2"
              >
                {loading ? t("auth.please_wait") : t("auth.continue")}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="bg-signal/5 border border-signal/30 rounded-lg p-3">
                <input
                  className={`${inputClass} font-mono tracking-widest text-center`}
                  placeholder={t("auth.enter_6_digit_code")}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-signal text-paper rounded-lg font-medium hover:bg-signal-dark transition-colors disabled:opacity-50"
              >
                {loading ? t("auth.verifying") : t("auth.verify_and_login")}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setMessage("");
                  setOtp("");
                }}
                className="w-full text-sm text-slate hover:text-ink transition-colors"
              >
                {t("auth.back")}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-slate mt-6">
            {t("auth.no_account")} <Link to="/signup" className="text-ink font-medium hover:text-signal">{t("auth.sign_up")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;