// SMS Service Abstraction
// Sends real SMS via Fast2SMS's Quick SMS route (no DLT registration needed,
// works instantly for OTP/transactional messages) when SMS_PROVIDER=fast2sms
// is set in .env. Otherwise falls back to "console mode" for development,
// where the message is just printed in this terminal instead of sent.

const sendSMS = async (phone, message) => {
  if (process.env.SMS_PROVIDER === "fast2sms") {
    try {
      const url = new URL("https://www.fast2sms.com/dev/bulkV2");
      url.searchParams.set("authorization", process.env.FAST2SMS_API_KEY);
      url.searchParams.set("route", "q");
      url.searchParams.set("message", message);
      url.searchParams.set("numbers", phone);

      const res = await fetch(url.toString());
      const data = await res.json();

      if (data.return === true) {
        return { success: true, mode: "fast2sms" };
      }

      const errorDetail = Array.isArray(data.message) ? data.message.join(", ") : data.message;
      throw new Error(errorDetail || "Fast2SMS request failed");
    } catch (error) {
      console.error("Fast2SMS SMS failed:", error.message);
      // Fall back to console mode so a provider hiccup never blocks signup/login
      console.log(`\n[SMS to ${phone} - Fast2SMS failed, showing here instead]: ${message}\n`);
      return { success: true, mode: "console-fallback" };
    }
  }

  // Development mode: log the message instead of sending a real SMS
  console.log(`\n[SMS to ${phone}]: ${message}\n`);
  return { success: true, mode: "console" };
};

module.exports = { sendSMS };