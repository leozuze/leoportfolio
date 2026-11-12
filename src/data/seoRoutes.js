// One source of truth for page titles, descriptions and URLs.
// Used by the Seo component at runtime and by scripts/prerender-meta.mjs at build time.
export const SITE = "https://leozuze.com";
export const OG_IMAGE = `${SITE}/og-image.jpg`;

// "/" -> https://leozuze.com/   "/about" -> https://leozuze.com/about   (never a double slash)
export function urlFor(path = "/") {
  const clean = path.replace(/^\/+|\/+$/g, "");
  return clean ? `${SITE}/${clean}` : `${SITE}/`;
}

export const SEO = {
  home: {
    path: "/",
    title: "Leo Zuze | Freelance AI Engineer & Full-Stack Developer",
    description:
      "Leo Zuze builds custom AI assistants, chatbots, automation and web apps for businesses. Freelance AI engineer and full-stack developer based in Pune, India.",
  },
  about: {
    path: "/about",
    title: "About Leo Zuze | Freelance AI Engineer & Full-Stack Developer",
    description:
      "Meet Leo Zuze, a freelance AI engineer and full-stack developer in Pune, India. I turn business problems into AI assistants, automation and web apps that work.",
  },
  projects: {
    path: "/projects",
    title: "Projects | Leo Zuze, Freelance AI Engineer & Full-Stack Developer",
    description:
      "Live websites and web apps built by Leo Zuze for real businesses, from business software and a travel app to sites for construction, retail and fintech brands.",
  },
  services: {
    path: "/services",
    title: "Services | AI Assistants, Automation & Web Apps by Leo Zuze",
    description:
      "AI chatbots, agents, knowledge assistants, workflow automation and websites for businesses. Fixed quotes after a short chat, with prices from $100.",
  },
  skills: {
    path: "/skills",
    title: "Skills & Tools | Leo Zuze, AI Engineer & Full-Stack Developer",
    description:
      "The skills behind Leo Zuze's work: AI engineering (RAG, agents, chatbots), frontend and 3D, and backend, data and deployment.",
  },
  contact: {
    path: "/contact",
    title: "Contact Leo Zuze | Start a Project",
    description:
      "Start a project with Leo Zuze by WhatsApp, email or the contact form. AI assistants, automation, websites and web apps for your business.",
  },
  notFound: {
    path: "/404",
    title: "Page not found | Leo Zuze",
    description: "This page doesn't exist. Head back to the home page or see Leo Zuze's projects.",
    noindex: true,
  },
};