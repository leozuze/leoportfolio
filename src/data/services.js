import { MessageSquare, Bot, BookOpen, Workflow, Code2 } from "lucide-react";

export const services = [
  {
    id: "chatbots",
    title: "AI Chatbots & Assistants",
    tagline: "Answer customers and capture leads around the clock",
    icon: MessageSquare,
    status: "available",
    rotate: "rotate-2",
    description:
      "A chat assistant on your website that answers common questions in your tone, collects enquiries, and passes the conversation to you when a person is needed.",
    features: [
      "Answers common questions instantly, day and night",
      "Speaks in your brand's voice",
      "Captures leads and enquiries for you",
      "Hands over to you when a person is needed",
    ],
    price: "From $150",
    priceNote: "Fixed quote after a short chat. No surprises.",
    cta: "Start a Project",
  },
  {
    id: "agents",
    title: "AI Agents & Automation",
    tagline: "Software that finishes repetitive tasks for you",
    icon: Bot,
    status: "available",
    rotate: "-rotate-2",
    description:
      "Instead of just answering, the software does the work: it reads incoming requests, looks things up, updates your tools and completes the task end to end, with you approving the important steps.",
    features: [
      "Takes repetitive tasks off your team's plate",
      "Works with the tools you already use",
      "Asks for your approval before important actions",
      "Clear reports on what it did and when",
    ],
    price: "From $250",
    priceNote: "Fixed quote after a short chat. No surprises.",
    cta: "Start a Project",
  },
  {
    id: "knowledge",
    title: "Knowledge Assistants",
    tagline: "An assistant that answers from your own documents",
    icon: BookOpen,
    status: "available",
    rotate: "rotate-2",
    description:
      "Share your manuals, policies, price lists or notes and get an assistant that finds the right answer in seconds and shows where it came from. No guessing and no digging through folders.",
    features: [
      "Answers from your own files, not from guesswork",
      "Shows which document an answer came from",
      "Easy to update when your documents change",
      "Useful for customers or for your own team",
    ],
    price: "From $250",
    priceNote: "Fixed quote after a short chat. No surprises.",
    cta: "Start a Project",
  },
  {
    id: "pipelines",
    title: "Data & Workflow Automation",
    tagline: "Connect your tools so information moves by itself",
    icon: Workflow,
    status: "available",
    rotate: "-rotate-2",
    description:
      "Stop copying data between spreadsheets, forms, inboxes and apps. I connect your tools so information flows automatically and you get alerts or summaries when something needs attention.",
    features: [
      "Information moves between your tools on its own",
      "Fewer manual steps and fewer mistakes",
      "Alerts and summaries sent where you read them",
      "Clean, organised data you can trust",
    ],
    price: "From $120",
    priceNote: "Fixed quote after a short chat. No surprises.",
    cta: "Start a Project",
  },
  {
    id: "web",
    title: "Websites & Web Apps",
    tagline: "From first idea to live launch",
    icon: Code2,
    status: "available",
    rotate: "rotate-2",
    description:
      "A fast, professional website or a full web app with accounts, a database and admin tools, designed and built end to end by one developer.",
    features: [
      "Looks great and loads fast on any device",
      "Accounts, logins and a database when you need them",
      "Built around how your business actually works",
      "Live and ready for visitors at launch",
    ],
    price: "From $100",
    priceNote: "Fixed quote after a short chat. No surprises.",
    cta: "Start a Project",
  },
];

export const getWhatsAppLink = (serviceTitle) =>
  `https://wa.me/919764506058?text=${encodeURIComponent(
    `Hi Leo, I'm interested in your "${serviceTitle}" service. Can we talk?`
  )}`;