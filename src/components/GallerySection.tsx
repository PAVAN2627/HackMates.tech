import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Images, 
  MapPin, 
  Calendar, 
  Trophy, 
  GraduationCap,
  Maximize2
} from "lucide-react";

interface Album {
  id: string;
  name: string;
  year: string;
  location: string;
  category: "hackathon" | "internship" | "workshop";
  coverImage: string;
  images: string[];
  description: string;
}

const albums: Album[] = [
  {
    id: "internship-batch-1",
    name: "Internship Batch 1 Graduation",
    year: "2026",
    location: "HackMates HQ, Pune",
    category: "internship",
    coverImage: "/gallery/internshipbatch1/1.png",
    images: [
      "/gallery/internshipbatch1/1.png",
      "/gallery/internshipbatch1/2.png",
      "/gallery/internshipbatch1/3.png",
      "/gallery/internshipbatch1/4.png",
      "/gallery/internshipbatch1/5.png",
      "/gallery/internshipbatch1/6.png",
      "/gallery/internshipbatch1/7.png",
      "/gallery/internshipbatch1/8.png",
      "/gallery/internshipbatch1/9.png",
    ],
    description: "Celebrating the graduation of our 1st batch of 12-Week MERN Stack full-stack web engineering interns.",
  },
  {
    id: "rift-hackathon",
    name: "RIFT Hackathon 2026",
    year: "2026",
    location: "PW Institute of Innovation, Pune",
    category: "hackathon",
    coverImage: "/gallery/rift/rift1.jpeg",
    images: [
      "/gallery/rift/rift1.jpeg",
      "/gallery/rift/rift2.jpeg",
      "/gallery/rift/rift3.jpeg",
      "/gallery/rift/rift4.jpeg",
      "/gallery/rift/rift5.jpeg",
    ],
    description: "Intense 36-hour sprint competing, building real-time tech, and pitching to industry leaders.",
  },
  {
    id: "techathon-3-0",
    name: "Techathon 3.0 National Sprint",
    year: "2026",
    location: "AISSMS IOIT, Pune",
    category: "hackathon",
    coverImage: "/gallery/techathon/tech1.jpeg",
    images: [
      "/gallery/techathon/tech1.jpeg",
      "/gallery/techathon/tech2.jpeg",
      "/gallery/techathon/tech3.jpeg",
      "/gallery/techathon/tech4.jpeg",
      "/gallery/techathon/tech5.jpeg",
    ],
    description: "Prototyping community-driven tech solutions and collaborating with top engineering innovators.",
  },
  {
    id: "tutedude-hackathon",
    name: "Tutedude 48hrs Hackathon Champions",
    year: "2025",
    location: "National Virtual Hackathon",
    category: "hackathon",
    coverImage: "/Journey/tutedudehackthon.jpeg",
    images: ["/Journey/tutedudehackthon.jpeg"],
    description: "Pavan Mali won 1st prize ₹8,000 for StreetSource B2B food vendor logistics platform.",
  },
  {
    id: "coderush-2025",
    name: "CodeRush 2025 1st Prize Podium",
    year: "2025",
    location: "Pune Hackathon Circuit",
    category: "hackathon",
    coverImage: "/Journey/coderush.jpeg",
    images: ["/Journey/coderush.jpeg"],
    description: "1st Prize Trophy win with AI Job Mentor NLP resume parsing engine.",
  },
  {
    id: "ai-career-workshop",
    name: "AI & Career Guidance Workshop",
    year: "2025",
    location: "ABIT Shendre, Satara",
    category: "workshop",
    coverImage: "/Journey/AI Workshop.jpeg",
    images: ["/Journey/AI Workshop.jpeg"],
    description: "Interactive AI fundamentals & prompt engineering masterclass conducted for IT diploma students.",
  },
];

type CategoryFilter = "all" | "hackathon" | "internship" | "workshop";

const filters: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All Moments (6)" },
  { id: "hackathon", label: "⚡ Hackathons (4)" },
  { id: "internship", label: "🎓 Internships (1)" },
  { id: "workshop", label: "💡 Workshops (1)" },
];

