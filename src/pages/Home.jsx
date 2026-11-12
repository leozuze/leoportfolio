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
import { SEO } from "../data/seoRoutes";

export default function Home() {
  return (
    <IntroProvider>
      <Seo {...SEO.home} />
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