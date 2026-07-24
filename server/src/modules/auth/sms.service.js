// SMS Service Abstraction
// Currently running in "console mode" for development.
// Later, this will be replaced with a real provider (Twilio, MSG91, Fast2SMS)
// without changing any code that calls sendSMS().

const sendSMS = async (phone, message) => {
  if (process.env.SMS_PROVIDER === "twilio") {
    // Twilio integration will be added here later
    throw new Error("Twilio provider not configured yet");
  }

  // Development mode: log the message instead of sending a real SMS
  console.log(`\n[SMS to ${phone}]: ${message}\n`);
  return { success: true, mode: "console" };
};

module.exports = { sendSMS };