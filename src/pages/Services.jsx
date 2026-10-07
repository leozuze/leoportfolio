import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { services, getWhatsAppLink } from "../data/services";
import Seo from "../components/Seo";

export default function Services() {
  const shouldReduceMotion = useReducedMotion();

  const headerFade = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
  };

  const item = {
    hidden: (i) => ({
      opacity: 0,
      x: shouldReduceMotion ? 0 : i % 2 === 0 ? -48 : 48,
    }),
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.55, ease: "easeOut" },
    },
  };

  return (
    <div className="pt-32 pb-24 bg-bg min-h-screen overflow-x-hidden">
      <Seo
        title="Services | Web Development & AI Tools by Leo Zuze"
        description="Web development for businesses, plus AI and data work. Every project starts with a conversation, so you only pay for what you need."
        path="/services"
      />

      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.6 }}
          variants={headerFade}
          className="max-w-2xl mb-16"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-accent mb-2">
            How I Can Help
          </p>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-text mb-4">
            Services
          </h1>
          <p className="text-muted text-sm md:text-base leading-relaxed">
            Straightforward web development, delivered with care plus the
            AI and data work I'm actively building toward. Every project
            starts with a conversation, so you only pay for what you need.
          </p>
        </motion.div>

        <div className="flex flex-col gap-12">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                variants={item}
                className="group relative"
              >
                <div
                  className={`absolute -inset-3 bg-gradient-to-br from-accent/15 via-surface to-accent-2/10 rounded-[2.5rem] border border-border ${service.rotate} transition-transform duration-300 group-hover:rotate-0`}
                />

                <div className="relative z-10 bg-surface border border-border rounded-3xl p-8 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-5">
                      <Icon size={22} className="text-accent" />
                    </div>
                    <h2 className="font-heading text-2xl font-semibold text-text mb-2">
                      {service.title}
                    </h2>
                    <p className="text-muted text-sm leading-relaxed">
                      {service.tagline}
                    </p>

                    {service.status === "in-development" ? (
                      <span className="inline-block text-xs font-medium text-accent bg-accent/10 rounded-full px-3 py-1 mt-5">
                        In Development
                      </span>
                    ) : (
                      <p className="font-mono text-text mt-5">{service.price}</p>
                    )}
                    <p className="text-muted text-xs mt-1.5">{service.priceNote}</p>
                  </div>

                  <div className="md:col-span-2 flex flex-col justify-between">
                    <div>
                      <p className="text-muted leading-relaxed mb-5">
                        {service.description}
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                        {service.features.map((feature) => (
                          <li key={feature} className="text-sm text-muted flex items-start gap-2">
                            <span className="text-accent mt-1">•</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <a
                      href={getWhatsAppLink(service.title)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-bg bg-accent px-5 py-2.5 rounded-full hover:bg-accent-2 hover:scale-105 transition-all duration-200 w-fit mt-6"
                    >
                      {service.cta} <ArrowUpRight size={14} />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}