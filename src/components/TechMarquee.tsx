import { motion } from "framer-motion";
import { 
  Code2, 
  Terminal, 
  Cpu, 
  Layers, 
  Database, 
  Sparkles, 
  Flame, 
  GitBranch, 
  Boxes, 
  Server,
  Workflow,
  ShieldCheck
} from "lucide-react";

const techStack = [
  { name: "React 18", category: "Frontend", icon: Code2, color: "text-cyan-400" },
  { name: "TypeScript", category: "Language", icon: Terminal, color: "text-blue-400" },
  { name: "Python", category: "AI & Backend", icon: Cpu, color: "text-amber-400" },
  { name: "Gemini AI", category: "GenAI", icon: Sparkles, color: "text-teal-400" },
  { name: "Firebase", category: "Cloud & Auth", icon: Flame, color: "text-amber-500" },
  { name: "Tailwind CSS", category: "Styling", icon: Layers, color: "text-sky-400" },
  { name: "Next.js", category: "Full-Stack", icon: Workflow, color: "text-white" },
  { name: "PostgreSQL", category: "Database", icon: Database, color: "text-indigo-400" },
  { name: "Docker", category: "DevOps", icon: Boxes, color: "text-blue-500" },
  { name: "Git & GitHub", category: "VCS", icon: GitBranch, color: "text-orange-400" },
  { name: "Node.js", category: "Runtime", icon: Server, color: "text-emerald-400" },
  { name: "Secure APIs", category: "Security", icon: ShieldCheck, color: "text-teal-300" },
];

export const TechMarquee = () => {
  // Duplicate for seamless infinite loop
  const duplicatedTech = [...techStack, ...techStack];

  return (
    <section className="relative py-12 overflow-hidden border-y border-white/5 bg-slate-950/60 backdrop-blur-md">
      {/* Ambient glow behind marquee */}
      <div className="absolute inset-x-0 -top-12 h-24 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

      {/* Edge gradient masks for smooth fade */}
      <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />

      <div className="container mx-auto px-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Technologies & Ecosystem Stack
          </span>
        </div>
        <p className="font-mono text-xs text-primary/80">
          Built for hackathon velocity & production scale
        </p>
      </div>

      <div className="flex overflow-hidden select-none">
        <div className="animate-marquee flex items-center gap-4 py-2">
          {duplicatedTech.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={`${item.name}-${index}`}
                className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-primary/40 hover:bg-white/[0.06] transition-all cursor-default group"
              >
                <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors">
                    {item.name}
                  </div>
                  <div className="text-[11px] font-mono text-muted-foreground">
                    {item.category}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TechMarquee;
