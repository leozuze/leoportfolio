import { useState } from "react";
import { ArrowUpRight, Check, Mail, Send } from "lucide-react";
import { FaFacebook, FaGithub, FaInstagram, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import PageHeader from "../components/ui/PageHeader";
import { Reveal } from "../components/motion/primitives";
import Seo from "../components/Seo";
import { SEO } from "../data/seoRoutes";

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
    external: true,
  },
  {
    label: "Email",
    detail: "Best for briefs, files, or anything formal",
    icon: Mail,
    href: `mailto:${EMAIL}`,
    cta: EMAIL,
  },
];

const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-muted";
const fieldClass =
  "w-full rounded-md border border-border bg-bg px-4 py-3.5 text-base text-text transition-colors placeholder:text-muted/60 focus:border-ink focus:outline-none";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // No backend yet, so this hands the message to the visitor's own mail client,
  // prefilled and ready to send. Swap this for a fetch() to your own endpoint
  // (or EmailJS / Formspree) later; the fields and validation stay the same.
  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Project enquiry from ${form.name || "a visitor"}`);
    const body = encodeURIComponent(`${form.message}\n\n\u2014\n${form.name}\n${form.email}`);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-12 md:pb-32 md:pt-16">
      <Seo {...SEO.contact} />

      <PageHeader
        eyebrow="Contact"
        lines={[{ text: "Tell me what" }, { text: "you need.", accent: true }]}
        intro="WhatsApp or email get the fastest reply. The form works too: it opens straight into your mail client, prefilled and ready to send."
      />

      <div className="mt-14 grid gap-10 lg:grid-cols-12">
        {/* Quick contacts */}
        <div className="lg:col-span-5">
          <div className="flex flex-col gap-4">
            {quickContacts.map(({ label, detail, icon: Icon, href, cta, external }, i) => (
              <Reveal key={label} delay={i * 0.1}>
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex items-start gap-4 rounded-lg border border-border bg-surface p-6 transition-[translate,border-color] duration-300 hover:-translate-y-1 hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-ink text-on-ink transition-colors duration-300 group-hover:bg-accent">
                    <Icon size={20} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-heading text-lg font-extrabold text-text">{label}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted">{detail}</span>
                    <span className="mt-3 block truncate text-xs font-semibold uppercase tracking-[0.12em] text-text group-hover:text-accent">
                      {cta}
                    </span>
                  </span>
                  <ArrowUpRight
                    size={18}
                    aria-hidden
                    className="shrink-0 text-accent transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
                  />
                </a>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-6">
            <p className="text-sm text-muted">
              Prefer a call?{" "}
              <a
                href="tel:+919764506058"
                className="border-b-2 border-ink pb-0.5 font-semibold text-text transition-colors hover:border-accent hover:text-accent"
              >
                {PHONE}
              </a>
            </p>

            <div className="mt-8 flex gap-3">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-11 w-11 place-items-center rounded-md border border-border text-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:text-on-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transform-none"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Message form */}
        <Reveal className="lg:col-span-7">
          <div className="rounded-xl border border-border bg-surface p-6 md:p-10">
            <h2 className="font-heading text-2xl font-extrabold tracking-tight text-text">
              Send a message
            </h2>
            <p className="mt-1 text-sm text-muted">Got a longer brief? Write it here instead.</p>

            {sent ? (
              <div className="mt-8 flex items-start gap-3 rounded-lg border border-ink bg-bg px-5 py-4 text-text">
                <Check size={18} aria-hidden className="mt-0.5 shrink-0 text-accent" />
                <p className="text-sm leading-relaxed">
                  Your mail client should be open with everything prefilled. Just press send there
                  and I&rsquo;ll reply personally.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className={labelClass}>
                      Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className={labelClass}>
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className={labelClass}>
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="What are you building, and what is slowing you down?"
                    className={`${fieldClass} resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-md bg-ink px-7 py-4 text-sm font-semibold text-on-ink transition-colors duration-300 before:absolute before:inset-0 before:translate-y-full before:bg-accent before:transition-transform before:duration-300 before:ease-out hover:before:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:before:transition-none"
                >
                  <span className="relative">Send message</span>
                  <Send
                    size={16}
                    aria-hidden
                    className="relative transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transform-none"
                  />
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}