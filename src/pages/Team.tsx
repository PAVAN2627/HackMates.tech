import Navbar from "@/components/Navbar";
import TeamSection from "@/components/TeamSection";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import { useSEO } from "@/hooks/useSEO";

const Team = () => {
  useSEO({
    title: "Our Team & Builders",
    description: "Meet the passionate student developers, AI engineers, and community leaders behind HackMates.",
    canonical: "/team",
  });

  return (
    <div className="min-h-screen bg-slate-950 text-foreground relative selection:bg-teal-500/30 selection:text-teal-200 overflow-x-hidden">
      <ScrollProgressBar />
      {/* Background Image with Ambient Scrim */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/teambackground.png"
          alt="Team Background"
          className="w-full h-full object-cover opacity-35 filter brightness-90 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/90" />
      </div>
      
      <div className="relative z-10">
        <Navbar />
        <main className="pt-20">
          <TeamSection />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Team;
