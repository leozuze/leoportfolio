import Hero from "../components/sections/Hero";
import FeaturedProjects from "../components/sections/FeaturedProjects";
import SkillsPreview from "../components/sections/SkillsPreview";
import CTASection from "../components/sections/CTASection";
import SocialRail from "../components/sections/SocialRail";

export default function Home() {
  return (
    <>
      <SocialRail />
      <Hero />
      <FeaturedProjects />
      <SkillsPreview />
      <CTASection />
    </>
  );
}