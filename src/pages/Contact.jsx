import { motion } from "framer-motion";
import { Mail, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const CONTACT_METHODS = [
  {
    icon: Mail,
    label: "Email",
    value: "leonoelzuze@gmail.com",
    href: "mailto:leonoelzuze@gmail.com",
    cta: "Email me",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 97645 06058",
    href: "tel:+919764506058",
    cta: "Call me",
  },
  {
    icon: FaWhatsapp,
    label: "WhatsApp",
    value: "Quick chat, real-time",
    href: "https://wa.me/919764506058?text=Hi%20Leo%2C%20I%27d%20like%20to%20start%20a%20project.",
    cta: "Chat now",
  },
];

export default function Contact() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-accent font-mono text-xs uppercase tracking-widest mb-3"
      >
        Contact
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="font-heading text-4xl md:text-5xl font-bold text-text max-w-2xl mb-4"
      >
        Let's build something.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-muted text-lg max-w-xl mb-16"
      >
        Open to collaboration, freelance web work, or a conversation about AI
        and fintech. Reach out however's easiest for you.
      </motion.p>

      <div className="grid md:grid-cols-3 gap-6">
        {CONTACT_METHODS.map(({ icon: Icon, label, value, href, cta }, i) => (
          <motion.a
            key={label}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noreferrer" : undefined}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="group rounded-2xl border border-border bg-surface p-8 text-center hover:border-accent/40 transition-colors"
          >
            <Icon size={26} className="text-accent mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-text mb-1">
              {label}
            </h3>
            <p className="text-muted text-sm mb-5">{value}</p>
            <span className="text-accent text-sm font-medium group-hover:underline">
              {cta}
            </span>
          </motion.a>
        ))}
      </div>
    </section>
  );
}