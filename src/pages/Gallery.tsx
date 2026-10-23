import Navbar from "@/components/Navbar";
import GallerySection from "@/components/GallerySection";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import { useSEO } from "@/hooks/useSEO";

const Gallery = () => {
  useSEO({
    title: "Hackathon Gallery & Moments — HackMates",
    description: "Browse photo memories, hackathon victories, workshop captures, and batch graduation moments from HackMates.",
    canonical: "/gallery",
  });

  return (
    <div className="min-h-screen bg-slate-950 text-foreground relative selection:bg-teal-500/30 selection:text-teal-200 overflow-x-hidden">
      <ScrollProgressBar />
      {/* Background Image with Ambient Scrim */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/gallerybackground.png"
          alt="Gallery Background"
          className="w-full h-full object-cover opacity-35 filter brightness-90 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent" />
      </div>
      
      <div className="relative z-10">
        <Navbar />
        <main className="pt-20">
          <GallerySection />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Gallery;