export const GallerySection = () => {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");

  const openSlideshow = (album: Album, index: number = 0) => {
    setSelectedAlbum(album);
    setCurrentImageIndex(index);
  };

  const closeSlideshow = () => {
    setSelectedAlbum(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedAlbum) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedAlbum.images.length);
    }
  };

  const prevImage = () => {
    if (selectedAlbum) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedAlbum.images.length - 1 : prev - 1
      );
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedAlbum) return;
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") closeSlideshow();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedAlbum]);

  const filteredAlbums = albums.filter((album) => {
    if (activeCategory === "all") return true;
    return album.category === activeCategory;
  });

  return (
    <section id="gallery" className="relative py-20 lg:py-28 overflow-hidden bg-transparent">
      {/* Ambient Aurora Glow Spheres */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute top-1/4 -left-48 w-[520px] h-[520px] bg-teal-500/10 rounded-full blur-[130px] animate-aurora-1" 
      />
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute bottom-1/4 -right-48 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-aurora-2" 
      />

      {/* Cyber Grid Texture Overlay */}
      <div className="absolute inset-0 tech-grid-bg opacity-20 pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 font-mono text-xs shadow-[0_0_15px_rgba(45,212,191,0.2)] mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>gallery.memories</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-white mb-4"
          >
            Hackathon & Studio <span className="gradient-text">Gallery</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 max-w-2xl mx-auto text-base md:text-lg leading-relaxed"
          >
            Memories captured across hackathons, engineering incubations, campus workshops, and cohort celebrations.
          </motion.p>

          {/* Category Filter Pills */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-2 mt-8"
          >
            {filters.map((filter) => {
              const active = activeCategory === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveCategory(filter.id)}
                  className={`relative px-4 py-2 rounded-full font-mono text-xs transition-all duration-300 ${
                    active
                      ? "text-teal-200 border border-teal-400/50 shadow-[0_0_18px_rgba(45,212,191,0.35)]"
                      : "text-slate-400 bg-white/[0.03] border border-white/10 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="galleryFilterPill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500/25 via-cyan-500/20 to-teal-500/25"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{filter.label}</span>
                </button>
              );
            })}
          </motion.div>
        </div>

        {/* Albums Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredAlbums.map((album, i) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, scale: 1.015 }}
              onClick={() => openSlideshow(album, 0)}
              className="glass-card group relative rounded-2xl overflow-hidden border border-white/10 hover:border-teal-400/50 transition-all duration-300 shadow-xl hover:shadow-[0_12px_40px_-10px_rgba(45,212,191,0.25)] cursor-pointer flex flex-col justify-between"
            >
              {/* Image Container with Aspect Ratio */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
                <img
                  src={album.coverImage}
                  alt={album.name}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                {/* Top Floating Badges */}
                <div className="absolute top-3 left-3">
                  <span className="font-mono text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-950/85 border border-white/15 text-teal-300 backdrop-blur-md">
                    {album.year}
                  </span>
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/85 border border-white/15 text-white font-mono text-[11px] backdrop-blur-md">
                  <Images className="w-3.5 h-3.5 text-teal-400" />
                  <span>{album.images.length} {album.images.length === 1 ? "Photo" : "Photos"}</span>
                </div>

                {/* Hover Inspect Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-teal-500/80 text-slate-950 flex items-center justify-center shadow-lg backdrop-blur-sm transform scale-90 group-hover:scale-100 transition-transform">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Album Details */}
              <div className="p-5 md:p-6 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-teal-300 font-mono mb-2">
                    <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="line-clamp-1">{album.location}</span>
                  </div>

                  <h3 className="font-display font-bold text-lg text-white group-hover:text-teal-300 transition-colors mb-2">
                    {album.name}
                  </h3>

                  <p className="text-xs md:text-sm text-slate-300 line-clamp-2 leading-relaxed mb-4">
                    {album.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-teal-400">
                  <span>View Photo Gallery</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Fullscreen Photo Lightbox Modal (Z-INDEX 100 to never overlap with Navbar) */}
        <AnimatePresence>
          {selectedAlbum && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-950/92 backdrop-blur-2xl flex items-center justify-center p-4 pt-24 pb-12 overflow-y-auto"
              onClick={closeSlideshow}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 320 }}
                className="glass-card border border-white/15 rounded-3xl max-w-5xl w-full shadow-[0_0_60px_rgba(45,212,191,0.25)] overflow-hidden my-auto relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={closeSlideshow}
                  className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-slate-900/80 border border-white/20 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-900 transition-colors backdrop-blur-md"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Main Photo Display */}
                <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                  <img
                    src={selectedAlbum.images[currentImageIndex]}
                    alt={`${selectedAlbum.name} - Photo ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain p-2"
                  />

                  {/* Previous / Next Arrows */}
                  {selectedAlbum.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        aria-label="Previous photo"
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 border border-white/20 text-white flex items-center justify-center hover:bg-teal-500 hover:border-teal-400 hover:text-slate-950 transition-all duration-200 backdrop-blur-md shadow-lg"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>

                      <button
                        onClick={nextImage}
                        aria-label="Next photo"
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 border border-white/20 text-white flex items-center justify-center hover:bg-teal-500 hover:border-teal-400 hover:text-slate-950 transition-all duration-200 backdrop-blur-md shadow-lg"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>

                      {/* Photo Counter */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/85 border border-white/20 backdrop-blur-md">
                        <Images className="w-3.5 h-3.5 text-teal-400" />
                        <span className="font-mono text-xs text-white">
                          Photo {currentImageIndex + 1} of {selectedAlbum.images.length}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnail Filmstrip */}
                {selectedAlbum.images.length > 1 && (
                  <div className="flex items-center gap-2 px-6 py-3 bg-slate-950/90 border-y border-white/10 overflow-x-auto">
                    {selectedAlbum.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative w-16 h-11 rounded-lg overflow-hidden border flex-shrink-0 transition-all ${
                          idx === currentImageIndex
                            ? "border-teal-400 ring-2 ring-teal-400/40 scale-105"
                            : "border-white/10 opacity-50 hover:opacity-100"
                        }`}
                      >
                        <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Album Details Footer */}
                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-teal-300 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-400" />
                      <span>{selectedAlbum.location}</span>
                      <span>•</span>
                      <span>{selectedAlbum.year}</span>
                    </div>
                    <h3 className="font-display text-xl md:text-2xl font-bold text-white">
                      {selectedAlbum.name}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      {selectedAlbum.description}
                    </p>
                  </div>

                  <span className="font-mono text-xs text-slate-400 shrink-0 self-start md:self-auto">
                    Tip: Use ← → keys to navigate
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default GallerySection;
