import Navbar from "@/components/Navbar";
import ServicesSection from "@/components/ServicesSection";
import Footer from "@/components/Footer";

const Services = () => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img
          src="/servicesbackground.png"
          alt="Services Background"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="relative z-10">
        <Navbar />
        <ServicesSection />
        <Footer />
      </div>
    </div>
  );
};

export default Services;
