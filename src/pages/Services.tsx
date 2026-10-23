import Navbar from "@/components/Navbar";
import ServicesSection from "@/components/ServicesSection";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import { useSEO } from "@/hooks/useSEO";

const Services = () => {
  useSEO({
    title: "Services & Solutions — HackMates",
    description: "Explore HackMates engineering services: pre-built academic projects, custom MVP software development, mentorship, hackathon organization, and 12-week internships.",
    canonical: "/services",
  });

  return (
    <div className="min-h-screen bg-slate-950 text-foreground relative selection:bg-teal-500/30 selection:text-teal-200 overflow-x-hidden">
      <ScrollProgressBar />
      {/* Background Image with Ambient Scrim */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/servicesbackground.png"
          alt="Services Background"
          className="w-full h-full object-cover opacity-35 filter brightness-90 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent" />
      </div>
      
      <div className="relative z-10">
        <Navbar />
        <main className="pt-20">
          <ServicesSection />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Services;

