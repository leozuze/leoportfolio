import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import HeroPortrait from "./HeroPortrait";
import ServicesMarquee from "./ServicesMarquee";
import { Flicks, FlowLines } from "../ui/Curves";
import { SplitText, WordFade } from "../motion/TextReveal";
import Magnetic from "../motion/Magnetic";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useIntro } from "../intro/IntroContext";

const EASE = [0.22, 1, 0.36, 1];

// Edit these so they match what is true for your freelance work.
const TRUST = [
  { title: "One developer", text: "Start to finish, no hand-offs" },
  { title: "Live projects", text: "Real work you can open and try" },
  { title: "Clear scope", text: "Agreed before any work begins" },
];

const trustList = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 1.5 } },
};
const trustItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};
const trustRule = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.8, ease: EASE } },
};

// A masked line: the words or letters inside slide up from behind it.
const Line = ({ children }) => (
  <span className="block overflow-hidden pb-[0.14em] pr-2">{children}</span>
);

export default function Hero() {
  const reduce = useReducedMotion();
  const mobile = useIsMobile();
  const { done } = useIntro();

  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // transform only, so scrolling stays smooth
  const textY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const still = reduce || mobile;

  return (
    <section ref={ref} className="relative overflow-x-clip">
      {/* Side panel with fine flowing lines: flat, no gradients, no dots */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[38%] overflow-hidden bg-sand md:block"
      >
        <FlowLines className="text-ink/25" delay={0.8} accentLine={3} />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-y-6 px-6 md:min-h-[calc(100svh-13rem)] md:grid-cols-12 md:items-center md:gap-x-10">
        {done && (
          <>
            {/* Text */}
            <motion.div
              style={still ? undefined : { y: textY }}
              className="py-12 md:col-span-7 md:py-20"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex items-center gap-4"
              >
                <motion.span
                  aria-hidden
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
                  style={{ originX: 0 }}
                  className="block h-px w-14 bg-ink"
                />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Freelance AI engineer &amp; full-stack developer
                </p>
              </motion.div>

              <h1 className="mt-7 font-heading text-[2.6rem] font-extrabold leading-[1.02] tracking-tight text-text sm:text-6xl lg:text-[4.25rem] xl:text-[5rem]">
                <span className="relative block">
                  <Line>
                    <SplitText
                      text="Custom AI"
                      by="chars"
                      delay={0.25}
                      stagger={0.045}
                      className="text-accent"
                    />
                  </Line>
                  {/* sized in em so it follows the headline size; tweak left if needed */}
                  <Flicks
                    delay={1.35}
                    className="absolute left-[5.2em] top-[-0.12em] h-[0.78em] w-[0.78em] text-accent"
                  />
                </span>
                <Line>
                  <SplitText text="assistants and" delay={0.6} />
                </Line>
                <Line>
                  <SplitText text="web apps for" delay={0.8} />
                </Line>
                <Line>
                  <SplitText text="your business." delay={1.0} />
                </Line>
              </h1>

              <WordFade
                delay={1.25}
                text="I design, build and launch chatbots, AI agents and web apps that answer your customers, automate repetitive work and fit the way your team already operates."
                className="mt-7 max-w-lg text-base leading-relaxed text-muted sm:text-lg"
              />

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.7, ease: EASE }}
                className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5"
              >
                <Magnetic>
                  <NavLink
                    to="/contact"
                    className="group relative inline-flex items-center gap-3 overflow-hidden rounded-md bg-accent px-7 py-4 text-sm font-semibold text-on-accent before:absolute before:inset-0 before:translate-y-full before:bg-ink before:transition-transform before:duration-300 before:ease-out hover:before:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:before:transition-none"
                  >
                    <span className="relative">Start a project</span>
                    <ArrowUpRight
                      size={17}
                      aria-hidden
                      className="relative transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
                    />
                  </NavLink>
                </Magnetic>

                <NavLink
                  to="/projects"
                  className="group inline-flex items-center gap-2 border-b-2 border-ink pb-1 text-sm font-semibold text-text transition-colors duration-200 hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  See my work
                  <ArrowRight
                    size={16}
                    aria-hidden
                    className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none"
                  />
                </NavLink>
              </motion.div>

              <motion.ul
                variants={trustList}
                initial="hidden"
                animate="show"
                className="mt-12 grid gap-5 sm:grid-cols-3"
              >
                {TRUST.map((item) => (
                  <motion.li
                    key={item.title}
                    variants={trustItem}
                    className="relative pt-5"
                  >
                    <motion.span
                      aria-hidden
                      variants={trustRule}
                      style={{ originX: 0 }}
                      className="absolute inset-x-0 top-0 h-px bg-ink/30"
                    />
                    <p className="text-sm font-bold text-text">{item.title}</p>
                    <p className="mt-1 text-sm leading-snug text-muted">{item.text}</p>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>

            {/* Portrait: sits flush on the marquee below */}
            <div className="self-end md:col-span-5">
              <HeroPortrait />
            </div>
          </>
        )}
      </div>

      <ServicesMarquee />
    </section>
  );
}