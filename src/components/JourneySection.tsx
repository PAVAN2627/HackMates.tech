import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { 
  Trophy, 
  Calendar, 
  Award, 
  Medal, 
  Star, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  GraduationCap, 
  Users, 
  Zap, 
  ExternalLink,
  Code2,
  CheckCircle2,
  Flame,
  IndianRupee,
  Images
} from "lucide-react";
import { TechBadge } from "@/components/TechIcon";

export interface Milestone {
  id: string;
  year: string;
  month: string;
  day: string;
  title: string;
  event: string;
  description: string;
  result: "winner" | "finalist" | "participant" | "milestone";
  category: "hackathon" | "mentorship" | "competition";
  icon: typeof Trophy;
  image: string;
  gallery?: string[];
  project?: string;
  projectDescription?: string;
  tech?: string[];
  prize?: string;
  teamMembers?: string[];
}

const milestones: Milestone[] = [
  {
    id: "internship-batch-1",
    year: "2026",
    month: "Aug",
    day: "19",
    title: "Internship Batch 1 Graduation 🎓",
    event: "HackMates 12-Week MERN Stack Internship Program",
    description: "Congratulations to all 5 student interns on successfully completing the intensive 12-Week Full Stack Web Development Internship at HackMates!",
    projectDescription: "HackMates proudly graduated its First Batch of the 12-Week Full Stack Web Development Internship Program focused on the MERN Stack. 🚀\n\nInterns Harshal Shinde, Nandini Shinde, Samiksha Bhosale, Preeti Dhanawade, and Vaibhav Sawant gained production-grade experience in modern web development, REST APIs, Git workflows, database schema design, authentication, and responsive UI engineering.\n\nThroughout the journey, they shipped real-world projects, solved complex architectural challenges, and collaborated under mentor guidance. This marks a pivotal milestone for HackMates' mission to democratize hands-on engineering experience for tier-2 and tier-3 colleges. 🌱",
    result: "milestone",
    category: "mentorship",
    icon: GraduationCap,
    image: "/Journey/internshipbatch1/1.png",
    gallery: [
      "/Journey/internshipbatch1/1.png",
      "/Journey/internshipbatch1/2.png",
      "/Journey/internshipbatch1/3.png",
      "/Journey/internshipbatch1/4.png",
      "/Journey/internshipbatch1/5.png",
      "/Journey/internshipbatch1/6.png",
      "/Journey/internshipbatch1/7.png",
      "/Journey/internshipbatch1/8.png",
      "/Journey/internshipbatch1/9.png",
    ],
    project: "Internship Program",
    tech: ["React", "TypeScript", "Node.js", "Express", "MongoDB", "Firebase", "HTML", "CSS", "JavaScript", "MERN"],
    teamMembers: ["Preeti Dhanawade", "Vaibhav Sawant", "Samiksha Bhosale", "Harshal Shinde", "Nandini Shinde"],
  },
  {
    id: "thinksprint-1-0",
    year: "2026",
    month: "Mar",
    day: "01",
    title: "ThinkSprint 1.0 - 3rd Place 🥉",
    event: "ThinkSprint 1.0 by Review Tech Club",
    description: "Sakshi Pawar secured 3rd prize with exclusive goodies and an internship opportunity at the ThinkSprint 1.0 Idea Presentation Competition.",
    projectDescription: "Presented the HackMates developer platform — an AI-powered synergy matching and hackathon team builder. Featured Gemini AI team formation algorithms, real-time collaboration tools, and community reliability scores.",
    result: "finalist",
    category: "competition",
    icon: Medal,
    image: "/Journey/thinksprint.jpeg",
    project: "HackMates Platform",
    tech: ["React 18", "TypeScript", "Vite", "Firebase", "Firestore", "Tailwind CSS", "Gemini AI"],
    prize: "3rd Prize + Goodies + Internship Opportunity",
    teamMembers: ["Sakshi Pawar"],
  },
  {
    id: "techsprint-2026",
    year: "2026",
    month: "Jan",
    day: "31",
    title: "TechSprint Hackathon 2026 ⚡",
    event: "TechSprint Hackathon 2026 by BVDUCOE Pune",
    description: "The core team of Pavan Mali, Sakshi Pawar, Siddhi Pisal, and Vijay Bhope competed at TechSprint Hackathon with the HackMates platform.",
    projectDescription: "Built and demonstrated HackMates: India's premier hackathon discovery and team formation platform connecting developers, designers, and innovators. Implemented Gemini-driven synergy matching, tier badges, and instant chat.",
    result: "participant",
    category: "hackathon",
    icon: Award,
    image: "/Journey/techsprint.jpeg",
    project: "HackMates Ecosystem",
    tech: ["React 18", "TypeScript", "Vite", "Firebase", "Firestore", "Tailwind CSS", "Gemini AI", "Google Apps Script"],
    teamMembers: ["Pavan Mali", "Sakshi Pawar", "Siddhi Pisal", "Vijay Bhope"],
  },
  {
    id: "ai-career-workshop",
    year: "2025",
    month: "Dec",
    day: "24",
    title: "AI & Career Guidance Workshop 🎓",
    event: "Hands-on Workshop at ABIT Shendre",
    description: "Pavan Mali and Vijay Bhope conducted an interactive workshop on AI and Career Pathways for 2nd & 3rd-year IT Diploma students.",
    projectDescription: "A hands-on workshop covering Artificial Intelligence fundamentals, LLM prompt engineering, modern career counseling, and practical project roadmaps. Included live quiz competitions with prizes and customized guidance for diploma students.",
    result: "milestone",
    category: "mentorship",
    icon: Star,
    image: "/Journey/AI Workshop.jpeg",
    tech: ["Python", "Generative AI", "Prompt Engineering", "Web Tech"],
    teamMembers: ["Pavan Mali", "Vijay Bhope"],
  },
  {
    id: "skillsprint-2025",
    year: "2025",
    month: "Nov",
    day: "15",
    title: "Skillsprint 2025 - 3rd Place 🥉",
    event: "Skillsprint 2025 by Skillected — 3rd Prize",
    description: "Pavan Mali won 3rd prize with a ₹1,000 cash award at Skillsprint 2025 organized by Skillected Company.",
    projectDescription: "CareerAdvisor: An intelligent web platform that helps Indian students discover tailored career paths using AI recommendations. Integrated Google Cloud Vertex AI, aptitude skill assessment, and personalized learning roadmaps.",
    result: "finalist",
    category: "hackathon",
    icon: Medal,
    image: "/Journey/skillsprinthackthon.jpeg",
    project: "CareerAdvisor",
    tech: ["PHP", "MySQL", "Google Cloud Vertex AI", "HTML5", "CSS3", "JavaScript", "Bootstrap 5", "Apache"],
    prize: "₹1,000 Cash Prize + Certificate",
    teamMembers: ["Pavan Mali"],
  },
  {
    id: "tutedude-hackathon",
    year: "2025",
    month: "Aug",
    day: "07",
    title: "Tutedude 48hrs Hackathon Winner 🏆",
    event: "Tutedude 48 Hours National Hackathon — 1st Prize",
    description: "Pavan Mali won 1st prize and a ₹8,000 cash award at the Tutedude 48-Hour National Hackathon.",
    projectDescription: "StreetSource: A full-scale B2B supply chain platform connecting local street food vendors with verified raw material suppliers. Features GPS-based Haversine supplier discovery within 10km, live inventory levels, order tracking, and mobile optimization.",
    result: "winner",
    category: "hackathon",
    icon: Trophy,
    image: "/Journey/tutedudehackthon.jpeg",
    project: "StreetSource",
    tech: ["PHP 8+", "MySQL 8+", "HTML5", "CSS3", "JavaScript", "Bootstrap 5", "AJAX", "Geolocation API"],
    prize: "₹8,000 Cash Prize + Champion Trophy",
    teamMembers: ["Pavan Mali"],
  },
  {
    id: "coderush-2025",
    year: "2025",
    month: "Jun",
    day: "30",
    title: "CodeRush 2025 Champions 🏆",
    event: "CodeRush 2025 Hackathon — 1st Prize",
    description: "Pavan Mali and Sakshi Pawar clinched 1st prize at CodeRush 2025 Hackathon with AI Job Mentor.",
    projectDescription: "AI Job Mentor: An AI-driven career advisor that parses resumes using Natural Language Processing (spaCy) and matches applicants with optimal roles using scikit-learn machine learning, generating comprehensive PDF analysis reports.",
    result: "winner",
    category: "hackathon",
    icon: Trophy,
    image: "/Journey/coderush.jpeg",
    project: "AI Job Mentor",
    tech: ["PHP", "Python", "MySQL", "spaCy", "scikit-learn", "FPDF", "PHPMailer"],
    prize: "1st Prize Trophy & Winner Certificate",
    teamMembers: ["Pavan Mali", "Sakshi Pawar"],
  },
];

