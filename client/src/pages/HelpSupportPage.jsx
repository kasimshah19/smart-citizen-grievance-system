import { useState } from "react";
import { Phone, Mail, MessageCircle, ChevronDown, Send } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../services/api";

const FAQS = [
  {
    q: "How do I file a new complaint?",
    a: "Go to 'New Complaint' from the sidebar, fill in the category, title, description, and location, then submit. You'll receive a unique complaint number.",
  },
  {
    q: "How can I track my complaint status?",
    a: "Visit 'My Complaints' from the sidebar to see all your complaints along with their current status. Click on any complaint to view its full timeline.",
  },
  {
    q: "How long does it take to resolve a complaint?",
    a: "Resolution time depends on the category and priority of the complaint. You'll receive notifications as the status changes.",
  },
  {
    q: "Can I edit a complaint after submitting it?",
    a: "Currently, complaints cannot be edited after submission. If you made an error, please submit a new complaint with correct details.",
  },
  {
    q: "How do I update my profile information?",
    a: "Go to 'Profile' from the sidebar and click 'Edit Profile' to update your name and address details. Email and phone cannot be changed for security reasons.",
  },
  {
    q: "Is my personal information secure?",
    a: "Yes. Your password is encrypted, and every login requires two-step verification (password + OTP) to keep your account secure.",
  },
];

function HelpSupportPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [formData, setFormData] = useState({ subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.subject.trim() || !formData.message.trim()) return;

    setLoading(true);
    try {
      await api.post("/api/support", formData);
      setSubmitted(true);
      setFormData({ subject: "", message: "" });
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-paper border border-line rounded-lg text-ink placeholder:text-slate/60 focus:outline-none focus:border-ink transition-colors text-sm";

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-2xl text-ink mb-1">Help & Support</h1>
          <p className="text-slate text-sm">Find answers to common questions or reach out to us directly.</p>
        </div>

        {/* Contact Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white border border-line rounded-2xl p-5">
            <div className="w-10 h-10 rounded-lg bg-signal/10 text-signal flex items-center justify-center mb-3">
              <Phone size={18} />
            </div>
            <p className="text-sm font-medium text-ink">Contact Municipality</p>
            <p className="text-xs text-slate mt-1">1800-XXX-XXXX (Toll Free)</p>
          </div>

          <div className="bg-white border border-line rounded-2xl p-5">
            <div className="w-10 h-10 rounded-lg bg-signal/10 text-signal flex items-center justify-center mb-3">
              <Mail size={18} />
            </div>
            <p className="text-sm font-medium text-ink">Email Support</p>
            <p className="text-xs text-slate mt-1">support@nagrik.gov.in</p>
          </div>

          <div className="bg-white border border-line rounded-2xl p-5">
            <div className="w-10 h-10 rounded-lg bg-signal/10 text-signal flex items-center justify-center mb-3">
              <MessageCircle size={18} />
            </div>
            <p className="text-sm font-medium text-ink">Support Center</p>
            <p className="text-xs text-slate mt-1">Mon–Sat, 9 AM – 6 PM</p>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="font-display text-lg text-ink mb-3">Frequently Asked Questions</h2>
          <div className="bg-white border border-line rounded-2xl divide-y divide-line">
            {FAQS.map((faq, index) => (
              <div key={index}>
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="text-sm font-medium text-ink">{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-slate shrink-0 transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-5 -mt-2">
                    <p className="text-sm text-slate leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white border border-line rounded-2xl p-6">
          <h2 className="font-display text-lg text-ink mb-1">Still need help?</h2>
          <p className="text-slate text-sm mb-5">Send us a message and we'll get back to you.</p>

          {submitted && (
            <div className="mb-4 text-sm bg-success/5 border border-success/30 rounded-lg px-4 py-3 text-success">
              Your message has been sent. We'll respond within 24 hours.
            </div>
          )}
          {error && (
            <div className="mb-4 text-sm bg-error/5 border border-error/30 rounded-lg px-4 py-3 text-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className={inputClass}
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />
            <textarea
              className={`${inputClass} resize-none`}
              name="message"
              rows={4}
              placeholder="Describe your issue or question"
              value={formData.message}
              onChange={handleChange}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-ink text-paper rounded-lg font-medium hover:bg-signal transition-colors disabled:opacity-50"
            >
              <Send size={15} /> {loading ? "Sending…" : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default HelpSupportPage;