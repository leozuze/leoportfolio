import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useScrollPosition } from "../../hooks/useScrollPosition";
import MobileMenu from "./MobileMenu";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Projects", to: "/projects" },
  { label: "Skills", to: "/skills" },
  { label: "Contact", to: "/contact" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const scrolled = useScrollPosition();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-bg/95 backdrop-blur-md border-b border-border"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <NavLink to="/" className="flex items-baseline gap-1.5 group">
          <span className="font-heading text-lg font-bold tracking-tight">
            <span className="text-accent">LEO</span>
            <span className="text-text"> ZUZE</span>
          </span>

        </NavLink>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8 text-sm">
          {LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `relative py-1 transition-colors ${
                    isActive ? "text-accent" : "text-muted hover:text-text"
                  } after:absolute after:left-0 after:-bottom-1 after:h-[1.5px] after:bg-accent after:transition-all after:duration-300 ${
                    isActive ? "after:w-full" : "after:w-0 hover:after:w-full"
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a
          href="https://wa.me/919764506058?text=Hi%20Leo%2C%20I%27d%20like%20to%20start%20a%20project."
          target="_blank"
          rel="noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-bg bg-accent px-5 py-2.5 rounded-full hover:bg-accent-2 hover:scale-105 transition-all duration-200"
        >
          Let's talk <ArrowUpRight size={14} />
        </a>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="md:hidden text-text hover:text-accent transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </header>
  );
}