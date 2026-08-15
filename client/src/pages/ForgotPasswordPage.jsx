import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [step, setStep] = useState("email"); // email -> reset -> done
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // STEP 1: Look up the account by email, trigger OTP to its registered email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/forgot-password/send-otp", { email });
      setMaskedEmail(res.data.maskedPhone);
      setMessage(res.data.message);
      setMessageType("info");
      setStep("reset");
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP and set the new password
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/auth/forgot-password/reset", {
        email,
        otp,
        newPassword,
        confirmPassword,
      });
      setMessage(res.data.message);
      setMessageType("success");
      setStep("done");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-paper border border-line rounded-lg text-ink placeholder:text-slate/60 focus:outline-none focus:border-ink transition-colors text-sm";

  const messageStyles =
    messageType === "error"
      ? "bg-error/5 border-error/30 text-error"
      : messageType === "success"
        ? "bg-success/5 border-success/30 text-success"
        : "bg-ink/5 border-line text-ink";

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-4 py-12 gap-8">
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
            {step === "email" && "Reset your password"}
            {step === "reset" && "Check your phone"}
            {step === "done" && "Password reset"}
          </h1>
          <p className="text-slate text-sm mb-8">
            {step === "email" && "Enter your account email and we'll send a verification code to your email address."}
            {step === "reset" && `Enter the code sent to ${maskedEmail}, along with your new password.`}
            {step === "done" && "Redirecting you to login…"}
          </p>

          {message && (
            <div className={`mb-5 text-sm border rounded-lg px-4 py-3 ${messageStyles}`}>{message}</div>
          )}

          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <input
                className={inputClass}
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-ink text-paper rounded-lg font-medium hover:bg-signal transition-colors disabled:opacity-50 mt-2"
              >
                {loading ? "Please wait…" : "Send Reset Code"}
              </button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="bg-signal/5 border border-signal/30 rounded-lg p-3">
                <input
                  className={`${inputClass} font-mono tracking-widest text-center`}
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2">
                <input
                  className={inputClass}
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="shrink-0 px-4 py-3 border border-line rounded-lg text-sm text-slate hover:border-ink transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <input
                className={inputClass}
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <p className="text-xs text-slate">
                At least 8 characters, with uppercase, lowercase, a number, and a special character.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-signal text-paper rounded-lg font-medium hover:bg-signal-dark transition-colors disabled:opacity-50"
              >
                {loading ? "Resetting…" : "Reset Password"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setMessage("");
                  setOtp("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="w-full text-sm text-slate hover:text-ink transition-colors"
              >
                ← Back
              </button>
            </form>
          )}

          <p className="text-center text-sm text-slate mt-6">
            Remembered your password? <Link to="/login" className="text-ink font-medium hover:text-signal">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
