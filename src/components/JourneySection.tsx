import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Calendar, Award, TrendingUp, Medal, Star, ExternalLink, X } from "lucide-react";
import { useState } from "react";

interface Milestone {
  year: string;
  month: string;
  day: string;
  title: string;
  event: string;
  description: string;
  result: "winner" | "finalist" | "participant" | "milestone";
  icon: typeof Trophy;
  image: string;
  project?: string;
  projectDescription?: string;
  tech?: string[];
  prize?: string;
  teamMembers?: string[];
}

const milestones: Milestone[] = [
  {
    year: "2025",
    month: "Jun",
    day: "30",
    title: "CodeRush 2025 Champions 🏆",
    event: "CodeRush 2025 Hackathon — 1st Prize",
    description: "Pavan Mali and Sakshi Pawar won 1st prize at CodeRush 2025 Hackathon.",
    projectDescription: "AI Job Mentor is a web-based application that provides personalized career guidance by analyzing user resumes using artificial intelligence. Combines PHP-based web interface with Python AI engine to deliver comprehensive career guidance. Features secure user authentication, resume processing with automated skill extraction using spaCy, job role matching with machine learning algorithms (scikit-learn), detailed PDF report generation with personalized recommendations, analysis history tracking, and email notifications for updates and reports using PHPMailer.",
    result: "winner",
    icon: Trophy,
    image: "/Journey/coderush.jpeg",
    project: "AI Job Mentor",
    tech: ["PHP", "Python", "MySQL", "spaCy", "scikit-learn", "FPDF", "PHPMailer"],
    teamMembers: ["Pavan Mali", "Sakshi Pawar"],
  },
  {
    year: "2025",
    month: "Aug",
    day: "07",
    title: "Tutedude 48hrs Hackathon Winner 🏆",
    event: "Tutedude 48 Hours Hackathon — 1st Prize ₹8000",
    description: "Pavan Mali won 1st prize with team at Tutedude 48 Hours Hackathon.",
    projectDescription: "A comprehensive web application connecting street food vendors with trusted suppliers, built with PHP, MySQL, and Bootstrap. Features location-based supplier discovery within 10km radius using GPS and Haversine formula, product browsing with real-time stock levels, easy ordering with quantity selection, order tracking from pending to delivered, supplier reviews and ratings, product management for suppliers, performance analytics, and mobile-responsive design optimized for smartphones.",
    result: "winner",
    icon: Trophy,
    image: "/Journey/tutedudehackthon.jpeg",
    project: "StreetSource",
    tech: ["PHP 8+", "MySQL 8+", "HTML5", "CSS3", "JavaScript", "Bootstrap 5.1.3", "AJAX", "Geolocation API"],
    prize: "₹8000",
    teamMembers: ["Pavan Mali"],
  },
  {
    year: "2025",
    month: "Nov",
    day: "15",
    title: "Skillsprint 2025 - 3rd Place 🥉",
    event: "Skillsprint 2025 by Skillected — 3rd Prize ₹1000",
    description: "Pavan Mali won 3rd prize at Skillsprint 2025 organized by Skillected Company.",
    projectDescription: "A PHP-based web platform that helps Indian students discover career paths using AI-powered recommendations. Features comprehensive skill assessment with aptitude and personality tests, Google Cloud Vertex AI powered career suggestions, personalized learning roadmaps with course recommendations, progress tracking to monitor skill development, and multi-role support for students, counselors, and admins.",
    result: "finalist",
    icon: Medal,
    image: "/Journey/skillsprinthackthon.jpeg",
    project: "CareerAdvisor",
    tech: ["PHP", "MySQL", "HTML", "CSS", "JavaScript", "Bootstrap 5", "Google Cloud Vertex AI", "Apache", "XAMPP"],
    prize: "₹1000",
    teamMembers: ["Pavan Mali"],
  },
  {
    year: "2026",
    month: "Jan",
    day: "31",
    title: "TechSprint Hackathon 2026 🏆",
    event: "TechSprint Hackathon 2026 by BVDUCOE Pune",
    description: "Team of Pavan Mali, Sakshi Pawar, Siddhi Pisal, and Vijay Bhope competed at TechSprint Hackathon.",
    projectDescription: "HackMates is India's premier hackathon discovery and team formation platform that connects developers, designers, and innovators across the country. Features AI-powered assistant with Gemini, reliability & trust system with 4-tier badges, synergy matching algorithm for optimal team formation, comprehensive hackathon management, real-time communication, email notifications via Google Apps Script, and modern responsive design with theme support.",
    result: "participant",
    icon: Award,
    image: "/Journey/techsprint.jpeg",
    project: "HackMates",
    tech: ["React 18", "TypeScript", "Vite", "Firebase", "Firestore", "Tailwind CSS", "shadcn/ui", "Radix UI", "Gemini AI", "Google Apps Script"],
    teamMembers: ["Pavan Mali", "Sakshi Pawar", "Siddhi Pisal", "Vijay Bhope"],
  },
  {
    year: "2025",
    month: "Dec",
    day: "24",
    title: "AI & Career Guidance Workshop 🎓",
    event: "Workshop at Abhaysinhraje Bhonsle Institute of Technology",
    description: "Pavan Mali and Vijay Bhope conducted a hands-on workshop on AI and Career Guidance for 2nd and 3rd year IT Diploma students.",
    projectDescription: "A comprehensive hands-on workshop covering AI fundamentals, career guidance, and practical demonstrations. The session included interactive learning, quiz competitions with prizes and swags for winners, and personalized career counseling for Information Technology Department students at Abhaysinhraje Bhonsle Institute of Technology, Shendre.",
    result: "milestone",
    icon: Star,
    image: "/Journey/AI Workshop.jpeg",
    teamMembers: ["Pavan Mali", "Vijay Bhope"],
  },
  {
    year: "2026",
    month: "Mar",
    day: "01",
    title: "ThinkSprint 1.0 - 3rd Place 🥉",
    event: "ThinkSprint 1.0 by Review Tech Club — 3rd Prize",
    description: "Sakshi Pawar won 3rd prize with goodies and internship opportunity at ThinkSprint 1.0 Idea Presentation Competition.",
    projectDescription: "HackMates is India's premier hackathon discovery and team formation platform that connects developers, designers, and innovators across the country. Features AI-powered assistant with Gemini, reliability & trust system with 4-tier badges, synergy matching algorithm for optimal team formation, comprehensive hackathon management, real-time communication, email notifications via Google Apps Script, and modern responsive design with theme support.",
    result: "finalist",
    icon: Medal,
    image: "/Journey/thinksprint.jpeg",
    project: "HackMates",
    tech: ["React 18", "TypeScript", "Vite", "Firebase", "Firestore", "Tailwind CSS", "shadcn/ui", "Radix UI", "Gemini AI", "Google Apps Script"],
    prize: "Goodies + Internship Opportunity",
    teamMembers: ["Sakshi Pawar"],
  },
];

