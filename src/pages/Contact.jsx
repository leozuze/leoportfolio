import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Mail, Send, Check } from "lucide-react";
import { FaGithub, FaLinkedin, FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";

const EMAIL = "leonoelzuze@gmail.com";
const PHONE = "+91 97645 06058";
const WHATSAPP_URL =
  "https://wa.me/919764506058?text=Hi%20Leo%2C%20I%27d%20like%20to%20start%20a%20project.";

const SOCIALS = [
  { icon: FaGithub, href: "https://github.com/leozuze", label: "GitHub" },
  { icon: FaLinkedin, href: "https://www.linkedin.com/in/leozuze/", label: "LinkedIn" },
  { icon: FaFacebook, href: "https://www.facebook.com/profile.php?id=61561005188449", label: "Facebook" },
  { icon: FaInstagram, href: "https://instagram.com/jayzthe_plug", label: "Instagram" },
];

const quickContacts = [
  {
    label: "WhatsApp",
    detail: "Usually the fastest way to reach me",
    icon: FaWhatsapp,
    href: WHATSAPP_URL,
    cta: "Message on WhatsApp",
  },
  {
    label: "Email",
    detail: "Best for briefs, files, or anything formal",
    icon: Mail,
    href: `mailto:${EMAIL}`,
    cta: EMAIL,
  },
];

export default function Contact() {
  const shouldReduceMotion = useReducedMotion();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // No backend wired up yet, so this hands the message off to the visitor's
  // own mail client, prefilled and ready to send. Swap this for a fetch()
  // to your own Express endpoint (or EmailJS/Formspree) once you have one —
  // the form fields and validation below don't need to change either way.
  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio inquiry from ${form.name || "a visitor"}`);
    const body = encodeURIComponent(
      `${form.message}\n\n—\n${form.name}\n${form.email}`
    );
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
  };

  const cardContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };
  const card = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 md:py-28 overflow-x-hidden">
      {/* Page header */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.6 }}
        variants={fadeUp}
        className="max-w-2xl mb-14"
      >
        <p className="font-mono text-xs uppercase tracking-widest text-accent mb-2">
          Contact
        </p>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-text mb-4">
          Let's Talk
        </h1>
        <p className="text-muted text-sm md:text-base leading-relaxed">
          WhatsApp or email get the fastest reply. The form below works too 
          it opens straight into your mail client, prefilled and ready to go.
        </p>
      </motion.div>

      {/* Quick contact cards */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        variants={cardContainer}
        className="grid sm:grid-cols-2 gap-4 mb-16"
      >
        {quickContacts.map(({ label, detail, icon: Icon, href, cta }) => (
          <motion.a
            key={label}
            href={href}
            target={label === "WhatsApp" ? "_blank" : undefined}
            rel={label === "WhatsApp" ? "noopener noreferrer" : undefined}
            variants={card}
            whileHover={shouldReduceMotion ? {} : { y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="group bg-surface border border-border rounded-2xl p-6 hover:border-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent shrink-0">
                <Icon size={18} />
              </span>
              <h2 className="font-heading text-lg font-semibold text-text">
                {label}
              </h2>
            </div>
            <p className="text-sm text-muted leading-relaxed mb-3">{detail}</p>
            <span className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-widest text-muted group-hover:text-accent transition-colors">
              {cta}
            </span>
          </motion.a>
        ))}
        <p className="sm:col-span-2 text-center text-xs text-muted">
          Prefer a call?{" "}
          <a href="tel:+919764506058" className="text-accent hover:underline">
            {PHONE}
          </a>
        </p>
      </motion.div>

      {/* Message form */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        variants={fadeUp}
        className="bg-surface border border-border rounded-3xl p-6 md:p-10"
      >
        <h2 className="font-heading text-xl md:text-2xl font-semibold text-text mb-1">
          Send a Message
        </h2>
        <p className="text-sm text-muted mb-8">
          Got a longer brief? Write it here instead.
        </p>

        {sent ? (
          <div className="flex items-center gap-3 text-accent bg-accent/10 border border-accent/30 rounded-2xl px-5 py-4">
            <Check size={18} className="shrink-0" />
            <p className="text-sm">
              Your mail client should be open with everything prefilled just
              hit send there.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-mono uppercase tracking-widest text-muted mb-2"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-muted/60 focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-mono uppercase tracking-widest text-muted mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-muted/60 focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-xs font-mono uppercase tracking-widest text-muted mb-2"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={form.message}
                onChange={handleChange}
                placeholder="What are you building?"
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-muted/60 focus:outline-none focus:border-accent transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-accent text-bg px-6 py-3 rounded-full font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Send Message <Send size={16} />
            </button>
          </form>
        )}
      </motion.div>

      {/* Social links */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.6 }}
        variants={fadeUp}
        className="flex items-center justify-center gap-4 mt-14"
      >
        {SOCIALS.map(({ icon: Icon, href, label }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="flex items-center justify-center w-11 h-11 rounded-full border border-border text-muted hover:border-accent hover:text-accent transition-colors"
          >
            <Icon size={18} />
          </a>
        ))}
      </motion.div>
    </div>
  );
}
