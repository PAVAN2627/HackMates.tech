import { motion } from "framer-motion";
import { ExternalLink, Users, Zap } from "lucide-react";

const liveProjects = [
  {
    id: "LIVE-001",
    title: "HackMates",
    tagline: "Find Your Perfect Hackathon Teammate",
    description:
      "India's premier platform to discover hackathons, form teams, and connect with developers, designers, and innovators. Built and deployed by our team — live and growing.",
    url: "https://thehackmates.xyz",
    tech: ["React", "TypeScript", "Firebase", "Gemini AI"],
    stats: [
      { icon: Users, label: "Team Matching" },
      { icon: Zap, label: "Live Now" },
    ],
    badge: "🟢 Live",
  },
];

const LiveProjectsSection = () => {
  return (
    <div className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <p className="font-mono text-sm text-primary mb-3">projects.live</p>
        <h2 className="text-4xl md:text-5xl font-bold font-display">
          Our Live <span className="gradient-text">Products</span>
        </h2>
        <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
          Real platforms built by our team — live, deployed, and used by people right now.
        </p>
      </motion.div>

      <div className="max-w-3xl mx-auto">
        {liveProjects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="card-elevated rounded-2xl overflow-hidden hover:border-glow transition-all duration-300"
          >
            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="font-mono text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-400 mb-3 inline-block">
                    {project.badge}
                  </span>
                  <h3 className="font-display text-3xl font-bold text-foreground">{project.title}</h3>
                  <p className="font-mono text-sm text-primary mt-1">{project.tagline}</p>
                </div>
                <span className="font-mono text-xs px-2 py-1 rounded bg-primary/20 text-primary border border-primary/30 shrink-0">
                  {project.id}
                </span>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6">{project.description}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {project.tech.map((t) => (
                  <span key={t} className="font-mono text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 mb-6">
                {project.stats.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon className="w-4 h-4 text-primary" />
                    {label}
                  </div>
                ))}
              </div>

              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 gradient-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Visit {project.title}
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LiveProjectsSection;
