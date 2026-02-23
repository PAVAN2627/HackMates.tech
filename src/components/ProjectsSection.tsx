import { motion, AnimatePresence } from "framer-motion";
import { Bot, Globe, Cloud, Database, Brain, Layers, ExternalLink, X, ChevronRight } from "lucide-react";
import { useState } from "react";
import hackathonEvent1 from "@/assets/hackathon-event-1.jpg";
import hackathonEvent2 from "@/assets/hackathon-event-2.jpg";
import hackathonEvent3 from "@/assets/hackathon-event-3.jpg";

interface Project {
  title: string;
  category: string;
  icon: typeof Bot;
  description: string;
  longDescription: string;
  tech: string[];
  image: string;
  features: string[];
  demo?: string;
  status: "completed" | "in-progress" | "hackathon-mvp";
}

const projects: Project[] = [
  {
    title: "AI Resume Analyzer",
    category: "AI/ML",
    icon: Bot,
    description: "NLP-powered resume parser with skill matching and scoring engine.",
    longDescription: "A comprehensive resume analysis platform that uses Natural Language Processing to parse resumes, extract key skills, match them against job descriptions, and provide a detailed scoring breakdown with improvement suggestions.",
    tech: ["Python", "spaCy", "Flask", "React", "PostgreSQL"],
    image: hackathonEvent2,
    features: ["Resume parsing & extraction", "Skill-job matching", "Score breakdown", "PDF/DOCX support"],
    demo: "#",
    status: "completed",
  },
  {
    title: "SmartFarm Dashboard",
    category: "Full Stack",
    icon: Globe,
    description: "IoT-based agriculture monitoring with real-time analytics.",
    longDescription: "An IoT-powered agriculture monitoring platform that collects real-time data from sensors (soil moisture, temperature, humidity) and displays analytics dashboards with automated alerts and irrigation recommendations.",
    tech: ["React", "Node.js", "MQTT", "InfluxDB", "Chart.js"],
    image: hackathonEvent3,
    features: ["Real-time sensor data", "Analytics dashboard", "Automated alerts", "Weather integration"],
    status: "completed",
  },
  {
    title: "CloudSync Manager",
    category: "Cloud",
    icon: Cloud,
    description: "Multi-cloud resource management with automated scaling.",
    longDescription: "A unified cloud management tool that allows teams to manage resources across AWS, Azure, and GCP from a single dashboard, with automated scaling policies and cost optimization suggestions.",
    tech: ["AWS", "Terraform", "Go", "React", "Docker"],
    image: hackathonEvent1,
    features: ["Multi-cloud support", "Auto-scaling", "Cost optimization", "Resource monitoring"],
    status: "in-progress",
  },
  {
    title: "MedPredict",
    category: "Data Science",
    icon: Database,
    description: "Disease prediction using patient history and ML algorithms.",
    longDescription: "A machine learning platform that analyzes patient history data to predict potential health risks. Uses ensemble methods combining Random Forest, XGBoost, and neural networks for high-accuracy predictions.",
    tech: ["Python", "scikit-learn", "Streamlit", "Pandas", "XGBoost"],
    image: hackathonEvent2,
    features: ["Patient risk scoring", "Multi-disease prediction", "Interactive visualizations", "Report generation"],
    demo: "#",
    status: "hackathon-mvp",
  },
  {
    title: "CodeCollab",
    category: "Full Stack",
    icon: Layers,
    description: "Real-time collaborative code editor with video chat.",
    longDescription: "A real-time collaborative coding platform where developers can write, run, and debug code together. Features include live cursor tracking, built-in video/audio chat, and support for 15+ programming languages.",
    tech: ["React", "WebRTC", "Socket.io", "Monaco Editor", "Docker"],
    image: hackathonEvent3,
    features: ["Real-time collaboration", "Video/audio chat", "Multi-language support", "Live execution"],
    demo: "#",
    status: "completed",
  },
  {
    title: "Vision Assist",
    category: "AI/ML",
    icon: Brain,
    description: "Object detection and scene description for visually impaired.",
    longDescription: "An accessibility-focused mobile app that uses computer vision to detect objects, read text, describe scenes, and provide audio navigation cues to assist visually impaired users in daily activities.",
    tech: ["TensorFlow", "React Native", "OpenCV", "Google TTS", "Python"],
    image: hackathonEvent1,
    features: ["Object detection", "Text-to-speech", "Scene description", "Navigation assist"],
    status: "hackathon-mvp",
  },
];

const statusBadge = {
  completed: { label: "✅ Completed", className: "bg-primary/10 text-primary" },
  "in-progress": { label: "🔧 In Progress", className: "bg-accent/10 text-accent" },
  "hackathon-mvp": { label: "🏆 Hackathon MVP", className: "bg-secondary text-secondary-foreground" },
};

const ProjectsSection = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {projects.map((project, i) => {
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
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <div className="w-9 h-9 rounded-lg bg-card/80 backdrop-blur-sm flex items-center justify-center">
                      <project.icon className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-accent uppercase tracking-wider">{project.category}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-2">{project.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{project.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech.slice(0, 3).map((t) => (
                      <span key={t} className="font-mono text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {t}
                      </span>
                    ))}
                    {project.tech.length > 3 && (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
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
                <div className="relative h-64">
                  <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-card/80 flex items-center justify-center text-foreground hover:bg-card transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-4 left-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                      <selectedProject.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-accent uppercase tracking-wider">{selectedProject.category}</span>
                      <h3 className="font-display text-xl font-bold text-foreground">{selectedProject.title}</h3>
                    </div>
                  </div>
                </div>

                <div className="p-6">
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
