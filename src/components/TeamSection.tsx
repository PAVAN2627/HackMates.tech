import { motion, AnimatePresence, type Variants } from "framer-motion";
import { 
  Linkedin, 
  Globe, 
  Code2, 
  Star, 
  Award, 
  Instagram, 
  X, 
  Sparkles, 
  Trophy, 
  ExternalLink,
  ChevronRight,
  GraduationCap
} from "lucide-react";
import { useState } from "react";
import { TechBadge } from "@/components/TechIcon";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  skills: string[];
  photo: string;
  isFounder: boolean;
  contributions: string;
  hackathons: number;
  linkedin?: string;
  portfolio?: string;
  instagram?: string;
}

interface Intern {
  name: string;
  id: string;
  photo: string;
  portfolio?: string;
  linkedin?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

const team: TeamMember[] = [
  {
    name: "Pavan Mali",
    role: "Founder & Team Lead | Full-Stack & DevOps Engineer",
    bio: "Full-Stack & DevOps Engineer passionate about building scalable, production-ready applications. Experienced in designing REST APIs, deploying cloud-native systems, and implementing CI/CD pipelines. Strong focus on performance, automation, and real-world problem solving.",
    skills: ["React", "Node.js", "TypeScript", "Python", "AWS", "Docker", "MySQL", "CI/CD"],
    photo: "/Pavan/ProffesionalPhoto.jpeg",
    isFounder: true,
    contributions: "12+ Projects Built & Deployed",
    hackathons: 10,
    portfolio: "https://pavanmaliportfolio.vercel.app/",
    linkedin: "https://www.linkedin.com/in/pavan-mali-1808b6273/",
    instagram: "https://www.instagram.com/its_me_pavanmali",
  },
  {
    name: "Vijay Bhope",
    role: "Full-Stack Developer | AI Engineer",
    bio: "Passionate about building real-world web applications and AI-based systems. Developed placement platforms, government-focused web apps, and intelligent automation projects.",
    skills: ["HTML", "CSS", "JavaScript", "Bootstrap", "PHP", "MySQL", "Flask", "OpenAI API"],
    photo: "/Pavan/VijayBhope.jpeg",
    isFounder: false,
    contributions: "8+ Projects Shipped",
    hackathons: 5,
    portfolio: "https://vijaybhope.vercel.app/",
    linkedin: "https://www.linkedin.com/in/vijay-bhope-b2b113343",
    instagram: "#",
  },
  {
    name: "Sakshi Pawar",
    role: "AI/ML Developer",
    bio: "Specializes in computer vision and natural language processing. Built multiple winning AI models that secured top awards in national student hackathons.",
    skills: ["Python", "TensorFlow", "OpenCV", "PyTorch", "NLP", "Machine Learning"],
    photo: "/Pavan/sakshipawar.jpeg",
    isFounder: false,
    contributions: "8+ AI Models Developed",
    hackathons: 9,
    portfolio: "#",
    linkedin: "https://www.linkedin.com/in/sakshi-pawar-03s/",
    instagram: "https://www.instagram.com/sakshipawar_3",
  },
  {
    name: "Siddhi Pisal",
    role: "Full-Stack Developer | AI Engineer",
    bio: "Passionate about building innovative tech solutions with AI, Full-Stack Development, web development, and software engineering. Loves creating digital products through clean, modular code.",
    skills: ["Python", "React", "Next.js", "TypeScript", "FastAPI", "Flask", "MySQL", "PostgreSQL", "MongoDB", "Docker"],
    photo: "/Pavan/siddhipisal.jpeg",
    isFounder: false,
    contributions: "10+ Projects Built",
    hackathons: 8,
    portfolio: "https://portfolio-ten-mauve-7i0d890f9v.vercel.app/",
    linkedin: "https://www.linkedin.com/in/siddhi-pisal-98557b30a/",
    instagram: "https://www.instagram.com/sidpisal18",
  },
  {
    name: "Shrutika Patil",
    role: "Full-Stack Developer | AI Engineer",
    bio: "Builds scalable applications powered by modern web technologies and machine learning. Passionate about turning complex ideas into real-world, production-ready systems.",
    skills: ["React", "Node.js", "Python", "TensorFlow", "Docker", "REST APIs"],
    photo: "/Pavan/shrutikapatil.jpeg",
    isFounder: false,
    contributions: "5+ Full-Stack Projects",
    hackathons: 3,
    portfolio: "https://my-portfolio-chi-lovat-baxxg2o9yf.vercel.app/",
    linkedin: "https://www.linkedin.com/in/shrutikapatil76/",
    instagram: "https://www.instagram.com/shrutika________07",
  },
  {
    name: "Purva Mohite",
    role: "AI/ML Engineer | Full-Stack Developer",
    bio: "Artificial Intelligence & Machine Learning specialist with a strong foundation in full-stack development and data structures. Thrives on building impactful applications that bridge the gap between AI and practical software engineering.",
    skills: ["Python", "Machine Learning", "React", "Node.js", "Data Structures", "AI/ML"],
    photo: "/Pavan/purvamohite.jpeg",
    isFounder: false,
    contributions: "8+ AI/ML Projects",
    hackathons: 8,
    portfolio: "https://purva-portfolio-kohl.vercel.app/",
    linkedin: "https://www.linkedin.com/in/purva-mohite-656086317/",
    instagram: "https://www.instagram.com/__pvxx__45",
  },
];

const interns: Intern[] = [
  {
    name: "Preeti Dhanawade",
    id: "HM-FWD-001",
    photo: "/Interns/preeti.jpeg",
    portfolio: "https://www.preetidhanawade.xyz/",
    linkedin: "https://www.linkedin.com/in/preeti-dhanawade-212b612a3/",
  },
  {
    name: "Vaibhav Sawant",
    id: "HM-FWD-002",
    photo: "/Interns/vaibhav.jpeg",
    portfolio: "https://vaibhavsawant.xyz/",
    linkedin: "https://www.linkedin.com/in/vaibhav-sawant-4b46113a2/",
  },
  {
    name: "Samiksha Bhosale",
    id: "HM-FWD-003",
    photo: "/Interns/samiksha.jpeg",
    linkedin: "https://www.linkedin.com/in/samiksha-bhosale-a82471385/",
  },
  {
    name: "Harshal Shinde",
    id: "HM-FWD-004",
    photo: "/Interns/harshal.jpeg",
    linkedin: "https://www.linkedin.com/in/harshal-shinde-2952663aa/",
  },
  {
    name: "Nandini Shinde",
    id: "HM-FWD-005",
    photo: "/Interns/Nandini.jpeg",
    linkedin: "https://www.linkedin.com/in/nandini-shinde-5b6a683a4/",
  },
];

const TeamSection = () => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [activeTab, setActiveTab] = useState<"core" | "interns">("core");
  const founder = team.find((m) => m.isFounder)!;
  const others = team.filter((m) => !m.isFounder);