const resultBadge = {
  winner: { label: "🏆 Winner", className: "bg-accent/20 text-accent" },
  finalist: { label: "🥈 Finalist", className: "bg-primary/20 text-primary" },
  participant: { label: "🎯 Participated", className: "bg-muted text-muted-foreground" },
  milestone: { label: "⭐ Milestone", className: "bg-secondary text-secondary-foreground" },
};

const JourneySection = () => {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

  return (
    <section id="journey" className="py-24 bg-secondary/30 particles-bg">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="font-mono text-sm text-primary mb-3">our_journey.log</p>
          <h2 className="text-4xl md:text-5xl font-bold font-display">
            The <span className="gradient-text">Timeline</span>
          </h2>
          <p className="text-foreground mt-4 max-w-lg mx-auto">
            From a small team of dreamers to hackathon winners — every milestone matters.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-accent/30 to-primary/50 md:-translate-x-px" />

          {milestones.map((m, i) => {
            const badge = resultBadge[m.result];

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`relative flex items-start gap-6 mb-10 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Dot with glow */}
                <div className="absolute left-8 md:left-1/2 -translate-x-1.5 mt-6 z-10">
                  <div className="w-3 h-3 rounded-full bg-primary border-2 border-background shadow-[0_0_12px_hsl(var(--glow-primary)/0.6)]" />
                </div>

                {/* Content */}
                <div className={`ml-16 md:ml-0 md:w-1/2 ${i % 2 === 0 ? "md:pr-14 md:text-right" : "md:pl-14"}`}>
                  <motion.div
                    onClick={() => setSelectedMilestone(m)}
                    whileHover={{ scale: 1.02 }}
                    className="card-elevated rounded-xl overflow-hidden cursor-pointer hover:border-glow transition-all duration-300"
                  >
                    {/* Image - show as-is without cropping */}
                    <div className="relative bg-background flex items-center justify-center p-4">
                      <img
                        src={m.image}
                        alt={m.title}
                        className="w-full h-auto object-contain transition-transform duration-500 hover:scale-105"
                      />
                    </div>

                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${badge.className}`}>
                          {badge.label}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {m.day} {m.month} {m.year}
                        </span>
                      </div>
                      <p className="font-mono text-[10px] text-accent mb-1 uppercase tracking-wider">{m.event}</p>
                      <h3 className="font-display font-semibold text-foreground mb-2 text-left">{m.title}</h3>
                      <p className="text-sm text-muted-foreground text-left leading-relaxed">{m.description}</p>
                      <p className="font-mono text-[10px] text-primary/50 mt-3 text-left">
                        ▼ Click for details
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Milestone Detail Modal */}
        <AnimatePresence>
          {selectedMilestone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4"
              onClick={() => setSelectedMilestone(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25 }}
                className="card-elevated rounded-2xl max-w-3xl w-full overflow-hidden max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Image */}
                <div className="relative bg-background flex items-center justify-center p-6">
                  <img 
                    src={selectedMilestone.image} 
                    alt={selectedMilestone.title} 
                    className="w-full h-auto object-contain max-h-[400px]" 
                  />
                  <button
                    onClick={() => setSelectedMilestone(null)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-card/80 flex items-center justify-center text-foreground hover:bg-card transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                      <selectedMilestone.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-accent uppercase tracking-wider">{selectedMilestone.event}</span>
                      <h3 className="font-display text-xl font-bold text-foreground">{selectedMilestone.title}</h3>
                    </div>
                  </div>
                  
                  <div className="mb-4 flex items-center gap-3">
                    <span className={`font-mono text-[10px] px-2.5 py-1 rounded-full ${resultBadge[selectedMilestone.result].className}`}>
                      {resultBadge[selectedMilestone.result].label}
                    </span>
                    <span className="font-mono text-sm text-muted-foreground">
                      {selectedMilestone.day} {selectedMilestone.month} {selectedMilestone.year}
                    </span>
                    {selectedMilestone.prize && (
                      <span className="font-mono text-sm text-primary">
                        Prize: {selectedMilestone.prize}
                      </span>
                    )}
                  </div>

                  {selectedMilestone.teamMembers && (
                    <div className="mb-4">
                      <h4 className="font-mono text-xs text-primary mb-2 uppercase tracking-wider">Team Members</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMilestone.teamMembers.map((member) => (
                          <span key={member} className="font-mono text-xs px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground">
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedMilestone.projectDescription && (
                    <div className="mb-6">
                      {selectedMilestone.project && (
                        <h4 className="font-mono text-xs text-primary mb-2 uppercase tracking-wider">Project: {selectedMilestone.project}</h4>
                      )}
                      <p className="text-muted-foreground leading-relaxed">{selectedMilestone.projectDescription}</p>
                    </div>
                  )}

                  {selectedMilestone.tech && (
                    <div className="mb-6">
                      <h4 className="font-mono text-xs text-primary mb-3 uppercase tracking-wider">Tech Stack</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMilestone.tech.map((t) => (
                          <span key={t} className="font-mono text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary">
                            {t}
                          </span>
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
