import { motion, AnimatePresence, type Variants } from "framer-motion";
import { 
  Bot, 
  Globe, 
  Cloud, 
  Database, 
  Brain, 
  Layers, 
  ExternalLink, 
  X, 
  ChevronRight, 
  MessageCircle, 
  Search, 
  Sparkles,
  CheckCircle2,
  Code2,
} from "lucide-react";
import { useState, useMemo } from "react";
import { TechBadge } from "@/components/TechIcon";

interface Project {
  id: string;
  title: string;
  category: string;
  categories?: string[];
  icon: typeof Bot;
  description: string;
  longDescription: string;
  tech: string[];
  features: string[];
  demo?: string;
  status: "completed" | "in-progress" | "hackathon-mvp";
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const projects: Project[] = [
  {
    id: "HM-001",
    title: "VocalGuard",
    category: "AI/ML",
    icon: Bot,
    description: "AI-Powered Voice Deepfake Detection with real-time confidence scores and spectrograms",
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
    description: "Online Gaming Anxiety Prediction utilizing statistical machine learning models",
    longDescription: "A machine learning project built in R language that predicts gaming anxiety levels and provides personalized guidance. Uses statistical models and ML algorithms to analyze gaming behavior patterns and mental health indicators.",
    tech: ["R", "Machine Learning", "Statistical Analysis", "Data Visualization"],
    features: ["Anxiety prediction", "Gaming behavior analysis", "Personalized guidance", "Statistical modeling"],
    status: "completed",
  },
  {
    id: "HM-003",
    title: "HackMates Platform",
    category: "Full Stack",
    icon: Globe,
    description: "India's premier hackathon discovery and team formation platform with Gemini AI",
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
    description: "Modern real estate management platform with smart search & multi-role workflows",
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
    description: "Smart roommate matching platform with AI-powered compatibility scoring & verification",
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
    description: "Comprehensive hackathon platform for organizers & participants with Supabase",
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
    description: "AI-Powered Pharmacogenomic Risk Assessment platform aligned with CPIC guidelines",
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
    description: "Intelligent career guidance & resume parser with Python spaCy and scikit-learn",
    longDescription: "AI Job Mentor is a web-based application that provides personalized career guidance by analyzing user resumes using artificial intelligence. Combines PHP-based web interface with Python AI engine to deliver comprehensive career guidance. Features secure user authentication, resume processing with automated skill extraction using spaCy, job role matching with machine learning algorithms (scikit-learn), detailed PDF report generation with personalized recommendations, analysis history tracking, and email notifications for updates and reports using PHPMailer.",
    tech: ["PHP", "Python", "MySQL", "HTML", "CSS", "JavaScript", "spaCy", "scikit-learn", "FPDF", "PHPMailer"],
    features: ["AI-powered resume analysis", "Automated skill extraction", "Job role matching with ML algorithms", "Personalized career recommendations", "PDF report generation", "Analysis history tracking", "Email notifications", "Secure authentication and session management"],
    status: "completed",
  },
  {
    id: "HM-009",
    title: "SmartHire Platform",
    category: "PHP",
    categories: ["PHP", "Full Stack"],
    icon: Database,
    description: "AI-Powered Resume & Career Analyzer Platform with ATS scoring & roadmap planner",
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
    description: "Career & skills advisor for students powered by Google Cloud Vertex AI",
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
    description: "Raw material sourcing & GPS logistics platform for street food vendors",
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
    description: "Bridge platform matching talented student developers with early-stage startups",
    longDescription: "A web platform connecting talented students with innovative startups. Features student registration with email verification (OTP-based), detailed profile creation, startup registration with admin approval system, job posting and event management, application system with email notifications, admin dashboard for user and startup management, application tracking, and automated email notifications for verification, application status updates, and startup approvals using PHPMailer.",
    tech: ["PHP 7.4+", "MySQL", "HTML5", "CSS3", "JavaScript", "PHPMailer", "Bootstrap"],
    features: ["Student profile management", "Startup registration and approval", "Job posting and event management", "Application system with tracking", "Email verification (OTP-based)", "Automated email notifications", "Admin dashboard for oversight", "Responsive design"],
    status: "completed",
  },
  {
    id: "HM-013",
    title: "Bonafide Generation System",
    category: "PHP",
    categories: ["PHP", "Full Stack"],
    icon: Database,
    description: "Automated institutional bonafide certificate generator with digital signature",
    longDescription: "A comprehensive web-based application for generating and managing bonafide certificates for educational institutions. This system allows students to apply for bonafide certificates online and enables administrators to approve/reject applications with automated PDF generation. Features secure authentication, profile management, application history tracking with monthly limits (3 per month), admin dashboard with statistics, automated email notifications using PHPMailer, and instant PDF generation using FPDF library.",
    tech: ["PHP", "MySQL", "HTML5", "CSS3", "JavaScript", "FPDF", "PHPMailer", "Apache"],
    features: ["Student authentication and profile management", "Online certificate application system", "Admin approval/rejection workflow", "Automated PDF generation with FPDF", "Email notifications via PHPMailer", "Application history and status tracking", "Monthly certificate limit (3 per month)", "Statistics dashboard and CSV reports"],
    status: "completed",
  },
  {
    id: "HM-014",
    title: "Campus Placement Portal",
    category: "Full Stack",
    icon: Layers,
    description: "Multi-panel campus recruitment & TPO placement management platform",
    longDescription: "A comprehensive campus management system with three dedicated panels - Student, Admin (TPO), and Company - facilitating seamless communication between students and Training & Placement Officers. Features student dashboard for profile management and opportunity applications, TPO dashboard for adding students and posting placement opportunities, application tracking with shortlisting capabilities, company portal for recruitment management, and real-time status updates. Built with React, TypeScript, Firebase, and Tailwind CSS for a modern, responsive experience.",
    tech: ["React 18", "TypeScript", "Vite", "Firebase", "Firestore", "Tailwind CSS"],
    features: ["Student dashboard with profile management", "TPO dashboard for student and opportunity management", "Company portal for recruitment", "Post placement opportunities", "Application tracking and monitoring", "Shortlisting and selection workflow", "Real-time status updates", "Multi-panel communication system"],
    status: "in-progress",
  },
  {
    id: "HM-015",
    title: "Full-Stack MERN Ecommerce",
    category: "Full Stack",
    icon: Globe,
    description: "Production-ready ecommerce system with Admin, Seller, and Customer dashboards",
    longDescription: "A comprehensive, production-ready full-stack ecommerce platform built with MERN Stack (MongoDB, Express.js, React.js, Node.js). Features three separate role-based dashboards: Admin Dashboard for platform management and seller oversight, Seller Dashboard for inventory and order management, and Customer Dashboard for shopping and order tracking. Includes secure authentication with JWT, payment integration with Stripe/PayPal, real-time order management, advanced product search and filtering, review and rating system, and responsive design optimized for all devices.",
    tech: ["React.js", "Node.js", "Express.js", "MongoDB", "JWT", "REST APIs", "Redux", "Tailwind CSS", "Stripe", "PayPal"],
    features: [
      "Admin Dashboard: Seller management & transaction monitoring",
      "Seller Dashboard: Product inventory & sales tracking",
      "Customer Dashboard: Cart, checkout & order tracking",
      "JWT authentication & session security",
      "Stripe & PayPal payment processing",
      "Real-time order management",
      "Full catalog search and filtering"
    ],
    status: "completed",
  },
];

const statusBadge = {
  completed: { label: "Completed", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  "in-progress": { label: "Active Dev", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  "hackathon-mvp": { label: "Hackathon MVP", className: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30" },
};

const ProjectsSection = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = ["All", "Full Stack", "AI/ML", "PHP", "Data Science"];
  
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Category match
      const matchesCategory =
        activeFilter === "All" ||
        p.category === activeFilter ||
        (p.categories && p.categories.includes(activeFilter));

      // Search query match
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesSearch =
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query) ||
        p.tech.some((t) => t.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  const getCategoryCount = (category: string) => {
    if (category === "All") return projects.length;
    return projects.filter((p) => {
      if (p.categories) {
        return p.categories.includes(category);
      }
      return p.category === category;
    }).length;
  };

  return (
    <section id="projects" className="py-14 bg-transparent relative overflow-hidden">
      {/* Ambient Aurora Glows */}
      <div className="absolute top-10 left-1/3 w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute inset-0 tech-grid-bg opacity-20 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 font-mono text-xs uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>projects.catalog</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display text-white tracking-tight mb-4">
            What We <span className="gradient-text">Build & Ship</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-base sm:text-lg">
            Production full-stack platforms, machine learning models, and hackathon-winning MVPs built by the HackMates engineering collective.
          </p>
        </motion.div>

        {/* Search & Filter Controls */}
        <div className="max-w-4xl mx-auto mb-12 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by title, tech stack (e.g. React, Python, PHP, Gemini)..."
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl glass-card text-sm text-white placeholder-slate-400 border border-white/10 focus:outline-none focus:border-teal-400/50 shadow-lg transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {categories.map((category) => {
              const isActive = activeFilter === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category)}
                  className={`relative px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? "text-slate-950 font-bold shadow-[0_0_15px_rgba(45,212,191,0.4)]"
                      : "glass text-slate-300 hover:text-white hover:border-white/20"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeFilterPill"
                      className="absolute inset-0 rounded-full gradient-primary -z-10"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span>{category}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-slate-950/20 text-slate-950" : "bg-white/10 text-slate-400"
                    }`}
                  >
                    {getCategoryCount(category)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16 glass-card rounded-3xl max-w-md mx-auto">
            <Code2 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-white font-medium text-lg mb-1">No matching projects found</p>
            <p className="text-sm text-slate-400 mb-4">Try searching for a different keyword or category.</p>
            <button
              onClick={() => {
                setActiveFilter("All");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl gradient-primary text-slate-950 text-xs font-mono font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Projects Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          {filteredProjects.map((project) => {
            const Icon = project.icon;
            const badge = statusBadge[project.status];

            return (
              <motion.div
                key={project.id}
                variants={cardVariants}
                onClick={() => setSelectedProject(project)}
                className="glass-card rounded-2xl p-6 cursor-pointer border border-white/10 hover:border-teal-400/40 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Status + ID */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`font-mono text-[11px] px-2.5 py-0.5 rounded-full border ${badge.className}`}>
                      {badge.label}
                    </span>
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                      {project.id}
                    </span>
                  </div>

                  {/* Icon & Category */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform shadow-md">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-mono text-[11px] text-teal-300 uppercase tracking-wider block">
                        {project.categories ? project.categories.join(" • ") : project.category}
                      </span>
                      <h2 className="font-display font-bold text-xl text-white group-hover:text-teal-300 transition-colors">
                        {project.title}
                      </h2>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-300/80 mb-5 leading-relaxed line-clamp-2">
                    {project.description}
                  </p>
                </div>

                <div>
                  {/* Tech stack chips */}
                  <div className="flex flex-wrap gap-1.5 mb-5 pt-4 border-t border-white/5">
                    {project.tech.slice(0, 3).map((t) => (
                      <TechBadge key={t} name={t} />
                    ))}
                    {project.tech.length > 3 && (
                      <span className="font-mono text-[10px] px-2 py-1 rounded-md bg-white/[0.04] text-teal-400 border border-white/10 font-bold">
                        +{project.tech.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Open details prompt */}
                  <div className="flex items-center justify-between text-xs font-mono text-teal-400 font-semibold group-hover:text-teal-300">
                    <span>Inspect specifications</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Project Detail Modal */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto pt-24 pb-12"
              onClick={() => setSelectedProject(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 320 }}
                className="glass-card rounded-3xl max-w-3xl w-full border border-white/15 my-auto max-h-[85vh] overflow-y-auto shadow-[0_0_60px_rgba(45,212,191,0.25)] relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Top Glowing Laser Wire */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-teal-500 via-cyan-400 to-amber-400" />

                {/* Ambient Internal Glow */}
                <div className="absolute -top-20 -right-20 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="p-6 sm:p-8 relative z-10 space-y-6">
                  {/* Top Bar with Icon, Title, and Close Button */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-teal-500/15 border-2 border-teal-400/40 flex items-center justify-center text-teal-300 shadow-[0_0_20px_rgba(45,212,191,0.25)] shrink-0">
                        <selectedProject.icon className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 uppercase tracking-wider font-semibold">
                            {selectedProject.categories ? selectedProject.categories.join(" • ") : selectedProject.category}
                          </span>
                          <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/15 text-slate-300">
                            {selectedProject.id}
                          </span>
                          <span className={`font-mono text-xs px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${statusBadge[selectedProject.status].className}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                            {statusBadge[selectedProject.status].label}
                          </span>
                        </div>
                        <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                          {selectedProject.title}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedProject(null)}
                      className="w-10 h-10 rounded-full bg-slate-900/80 border border-white/15 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shrink-0 backdrop-blur-md"
                      aria-label="Close modal"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Project Overview Synopsis */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 relative overflow-hidden">
                    <div className="absolute left-0 inset-y-0 w-1 bg-gradient-to-b from-teal-400 to-cyan-500" />
                    <h4 className="font-mono text-xs text-teal-300 uppercase tracking-wider mb-2 font-semibold">
                      System Overview & Architecture
                    </h4>
                    <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                      {selectedProject.longDescription}
                    </p>
                  </div>

                  {/* Key Features & Architecture Deliverables */}
                  <div>
                    <h4 className="font-mono text-xs text-teal-300 uppercase tracking-wider mb-3 font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-teal-400" />
                      Key Capabilities & Deliverables
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedProject.features.map((f) => (
                        <div
                          key={f}
                          className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-teal-400/30 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm text-slate-200 leading-normal">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tech Stack & Libraries */}
                  <div>
                    <h4 className="font-mono text-xs text-teal-300 uppercase tracking-wider mb-3 font-semibold flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-teal-400" />
                      Technology Stack & Libraries Deployed
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tech.map((t) => (
                        <TechBadge key={t} name={t} size="md" />
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
                    <a
                      href={`https://wa.me/917249830281?text=Hi%20HackMates,%20I%20am%20interested%20in%20Project%20${selectedProject.id}%20-%20${encodeURIComponent(selectedProject.title)}.%20Please%20share%20source%20code%20access,%20pricing,%20and%20setup%20details.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_25px_rgba(16,185,129,0.35)]"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Inquire / Get Source Code on WhatsApp</span>
                    </a>

                    {selectedProject.demo && (
                      <a
                        href={selectedProject.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(45,212,191,0.35)] hover:opacity-95"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Launch Live Demo</span>
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
