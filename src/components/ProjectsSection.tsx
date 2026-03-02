import { motion, AnimatePresence } from "framer-motion";
import { Bot, Globe, Cloud, Database, Brain, Layers, ExternalLink, X, ChevronRight, MessageCircle } from "lucide-react";
import { useState } from "react";

interface Project {
  id: string;
  title: string;
  category: string;
  categories?: string[]; // Multiple categories support
  icon: typeof Bot;
  description: string;
  longDescription: string;
  tech: string[];
  features: string[];
  demo?: string;
  status: "completed" | "in-progress" | "hackathon-mvp";
}

const projects: Project[] = [
  {
    id: "HM-001",
    title: "VocalGuard",
    category: "AI/ML",
    icon: Bot,
    description: "AI-Powered Voice Deepfake Detection with high accuracy",
    longDescription: "VocalGuard is an advanced AI-powered web application that detects voice deepfakes and synthetic audio with high accuracy. Using state-of-the-art machine learning models, it helps protect against voice cloning attacks and ensures audio authenticity. Features real-time processing, visual insights with mel spectrograms, and a comprehensive analytics dashboard.",
    tech: ["React 19", "Vite", "Tailwind CSS", "Node.js", "Express", "Python", "Flask", "TensorFlow Lite", "Librosa", "Framer Motion"],
    features: ["Deepfake detection with confidence scores", "Multi-format support (WAV, MP3, FLAC, OGG, M4A, WebM)", "Mel spectrogram visualization", "Real-time processing", "Analytics dashboard", "Responsive design"],
    status: "completed",
  },
  {
    id: "HM-002",
    title: "AnxietyDetection",
    category: "Data Science",
    icon: Database,
    description: "Online Gaming Anxiety Prediction (ML/R project)",
    longDescription: "A machine learning project built in R language that predicts gaming anxiety levels and provides personalized guidance. Uses statistical models and ML algorithms to analyze gaming behavior patterns and mental health indicators.",
    tech: ["R", "Machine Learning", "Statistical Analysis", "Data Visualization"],
    features: ["Anxiety prediction", "Gaming behavior analysis", "Personalized guidance", "Statistical modeling"],
    status: "completed",
  },
  {
    id: "HM-003",
    title: "HackMates",
    category: "Full Stack",
    icon: Globe,
    description: "India's premier hackathon discovery and team formation platform",
    longDescription: "HackMates is India's premier hackathon discovery and team formation platform that connects developers, designers, and innovators across the country. Features AI-powered assistant with Gemini, reliability & trust system with 4-tier badges, synergy matching algorithm for optimal team formation, comprehensive hackathon management, real-time communication, email notifications via Google Apps Script, and modern responsive design with theme support.",
    tech: ["React 18", "TypeScript", "Vite", "Firebase", "Firestore", "Tailwind CSS", "shadcn/ui", "Radix UI", "Gemini AI", "Google Apps Script"],
    features: ["AI-powered assistant for guidance", "Reliability badges and trust scores", "Synergy matching algorithm (0-100% compatibility)", "Hackathon creation and management", "Real-time messaging and chat", "Email notifications system", "Profile and team discovery", "Announcements with unread tracking"],
    status: "completed",
  },
  {
    id: "HM-004",
    title: "RealEstateRider",
    category: "Full Stack",
    icon: Cloud,
    description: "Modern real estate management platform with multi-role system",
    longDescription: "A modern real estate management platform built with React, TypeScript, and Firebase. Features a comprehensive multi-role system for Buyers, Sellers, Agents, and Admins. Includes smart property search with Google Maps integration, WhatsApp-style inquiry chat system, admin dashboard with document verification, and AI-powered chatbot assistance using Gemini AI.",
    tech: ["React 18", "TypeScript", "Vite", "Firebase", "Firestore", "Tailwind CSS", "shadcn/ui", "Google Maps API", "Gemini AI"],
    features: ["Multi-role system (Buyers, Sellers, Agents, Admin)", "Property management with smart search", "Google Maps integration", "WhatsApp-style inquiry chat", "Admin dashboard with document verification", "AI chatbot assistant", "Wishlist functionality", "Email notifications"],
    status: "completed",
  },
  {
    id: "HM-005",
    title: "RoomBridge",
    category: "AI/ML",
    categories: ["AI/ML", "Full Stack"],
    icon: Brain,
    description: "Smart roommate matching platform with AI-powered features",
    longDescription: "A modern room rental and roommate matching platform with AI-powered features, smart matching algorithms, and real-time communication. Features Gemini 2.5 Flash AI chatbot, intelligent compatibility scoring, location-based services with distance calculation, multiple listing types, real-time chat, comprehensive verification system, and admin dashboard with moderation tools.",
    tech: ["React 18", "TypeScript", "Vite", "Firebase", "Firestore", "Tailwind CSS", "shadcn/ui", "Framer Motion", "Gemini 2.5 Flash", "Google Maps API"],
    features: ["AI chatbot assistant", "Smart matching algorithm", "Location-based distance calculation", "Multiple listing types (Long-Term, PG, Short Stay, Emergency)", "Real-time chat and notifications", "Verification system (Student ID, Aadhaar, Live Selfie)", "Auto-moderation and reporting", "Admin dashboard"],
    status: "completed",
  },
  {
    id: "HM-006",
    title: "DevnovateX",
    category: "Full Stack",
    icon: Layers,
    description: "Comprehensive hackathon platform for organizers and participants",
    longDescription: "A comprehensive hackathon platform built for HackWithIndia that brings together organizers and participants in a collaborative environment. Features dual role system, real-time messaging with unlimited file storage (up to 50MB per file), smart file compression, announcement hub, hackathon management, rich blog editor, issue tracking system with comment moderation, and modern glassmorphism UI with theme support. Powered by Supabase for real-time updates and secure storage.",
    tech: ["React 18", "TypeScript", "Vite", "Supabase", "PostgreSQL", "Tailwind CSS", "shadcn/ui", "Supabase Storage", "Lucide React", "Sonner"],
    features: ["Dual role system (organizers & participants)", "Real-time messaging with file sharing", "Unlimited file storage with CDN delivery", "Announcement hub with unread tracking", "Hackathon creation and discovery", "Rich blog editor with image support", "Issue tracking with comment moderation", "Profile system with avatar upload"],
    status: "completed",
  },
  {
    id: "HM-007",
    title: "PharmaGen-AI",
    category: "AI/ML",
    icon: Bot,
    description: "AI-Powered Pharmacogenomic Risk Assessment platform",
    longDescription: "An intelligent web application that analyzes patient genomic data (VCF files) to predict personalized pharmacogenomic risks and provides clinically actionable recommendations with AI-generated explanations aligned with CPIC guidelines. Prevents adverse drug reactions through personalized genetic analysis, helping clinicians predict drug-specific safety risks, avoid toxic drug-gene interactions, and optimize drug dosing for individual patients.",
    tech: ["React 18", "TypeScript", "Vite", "Node.js", "Express.js", "Tailwind CSS", "shadcn/ui", "Framer Motion", "Google Gemini", "Vitest", "Jest"],
    features: ["VCF file genomic analysis", "Pharmacogenomic risk prediction", "AI-generated clinical recommendations", "CPIC guideline alignment", "Drug-gene interaction detection", "Personalized dosing optimization", "Evidence-based insights", "Structured logging"],
    status: "completed",
  },
  {
    id: "HM-008",
    title: "AI-Job-Mentor",
    category: "AI/ML",
    categories: ["AI/ML", "Full Stack", "PHP"],
    icon: Brain,
    description: "Intelligent Career Guidance Through Resume Analysis",
    longDescription: "AI Job Mentor is a web-based application that provides personalized career guidance by analyzing user resumes using artificial intelligence. Combines PHP-based web interface with Python AI engine to deliver comprehensive career guidance. Features secure user authentication, resume processing with automated skill extraction using spaCy, job role matching with machine learning algorithms (scikit-learn), detailed PDF report generation with personalized recommendations, analysis history tracking, and email notifications for updates and reports using PHPMailer.",
    tech: ["PHP", "Python", "MySQL", "HTML", "CSS", "JavaScript", "spaCy", "scikit-learn", "FPDF", "PHPMailer"],
    features: ["AI-powered resume analysis", "Automated skill extraction", "Job role matching with ML algorithms", "Personalized career recommendations", "PDF report generation", "Analysis history tracking", "Email notifications", "Secure authentication and session management"],
    status: "completed",
  },
  {
    id: "HM-009",
    title: "SmartHire",
    category: "PHP",
    categories: ["PHP", "Full Stack"],
    icon: Database,
    description: "AI-Powered Resume & Career Analyzer Platform",
    longDescription: "SmartHire is a full-stack platform that empowers users to upload, analyze, and improve their resumes using advanced AI. Features resume upload and analysis with PDF parsing, ATS compatibility scoring with actionable suggestions, personalized job recommendations based on skills and market demand, 8-week learning plans with weekly tasks, resume builder with multiple modern templates and PDF download, history and progress dashboard, and secure authentication with OTP email verification.",
    tech: ["PHP", "Python", "Flask", "MySQL", "Bootstrap 5", "HTML5", "CSS3", "JavaScript", "Azure/OpenAI API", "PyMuPDF", "PHPMailer", "Chart.js"],
    features: ["Resume upload and AI analysis", "ATS compatibility scoring", "Actionable improvement suggestions", "Personalized job recommendations", "8-week learning plans", "Resume builder with multiple templates", "PDF download functionality", "History and progress tracking", "OTP email verification"],
    status: "completed",
  },
  {
    id: "HM-010",
    title: "CareerAdvisor",
    category: "AI/ML",
    categories: ["AI/ML", "Full Stack", "PHP"],
    icon: Bot,
    description: "Career & Skills Advisor Platform for Indian students",
    longDescription: "A PHP-based web platform that helps Indian students discover career paths using AI-powered recommendations. Features comprehensive skill assessment with aptitude and personality tests, Google Cloud Vertex AI powered career suggestions, personalized learning roadmaps with course recommendations, progress tracking to monitor skill development, and multi-role support for students, counselors, and admins.",
    tech: ["PHP", "MySQL", "HTML", "CSS", "JavaScript", "Bootstrap 5", "Google Cloud Vertex AI", "Apache", "XAMPP"],
    features: ["Comprehensive skill assessment tests", "AI-powered career recommendations", "Personalized learning roadmaps", "Progress tracking and monitoring", "Multi-role support (students, counselors, admins)", "Course recommendations", "Aptitude and personality tests"],
    status: "completed",
  },
  {
    id: "HM-011",
    title: "StreetSource",
    category: "PHP",
    categories: ["PHP", "Full Stack"],
    icon: Globe,
    description: "Raw Material Sourcing Platform for street food vendors",
    longDescription: "A comprehensive web application connecting street food vendors with trusted suppliers, built with PHP, MySQL, and Bootstrap. Features location-based supplier discovery within 10km radius using GPS and Haversine formula, product browsing with real-time stock levels, easy ordering with quantity selection, order tracking from pending to delivered, supplier reviews and ratings, product management for suppliers, performance analytics, and mobile-responsive design optimized for smartphones.",
    tech: ["PHP 8+", "MySQL 8+", "HTML5", "CSS3", "JavaScript", "Bootstrap 5.1.3", "AJAX", "Geolocation API", "Apache"],
    features: ["Location-based supplier discovery (10km radius)", "Real-time stock level tracking", "Order management and tracking", "Supplier review and rating system", "Product management for suppliers", "Performance analytics dashboard", "Mobile-responsive design", "Secure authentication with password hashing"],
    status: "completed",
  },
  {
    id: "HM-012",
    title: "Skill-to-Startup Matcher",
    category: "PHP",
    categories: ["PHP", "Full Stack"],
    icon: Brain,
    description: "Platform connecting talented students with innovative startups",
    longDescription: "A web platform connecting talented students with innovative startups. Features student registration with email verification (OTP-based), detailed profile creation, startup registration with admin approval system, job posting and event management, application system with email notifications, admin dashboard for user and startup management, application tracking, and automated email notifications for verification, application status updates, and startup approvals using PHPMailer.",
    tech: ["PHP 7.4+", "MySQL", "HTML5", "CSS3", "JavaScript", "PHPMailer", "Bootstrap"],
    features: ["Student profile management", "Startup registration and approval", "Job posting and event management", "Application system with tracking", "Email verification (OTP-based)", "Automated email notifications", "Admin dashboard for oversight", "Responsive design"],
    status: "completed",
  },
  {
    id: "HM-013",
    title: "Bonafide Certificate Generation System",
    category: "PHP",
    categories: ["PHP", "Full Stack"],
    icon: Database,
    description: "Web-based bonafide certificate management for educational institutions",
    longDescription: "A comprehensive web-based application for generating and managing bonafide certificates for educational institutions. This system allows students to apply for bonafide certificates online and enables administrators to approve/reject applications with automated PDF generation. Features secure authentication, profile management, application history tracking with monthly limits (3 per month), admin dashboard with statistics, automated email notifications using PHPMailer, and instant PDF generation using FPDF library.",
    tech: ["PHP", "MySQL", "HTML5", "CSS3", "JavaScript", "FPDF", "PHPMailer", "Apache"],
    features: ["Student authentication and profile management", "Online certificate application system", "Admin approval/rejection workflow", "Automated PDF generation with FPDF", "Email notifications via PHPMailer", "Application history and status tracking", "Monthly certificate limit (3 per month)", "Statistics dashboard and CSV reports"],
    status: "completed",
  },
  {
    id: "HM-014",
    title: "Campus Management System",
    category: "Full Stack",
    icon: Layers,
    description: "Multi-panel campus placement management platform",
    longDescription: "A comprehensive campus management system with three dedicated panels - Student, Admin (TPO), and Company - facilitating seamless communication between students and Training & Placement Officers. Features student dashboard for profile management and opportunity applications, TPO dashboard for adding students and posting placement opportunities, application tracking with shortlisting capabilities, company portal for recruitment management, and real-time status updates. Built with React, TypeScript, Firebase, and Tailwind CSS for a modern, responsive experience.",
    tech: ["React 18", "TypeScript", "Vite", "Firebase", "Firestore", "Tailwind CSS"],
    features: ["Student dashboard with profile management", "TPO dashboard for student and opportunity management", "Company portal for recruitment", "Post placement opportunities", "Application tracking and monitoring", "Shortlisting and selection workflow", "Real-time status updates", "Multi-panel communication system"],
    status: "in-progress",
  },
];