const monthMap: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
};

const resultBadgeConfig = {
  winner: {
    label: "🏆 Winner",
    className: "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]",
    glowColor: "from-amber-500/20 to-amber-500/0",
    accent: "text-amber-400",
  },
  finalist: {
    label: "🥈 Finalist",
    className: "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]",
    glowColor: "from-cyan-500/20 to-cyan-500/0",
    accent: "text-cyan-400",
  },
  milestone: {
    label: "⭐ Milestone",
    className: "bg-teal-500/15 border-teal-500/40 text-teal-300 shadow-[0_0_12px_rgba(45,212,191,0.25)]",
    glowColor: "from-teal-500/20 to-teal-500/0",
    accent: "text-teal-400",
  },
  participant: {
    label: "⚡ Contender",
    className: "bg-violet-500/15 border-violet-500/40 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.25)]",
    glowColor: "from-violet-500/20 to-violet-500/0",
    accent: "text-violet-400",
  },
};

type FilterCategory = "all" | "winner" | "mentorship" | "hackathon";

const filters: { id: FilterCategory; label: string }[] = [
  { id: "all", label: "All Milestones (7)" },
  { id: "winner", label: "🏆 Podiums & Wins (4)" },
  { id: "mentorship", label: "🎓 Mentorship & Internships (2)" },
  { id: "hackathon", label: "⚡ Hackathons (4)" },
];

