import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Projects", to: "/projects" },
  { label: "Skills", to: "/skills" },
  { label: "Contact", to: "/contact" },
];

export default function MobileMenu({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="md:hidden overflow-hidden border-t border-border bg-bg"
        >
          <ul className="flex flex-col px-6 py-6 gap-5 text-base">
            {LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    isActive ? "text-accent font-medium" : "text-muted"
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li>
              <a
                href="https://wa.me/919764506058?text=Hi%20Leo%2C%20I%27d%20like%20to%20start%20a%20project."
                target="_blank"
                rel="noreferrer"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-bg bg-accent px-4 py-2.5 rounded-full font-medium text-sm"
              >
                Let's talk <ArrowUpRight size={14} />
              </a>
            </li>
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}