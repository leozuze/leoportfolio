import Hero from "../components/home/Hero";
import PageSlide from "../components/layout/PageSlide";
import Backed from "../components/sections/Backed";
import ServicesCarousel from "../components/sections/ServicesCarousel";
import FeaturedProjects from "../components/sections/FeaturedProjects";
import SkillsPreview from "../components/sections/SkillsPreview";
import CTASection from "../components/sections/CTASection";
import Intro from "../components/intro/Intro";
import { IntroProvider } from "../components/intro/IntroContext";
import Seo from "../components/Seo";

export default function Home() {
  return (
    <IntroProvider>
      <Seo
        title="Leo Zuze | Freelance AI Engineer & Full-Stack Developer"
        description="Leo Zuze builds custom AI assistants, chatbots, automation and web apps for businesses. Freelance AI engineer and full-stack developer based in Pune, India."
        path="/"
      />
      <Intro />
      <Hero />

      <PageSlide>
        <Backed variant="services"><ServicesCarousel /></Backed>
        <Backed variant="projects"><FeaturedProjects /></Backed>
        <Backed variant="skills"><SkillsPreview /></Backed>
        <Backed variant="cta"><CTASection /></Backed>
      </PageSlide>
    </IntroProvider>
  );
}