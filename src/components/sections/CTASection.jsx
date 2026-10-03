import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { ArrowUpRight, Mail, MessageCircle } from "lucide-react";
import { NavLink } from "react-router-dom";
import { WordReveal } from "../motion/primitives";
import { getWhatsAppLink } from "../../data/services";
import { useIsMobile } from "../../hooks/useIsMobile";

const EMAIL = "leonoelzuze@gmail.com";

/* pulls its child toward the cursor */
function Magnetic({ children, disabled }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 16 });
  const y = useSpring(my, { stiffness: 220, damping: 16 });

  if (disabled) return <div className="inline-block">{children}</div>;

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.3);
    my.set((e.clientY - (r.top + r.height / 2)) * 0.3);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      style={{ x, y }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="-m-3 inline-block p-3"
    >
      {children}
    </motion.div>
  );
}

export default function CTASection() {
  const reduce = useReducedMotion();
  const mobile = useIsMobile();

  const sx = useMotionValue(-500);
  const sy = useMotionValue(-500);
  const spot = useMotionTemplate`radial-gradient(420px circle at ${sx}px ${sy}px, rgba(242,98,27,0.14), transparent 70%)`;

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    sx.set(e.clientX - r.left);
    sy.set(e.clientY - r.top);
  };
  const onLeave = () => {
    sx.set(-500);
    sy.set(-500);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: reduce ? 0 : 28 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" } },
  };

  const mask = "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)";
  const ghost = "Let's talk • Let's build • Let's ship • ";

  return (
    <section className="mx-auto max-w-6xl overflow-x-hidden px-6 py-20 md:py-28">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={fadeUp}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="relative overflow-hidden rounded-[2.5rem] p-px"
      >
        {/* light sweep travelling around the border */}
        <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="aspect-square w-[200%] shrink-0"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0 62%, #F2621B 80%, #FFC542 90%, transparent 100%)",
            }}
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="relative overflow-hidden rounded-[calc(2.5rem-1px)] bg-surface">
          {/* aurora */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-accent/25 blur-3xl"
            animate={reduce ? undefined : { x: [0, 70, 0], y: [0, 40, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-accent-2/20 blur-3xl"
            animate={reduce ? undefined : { x: [0, -60, 0], y: [0, -50, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* faint grid, faded toward the edges */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(250,250,248,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(250,250,248,0.045) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage: "radial-gradient(ellipse at center, #000 25%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, #000 25%, transparent 75%)",
            }}
          />

          {/* cursor spotlight */}
          <motion.div
            aria-hidden="true"
            style={{ background: spot }}
            className="pointer-events-none absolute inset-0"
          />

          <div className="relative px-8 pt-16 text-center md:px-16 md:pt-24">
            <div className="mx-auto inline-flex items-center gap-2.5 rounded-full border border-border bg-bg/60 px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted backdrop-blur">
              <span className="relative flex h-2 w-2">
                {!reduce && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                )}
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Open for new projects
            </div>

            <h2 className="mx-auto mt-8 max-w-3xl font-heading text-4xl font-bold leading-[1.05] tracking-tight text-text md:text-6xl">
              <WordReveal text="Let's build something" />{" "}
              <span className="font-logo font-normal italic text-accent">
                <WordReveal text="worth shipping." delay={0.3} />
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-muted md:text-base">
              Whether it's a data pipeline, a full stack app, or a site that needs
              to actually convert, I'm open to new work.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <Magnetic disabled={reduce || mobile}>
                <NavLink
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-semibold text-bg shadow-[0_0_40px_rgba(242,98,27,0.35)] transition-shadow hover:shadow-[0_0_60px_rgba(242,98,27,0.55)]"
                >
                  Get In Touch <ArrowUpRight size={16} />
                </NavLink>
              </Magnetic>

              <a
                href={getWhatsAppLink("a new project")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-bg/50 px-6 py-3.5 text-sm font-medium text-text backdrop-blur transition-colors hover:border-accent hover:text-accent"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>

              <a
                href={`mailto:${EMAIL}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-bg/50 px-6 py-3.5 text-sm font-medium text-text backdrop-blur transition-colors hover:border-accent hover:text-accent"
              >
                <Mail size={16} /> {EMAIL}
              </a>
            </div>

            <p className="mt-8 font-mono text-[11px] uppercase tracking-widest text-muted">
              Websites · AI &amp; data tools · Full stack apps
            </p>
          </div>

          {/* giant outlined strip */}
          <div
            aria-hidden="true"
            className="relative mt-12 overflow-hidden pb-4 md:mt-16"
            style={{ maskImage: mask, WebkitMaskImage: mask }}
          >
            <motion.div
              className="flex w-max select-none whitespace-nowrap font-logo text-[4.5rem] italic leading-none text-transparent md:text-[8rem]"
              style={{ WebkitTextStroke: "1px rgba(250,250,248,0.12)" }}
              animate={reduce ? undefined : { x: ["0%", "-50%"] }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            >
              <span className="pr-8">{ghost.repeat(2)}</span>
              <span className="pr-8">{ghost.repeat(2)}</span>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}