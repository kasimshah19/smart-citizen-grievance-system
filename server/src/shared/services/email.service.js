const sendEmail = async (to, subject, message) => {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const BREVO_SENDER = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER;

  if (!BREVO_API_KEY) {
    console.log(`\n[EMAIL BLOCKED - FALLBACK for ${to}]: ${subject}\n${message}\n`);
    return { success: true, mode: "console" };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sender: {
          name: "Smart Citizen Grievance System",
          email: BREVO_SENDER
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color:#142330;">Smart Citizen Grievance Management System</h2>
          <p style="color:#333; font-size:15px; line-height:1.5;">${message}</p>
          <p style="color:#999; font-size:12px; margin-top:24px;">This is an automated email. Please do not reply.</p>
        </div>`
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(JSON.stringify(errData));
    }

    return { success: true, mode: "brevo-http" };
  } catch (error) {
    console.error("Failed to send email via Brevo:", error.message);
    console.log(`\n[EMAIL BLOCKED - FALLBACK for ${to}]: ${subject}\n${message}\n`);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };