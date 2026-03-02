import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Hackathon {
  name: string;
  year: string;
  location: string;
  coverImage: string;
  images: string[];
}

const hackathons: Hackathon[] = [
  {
    name: "RIFT Hackathon",
    year: "2026",
    location: "PW Pune",
    coverImage: "/gallery/rift/rift1.jpeg",
    images: [
      "/gallery/rift/rift1.jpeg",
      "/gallery/rift/rift2.jpeg",
      "/gallery/rift/rift3.jpeg",
      "/gallery/rift/rift4.jpeg",
      "/gallery/rift/rift5.jpeg",
    ],
  },
  {
    name: "Techathon 3.0",
    year: "2026",
    location: "AISSMS IOIT",
    coverImage: "/gallery/techathon/tech1.jpeg",
    images: [
      "/gallery/techathon/tech1.jpeg",
      "/gallery/techathon/tech2.jpeg",
      "/gallery/techathon/tech3.jpeg",
      "/gallery/techathon/tech4.jpeg",
      "/gallery/techathon/tech5.jpeg",
    ],
  },
];

const GallerySection = () => {
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openSlideshow = (hackathon: Hackathon) => {
    setSelectedHackathon(hackathon);
    setCurrentImageIndex(0);
  };

  const closeSlideshow = () => {
    setSelectedHackathon(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedHackathon) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedHackathon.images.length);
    }
  };

  const prevImage = () => {
    if (selectedHackathon) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedHackathon.images.length - 1 : prev - 1
      );
    }
  };

  return (
    <section id="gallery" className="py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="font-mono text-sm text-primary mb-3">gallery.memories</p>
          <h2 className="text-4xl md:text-5xl font-bold font-display text-foreground">
            Hackathon <span className="text-primary">Gallery</span>
          </h2>
          <p className="text-foreground/80 mt-4 max-w-lg mx-auto">
            Moments captured from our hackathon journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {hackathons.map((hackathon, i) => (
            <motion.div
              key={hackathon.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              onClick={() => openSlideshow(hackathon)}
              className="card-elevated rounded-xl overflow-hidden cursor-pointer hover:border-glow transition-all duration-300 group"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={hackathon.coverImage}
                  alt={hackathon.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-mono text-xs text-accent mb-1">{hackathon.year} • {hackathon.location}</p>
                  <h3 className="font-display font-semibold text-white text-sm">{hackathon.name}</h3>
                  <p className="font-mono text-xs text-white/70 mt-2">
                    {hackathon.images.length} photos
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Slideshow Modal */}
        <AnimatePresence>
          {selectedHackathon && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={closeSlideshow}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25 }}
                className="relative max-w-5xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={closeSlideshow}
                  className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Image */}
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                  <img
                    src={selectedHackathon.images[currentImageIndex]}
                    alt={`${selectedHackathon.name} - ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain"
                  />

                  {/* Navigation Arrows */}
                  {selectedHackathon.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm">
                    <p className="font-mono text-xs text-white">
                      {currentImageIndex + 1} / {selectedHackathon.images.length}
                    </p>
                  </div>
                </div>

                {/* Hackathon Info */}
                <div className="mt-4 text-center">
                  <p className="font-mono text-xs text-accent mb-1">{selectedHackathon.year} • {selectedHackathon.location}</p>
                  <h3 className="font-display text-xl font-bold text-white">{selectedHackathon.name}</h3>
                </div>

                {/* Thumbnail Navigation */}
                {selectedHackathon.images.length > 1 && (
                  <div className="flex gap-2 justify-center mt-4 overflow-x-auto pb-2">
                    {selectedHackathon.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                          idx === currentImageIndex
                            ? "ring-2 ring-primary scale-110"
                            : "opacity-50 hover:opacity-100"
                        }`}
                      >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default GallerySection;
