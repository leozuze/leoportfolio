import { skillCategories } from "../data/skills";
import PageHeader from "../components/ui/PageHeader";
import PageCTA from "../components/ui/PageCTA";
import { FlowLines } from "../components/ui/Curves";
import { Reveal } from "../components/motion/primitives";
import Seo from "../components/Seo";
import { SEO } from "../data/seoRoutes";

const pad = (n) => String(n).padStart(2, "0");

function SkillGroup({ cat, i }) {
  const dark = i === 0; // the first group is the core focus

  return (
    <Reveal
      className={`relative overflow-hidden rounded-xl p-6 md:p-10 ${
        dark ? "bg-ink text-on-ink" : "border border-border bg-surface"
      }`}
    >
      {dark && (
        <FlowLines
          className="text-white/[0.1]"
          count={5}
          gap={28}
          inView
          accentLine={3}
          accentColor="var(--color-accent-soft)"
        />
      )}

      <div className="relative grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className={`text-xs font-bold tabular-nums ${dark ? "text-accent-soft" : "text-accent"}`}>
            {pad(i + 1)}
          </p>
          <h2 className="mt-3 font-heading text-2xl font-extrabold leading-tight tracking-tight md:text-3xl">
            {cat.title}
          </h2>
          <p className={`mt-2 text-sm leading-relaxed ${dark ? "text-on-ink/65" : "text-muted"}`}>
            {cat.tagline}
          </p>
          {dark && (
            <p className="mt-5 inline-block border border-white/25 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-on-ink/80">
              Core focus
            </p>
          )}
        </div>

        <ul className="grid gap-x-8 gap-y-7 sm:grid-cols-2 md:col-span-8">
          {cat.skills.map(({ name, icon: Icon, detail }, k) => (
            <Reveal as="li" key={name} delay={k * 0.05} y={18} className="group flex gap-4">
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-md transition-colors duration-300 ${
                  dark
                    ? "bg-white/10 text-accent-soft group-hover:bg-accent group-hover:text-on-accent"
                    : "bg-ink text-on-ink group-hover:bg-accent"
                }`}
              >
                <Icon size={20} aria-hidden />
              </span>
              <div>
                <h3 className="font-bold">{name}</h3>
                <p
                  className={`mt-1 text-sm leading-relaxed ${
                    dark ? "text-on-ink/65" : "text-muted"
                  }`}
                >
                  {detail}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

export default function Skills() {
  return (
    <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-12 md:pb-32 md:pt-16">
      <Seo {...SEO.skills} />

      <PageHeader
        eyebrow="Skills & tools"
        lines={[{ text: "The skills behind" }, { text: "every project.", accent: true }]}
        intro="You don't need to know any of this to work with me. It's here so you can see the range of what I can build, from AI assistants to websites and the systems behind them."
      />

      <div className="mt-16 flex flex-col gap-6 md:mt-20">
        {skillCategories.map((cat, i) => (
          <SkillGroup key={cat.title} cat={cat} i={i} />
        ))}
      </div>

      <PageCTA
        className="mt-24 md:mt-32"
        eyebrow="Put them to work"
        lines={[{ text: "Ready to build" }, { text: "something real?", accent: true }]}
        text="Tell me about your project. I'll explain in plain language how I'd approach it."
        primary={{ label: "Start a project", to: "/contact" }}
        secondary={{ label: "See my projects", to: "/projects" }}
      />
    </div>
  );
}