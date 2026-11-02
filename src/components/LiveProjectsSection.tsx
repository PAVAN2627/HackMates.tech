import { motion } from "framer-motion";
import { ExternalLink, Users, Zap, ShieldCheck, Sparkles, ArrowUpRight, Globe, Lock } from "lucide-react";

interface LiveProject {
  id: string;
  title: string;
  tagline: string;
  description: string;
  url: string;
  ctaLabel: string;
  badge: string;
  tech: string[];
  modules: {
    icon: typeof Globe;
    title: string;
    desc: string;
  }[];
}

const liveProjects: LiveProject[] = [
  {
    id: "PROD-001",
    title: "Official E-Governance Portal — Wai Municipal Council",
    tagline: "Government Tech / Enterprise Web Application",
    description:
      "An enterprise-scale e-governance platform engineered for Wai Municipal Council. Delivers citizen-first digital services with online civic applications and real-time grievance tracking, while empowering municipal administration and staff with secure role-based workflow automation and high-performance caching infrastructure.",
    url: "https://waimunicipalcouncil.org",
    ctaLabel: "Launch Wai Municipal Portal",
    badge: "Live in Production",
    tech: [
      "React",
      "TypeScript",
      "Tailwind CSS",
      "NestJS",
      "PostgreSQL",
      "Redis",
      "Nginx",
      "Oracle Cloud",
      "Cloudflare R2",
    ],
    modules: [
      {
        icon: Globe,
        title: "Citizen Portal",
        desc: "Online civic applications, grievance lodging & live status tracking.",
      },
      {
        icon: Lock,
        title: "Admin & Staff Portals",
        desc: "Role-based municipal workflow & complaint resolution.",
      },
      {
        icon: Zap,
        title: "High-Performance Architecture",
        desc: "Sub-second response times with Redis caching & Cloudflare R2 cloud storage.",
      },
    ],
  },
  {
    id: "PROD-002",
    title: "HackMates Platform",
    tagline: "Find Your Ideal Hackathon Teammate & Squad",
    description:
      "India's dedicated platform designed to discover active hackathons, form complementary teams across tech and design, and connect ambitious builders. Designed, architected, and deployed by our student team.",
    url: "https://thehackmates.xyz",
    ctaLabel: "Launch HackMates Platform",
    badge: "Live in Production",
    tech: ["React 18", "TypeScript", "Firebase Auth & Firestore", "Gemini AI"],
    modules: [
      {
        icon: Users,
        title: "Teammate Matching",
        desc: "Automated synergy-driven team & squad formation across tech and design.",
      },
      {
        icon: Zap,
        title: "Live Deployment",
        desc: "Continuous production platform serving student innovators & hackathon squads.",
      },
      {
        icon: ShieldCheck,
        title: "Verified Student Network",
        desc: "4-tier reliability trust scoring, authenticated profiles & real-time messaging.",
      },
    ],
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

      <div className="max-w-4xl mx-auto space-y-8">
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
                <h4 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
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

            {/* Key Modules */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 pt-6 border-t border-white/10">
              {project.modules.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="font-mono text-xs font-semibold text-white tracking-wide">
                      {title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans pl-8 sm:pl-0">
                    {desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Launch CTA */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl gradient-primary text-slate-950 font-mono text-sm font-bold shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:opacity-95 transition-all hover-scale"
              >
                <span>{project.ctaLabel}</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-slate-400 hover:text-teal-300 transition-colors flex items-center gap-1.5"
              >
                <span>{project.url.replace(/^https?:\/\//, "")}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LiveProjectsSection;
