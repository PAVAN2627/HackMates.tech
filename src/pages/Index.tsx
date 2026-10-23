import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TechMarquee from "@/components/TechMarquee";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import { useSEO } from "@/hooks/useSEO";

const Index = () => {
  useSEO({
    title: "HackMates | Student Hackathon & Developer Community",
    description:
      "HackMates is a student developer community in India. Join hackathons, build real-world AI and full-stack projects, and collaborate with passionate engineers.",
    canonical: "/",
  });

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-teal-500/30 selection:text-teal-200 relative overflow-x-hidden">
      <ScrollProgressBar />
      <Navbar />
      <main>
        <HeroSection />
        <TechMarquee />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
