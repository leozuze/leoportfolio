import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Mail } from "lucide-react";
import { NavLink } from "react-router-dom";

// Swap this for wherever you actually want inbound contact to land —
// mailto works out of the box with zero backend, but if /contact has
// a form, that's probably the better primary action.
const EMAIL = "leonoelzuze@gmail.com";

export default function CTASection() {
  const shouldReduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 overflow-x-hidden">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.5 }}
        variants={fadeUp}
        className="relative rounded-[2.5rem] border border-border bg-surface overflow-hidden px-8 py-16 md:px-16 md:py-20 text-center"
      >
        {/* Ambient gradient, same accent pairing used on the project cards */}
        <div className="pointer-events-none absolute -inset-1 bg-gradient-to-br from-accent/10 via-transparent to-accent-2/10" />

        <div className="relative">
          <p className="font-mono text-xs uppercase tracking-widest text-accent mb-4">
            Got a project in mind?
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-text max-w-xl mx-auto">
            Let's build something worth shipping.
          </h2>
          <p className="mt-4 text-sm md:text-base text-muted max-w-md mx-auto leading-relaxed">
            Whether it's a data pipeline, a full stack app, or a site that
            needs to actually convert I'm open to new work.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <NavLink
              to="/contact"
              className="inline-flex items-center gap-2 bg-accent text-bg px-6 py-3 rounded-full font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Get In Touch <ArrowUpRight size={16} />
            </NavLink>

            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center gap-2 border border-border px-6 py-3 rounded-full font-medium text-sm text-text hover:border-accent hover:text-accent transition-colors"
            >
              <Mail size={16} /> {EMAIL}
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
