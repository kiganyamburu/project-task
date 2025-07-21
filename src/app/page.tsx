import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import RecommendationEngine from "@/components/RecommendationEngine";
import TechStack from "@/components/TechStack";
import Roadmap from "@/components/Roadmap";
import Branding from "@/components/Branding";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="font-sans antialiased text-gray-800 bg-gray-50">
      <Navigation />
      <Hero />
      <Features />
      <HowItWorks />
      <RecommendationEngine />
      <TechStack />
      <Roadmap />
      <Branding />
      <CTA />
      <Footer />
    </div>
  );
}