const statusBadge = {
  completed: { label: "✅ Completed", className: "bg-primary/10 text-primary" },
  "in-progress": { label: "🔧 In Progress", className: "bg-accent/10 text-accent" },
  "hackathon-mvp": { label: "🏆 Hackathon MVP", className: "bg-secondary text-secondary-foreground" },
};

const ProjectsSection = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const categories = ["All", "Full Stack", "AI/ML", "PHP", "Data Science"];
  
  const filteredProjects = activeFilter === "All" 
    ? projects 
    : projects.filter(p => {
        // Check both category and categories array
        if (p.categories) {
          return p.categories.includes(activeFilter);
        }
        return p.category === activeFilter;
      });

  // Calculate project count for each category
  const getCategoryCount = (category: string) => {
    if (category === "All") return projects.length;
    return projects.filter(p => {
      if (p.categories) {
        return p.categories.includes(category);
      }
      return p.category === category;
    }).length;
  };

  return (
    <section id="projects" className="py-24 bg-secondary/30 particles-bg">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="font-mono text-sm text-primary mb-3">projects.showcase</p>
          <h2 className="text-4xl md:text-5xl font-bold font-display">
            What We <span className="gradient-text">Build</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            From AI to Full Stack — every project solves a real problem.
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`font-mono text-sm px-5 py-2.5 rounded-full transition-all duration-300 ${
                activeFilter === category
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-card text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {category} <span className="ml-1.5 opacity-70">({getCategoryCount(category)})</span>
            </button>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredProjects.map((project, i) => {
            const badge = statusBadge[project.status];
            return (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                onClick={() => setSelectedProject(project)}
                className="card-elevated rounded-xl overflow-hidden cursor-pointer hover:border-glow transition-all duration-300 group"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${badge.className}`}>
                      {badge.label}
                    </span>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <project.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-wrap gap-1">
                      {project.categories ? (
                        <span className="font-mono text-xs text-accent uppercase tracking-wider">
                          {project.categories.join(" + ")}
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-accent uppercase tracking-wider">{project.category}</span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-semibold text-lg text-foreground">{project.title}</h3>
                    <span className="font-mono text-xs px-2 py-1 rounded bg-primary/20 text-primary border border-primary/30 shrink-0">
                      {project.id}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.slice(0, 3).map((t) => (
                      <span key={t} className="font-mono text-[10px] px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                        {t}
                      </span>
                    ))}
                    {project.tech.length > 3 && (
                      <span className="font-mono text-[10px] px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                        +{project.tech.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Project Detail Modal */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4"
              onClick={() => setSelectedProject(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25 }}
                className="card-elevated rounded-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                        <selectedProject.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="flex flex-wrap gap-2 mb-1">
                          {selectedProject.categories ? (
                            <span className="font-mono text-[10px] text-accent uppercase tracking-wider">
                              {selectedProject.categories.join(" + ")}
                            </span>
                          ) : (
                            <span className="font-mono text-[10px] text-accent uppercase tracking-wider">{selectedProject.category}</span>
                          )}
                        </div>
                        <h3 className="font-display text-xl font-bold text-foreground">{selectedProject.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-xs text-muted-foreground">Project ID:</span>
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                            {selectedProject.id}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mb-4">
                    <span className={`font-mono text-[10px] px-2.5 py-1 rounded-full ${statusBadge[selectedProject.status].className}`}>
                      {statusBadge[selectedProject.status].label}
                    </span>
                  </div>

                  <p className="text-muted-foreground leading-relaxed mb-6">{selectedProject.longDescription}</p>

                  <div className="mb-6">
                    <h4 className="font-mono text-xs text-primary mb-3 uppercase tracking-wider">Key Features</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedProject.features.map((f) => (
                        <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-mono text-xs text-primary mb-3 uppercase tracking-wider">Tech Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tech.map((t) => (
                        <span key={t} className="font-mono text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <a
                      href={`https://wa.me/917249830281?text=Hi, I need more information about Project ${selectedProject.id} - ${selectedProject.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Inquire on WhatsApp
                    </a>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-border">
                    {selectedProject.demo && (
                      <a href={selectedProject.demo} className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity">
                        <ExternalLink className="w-4 h-4" /> Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ProjectsSection;
