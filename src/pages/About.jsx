import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Brain, Code2, Rocket, GraduationCap, MapPin } from "lucide-react";
import { NavLink } from "react-router-dom";
import heroImg from "../assets/images/heroimg.jpeg";

const quickFacts = [
  { label: "Based in", value: "Pune, India" },
  { label: "Studying", value: "Vishwakarma University" },
  { label: "Year", value: "2nd Year" },
  { label: "Focus", value: "AI Fintech Dev" },
];

const focusAreas = [
  {
    title: "AI Fintech Dev & Data Science",
    icon: Brain,
    detail:
      "Python, Pandas, and scikit-learn to clean, explore, and model financial data turning raw numbers into something a system can act on.",
  },
  {
    title: "Full Stack Development",
    icon: Code2,
    detail:
      "React and Tailwind on the frontend, Express and MongoDB on the backend, wired together so the models above actually reach a real interface.",
  },
  {
    title: "Currently Exploring",
    icon: Rocket,
    detail:
      "Agentic coding tools like Antigravity, and going deeper on model training the next layer past classic ML.",
  },
];

export default function About() {
  const shouldReduceMotion = useReducedMotion();

  const slideLeft = {
    hidden: { opacity: 0, x: shouldReduceMotion ? 0 : -36 },
    visible: (i = 0) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.12, duration: 0.55, ease: "easeOut" },
    }),
  };

  const slideRight = {
    hidden: { opacity: 0, x: shouldReduceMotion ? 0 : 56 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.65, ease: "easeOut", delay: 0.25 },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
  };

  const cardContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };
  const card = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 overflow-x-hidden">
      {/* Intro */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
        {/* Text side */}
        <div>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0}
            variants={slideLeft}
            className="font-mono text-xs uppercase tracking-widest text-accent mb-2"
          >
            About
          </motion.p>

          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={slideLeft}
            className="font-heading text-3xl md:text-4xl font-bold tracking-tight leading-[1.15] text-text"
          >
            Building at the edge of AI and the web.
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            custom={2}
            variants={slideLeft}
            className="mt-6 text-muted text-sm md:text-base max-w-md leading-relaxed"
          >
            I'm Leo a second-year student at Vishwakarma University in
            Pune, India, spending most of my time in the overlap between AI
            and fintech development. I like the pipeline side of things:
            pulling in messy data, cleaning it with Pandas, and training
            models that actually hold up. But a model nobody can reach isn't
            very useful, so I build the full stack around it too React on
            the frontend, Express and MongoDB behind it so the work ends up
            in something people can open and use.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            custom={3}
            variants={slideLeft}
            className="mt-8 grid grid-cols-2 gap-4 max-w-md"
          >
            {quickFacts.map(({ label, value }) => (
              <div key={label} className="border-l-2 border-accent/40 pl-3">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted">
                  {label}
                </p>
                <p className="text-sm font-medium text-text mt-0.5">{value}</p>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            custom={4}
            variants={slideLeft}
            className="mt-9 flex flex-wrap gap-4"
          >
            <NavLink
              to="/projects"
              className="inline-flex items-center gap-2 bg-accent text-bg px-6 py-3 rounded-full font-semibold text-sm hover:bg-accent-2 hover:scale-105 transition-all duration-200"
            >
              See My Projects <ArrowUpRight size={16} />
            </NavLink>
            <NavLink
              to="/contact"
              className="inline-flex items-center gap-2 border border-border px-6 py-3 rounded-full font-medium text-sm text-text hover:border-accent hover:text-accent transition-colors"
            >
              Get In Touch
            </NavLink>
          </motion.div>
        </div>

        {/* Image side — same layered treatment as the Hero portrait, so
            the two feel like one visual system rather than two different
            photo styles */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideRight}
          className="relative flex justify-center md:justify-end"
        >
          <div className="relative w-full max-w-xs md:max-w-sm">
            <div className="absolute -inset-3 bg-gradient-to-br from-accent/15 via-surface to-accent-2/10 rounded-[2.5rem] rotate-6 border border-border" />

            <motion.svg
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="absolute -bottom-6 -left-6 w-16 h-16 text-accent/30 -z-0"
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
            </motion.svg>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="absolute -top-4 -right-4 w-20 h-20 bg-accent-2/25 rounded-full blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute top-4 -left-3 md:-left-5 bg-bg border border-border rounded-2xl px-3 py-2 shadow-lg z-20 flex items-center gap-2"
            >
              <MapPin size={14} className="text-accent shrink-0" />
              <p className="text-xs font-semibold text-text">Pune, India</p>
            </motion.div>

            <img
              src={heroImg}
              alt="Leo Zuze"
              className="relative w-full aspect-[4/5] object-cover rounded-[2rem] z-10"
            />
          </div>
        </motion.div>
      </div>

      {/* Education */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.5 }}
        variants={fadeUp}
        className="relative bg-surface border border-border rounded-3xl p-6 md:p-8 mb-24 overflow-hidden"
      >
        <div className="pointer-events-none absolute -inset-1 bg-gradient-to-br from-accent/5 via-transparent to-accent-2/5" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 text-accent shrink-0">
            <GraduationCap size={22} />
          </span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted mb-1">
              Education
            </p>
            <h2 className="font-heading text-lg md:text-xl font-semibold text-text">
              Vishwakarma University, Pune
            </h2>
            <p className="text-sm text-muted mt-1">
              2nd Year currently building toward AI and fintech development
              alongside coursework.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Focus areas */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.6 }}
        variants={fadeUp}
        className="mb-10"
      >
        <p className="font-mono text-xs uppercase tracking-widest text-accent mb-2">
          What I Focus On
        </p>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-text">
          Where I Spend My Time
        </h2>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        variants={cardContainer}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {focusAreas.map(({ title, icon: Icon, detail }) => (
          <motion.div
            key={title}
            variants={card}
            className="group bg-surface border border-border rounded-2xl p-6 hover:border-accent transition-colors"
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent mb-4">
              <Icon size={18} />
            </span>
            <h3 className="font-heading text-base font-semibold text-text mb-2">
              {title}
            </h3>
            <p className="text-sm text-muted leading-relaxed">{detail}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
