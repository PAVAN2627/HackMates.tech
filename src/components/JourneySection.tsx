import { motion } from "framer-motion";
import { Trophy, Calendar, Award, TrendingUp, Medal, Star, ExternalLink } from "lucide-react";
import { useState } from "react";
import hackathonEvent1 from "@/assets/hackathon-event-1.jpg";
import hackathonEvent2 from "@/assets/hackathon-event-2.jpg";
import hackathonEvent3 from "@/assets/hackathon-event-3.jpg";

interface Milestone {
  year: string;
  month: string;
  title: string;
  event: string;
  description: string;
  result: "winner" | "finalist" | "participant" | "milestone";
  icon: typeof Trophy;
  image: string;
  project?: string;
  tech?: string[];
}

const milestones: Milestone[] = [
  {
    year: "2023",
    month: "Mar",
    title: "Team Formation",
    event: "HackMates Founded",
    description: "A group of passionate student developers came together with a vision to build, compete, and innovate. Started with 4 core members.",
    result: "milestone",
    icon: TrendingUp,
    image: hackathonEvent3,
  },
  {
    year: "2023",
    month: "Jul",
    title: "Smart India Hackathon",
    event: "SIH 2023 — Internal Round",
    description: "Cleared the internal round with an AI-powered agriculture monitoring system. Our first major hackathon experience.",
    result: "finalist",
    icon: Calendar,
    image: hackathonEvent1,
    project: "SmartFarm AI",
    tech: ["Python", "TensorFlow", "React"],
  },
  {
    year: "2023",
    month: "Nov",
    title: "First Hackathon Win 🏆",
    event: "CodeStorm 2023 — State Level",
    description: "Won first place at CodeStorm with an AI Resume Analyzer that impressed judges with real-time NLP processing and beautiful UX.",
    result: "winner",
    icon: Trophy,
    image: hackathonEvent2,
    project: "AI Resume Analyzer",
    tech: ["Python", "spaCy", "Flask", "React"],
  },
  {
    year: "2024",
    month: "Feb",
    title: "National Hackathon Circuit",
    event: "HackOverflow National",
    description: "Participated in 5+ national-level hackathons. Built CodeCollab — a real-time collaborative code editor with video chat.",
    result: "finalist",
    icon: Award,
    image: hackathonEvent1,
    project: "CodeCollab",
    tech: ["React", "WebRTC", "Socket.io"],
  },
  {
    year: "2024",
    month: "Aug",
    title: "Project Services Launch",
    event: "HackMates Platform",
    description: "Launched our project services — helping students with ready-made and custom tech projects. Started mentoring junior developers.",
    result: "milestone",
    icon: Star,
    image: hackathonEvent3,
  },
  {
    year: "2024",
    month: "Dec",
    title: "SIH 2024 Finalists",
    event: "Smart India Hackathon 2024",
    description: "Reached the national finals of SIH 2024 with MedPredict — a disease prediction platform using ML and patient history data.",
    result: "finalist",
    icon: Medal,
    image: hackathonEvent2,
    project: "MedPredict",
    tech: ["Python", "scikit-learn", "Streamlit"],
  },
  {
    year: "2025",
    month: "Jan",
    title: "Growing Community",
    event: "12+ Active Members",
    description: "Expanded to 12+ members with diverse skills across AI, Full-Stack, Cloud, and Design. Multiple hackathon wins under our belt.",
    result: "milestone",
    icon: TrendingUp,
    image: hackathonEvent1,
  },
];

const resultBadge = {
  winner: { label: "🏆 Winner", className: "bg-accent/20 text-accent" },
  finalist: { label: "🥈 Finalist", className: "bg-primary/20 text-primary" },
  participant: { label: "🎯 Participated", className: "bg-muted text-muted-foreground" },
  milestone: { label: "⭐ Milestone", className: "bg-secondary text-secondary-foreground" },
};

const JourneySection = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

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
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            From a small team of dreamers to hackathon winners — every milestone matters.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-accent/30 to-primary/50 md:-translate-x-px" />

          {milestones.map((m, i) => {
            const isExpanded = expandedIndex === i;
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
                    onClick={() => setExpandedIndex(isExpanded ? null : i)}
                    whileHover={{ scale: 1.02 }}
                    className="card-elevated rounded-xl overflow-hidden cursor-pointer hover:border-glow transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={m.image}
                        alt={m.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>

                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${badge.className}`}>
                          {badge.label}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {m.month} {m.year}
                        </span>
                      </div>
                      <p className="font-mono text-[10px] text-accent mb-1 uppercase tracking-wider">{m.event}</p>
                      <h3 className="font-display font-semibold text-foreground mb-2 text-left">{m.title}</h3>
                      <p className="text-sm text-muted-foreground text-left leading-relaxed">{m.description}</p>

                      {/* Expanded details */}
                      <motion.div
                        initial={false}
                        animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        {m.project && (
                          <div className="mt-4 pt-4 border-t border-border text-left">
                            <p className="font-mono text-xs text-primary mb-2">Project: {m.project}</p>
                            {m.tech && (
                              <div className="flex flex-wrap gap-1.5">
                                {m.tech.map((t) => (
                                  <span key={t} className="font-mono text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>

                      <p className="font-mono text-[10px] text-primary/50 mt-3 text-left">
                        {isExpanded ? "▲ Click to collapse" : "▼ Click for details"}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default JourneySection;
