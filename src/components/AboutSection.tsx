import { motion, type Variants } from "framer-motion";
import { 
  Trophy, 
  Lightbulb, 
  Users, 
  Code, 
  Rocket, 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";
import LiveProjectsSection from "@/components/LiveProjectsSection";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};


const pillars = [
  { icon: Trophy, title: "Compete & Win", desc: "Top hackathon performance and strategic mentorship", color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30" },
  { icon: Lightbulb, title: "Innovate Relentlessly", desc: "From crazy midnight ideas to high-impact products", color: "from-teal-500/20 to-cyan-500/20 text-teal-400 border-teal-500/30" },
  { icon: Users, title: "Peer Collaboration", desc: "High-caliber developer community sharing real skills", color: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30" },
  { icon: Code, title: "Production Code", desc: "Clean architecture, modern stacks, and deployed apps", color: "from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/30" },
];

const services = [
  {
    icon: Rocket,
    title: "Pre-Built Projects",
    tag: "Diploma & Degree Ready",
    desc: "Complete academic and showcase software with clean source code, full documentation, system architecture, and 1-on-1 setup support.",
    features: ["Full Source Code + Docs", "One-Click Setup Assistance", "Viva & Presentation Prep"],
    color: "text-teal-400",
    bg: "from-teal-500/10 to-teal-500/0",
    border: "group-hover:border-teal-500/40",
  },
  {
    icon: Code,
    title: "Custom Development",
    tag: "MVP to Production",
    desc: "Turn your startup idea or academic concept into a functional, beautifully designed web or mobile application with AI integration.",
    features: ["Tailored Full-Stack Apps", "Startup MVPs & Prototypes", "Modern AI & LLM Integrations"],
    color: "text-cyan-400",
    bg: "from-cyan-500/10 to-cyan-500/0",
    border: "group-hover:border-cyan-500/40",
  },
  {
    icon: GraduationCap,
    title: "Mentorship & Guidance",
    tag: "1-on-1 Mentoring",
    desc: "Personalized tech stack advisory, system design reviews, pitch deck sharpening, and hackathon strategy from experienced builders.",
    features: ["Tech Stack Architecture", "Pitch & Presentation Coaching", "Code & Architecture Reviews"],
    color: "text-amber-400",
    bg: "from-amber-500/10 to-amber-500/0",
    border: "group-hover:border-amber-500/40",
  },
  {
    icon: Trophy,
    title: "Hackathon Acceleration",
    tag: "Competitive Arena",
    desc: "Team matching, hackathon sprints, idea validation, and winning execution tactics to dominate national & international hackathons.",
    features: ["Teammate Matchmaking", "Winning Execution Tactics", "Rapid Prototyping Sprints"],
    color: "text-orange-400",
    bg: "from-orange-500/10 to-orange-500/0",
    border: "group-hover:border-orange-500/40",
  },
  {
    icon: Users,
    title: "Internship Program",
    tag: "12-Week Immersive",
    desc: "Hands-on Full Stack and AI engineering internships. Work on live user-facing production projects with verified credential certification.",
    features: ["Real User-Facing Code", "Verified Certificate & Letter", "Weekly Code Reviews & Demos"],
    color: "text-indigo-400",
    bg: "from-indigo-500/10 to-indigo-500/0",
    border: "group-hover:border-indigo-500/40",
  },
  {
    icon: Lightbulb,
    title: "Workshops & Bootcamps",
    tag: "Live Interactive",
    desc: "Hands-on engineering workshops on Generative AI, cloud infrastructure, full-stack development, and competitive tech careers.",
    features: ["Hands-On Live Coding", "Career & Tech Roadmaps", "Interactive Q&A Sessions"],
    color: "text-rose-400",
    bg: "from-rose-500/10 to-rose-500/0",
    border: "group-hover:border-rose-500/40",
  },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-28 bg-background relative overflow-hidden">
      {/* Background Ambient Glows & Grid */}
      <div className="absolute inset-0 tech-grid-bg opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 rounded-full bg-teal-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 rounded-full bg-indigo-500/10 blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 font-mono text-xs uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>about.init()</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display tracking-tight text-white mb-4">
            Who <span className="gradient-text">We Are</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
            A developer collective born from the competitive pressure of hackathons, built to transform student ambition into industry-ready software.
          </p>
        </motion.div>

        {/* Main Brand Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-28">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 glass-card rounded-3xl p-8 sm:p-10 border border-white/10 relative overflow-hidden"
          >
            {/* Ambient card accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-teal-500/30 blur-sm" />
                <img 
                  src="/hackmatesroundlogo.png" 
                  alt="HackMates Logo" 
                  className="relative w-16 h-16 rounded-full object-cover border border-white/20"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold font-display text-white">
                  Hack<span className="text-teal-400">Mates</span>
                </h3>
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                  Student Innovation Ecosystem
                </p>
              </div>
            </div>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed mb-6 font-normal">
              HackMates is a collective of student developers who live and breathe hackathons. We don't just participate—we <span className="text-teal-300 font-semibold underline decoration-teal-500/50 underline-offset-4">code, strategize, compete, and deploy</span> real tech solutions that solve genuine problems.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-8 text-sm sm:text-base">
              Starting as a competitive hackathon crew, we expanded into a complete innovation hub supporting peers with production-ready projects, hands-on mentorship, and an ecosystem built for builders.
            </p>

            <div className="flex flex-wrap gap-2.5">
              {["Hackathons", "AI Engineering", "Full-Stack Web", "Peer Mentorship", "Verified Internships"].map((tag) => (
                <span
                  key={tag}
                  className="px-3.5 py-1.5 rounded-lg bg-white/[0.04] text-teal-300 text-xs font-mono border border-white/10 hover:border-teal-400/40 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* 4 Pillars Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  variants={itemVariants}
                  className="glass-card rounded-2xl p-6 group cursor-default"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pillar.color} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-display font-bold text-white text-lg mb-1.5 group-hover:text-teal-300 transition-colors">
                    {pillar.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {pillar.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* What We Offer Section */}
        <div className="mb-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-xs uppercase tracking-wider mb-4">
              <Target className="w-3.5 h-3.5" />
              <span>capabilities.list</span>
            </div>
            <h3 className="text-4xl sm:text-5xl font-bold font-display tracking-tight text-white mb-4">
              What We <span className="gradient-text">Offer</span>
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto text-base sm:text-lg">
              Engineered support for student developers, aspiring founders, and hackathon competitors at every milestone.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <motion.div key={service.title} variants={itemVariants}>
                  <Link
                    to={`/services?open=${encodeURIComponent(service.title)}`}
                    className={`block h-full glass-card rounded-2xl p-7 border border-white/10 ${service.border} transition-all duration-300 group relative overflow-hidden`}
                  >
                    {/* Background gradient hint */}
                    <div className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-br ${service.bg} rounded-full blur-2xl pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity`} />

                    {/* Tag badge */}
                    <div className="flex items-center justify-between gap-2 mb-6">
                      <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${service.color} group-hover:scale-110 transition-transform shadow-md`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                        {service.tag}
                      </span>
                    </div>

                    <h4 className="text-xl font-bold font-display text-white mb-2.5 group-hover:text-teal-300 transition-colors">
                      {service.title}
                    </h4>
                    <p className="text-sm text-slate-300/80 mb-6 leading-relaxed line-clamp-3">
                      {service.desc}
                    </p>

                    {/* Features checklist */}
                    <ul className="space-y-2 mb-6 pt-4 border-t border-white/5">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Action link */}
                    <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-teal-400 group-hover:text-teal-300 transition-colors">
                      <span>Learn more details</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Live Projects Section */}
        <LiveProjectsSection />

        {/* Modernized Call to Action Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
          className="relative mt-20"
        >
          <div className="relative glass-card rounded-3xl p-8 sm:p-14 border border-teal-500/30 overflow-hidden text-center max-w-4xl mx-auto shadow-[0_0_50px_rgba(45,212,191,0.15)]">
            {/* Ambient Aurora inside Card */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 font-mono text-xs uppercase tracking-wider mb-6">
              <Zap className="w-3.5 h-3.5" />
              <span>Let's collaborate</span>
            </div>

            <h3 className="text-3xl sm:text-5xl font-bold font-display text-white mb-4 tracking-tight">
              Ready to <span className="gradient-text">Build Something Great?</span>
            </h3>

            <p className="text-slate-300 mb-8 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
              Whether you are preparing for an upcoming hackathon, need a verified project, or want to partner with our developer collective—we are here to ship.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/projects"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl gradient-primary text-slate-950 font-mono text-sm font-bold hover:opacity-95 transition-all shadow-[0_0_20px_rgba(45,212,191,0.4)] hover-scale"
              >
                Browse Projects Catalog →
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl glass border border-white/20 hover:border-teal-400 text-white font-mono text-sm font-semibold transition-all hover-scale"
              >
                Get in Touch With Us
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
