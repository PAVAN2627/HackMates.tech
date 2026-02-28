import Navbar from "@/components/Navbar";
import JourneySection from "@/components/JourneySection";
import Footer from "@/components/Footer";

const Journey = () => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img
          src="/journeybackground.png"
          alt="Journey Background"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="relative z-10">
        <Navbar />
        <JourneySection />
        <Footer />
      </div>
    </div>
  );
};

export default Journey;