export const JourneySection = () => {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("all");
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Accurate date sorting (newest first)
  const sortedMilestones = [...milestones].sort((a, b) => {
    const timeA = new Date(parseInt(a.year), monthMap[a.month] ?? 0, parseInt(a.day)).getTime();
    const timeB = new Date(parseInt(b.year), monthMap[b.month] ?? 0, parseInt(b.day)).getTime();
    return timeB - timeA;
  });

  const filteredMilestones = sortedMilestones.filter((m) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "winner") return m.result === "winner" || m.result === "finalist";
    if (selectedCategory === "mentorship") return m.category === "mentorship";
    if (selectedCategory === "hackathon") return m.category === "hackathon";
    return true;
  });

  const nextImage = () => {
    if (selectedMilestone?.gallery) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedMilestone.gallery!.length);
    }
  };

  const prevImage = () => {
    if (selectedMilestone?.gallery) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedMilestone.gallery!.length - 1 : prev - 1
      );
    }
  };

  return (
    <section id="journey" className="relative py-20 lg:py-28 overflow-hidden bg-transparent">
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
            <span>our_journey.log</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-white mb-4"
          >
            The Hackathon & Startup <span className="gradient-text">Chronicle</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 max-w-2xl mx-auto text-base md:text-lg leading-relaxed"
          >
            From college ideathons to national hackathon podiums and graduating our first engineering batch — explore every trophy, project, and milestone.
          </motion.p>

          {/* Quick Metrics Strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mt-10"
          >
            <div className="p-4 rounded-xl glass-card border border-white/10 text-center">
              <div className="flex items-center justify-center gap-1.5 text-amber-400 font-display text-2xl font-bold">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>4+</span>
              </div>
              <p className="font-mono text-[11px] text-slate-400 mt-1 uppercase tracking-wider">Podiums & Wins</p>
            </div>

            <div className="p-4 rounded-xl glass-card border border-white/10 text-center">
              <div className="flex items-center justify-center gap-1.5 text-teal-300 font-display text-2xl font-bold">
                <IndianRupee className="w-5 h-5 text-teal-400" />
                <span>9,000+</span>
              </div>
              <p className="font-mono text-[11px] text-slate-400 mt-1 uppercase tracking-wider">Cash Prizes Won</p>
            </div>

            <div className="p-4 rounded-xl glass-card border border-white/10 text-center">
              <div className="flex items-center justify-center gap-1.5 text-cyan-300 font-display text-2xl font-bold">
                <GraduationCap className="w-5 h-5 text-cyan-400" />
                <span>5 Interns</span>
              </div>
              <p className="font-mono text-[11px] text-slate-400 mt-1 uppercase tracking-wider">Batch #1 Graduated</p>
            </div>

            <div className="p-4 rounded-xl glass-card border border-white/10 text-center">
              <div className="flex items-center justify-center gap-1.5 text-violet-400 font-display text-2xl font-bold">
                <Code2 className="w-5 h-5 text-violet-400" />
                <span>7+ Projects</span>
              </div>
              <p className="font-mono text-[11px] text-slate-400 mt-1 uppercase tracking-wider">Built & Shipped</p>
            </div>
          </motion.div>

          {/* Interactive Category Filter Pills */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 }}
            className="flex flex-wrap items-center justify-center gap-2 mt-8"
          >
            {filters.map((tab) => {
              const active = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`relative px-4 py-2 rounded-full font-mono text-xs transition-all duration-300 ${
                    active
                      ? "text-teal-200 border border-teal-400/50 shadow-[0_0_18px_rgba(45,212,191,0.35)]"
                      : "text-slate-400 bg-white/[0.03] border border-white/10 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="journeyFilterPill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500/25 via-cyan-500/20 to-teal-500/25"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </motion.div>
        </div>

        {/* Vertical Glowing Timeline */}
        <div className="relative max-w-4xl mx-auto pt-6 pb-12">
          {/* Cyber Luminescent Spine */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 -translate-x-1/2 pointer-events-none">
            {/* Ambient Line Halo */}
            <div className="absolute inset-0 w-2.5 -translate-x-1/2 bg-gradient-to-b from-teal-500/30 via-cyan-400/25 to-amber-500/25 blur-md" />
            {/* Sharp Core Wire */}
            <div className="relative w-[2px] h-full bg-gradient-to-b from-teal-400 via-cyan-400 to-amber-400 shadow-[0_0_12px_rgba(45,212,191,0.7)]" />
          </div>

          <div className="space-y-12">
            {filteredMilestones.map((m, i) => {
              const badge = resultBadgeConfig[m.result];
              const IconComponent = m.icon;
              const isEven = i % 2 === 0;

              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className={`relative flex items-start gap-8 ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Glowing Milestone Circuit Beacon */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 mt-5 z-20">
                    <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-slate-950/95 border-2 border-teal-400/60 shadow-[0_0_22px_rgba(45,212,191,0.5)] backdrop-blur-md group-hover:scale-110 transition-transform">
                      {/* Pulse Ring */}
                      <span className="absolute inset-0 rounded-full animate-ping opacity-30 bg-teal-400 pointer-events-none" />
                      <IconComponent className={`w-5 h-5 ${badge.accent}`} />
                    </div>
                  </div>

                  {/* Milestone Card */}
                  <div className={`ml-14 md:ml-0 md:w-1/2 ${isEven ? "md:pr-12" : "md:pl-12"}`}>
                    <motion.div
                      whileHover={{ y: -4, scale: 1.015 }}
                      onClick={() => {
                        setSelectedMilestone(m);
                        setCurrentImageIndex(0);
                      }}
                      className="glass-card group relative rounded-2xl overflow-hidden border border-white/10 hover:border-teal-400/50 transition-all duration-300 shadow-xl hover:shadow-[0_12px_35px_-10px_rgba(45,212,191,0.25)] cursor-pointer"
                    >
                      {/* Top Gradient Highlight */}
                      <div className={`h-1 w-full bg-gradient-to-r ${badge.glowColor} border-b border-white/5`} />

                      {/* Image Preview with Aspect Ratio & Badge */}
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950/80">
                        <img
                          src={m.image}
                          alt={m.title}
                          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                        {/* Top Left Result Badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-md ${badge.className}`}>
                            {badge.label}
                          </span>
                        </div>

                        {/* Gallery Indicator if multiple images */}
                        {m.gallery && m.gallery.length > 1 && (
                          <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 border border-white/20 text-white font-mono text-[11px] backdrop-blur-md">
                            <Images className="w-3.5 h-3.5 text-teal-400" />
                            <span>{m.gallery.length} Photos</span>
                          </div>
                        )}

                        {/* Bottom Date Pill */}
                        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-white/10 text-slate-300 font-mono text-[11px] backdrop-blur-sm">
                          <Calendar className="w-3 h-3 text-teal-400" />
                          <span>{m.day} {m.month} {m.year}</span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 md:p-6">
                        <p className="font-mono text-xs text-teal-300/80 mb-1.5 uppercase tracking-wider line-clamp-1">
                          {m.event}
                        </p>
                        
                        <h3 className="font-display font-bold text-lg md:text-xl text-white group-hover:text-teal-300 transition-colors mb-2.5">
                          {m.title}
                        </h3>

                        <p className="text-sm text-slate-300 leading-relaxed line-clamp-2 mb-4">
                          {m.description}
                        </p>

                        {/* Prize Pill if Available */}
                        {m.prize && (
                          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono shadow-[0_0_12px_rgba(245,158,11,0.15)]">
                            <Trophy className="w-3.5 h-3.5 text-amber-400" />
                            <span>{m.prize}</span>
                          </div>
                        )}

                        {/* Tech Badges with Logos */}
                        {m.tech && m.tech.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {m.tech.slice(0, 4).map((tech) => (
                              <TechBadge key={tech} name={tech} size="sm" />
                            ))}
                            {m.tech.length > 4 && (
                              <span className="font-mono text-[11px] px-2 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-slate-400">
                                +{m.tech.length - 4} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Team Pill & View Story Action */}
                        <div className="flex items-center justify-between pt-3 border-t border-white/10">
                          {m.teamMembers && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                              <Users className="w-3.5 h-3.5 text-teal-400" />
                              <span className="line-clamp-1">{m.teamMembers.join(", ")}</span>
                            </div>
                          )}

                          <span className="ml-auto inline-flex items-center gap-1 text-xs font-mono text-teal-400 group-hover:translate-x-1 transition-transform">
                            Details →
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Milestone Detail Modal & Photo Gallery (Z-INDEX 100 to avoid Navbar overlap!) */}
        <AnimatePresence>
          {selectedMilestone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-2xl flex items-center justify-center p-4 pt-24 pb-12 overflow-y-auto"
              onClick={() => {
                setSelectedMilestone(null);
                setCurrentImageIndex(0);
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 320 }}
                className="glass-card border border-white/15 rounded-3xl max-w-3xl w-full shadow-[0_0_60px_rgba(45,212,191,0.25)] overflow-hidden my-auto relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => {
                    setSelectedMilestone(null);
                    setCurrentImageIndex(0);
                  }}
                  className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-slate-950/80 border border-white/20 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-900 transition-colors backdrop-blur-md"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Media Showcase / Slider */}
                <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                  <img
                    src={
                      selectedMilestone.gallery
                        ? selectedMilestone.gallery[currentImageIndex]
                        : selectedMilestone.image
                    }
                    alt={selectedMilestone.title}
                    className="w-full h-full object-contain max-h-[460px] p-2"
                  />

                  {/* Gradient Scrim */}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />

                  {/* Carousel Controls for Gallery (e.g. Internship Batch) */}
                  {selectedMilestone.gallery && selectedMilestone.gallery.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        aria-label="Previous image"
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 border border-white/20 text-white flex items-center justify-center hover:bg-teal-500 hover:border-teal-400 hover:text-slate-950 transition-all duration-200 backdrop-blur-md shadow-lg"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>

                      <button
                        onClick={nextImage}
                        aria-label="Next image"
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 border border-white/20 text-white flex items-center justify-center hover:bg-teal-500 hover:border-teal-400 hover:text-slate-950 transition-all duration-200 backdrop-blur-md shadow-lg"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>

                      {/* Photo Index Indicator */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/85 border border-white/20 backdrop-blur-md">
                        <Images className="w-3.5 h-3.5 text-teal-400" />
                        <span className="font-mono text-xs text-white">
                          Photo {currentImageIndex + 1} of {selectedMilestone.gallery.length}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Gallery Thumbnail Strip (Internship Batch) */}
                {selectedMilestone.gallery && selectedMilestone.gallery.length > 1 && (
                  <div className="flex items-center gap-2 px-6 py-3 bg-slate-950/90 border-y border-white/10 overflow-x-auto">
                    {selectedMilestone.gallery.map((img, idx) => (
                      <button
                        key={img}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative w-14 h-10 rounded-lg overflow-hidden border flex-shrink-0 transition-all ${
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

                {/* Modal Content */}
                <div className="p-6 md:p-8 max-h-[50vh] overflow-y-auto space-y-6">
                  {/* Title & Event Header */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                      <span className={`font-mono text-xs px-3 py-1 rounded-full border ${resultBadgeConfig[selectedMilestone.result].className}`}>
                        {resultBadgeConfig[selectedMilestone.result].label}
                      </span>
                      <span className="font-mono text-xs text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-teal-400" />
                        {selectedMilestone.day} {selectedMilestone.month} {selectedMilestone.year}
                      </span>
                      {selectedMilestone.prize && (
                        <span className="font-mono text-xs px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center gap-1.5">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          {selectedMilestone.prize}
                        </span>
                      )}
                    </div>

                    <p className="font-mono text-xs text-teal-300 uppercase tracking-wider mb-1">
                      {selectedMilestone.event}
                    </p>
                    <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white">
                      {selectedMilestone.title}
                    </h3>
                  </div>

                  {/* Team Members */}
                  {selectedMilestone.teamMembers && selectedMilestone.teamMembers.length > 0 && (
                    <div>
                      <h4 className="font-mono text-xs text-teal-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                        <Users className="w-4 h-4 text-teal-400" />
                        Team Members & Mentors
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMilestone.teamMembers.map((member) => (
                          <div
                            key={member}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono text-xs"
                          >
                            <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-[10px] font-bold">
                              {member.charAt(0)}
                            </span>
                            <span>{member}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Project / Milestone Story */}
                  {selectedMilestone.projectDescription && (
                    <div>
                      <h4 className="font-mono text-xs text-teal-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-400" />
                        {selectedMilestone.project ? `Project: ${selectedMilestone.project}` : "Full Chronicle"}
                      </h4>
                      <div className="text-slate-300 leading-relaxed text-sm whitespace-pre-line bg-white/[0.02] p-4 rounded-xl border border-white/5">
                        {selectedMilestone.projectDescription}
                      </div>
                    </div>
                  )}

                  {/* Tech Stack Badges with Logos */}
                  {selectedMilestone.tech && selectedMilestone.tech.length > 0 && (
                    <div>
                      <h4 className="font-mono text-xs text-teal-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-teal-400" />
                        Technologies & Tools Deployed
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMilestone.tech.map((t) => (
                          <TechBadge key={t} name={t} size="md" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default JourneySection;
