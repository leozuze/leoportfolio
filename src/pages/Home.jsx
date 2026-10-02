import Hero from "../components/sections/Hero";
import PageSlide from "../components/layout/PageSlide";
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
        <ServicesCarousel />
        <FeaturedProjects />
        <SkillsPreview />
        <CTASection />
      </PageSlide>
    </IntroProvider>
  );
}