import { motion } from "framer-motion";
import { ExternalLink, Users, Zap, ShieldCheck, Sparkles, ArrowUpRight } from "lucide-react";

const liveProjects = [
  {
    id: "PROD-001",
    title: "HackMates Platform",
    tagline: "Find Your Ideal Hackathon Teammate & Squad",
    description:
      "India's dedicated platform designed to discover active hackathons, form complementary teams across tech and design, and connect ambitious builders. Designed, architected, and deployed by our student team.",
    url: "https://thehackmates.xyz",
    tech: ["React 18", "TypeScript", "Firebase Auth & Firestore", "Gemini AI"],
    stats: [
      { icon: Users, label: "Automated Teammate Matching" },
      { icon: Zap, label: "Live Deployment" },
      { icon: ShieldCheck, label: "Verified Student Network" },
    ],
    badge: "Live in Production",
  },
];

const LiveProjectsSection = () => {
  return (
    <div className="py-20 relative">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-14"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-xs uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>production.deployed</span>
        </div>
        <h3 className="text-4xl sm:text-5xl font-bold font-display text-white tracking-tight mb-3">
          Our Live <span className="gradient-text">Platforms</span>
        </h3>
        <p className="text-muted-foreground max-w-lg mx-auto text-base">
          Real software platforms built and shipped by our team—active, hosted, and serving real users.
        </p>
      </motion.div>

      <div className="max-w-4xl mx-auto">
        {liveProjects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.15, duration: 0.6 }}
            className="glass-card rounded-3xl p-8 sm:p-12 border border-emerald-500/30 relative overflow-hidden group shadow-[0_0_40px_rgba(16,185,129,0.1)]"
          >
            {/* Top Right Live Beacon */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs mb-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>{project.badge}</span>
                </div>
                <h4 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  {project.title}
                </h4>
                <p className="font-mono text-sm text-teal-300 mt-1">
                  {project.tagline}
                </p>
              </div>

              <span className="font-mono text-xs px-3 py-1 rounded-md bg-white/5 text-slate-400 border border-white/10 shrink-0">
                {project.id}
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed mb-8 text-base">
              {project.description}
            </p>

            {/* Tech badges */}
            <div className="flex flex-wrap gap-2 mb-8">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="font-mono text-xs px-3.5 py-1.5 rounded-lg bg-white/[0.04] text-slate-200 border border-white/10 group-hover:border-teal-400/30 transition-colors"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Features/Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 pt-6 border-t border-white/10">
              {project.stats.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs font-mono text-slate-300">
                  <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {/* Launch CTA */}
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl gradient-primary text-slate-950 font-mono text-sm font-bold shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:opacity-95 transition-all hover-scale"
            >
              <span>Launch {project.title}</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LiveProjectsSection;
