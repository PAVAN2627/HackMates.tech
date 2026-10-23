import Navbar from "@/components/Navbar";
import ProjectsSection from "@/components/ProjectsSection";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import { useSEO } from "@/hooks/useSEO";

const Projects = () => {
  useSEO({
    title: "Projects & Innovations",
    description: "Discover innovative full-stack, AI, and developer tools built by HackMates engineers and hackathon competitors.",
    canonical: "/projects",
  });

  return (
    <div className="min-h-screen bg-slate-950 text-foreground relative selection:bg-teal-500/30 selection:text-teal-200 overflow-x-hidden">
      <ScrollProgressBar />
      {/* Background Image with Ambient Scrim */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/projectbackground.png"
          alt="Projects Background"
          className="w-full h-full object-cover opacity-40 filter brightness-90 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/85" />
      </div>
      
      <div className="relative z-10">
        <Navbar />
        <main className="pt-16">
          <ProjectsSection />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Projects;
