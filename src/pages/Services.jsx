import { ArrowUpRight, Check } from "lucide-react";
import { services, getWhatsAppLink } from "../data/services";
import PageHeader from "../components/ui/PageHeader";
import PageCTA from "../components/ui/PageCTA";
import { Reveal } from "../components/motion/primitives";
import Seo from "../components/Seo";
import { SEO } from "../data/seoRoutes";

const pad = (n) => String(n).padStart(2, "0");

const BTN =
  "group relative inline-flex w-fit items-center gap-2.5 overflow-hidden rounded-md bg-ink px-6 py-3.5 text-sm font-semibold text-on-ink transition-colors duration-300 before:absolute before:inset-0 before:translate-y-full before:bg-accent before:transition-transform before:duration-300 before:ease-out hover:before:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:before:transition-none";

export default function Services() {
  return (
    <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-12 md:pb-32 md:pt-16">
      <Seo {...SEO.services} />

      <PageHeader
        eyebrow="Services"
        lines={[
          { text: "What I can" },
          { text: "build for your" },
          { text: "business.", accent: true },
        ]}
        intro="Five services, one developer. Every project starts with a short chat and a fixed quote, so you know the price before any work begins."
      />

      <div className="mt-16 flex flex-col gap-6 md:mt-20">
        {services.map((s, i) => {
          const Icon = s.icon;
          return (
            <Reveal key={s.id}>
              <article
                id={s.id}
                className="group/card relative grid scroll-mt-28 gap-8 overflow-hidden rounded-xl border border-border bg-surface p-7 transition-colors duration-300 hover:border-ink md:grid-cols-12 md:p-10"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-2 -top-6 select-none font-heading text-[9rem] font-extrabold leading-none text-transparent transition-transform duration-500 group-hover/card:-translate-x-2 motion-reduce:transform-none"
                  style={{ WebkitTextStroke: "1px rgba(22,20,15,0.1)" }}
                >
                  {pad(i + 1)}
                </span>

                <div className="relative md:col-span-5">
                  <span className="grid h-12 w-12 place-items-center rounded-md bg-ink text-on-ink transition-colors duration-300 group-hover/card:bg-accent">
                    <Icon size={22} aria-hidden />
                  </span>
                  <h2 className="mt-6 font-heading text-2xl font-extrabold leading-tight tracking-tight text-text md:text-3xl">
                    {s.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted md:text-base">{s.tagline}</p>

                  <p className="mt-6 font-heading text-3xl font-extrabold text-text">
                    {s.price ?? "Let\u2019s talk"}
                  </p>
                  <p className="mt-1 text-xs text-muted">{s.priceNote}</p>
                </div>

                <div className="relative flex flex-col justify-between gap-7 md:col-span-7">
                  <div>
                    <p className="text-sm leading-relaxed text-muted md:text-base">{s.description}</p>
                    <ul className="mt-6 grid gap-x-6 gap-y-3 border-t border-border pt-6 sm:grid-cols-2">
                      {s.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm text-text/80">
                          <Check size={15} aria-hidden className="mt-0.5 shrink-0 text-accent" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href={getWhatsAppLink(s.title)}
                    target="_blank"
                    rel="noreferrer"
                    className={BTN}
                  >
                    <span className="relative">{s.cta}</span>
                    <ArrowUpRight
                      size={16}
                      aria-hidden
                      className="relative transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
                    />
                  </a>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>

      <PageCTA
        className="mt-24 md:mt-32"
        eyebrow="Not sure what you need?"
        lines={[{ text: "Describe the problem." }, { text: "I'll suggest the fix.", accent: true }]}
        text="Tell me what slows your team down. I'll recommend the simplest solution and what it would cost."
        primary={{ label: "Talk to me", to: "/contact" }}
        secondary={{ label: "See my projects", to: "/projects" }}
      />
    </div>
  );
}