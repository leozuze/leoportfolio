import { motion } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { NavLink } from "react-router-dom";
import heroImg from "../../assets/images/heroimg.jpeg";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

export default function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Text side */}
        <div>
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="font-heading text-4xl md:text-5xl font-bold tracking-tight leading-[1.15] text-text"
          >
            Hi, I Am Leo Zuze,
            <br />
            <span className="text-accent">AI Fintech Dev & Full Stack Engineer.</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="mt-6 text-muted text-sm md:text-base max-w-md leading-relaxed"
          >
            I build reliable, data-driven systems and the interfaces that
            make them usable combining machine learning with clean,
            production-ready web development.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="mt-9 flex flex-wrap gap-4"
          >
            <NavLink
              to="/contact"
              className="inline-flex items-center gap-2 border border-border px-6 py-3 rounded-full font-medium text-sm text-text hover:border-accent hover:text-accent transition-colors"
            >
              Know Me
            </NavLink>
            <NavLink
              to="/projects"
              className="inline-flex items-center gap-2 bg-accent text-bg px-6 py-3 rounded-full font-semibold text-sm hover:bg-accent-2 hover:scale-105 transition-all duration-200"
            >
              See My Projects <ArrowUpRight size={16} />
            </NavLink>
          </motion.div>
        </div>

        {/* Image side */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative flex justify-center md:justify-end"
        >
          <div className="relative w-full max-w-xs md:max-w-sm">
            {/* Rotated background card */}
            <div className="absolute -inset-3 bg-gradient-to-br from-accent/15 via-surface to-accent-2/10 rounded-[2.5rem] -rotate-6 border border-border" />

            {/* Dotted pattern accent */}
            <svg
              className="absolute -top-6 -left-6 w-16 h-16 text-accent/30 -z-0"
              viewBox="0 0 60 60"
              fill="none"
            >
              {Array.from({ length: 5 }).map((_, row) =>
                Array.from({ length: 5 }).map((_, col) => (
                  <circle
                    key={`${row}-${col}`}
                    cx={6 + col * 12}
                    cy={6 + row * 12}
                    r="2"
                    fill="currentColor"
                  />
                ))
              )}
            </svg>

            {/* Yellow accent blob */}
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-accent-2/25 rounded-full blur-xl" />

            {/* Small floating badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="absolute top-4 -right-3 md:-right-5 bg-bg border border-border rounded-2xl px-3 py-2 shadow-lg z-20"
            >
              <p className="text-[10px] font-mono text-muted uppercase tracking-widest">
                Available for
              </p>
              <p className="text-xs font-semibold text-accent">Freelance work</p>
            </motion.div>

            {/* Image */}
            <img
              src={heroImg}
              alt="Leo Zuze"
              className="relative w-full aspect-[4/5] object-cover rounded-[2rem] z-10"
            />
          </div>
        </motion.div>
      </div>

      {/* Scroll down indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="flex justify-center mt-16"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1 text-muted"
        >
          <span className="text-[10px] font-mono uppercase tracking-widest">
            Scroll Down
          </span>
          <ChevronDown size={16} className="text-accent" />
        </motion.div>
      </motion.div>
    </section>
  );
}