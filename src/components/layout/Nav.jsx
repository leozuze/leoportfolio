import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useScrollPosition } from "../../hooks/useScrollPosition";
import MobileMenu from "./MobileMenu";
import Logo from "../ui/Logo";
import { NAV_LINKS, START_PROJECT_URL } from "./navData";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const scrolled = useScrollPosition();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <div
        className={`mx-auto transition-[max-width] duration-500 ease-out ${
          scrolled ? "max-w-5xl" : "max-w-6xl"
        }`}
      >
        <nav
          aria-label="Main"
          className={`flex items-center justify-between rounded-full bg-ink py-2 pl-2.5 pr-2.5 text-on-ink transition-shadow duration-300 sm:pl-3 ${
            scrolled ? "shadow-[0_12px_30px_-12px_rgb(22_20_15/0.5)]" : ""
          }`}
        >
          {/* Logo + name */}
          <NavLink
            to="/"
            aria-label="Leo Zuze, home"
            className="group flex items-center gap-2.5 rounded-full pr-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-ink"
          >
            <Logo size={34} />
            <span className="font-logo text-lg tracking-tight">
              <span className="font-semibold text-on-ink">Leo</span>{" "}
              <span className="font-bold text-accent-soft">Zuze</span>
            </span>
          </NavLink>

          {/* Desktop links */}
          <ul
            className="hidden items-center gap-1 md:flex"
            onMouseLeave={() => setHovered(null)}
            onBlur={() => setHovered(null)}
          >
            {NAV_LINKS.map((link) => (
              <li
                key={link.to}
                onMouseEnter={() => setHovered(link.to)}
                onFocus={() => setHovered(link.to)}
              >
                <NavLink
                  to={link.to}
                  end={link.to === "/"}
                  className={({ isActive }) =>
                    `group relative block rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-on-ink ${
                      isActive
                        ? "text-on-accent"
                        : "text-on-ink/70 hover:text-on-ink focus-visible:text-on-ink"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {hovered === link.to && !isActive && (
                        <motion.span
                          layoutId="nav-hover"
                          aria-hidden
                          className="absolute inset-0 rounded-full bg-white/10"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      )}
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          aria-hidden
                          className="absolute inset-0 rounded-full bg-accent"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}

                      {/* label roll */}
                      <span className="relative block overflow-hidden leading-5">
                        <span className="block transition-transform duration-300 ease-out group-hover:-translate-y-full motion-reduce:group-hover:translate-y-0">
                          {link.label}
                        </span>
                        <span
                          aria-hidden
                          className="absolute inset-0 block translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0 motion-reduce:hidden"
                        >
                          {link.label}
                        </span>
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <a
            href={START_PROJECT_URL}
            target="_blank"
            rel="noreferrer"
            className="group hidden items-center gap-2.5 rounded-full bg-on-ink py-1.5 pl-5 pr-1.5 text-sm font-semibold text-ink transition-colors duration-300 hover:bg-accent hover:text-on-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-ink md:inline-flex"
          >
            Start a project
            <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-on-ink transition-colors duration-300 group-hover:bg-on-accent group-hover:text-accent">
              <ArrowUpRight
                size={15}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
              />
            </span>
          </a>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="grid h-10 w-10 place-items-center rounded-full text-on-ink transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-on-ink md:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        <MobileMenu open={open} onClose={() => setOpen(false)} />
      </div>
    </header>
  );
}