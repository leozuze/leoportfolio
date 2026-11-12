import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { NAV_LINKS, START_PROJECT_URL } from "./navData";

export default function MobileMenu({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "top center" }}
          className="mt-2 overflow-hidden rounded-3xl bg-ink p-3 text-on-ink md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link, i) => (
              <motion.li
                key={link.to}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.04, duration: 0.25 }}
              >
                <NavLink
                  to={link.to}
                  end={link.to === "/"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-2xl px-4 py-3.5 text-lg font-medium transition-colors ${
                      isActive
                        ? "bg-accent text-on-accent"
                        : "text-on-ink/75 hover:bg-white/10 hover:text-on-ink"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {isActive && <ArrowUpRight size={18} aria-hidden />}
                    </>
                  )}
                </NavLink>
              </motion.li>
            ))}
          </ul>

          <a
            href={START_PROJECT_URL}
            target="_blank"
            rel="noreferrer"
            onClick={onClose}
            className="mt-3 flex items-center justify-center gap-1.5 rounded-2xl bg-on-ink px-4 py-3.5 text-base font-semibold text-ink"
          >
            Start a project <ArrowUpRight size={16} />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}