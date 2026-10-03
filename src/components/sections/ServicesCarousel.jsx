import { useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { services, getWhatsAppLink } from "../../data/services";
import { WordReveal } from "../motion/primitives";
import { useIsMobile } from "../../hooks/useIsMobile";

function ServiceCard({ s, i, total, x }) {
  const reduce = useReducedMotion();
  const mobile = useIsMobile();

  const outer = useRef(null);
  const measurements = useRef({
    left: 0,
    width: 420,
  });

  const [, forceUpdate] = useState(0);

  const gx = useMotionValue(50);
  const gy = useMotionValue(50);

  const glare = useMotionTemplate`
    radial-gradient(
      260px circle at ${gx}% ${gy}%,
      rgba(242, 98, 27, 0.16),
      transparent 70%
    )
  `;

  const center = useTransform(x, (xValue) => {
    return (
      measurements.current.left +
      xValue +
      measurements.current.width / 2 -
      window.innerWidth / 2
    );
  });

  const arrive = useTransform(center, (centerValue) => {
    const viewportWidth = window.innerWidth;
    const start = viewportWidth / 2 + 140;
    const end = viewportWidth * 0.22;

    return Math.min(
      1,
      Math.max(
        0,
        (start - centerValue) / (start - end)
      )
    );
  });

  const springConfig = {
    stiffness: 190,
    damping: 20,
  };

  const enterY = useSpring(
    useTransform(arrive, [0, 1], [150, 0]),
    springConfig
  );

  const enterRotate = useSpring(
    useTransform(arrive, [0, 1], [7, 0]),
    springConfig
  );

  const enterOpacity = useTransform(
    arrive,
    [0, 0.5],
    [0, 1]
  );

  const tiltAmount = mobile ? 8 : 18;

  const rotateY = useTransform(
    center,
    [-700, 0, 700],
    [tiltAmount, 0, -tiltAmount]
  );

  const scale = useTransform(
    center,
    [-700, 0, 700],
    [0.9, 1, 0.9]
  );

  const numberX = useTransform(
    center,
    [-700, 700],
    [50, -50]
  );

  const contentOpacity = useTransform(
    center,
    [-500, 0, 500],
    [0.45, 1, 0.45]
  );

  useLayoutEffect(() => {
    const measureCard = () => {
      if (!outer.current) return;

      measurements.current = {
        left: outer.current.offsetLeft,
        width: outer.current.offsetWidth,
      };

      forceUpdate((value) => value + 1);
    };

    measureCard();

    window.addEventListener("resize", measureCard);

    return () => {
      window.removeEventListener("resize", measureCard);
    };
  }, []);

  const handlePointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    gx.set(
      ((event.clientX - rect.left) / rect.width) * 100
    );

    gy.set(
      ((event.clientY - rect.top) / rect.height) * 100
    );
  };

  return (
    <motion.div
      ref={outer}
      style={
        reduce
          ? undefined
          : {
              rotateY,
              rotateZ: enterRotate,
              scale,
              y: enterY,
              opacity: enterOpacity,
              transformPerspective: 1200,
            }
      }
      className="w-[82vw] shrink-0 sm:w-[420px]"
    >
      <motion.article
        onPointerMove={handlePointerMove}
        animate={
          reduce
            ? undefined
            : {
                y: [0, -8, 0],
              }
        }
        transition={{
          duration: 4.5 + i * 0.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.35,
        }}
        className="group relative flex h-[min(68svh,540px)] w-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface p-7 transition-colors hover:border-accent"
      >
        <motion.div
          aria-hidden="true"
          style={{ background: glare }}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        <motion.span
          aria-hidden="true"
          style={{
            x: numberX,
            WebkitTextStroke:
              "1px rgba(242, 98, 27, 0.28)",
          }}
          className="pointer-events-none absolute -right-2 -top-6 select-none font-logo text-[9rem] italic leading-none text-transparent"
        >
          {String(i + 1).padStart(2, "0")}
        </motion.span>

        <motion.div
          style={{ opacity: contentOpacity }}
          className="relative flex h-full flex-col justify-between"
        >
          <div>
            <div className="font-mono text-xs text-muted">
              {String(i + 1).padStart(2, "0")} /{" "}
              {String(total).padStart(2, "0")}

              {s.status === "in-development" && (
                <span className="ml-3 text-accent">
                  In development
                </span>
              )}
            </div>

            <h3 className="mt-8 font-heading text-2xl font-semibold text-text">
              {s.title}
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-muted">
              {s.tagline}
            </p>

            <ul className="mt-6 divide-y divide-border/70 border-t border-border/70 text-sm text-muted">
              {s.features.map((feature) => (
                <li key={feature} className="py-2.5">
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-text">
              {s.price ?? "Let's talk"}
            </span>

            <a
              href={getWhatsAppLink(s.title)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent"
            >
              {s.cta}
              <ArrowUpRight size={14} />
            </a>
          </div>
        </motion.div>
      </motion.article>
    </motion.div>
  );
}

export default function ServicesCarousel() {
  const ref = useRef(null);
  const track = useRef(null);

  const [dist, setDist] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const x = useTransform(
    scrollYProgress,
    [0, 1],
    [0, -dist]
  );

  const ghostX = useTransform(
    scrollYProgress,
    [0, 1],
    [0, dist * 0.35]
  );

  useLayoutEffect(() => {
    const measureTrack = () => {
      if (!track.current) return;

      const distance = Math.max(
        0,
        track.current.scrollWidth - window.innerWidth
      );

      setDist(distance);
    };

    measureTrack();

    window.addEventListener("resize", measureTrack);

    return () => {
      window.removeEventListener("resize", measureTrack);
    };
  }, []);

  return (
    <section
      ref={ref}
      style={{
        height: `calc(100svh - 6rem + ${dist}px)`,
      }}
    >
      <div className="sticky top-20 flex h-[calc(100svh-6rem)] flex-col justify-center overflow-hidden">
        <motion.span
          aria-hidden="true"
          style={{
            x: ghostX,
            WebkitTextStroke:
              "1px rgba(250,250,248,0.07)",
          }}
          className="pointer-events-none absolute bottom-10 left-0 select-none whitespace-nowrap font-logo text-[28vw] italic leading-none text-transparent md:bottom-12 md:text-[16rem]"
        >
          Services
        </motion.span>

        <motion.div
          ref={track}
          style={{ x }}
          className="relative flex w-max gap-6 px-6 md:gap-8 md:px-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]"
        >
          <div className="flex w-[80vw] shrink-0 flex-col justify-between sm:w-[360px]">
            <p className="font-mono text-xs uppercase tracking-widest text-accent">
              What I do
            </p>

            <h2 className="font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-text md:text-5xl">
              <WordReveal text="Everything your business needs" />{" "}

              <span className="font-logo font-normal italic text-accent">
                <WordReveal text="online." delay={0.3} />
              </span>
            </h2>

            <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
              Keep scrolling →
            </p>
          </div>

          {services.map((service, index) => (
            <ServiceCard
              key={service.id}
              s={service}
              i={index}
              total={services.length}
              x={x}
            />
          ))}
        </motion.div>

        <div className="mx-auto mt-8 h-px w-full max-w-6xl px-6">
          <div className="h-px w-full bg-border">
            <motion.div
              style={{ scaleX: scrollYProgress }}
              className="h-px origin-left bg-accent"
            />
          </div>
        </div>
      </div>
    </section>
  );
}