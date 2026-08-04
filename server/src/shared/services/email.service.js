const nodemailer = require("nodemailer");

// The transporter is created lazily (only when actually sending an email),
// not at file-load time — this avoids a startup-order bug where .env
// hadn't been loaded yet when this file was first required.
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return transporter;
};

const sendEmail = async (to, subject, message) => {
  const activeTransporter = getTransporter();

  if (!activeTransporter) {
    console.log(`\n[EMAIL to ${to}]: ${subject}\n${message}\n`);
    return { success: true, mode: "console" };
  }

  try {
    await activeTransporter.sendMail({
      from: `"Smart Citizen Grievance System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: `<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#142330;">Smart Citizen Grievance Management System</h2>
        <p style="color:#333; font-size:15px; line-height:1.5;">${message}</p>
        <p style="color:#999; font-size:12px; margin-top:24px;">This is an automated email. Please do not reply.</p>
      </div>`,
    });
    return { success: true, mode: "smtp" };
  } catch (error) {
    console.error("Failed to send email:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };