import { NavLink } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUp, ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import {
  FaGithub,
  FaLinkedin,
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";
import Logo from "../ui/Logo";
import { NAV_LINKS, START_PROJECT_URL } from "./navData";
import { scrollToTop } from "../../lib/lenis";
import { useScrollReveal } from "../motion/useScrollReveal";

const EASE = [0.22, 1, 0.36, 1];

const SOCIALS = [
  { icon: FaGithub, href: "https://github.com/leozuze", label: "GitHub" },
  { icon: FaLinkedin, href: "https://www.linkedin.com/in/leozuze/", label: "LinkedIn" },
  { icon: FaFacebook, href: "https://www.facebook.com/profile.php?id=61561005188449", label: "Facebook" },
  { icon: FaInstagram, href: "https://instagram.com/jayzthe_plug", label: "Instagram" },
  { icon: FaWhatsapp, href: START_PROJECT_URL, label: "WhatsApp" },
];

const SERVICES = [
  "AI chatbots and assistants",
  "AI agents and automation",
  "Knowledge assistants",
  "Data and workflow pipelines",
  "Websites and web apps",
];

const linkClass =
  "relative inline-block text-on-ink/65 transition-colors duration-200 hover:text-on-ink focus-visible:text-on-ink focus-visible:outline-2 focus-visible:outline-on-ink after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-accent-soft after:transition-all after:duration-300 hover:after:w-full";

const headingClass =
  "mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-on-ink/50";

export default function Footer() {
  const reduce = useReducedMotion();
  const [ctaRef, ctaShown] = useScrollReveal({ margin: "0px 0px -8% 0px" });
  const show = reduce || ctaShown;

  return (
    <footer className="mt-24 bg-ink text-on-ink">
      <div className="mx-auto max-w-6xl px-6">
        {/* Call to action */}
        <motion.div
          ref={ctaRef}
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={
            show
              ? { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } }
              : { opacity: 0, y: 28, transition: { duration: 0.25, ease: EASE } }
          }
          className="border-b border-white/10 py-16 md:py-24"
        >
          <div className="flex items-center gap-4">
            <span aria-hidden className="block h-px w-12 bg-accent-soft" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-ink/60">
              Available for new freelance projects
            </p>
          </div>

          <h2 className="mt-7 max-w-3xl font-heading text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl md:text-7xl">
            Have a project in mind?{" "}
            <span className="text-accent-soft">Let&rsquo;s talk.</span>
          </h2>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-on-ink/65 sm:text-lg">
            Tell me what slows your team down, and I&rsquo;ll tell you honestly
            whether software can fix it.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
            <a
              href={START_PROJECT_URL}
              target="_blank"
              rel="noreferrer"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-md bg-on-ink px-7 py-4 text-sm font-semibold text-ink transition-colors duration-300 before:absolute before:inset-0 before:translate-y-full before:bg-accent before:transition-transform before:duration-300 before:ease-out hover:text-on-accent hover:before:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-ink motion-reduce:before:transition-none"
            >
              <span className="relative">Start a project</span>
              <ArrowUpRight
                size={17}
                aria-hidden
                className="relative transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
              />
            </a>

            <a
              href="mailto:leonoelzuze@gmail.com"
              className="border-b-2 border-white/40 pb-1 text-sm font-semibold text-on-ink transition-colors duration-200 hover:border-accent-soft hover:text-accent-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-ink"
            >
              Email me
            </a>
          </div>
        </motion.div>

        {/* Link columns */}
        <div className="grid grid-cols-1 gap-12 py-14 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <NavLink
              to="/"
              aria-label="Leo Zuze, home"
              className="group inline-flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-ink"
            >
              <Logo size={34} />
              <span className="font-logo text-lg tracking-tight">
                <span className="font-semibold text-on-ink">Leo</span>{" "}
                <span className="font-bold text-accent-soft">Zuze</span>
              </span>
            </NavLink>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-on-ink/65">
              AI engineer and full-stack developer building chatbots, AI agents
              and web software for businesses.
            </p>
          </div>

          <nav aria-label="Footer" className="lg:col-span-2">
            <h3 className={headingClass}>Explore</h3>
            <ul className="space-y-3 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} className={linkClass}>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h3 className={headingClass}>What I build</h3>
            <ul className="space-y-3 text-sm">
              {SERVICES.map((service) => (
                <li key={service}>
                  <NavLink to="/services" className={linkClass}>
                    {service}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className={headingClass}>Get in touch</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Mail size={15} aria-hidden className="text-accent-soft" />
                <a href="mailto:leonoelzuze@gmail.com" className={linkClass}>
                  leonoelzuze@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={15} aria-hidden className="text-accent-soft" />
                <a href="tel:+919764506058" className={linkClass}>
                  +91 97645 06058
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-on-ink/65">
                <MapPin size={15} aria-hidden className="text-accent-soft" />
                Pune, India
              </li>
            </ul>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-md border border-white/20 text-on-ink/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:text-on-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-ink motion-reduce:transform-none"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar: extra bottom room keeps the chat button off the content */}
        <div className="flex items-center justify-between gap-4 border-t border-white/10 pb-24 pt-6">
          <p className="text-xs tracking-wide text-on-ink/50">
            &copy; {new Date().getFullYear()}{" "}
            <span className="font-medium text-on-ink/80">Leo Zuze</span>. All
            rights reserved.
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            className="group inline-flex items-center gap-3 text-xs font-semibold text-on-ink/65 transition-colors hover:text-on-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-ink"
          >
            Back to top
            <span className="grid h-8 w-8 place-items-center rounded-md border border-white/20 transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent">
              <ArrowUp size={14} aria-hidden />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}