import {
  SiPython,
  SiFastapi,
  SiReact,
  SiJavascript,
  SiHtml5,
  SiTailwindcss,
  SiFramer,
  SiThreedotjs,
  SiScikitlearn,
  SiSupabase,
  SiGithub,
  SiVercel,
} from "react-icons/si";
import { Sparkles, Database, Bot, MessageSquare, Link2, Layers, Webhook } from "lucide-react";

// Everything about a skill lives here once: name, icon, and the detail
// copy used on the full Skills page. The homepage preview and the
// Projects page filters both derive from this instead of keeping their
// own copies, so adding a skill here is the only edit needed anywhere.
export const skillCategories = [
  {
    title: "AI Engineering",
    tagline: "The core of what I do",
    skills: [
      {
        name: "Prompt Engineering",
        icon: Sparkles,
        detail: "Writing and testing instructions so AI answers stay accurate, on-brand and on task.",
      },
      {
        name: "RAG",
        icon: Database,
        detail: "Assistants that answer from your own documents and data instead of guessing, using vector search.",
      },
      {
        name: "AI Agents",
        icon: Bot,
        detail: "Software that chooses its tools, takes the steps and finishes a task, with human approval where it matters.",
      },
      {
        name: "AI Chatbots",
        icon: MessageSquare,
        detail: "Chat assistants that answer customers, capture leads and hand over to a person when needed.",
      },
      {
        name: "LangChain",
        icon: Link2,
        detail: "Framework for connecting models, tools and retrieval into working assistants and agents.",
      },
      {
        name: "LlamaIndex",
        icon: Layers,
        detail: "Indexing and searching your documents so an assistant can find the right answer fast.",
      },
    ],
  },
  {
    title: "Frontend & 3D",
    tagline: "Interfaces people enjoy using",
    skills: [
      {
        name: "React",
        icon: SiReact,
        detail: "Fast, component-based interfaces that stay easy to maintain and extend.",
      },
      {
        name: "JavaScript",
        icon: SiJavascript,
        detail: "The language behind every interactive part of a site or app.",
      },
      {
        name: "HTML & CSS",
        icon: SiHtml5,
        detail: "Semantic, accessible markup and clean styling underneath everything I build.",
      },
      {
        name: "Tailwind CSS",
        icon: SiTailwindcss,
        detail: "Consistent, responsive styling that keeps pages quick to build and quick to load.",
      },
      {
        name: "Framer Motion",
        icon: SiFramer,
        detail: "Subtle scroll and page animations that guide the eye instead of distracting it.",
      },
      {
        name: "Three.js",
        icon: SiThreedotjs,
        detail: "Interactive 3D on the web, used only where it adds meaning, never as decoration.",
      },
    ],
  },
  {
    title: "Backend, Data & Deployment",
    tagline: "The logic behind the screen, and getting it live",
    skills: [
      {
        name: "Python",
        icon: SiPython,
        detail: "My main language for AI work, automation and backend services.",
      },
      {
        name: "FastAPI",
        icon: SiFastapi,
        detail: "Fast, well-documented APIs that connect your interface to models and data.",
      },
      {
        name: "REST APIs",
        icon: Webhook,
        detail: "Connecting your tools and third-party services so information moves on its own.",
      },
      {
        name: "Supabase",
        icon: SiSupabase,
        detail: "Managed database and sign-in, so apps get accounts and storage without heavy setup.",
      },
      {
        name: "Machine Learning",
        icon: SiScikitlearn,
        detail: "Classic models such as fraud and risk scoring, built and evaluated with scikit-learn.",
      },
      {
        name: "Git & GitHub",
        icon: SiGithub,
        detail: "Version control and a clean handover of code on every project.",
      },
      {
        name: "Vercel",
        icon: SiVercel,
        detail: "Deploying sites and apps live, with preview links to review changes before launch.",
      },
    ],
  },
];

// Flat name -> icon lookup, derived automatically so it can never drift
// out of sync with skillCategories above.
export const techIcons = Object.fromEntries(
  skillCategories.flatMap((category) => category.skills.map((s) => [s.name, s.icon]))
);

// Flat list of every skill name, for anything that just needs "all of them"
// (e.g. the Projects page tech filter).
export const allSkillNames = skillCategories.flatMap((category) =>
  category.skills.map((s) => s.name)
);