import Navbar from "@/components/Navbar";
import JourneySection from "@/components/JourneySection";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import { useSEO } from "@/hooks/useSEO";

const Journey = () => {
  useSEO({
    title: "Our Journey & Hackathon Timeline",
    description: "Follow the HackMates journey from grassroots inception and hackathon championships to student mentorship and startup milestones.",
    canonical: "/journey",
  });

  return (
    <div className="min-h-screen bg-slate-950 text-foreground relative selection:bg-teal-500/30 selection:text-teal-200 overflow-x-hidden">
      <ScrollProgressBar />
      {/* Background Image with Ambient Scrim */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/journeybackground.png"
          alt="Journey Background"
          className="w-full h-full object-cover opacity-35 filter brightness-90 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent" />
      </div>
      
      <div className="relative z-10">
        <Navbar />
        <main className="pt-20">
          <JourneySection />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Journey;

