import { NavLink } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import {
  FaGithub,
  FaLinkedin,
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";
import Logo from "../ui/Logo";

const SOCIALS = [
  { icon: FaGithub, href: "https://github.com/leozuze", label: "GitHub" },
  { icon: FaLinkedin, href: "https://www.linkedin.com/in/leozuze/", label: "LinkedIn" },
  { icon: FaFacebook, href: "https://www.facebook.com/profile.php?id=61561005188449", label: "Facebook" },
  { icon: FaInstagram, href: "https://instagram.com/jayzthe_plug", label: "Instagram" },
  { icon: FaWhatsapp, href: "https://wa.me/919764506058?text=Hi%20Leo%2C%20I%27d%20like%20to%20start%20a%20project.", label: "WhatsApp" },
];

const QUICK_LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Projects", to: "/projects" },
  { label: "Skills", to: "/skills" },
  { label: "Contact", to: "/contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div>
           <div className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="font-logo italic text-2xl tracking-tight">
            <span className="text-accent">Leo</span>
            <span className="text-text"> Zuze</span>
            </span>
        </div>
                <p className="text-muted text-sm leading-relaxed mt-4 max-w-xs">
            Aspiring AI & fintech developer exploring machine learning with Python, building modern web experiences on the side.
          </p>
        </div>

        <div>
          <h3 className="font-heading text-text font-semibold mb-5 text-sm uppercase tracking-wide">
            Contact
          </h3>
          <ul className="space-y-3 text-sm text-muted">
            <li className="flex items-center gap-2.5">
              <Mail size={15} className="text-accent" />
              <a href="mailto:leonoelzuze@gmail.com" className="hover:text-text transition-colors">
                leonoelzuze@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={15} className="text-accent" />
              <a href="tel:+919764506058" className="hover:text-text transition-colors">
                +91 97645 06058
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-text font-semibold mb-5 text-sm uppercase tracking-wide">
            Quick Links
          </h3>
          <ul className="space-y-3 text-sm text-muted">
            {QUICK_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} className="hover:text-accent transition-colors">
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-text font-semibold mb-5 text-sm uppercase tracking-wide">
            Follow
          </h3>
          <div className="flex flex-wrap gap-4">
            {SOCIALS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-border text-muted hover:text-bg hover:bg-accent hover:border-accent transition-all duration-200"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-16 pt-8 border-t border-border flex justify-center">
        <p className="text-muted text-xs tracking-wide">
          © 2026 <span className="text-text font-medium">Leo Zuze</span>. All rights reserved.
        </p>
      </div>
    </footer>
  );
}