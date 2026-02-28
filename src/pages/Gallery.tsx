import Navbar from "@/components/Navbar";
import GallerySection from "@/components/GallerySection";
import Footer from "@/components/Footer";

const Gallery = () => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img
          src="/gallerybackground.png"
          alt="Gallery Background"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="relative z-10">
        <Navbar />
        <GallerySection />
        <Footer />
      </div>
    </div>
  );
};

export default Gallery;
