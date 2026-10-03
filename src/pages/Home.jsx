import Hero from "../components/sections/Hero";
import PageSlide from "../components/layout/PageSlide";
import HomeBackdrop from "../components/sections/HomeBackdrop";
import Backed from "../components/sections/Backed";
import ServicesCarousel from "../components/sections/ServicesCarousel";
import FeaturedProjects from "../components/sections/FeaturedProjects";
import SkillsPreview from "../components/sections/SkillsPreview";
import CTASection from "../components/sections/CTASection";
import Intro from "../components/intro/Intro";
import { IntroProvider } from "../components/intro/IntroContext";

export default function Home() {
  return (
    <IntroProvider>
      <Intro />
      <Hero />

      <PageSlide>
        <HomeBackdrop />
        <Backed variant="services"><ServicesCarousel /></Backed>
        <Backed variant="projects"><FeaturedProjects /></Backed>
        <Backed variant="skills"><SkillsPreview /></Backed>
        <Backed variant="cta"><CTASection /></Backed>
      </PageSlide>
    </IntroProvider>
  );
}