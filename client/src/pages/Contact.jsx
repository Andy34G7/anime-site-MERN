import { useState } from "react";
import api from "../services/api";
import "./Contact.css";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: ""
};

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ submitting: false, success: false, error: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ submitting: true, success: false, error: "" });
    try {
      await api.post("/contact", form);
      setStatus({ submitting: false, success: true, error: "" });
      setForm(initialForm);
    } catch (err) {
      const message = err?.response?.data?.error || "Unable to send message right now.";
      setStatus({ submitting: false, success: false, error: message });
    }
  };

  return (
    <main className="page-shell contact-page">
      <header className="glass-panel contact-hero">
        <p className="section-eyebrow">Support</p>
        <h1 className="section-heading">Let&apos;s start a conversation</h1>
        <p className="muted-text">
          Drop us a note about partnerships, creator submissions, or just to say hi. We reply within two business days.
        </p>
      </header>

      <div className="contact-grid">
        <form className="glass-panel contact-form-panel" onSubmit={handleSubmit}>
          {status.success && <p className="contact-alert success">Thanks! We received your message and will reply soon.</p>}
          {status.error && <p className="contact-alert error">{status.error}</p>}
          <div className="contact-form-grid">
            <label className="field">
              <span>First name</span>
              <input
                type="text"
                name="firstName"
                placeholder="Enter your first name"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </label>
            <label className="field">
              <span>Last name</span>
              <input
                type="text"
                name="lastName"
                placeholder="Enter your last name"
                value={form.lastName}
                onChange={handleChange}
              />
            </label>
          </div>

          <label className="field">
            <span>Email address</span>
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Phone number</span>
            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={form.phone}
              onChange={handleChange}
            />
          </label>

          <label className="field">
            <span>Message</span>
            <textarea
              name="message"
              rows="5"
              placeholder="Share comments, feedback, or queries here"
              value={form.message}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit" className="btn-primary" disabled={status.submitting}>
            {status.submitting ? "Sending…" : "Send message"}
          </button>
        </form>

        <aside className="glass-panel contact-info-panel">
          <div className="info-block">
            <p className="info-eyebrow">Visit us</p>
            <h3>Studio HQ</h3>
            <p>Talk to the team at our Bangalore HQ.</p>
            <p className="info-main">123 MG Road, Bengaluru 560001</p>
          </div>

          <div className="info-block">
            <p className="info-eyebrow">Call us</p>
            <h3>+91 999 999 999</h3>
            <p>Available Monday–Friday, 8am–4pm IST.</p>
          </div>

          <div className="info-block">
            <p className="info-eyebrow">Chat with us</p>
            <h3>Creator concierge</h3>
            <ul>
              <li><a href="#">Message us on X</a></li>
              <li><a href="mailto:hello@animebloom.com">Shoot us an email</a></li>
              <li><a href="#">Start a live chat</a></li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
