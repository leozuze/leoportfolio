import dannImg from "../assets/images/projects/dannImg.png";
import skyscoutImg from "../assets/images/projects/skyscout.jpg";
import jamcoImg from "../assets/images/projects/jamco.jpeg";
import talithaImg from "../assets/images/projects/talitha.jpg";
import ritzImg from "../assets/images/projects/ritzImg.png";
import nexusImg from "../assets/images/projects/nexusImg.png";

// Only live, public projects belong here. `url` is always the live site.
// `category` drives filter chips + section grouping ("Web Apps" / "Websites").
// `subCategory` is just the on-image badge label, purely display.
// `image` is the single cover shown on the homepage (FeaturedProjects).
export const projects = [
  {
    title: "DANN",
    category: "Web Apps",
    subCategory: "Business Software",
    tagline: "Business management app for small manufacturers",
    description:
      "A web app that helps small manufacturers track production, orders, inventory and profit in one place instead of notebooks and WhatsApp messages. Signed-in users get an AI chatbot assistant. Built with a small team.",
    image: dannImg,
    url: "https://dannbusiness.vercel.app/",
    rotate: "-rotate-2",
    featured: true,
  },
  {
    title: "SkyScout",
    category: "Web Apps",
    subCategory: "Travel",
    tagline: "Flight search and price tracking app",
    description:
      "A full-stack travel app for finding flights, tracking prices and discovering places, with live airport arrival and departure boards and automated email alerts.",
    image: skyscoutImg,
    url: "https://skyscout-sepia.vercel.app/",
    rotate: "rotate-2",
    featured: true,
  },
  {
    title: "Jamco Builders",
    category: "Websites",
    subCategory: "Construction",
    tagline: "Website for a construction company",
    description:
      "A business site for a residential and civil construction company in Southern Africa. It showcases their work and lets customers request a quote online, and the team manages projects and enquiries through a private admin dashboard.",
    image: jamcoImg,
    url: "https://jamco-builders.vercel.app/",
    rotate: "-rotate-2",
    featured: true,
  },
  {
    title: "Talitha Cumi Accessories",
    category: "Websites",
    subCategory: "E-commerce",
    tagline: "Online store for a luxury accessories brand",
    description:
      "A fast online storefront for a luxury bags and watches brand in Zimbabwe, with ordering and delivery arranged over WhatsApp. The owner manages products and orders through a private admin dashboard.",
    image: talithaImg,
    url: "https://talitha-cumi-accessories.vercel.app/",
    rotate: "rotate-2",
    featured: false,
  },
  {
    title: "Ritz Marketing",
    category: "Websites",
    subCategory: "Marketing Agency",
    tagline: "Website for a marketing and creative agency",
    description:
      "A website for a marketing agency offering strategy, content, digital campaigns and PR, with a dedicated section for creatives alongside services for business owners.",
    image: ritzImg,
    url: "https://ritzmarketing.vercel.app/",
    rotate: "-rotate-2",
    featured: false,
  },
  {
    title: "Nexus Lending",
    category: "Websites",
    subCategory: "Landing Page",
    tagline: "Landing page for a fintech lending brand",
    description:
      "A modern landing page that explains fast approvals and transparent terms, built to move visitors toward applying.",
    image: nexusImg,
    url: "https://nexus-lending-business.vercel.app/",
    rotate: "rotate-2",
    featured: false,
  },
];