  return (
    <section id="team" className="py-14 bg-transparent relative overflow-hidden">
      {/* Ambient Glow Orbs */}
      <div className="absolute top-10 left-1/4 w-[450px] h-[450px] rounded-full bg-teal-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-[450px] h-[450px] rounded-full bg-indigo-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 tech-grid-bg opacity-20 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 font-mono text-xs uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>team.collective</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display text-white tracking-tight mb-4">
            Meet the <span className="gradient-text">Builders & Innovators</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-base sm:text-lg">
            Passionate student developers, AI engineers, and hackathon competitors driving the HackMates mission.
          </p>
        </motion.div>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-3 mb-14">
          <button
            onClick={() => setActiveTab("core")}
            className={`relative px-5 py-2.5 rounded-full font-mono text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              activeTab === "core"
                ? "text-slate-950 font-bold shadow-[0_0_20px_rgba(45,212,191,0.4)]"
                : "glass text-slate-300 hover:text-white"
            }`}
          >
            {activeTab === "core" && (
              <motion.span
                layoutId="activeTeamTab"
                className="absolute inset-0 rounded-full gradient-primary -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span>Core Engineers</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "core" ? "bg-slate-950/20 text-slate-950" : "bg-white/10 text-slate-400"}`}>
              {team.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("interns")}
            className={`relative px-5 py-2.5 rounded-full font-mono text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              activeTab === "interns"
                ? "text-slate-950 font-bold shadow-[0_0_20px_rgba(45,212,191,0.4)]"
                : "glass text-slate-300 hover:text-white"
            }`}
          >
            {activeTab === "interns" && (
              <motion.span
                layoutId="activeTeamTab"
                className="absolute inset-0 rounded-full gradient-primary -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span>Internship Batch 1</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "interns" ? "bg-slate-950/20 text-slate-950" : "bg-white/10 text-slate-400"}`}>
              {interns.length}
            </span>
          </button>
        </div>

        {/* Core Team View */}
        {activeTab === "core" && (
          <div className="space-y-12">
            {/* Founder Spotlight Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              onClick={() => setSelectedMember(founder)}
              className="glass-card rounded-3xl p-8 sm:p-10 border border-teal-500/40 cursor-pointer group shadow-[0_0_40px_rgba(45,212,191,0.15)] relative overflow-hidden"
            >
              {/* Card Ambient Glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                {/* Founder Photo */}
                <div className="relative shrink-0">
                  <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-teal-400 via-cyan-400 to-amber-400 opacity-60 blur-md group-hover:opacity-100 transition-opacity" />
                  <img
                    src={founder.photo}
                    alt={founder.name}
                    className="relative w-48 h-56 sm:w-56 sm:h-64 object-cover rounded-2xl border-2 border-white/20 shadow-2xl"
                  />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="font-mono text-xs px-3 py-1 rounded-full gradient-primary text-slate-950 font-bold flex items-center gap-1 shadow-lg">
                      <Star className="w-3.5 h-3.5 fill-slate-950" /> Founder & Lead
                    </span>
                  </div>
                </div>

                {/* Founder Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                    <h2 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight">
                      {founder.name}
                    </h2>
                    <span className="font-mono text-xs px-3 py-1 rounded-md bg-teal-500/15 text-teal-300 border border-teal-500/30">
                      Team Lead
                    </span>
                  </div>

                  <p className="font-mono text-sm text-teal-300 mb-4">
                    {founder.role}
                  </p>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
                    {founder.bio}
                  </p>

                  {/* Skills with Logos */}
                  <div className="mb-6">
                    <div className="text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider">
                      Technical Skills & Stack:
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                      {founder.skills.map((skill) => (
                        <TechBadge key={skill} name={skill} />
                      ))}
                    </div>
                  </div>

                  {/* Highlights & Socials */}
                  <div className="flex flex-wrap items-center justify-center md:justify-between gap-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-5 text-xs font-mono text-slate-300">
                      <span className="flex items-center gap-1.5 text-teal-300">
                        <Code2 className="w-4 h-4" /> {founder.contributions}
                      </span>
                      <span className="flex items-center gap-1.5 text-amber-400">
                        <Trophy className="w-4 h-4" /> {founder.hackathons} Hackathons
                      </span>
                    </div>

                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      {founder.portfolio && (
                        <a
                          href={founder.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Portfolio"
                          className="w-9 h-9 rounded-full glass border border-white/15 flex items-center justify-center text-slate-300 hover:text-teal-300 hover:border-teal-400 transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                      {founder.linkedin && (
                        <a
                          href={founder.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="LinkedIn"
                          className="w-9 h-9 rounded-full glass border border-white/15 flex items-center justify-center text-slate-300 hover:text-teal-300 hover:border-teal-400 transition-colors"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                      {founder.instagram && (
                        <a
                          href={founder.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Instagram"
                          className="w-9 h-9 rounded-full glass border border-white/15 flex items-center justify-center text-slate-300 hover:text-teal-300 hover:border-teal-400 transition-colors"
                        >
                          <Instagram className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Other Core Members Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {others.map((member) => (
                <motion.div
                  key={member.name}
                  variants={cardVariants}
                  onClick={() => setSelectedMember(member)}
                  className="glass-card rounded-2xl p-6 cursor-pointer border border-white/10 hover:border-teal-400/40 transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    {/* Avatar & Info */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative shrink-0">
                        <div className="absolute -inset-1 rounded-full bg-teal-500/20 blur-sm group-hover:bg-teal-500/40 transition-colors" />
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="relative w-16 h-16 rounded-full object-cover border border-white/20 shadow-md"
                        />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-lg text-white group-hover:text-teal-300 transition-colors">
                          {member.name}
                        </h3>
                        <p className="font-mono text-xs text-teal-400 line-clamp-1">
                          {member.role.split("|")[0]}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300/80 leading-relaxed mb-4 line-clamp-3">
                      {member.bio}
                    </p>

                    {/* Skill Badges with Logos */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {member.skills.slice(0, 4).map((skill) => (
                        <TechBadge key={skill} name={skill} />
                      ))}
                      {member.skills.length > 4 && (
                        <span className="font-mono text-[10px] px-2 py-1 rounded-lg bg-white/5 text-slate-400 border border-white/10">
                          +{member.skills.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom: Stats + Socials */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1 text-teal-300/90 text-[11px]">
                      <Trophy className="w-3.5 h-3.5" /> {member.hackathons} Hackathons
                    </span>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {member.portfolio && member.portfolio !== "#" && (
                        <a
                          href={member.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Portfolio"
                          className="text-slate-400 hover:text-teal-300 transition-colors"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {member.linkedin && member.linkedin !== "#" && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="LinkedIn"
                          className="text-slate-400 hover:text-teal-300 transition-colors"
                        >
                          <Linkedin className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {member.instagram && member.instagram !== "#" && (
                        <a
                          href={member.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Instagram"
                          className="text-slate-400 hover:text-teal-300 transition-colors"
                        >
                          <Instagram className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Interns Tab View */}
        {activeTab === "interns" && (
          <div className="space-y-8">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="font-mono text-xs px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 inline-flex items-center gap-1.5 mb-2">
                <GraduationCap className="w-4 h-4" /> 12-Week Full Stack Program Completed
              </span>
              <p className="text-slate-300 text-sm">
                Engineers who completed our rigorous 12-Week Full-Stack Web Development internship program with verified project deliverables.
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5"
            >
              {interns.map((intern) => (
                <motion.div
                  key={intern.id}
                  variants={cardVariants}
                  className="glass-card rounded-2xl p-5 border border-white/10 hover:border-teal-400/40 text-center flex flex-col justify-between group"
                >
                  <div>
                    {/* Photo with glow */}
                    <div className="relative mx-auto w-24 h-24 mb-4">
                      <div className="absolute -inset-1 rounded-full bg-teal-500/20 blur-sm group-hover:bg-teal-500/50 transition-colors" />
                      <img
                        src={intern.photo}
                        alt={intern.name}
                        className="relative w-24 h-24 rounded-full object-cover border border-white/20 mx-auto shadow-md"
                      />
                    </div>

                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/5 text-teal-300 border border-white/10 mb-2 inline-block">
                      {intern.id}
                    </span>

                    <h4 className="font-display font-bold text-white text-base mb-1">
                      {intern.name}
                    </h4>

                    <p className="text-xs text-slate-400 font-mono mb-4">
                      Full-Stack Intern
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-center gap-3">
                    {intern.portfolio && (
                      <a
                        href={intern.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-slate-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Portfolio</span>
                      </a>
                    )}
                    {intern.linkedin && (
                      <a
                        href={intern.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-slate-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Member Detail Modal Dialog (Higher z-index to avoid Navbar overlap) */}
        <AnimatePresence>
          {selectedMember && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto pt-24 pb-12"
              onClick={() => setSelectedMember(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 320 }}
                className="glass-card rounded-3xl max-w-2xl w-full border border-white/15 p-6 sm:p-8 my-auto max-h-[85vh] overflow-y-auto shadow-[0_0_60px_rgba(45,212,191,0.25)] relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Top Glowing Laser Wire */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-teal-500 via-cyan-400 to-violet-500" />

                {/* Ambient Internal Glow */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-6">
                  {/* Header: Avatar, Roles & Close Button */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 sm:gap-5">
                      <div className="relative shrink-0">
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-teal-400 to-cyan-400 blur-sm opacity-70" />
                        <img
                          src={selectedMember.photo}
                          alt={selectedMember.name}
                          className="relative w-20 h-20 rounded-full object-cover border-2 border-teal-400 shadow-[0_0_20px_rgba(45,212,191,0.4)]"
                        />
                        <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-[10px] text-white">
                          ✓
                        </div>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          {selectedMember.isFounder && (
                            <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                              Founder & Lead
                            </span>
                          )}
                          <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300">
                            Verified Core Builder
                          </span>
                        </div>
                        <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                          {selectedMember.name}
                        </h3>
                        <p className="font-mono text-xs text-teal-300/80 mt-0.5">
                          {selectedMember.role}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedMember(null)}
                      className="w-10 h-10 rounded-full bg-slate-900/80 border border-white/15 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shrink-0 backdrop-blur-md"
                      aria-label="Close modal"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Quick Builder Metrics Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-center font-mono text-xs">
                    <div className="p-2 rounded-xl bg-teal-500/5">
                      <span className="text-slate-400 block text-[10px] uppercase">Hackathons</span>
                      <span className="font-bold text-teal-300 text-sm">{selectedMember.hackathons} Completed</span>
                    </div>
                    <div className="p-2 rounded-xl bg-cyan-500/5">
                      <span className="text-slate-400 block text-[10px] uppercase">Status</span>
                      <span className="font-bold text-cyan-300 text-sm">Active Builder</span>
                    </div>
                    <div className="p-2 rounded-xl bg-violet-500/5 col-span-2 sm:col-span-1">
                      <span className="text-slate-400 block text-[10px] uppercase">Ecosystem</span>
                      <span className="font-bold text-violet-300 text-sm">HackMates Platform</span>
                    </div>
                  </div>

                  {/* Biography */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 relative">
                    <h4 className="font-mono text-xs text-teal-300 uppercase tracking-wider mb-2 font-semibold">
                      Biography & Technical Focus
                    </h4>
                    <p className="text-slate-200 text-sm leading-relaxed">
                      {selectedMember.bio}
                    </p>
                  </div>

                  {/* Key Contributions & Accolades */}
                  <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-start gap-3 text-xs md:text-sm text-slate-200 font-mono">
                    <Award className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-teal-300 font-bold block mb-0.5">Signature Contributions</span>
                      <span>{selectedMember.contributions}</span>
                    </div>
                  </div>

                  {/* Skills Grid with Logos */}
                  <div>
                    <h4 className="font-mono text-xs text-teal-300 uppercase tracking-wider mb-3 font-semibold flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-teal-400" />
                      Core Technical Skills & Stack
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.skills.map((skill) => (
                        <TechBadge key={skill} name={skill} size="md" />
                      ))}
                    </div>
                  </div>

                  {/* Social & Portfolio Links */}
                  <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
                    {selectedMember.portfolio && selectedMember.portfolio !== "#" && (
                      <a
                        href={selectedMember.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 font-mono text-xs font-bold shadow-[0_0_20px_rgba(45,212,191,0.35)] hover:opacity-95 transition-all"
                      >
                        <Globe className="w-4 h-4" />
                        <span>View Portfolio</span>
                      </a>
                    )}
                    {selectedMember.linkedin && selectedMember.linkedin !== "#" && (
                      <a
                        href={selectedMember.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0077b5] hover:bg-[#006097] text-white font-mono text-xs font-bold transition-all shadow-md"
                      >
                        <Linkedin className="w-4 h-4" />
                        <span>Connect on LinkedIn</span>
                      </a>
                    )}
                    {selectedMember.instagram && selectedMember.instagram !== "#" && (
                      <a
                        href={selectedMember.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-mono text-xs font-bold transition-all shadow-md"
                      >
                        <Instagram className="w-4 h-4" />
                        <span>Instagram Profile</span>
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

export default TeamSection;
