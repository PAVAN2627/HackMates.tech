import { motion } from "framer-motion";
import { ArrowRight, Trophy, Users, Code, Sparkles, ChevronDown, Rocket, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function AnimatedCounter({ value, suffix = "+" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 1800;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(ease * value));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    const animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [value]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-[105vh] flex items-center justify-center overflow-hidden pt-28 pb-20">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105 filter brightness-75 contrast-125"
        >
          <source src="/videobackground.mp4" type="video/mp4" />
        </video>
        {/* Dark radial overlay for deep contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-background z-10" />
      </div>

      {/* Aurora Ambient Glow Effects */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {/* Teal glow */}
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full bg-teal-500/20 blur-[130px] animate-aurora-1" />
        {/* Cyan / Blue glow */}
        <div className="absolute top-1/3 -right-20 w-[450px] h-[450px] rounded-full bg-cyan-500/20 blur-[140px] animate-aurora-2" />
        {/* Violet / Amber accent glow */}
        <div className="absolute bottom-10 left-1/3 w-[400px] h-[400px] rounded-full bg-amber-500/15 blur-[120px] animate-aurora-1" />
      </div>

      {/* Tech Grid Pattern */}
      <div className="absolute inset-0 tech-grid-bg opacity-30 pointer-events-none z-10" />

      {/* Main Content */}
      <div className="container mx-auto px-6 relative z-20 text-center max-w-5xl">
        {/* Live Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass border border-teal-500/30 text-xs font-mono text-teal-300 mb-8 shadow-[0_0_20px_rgba(45,212,191,0.2)] hover:border-teal-400 transition-all cursor-default"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
          </span>
          <span className="font-semibold tracking-wide">STUDENT HACKATHON & INNOVATION PLATFORM</span>
          <span className="text-white/40">|</span>
          <span className="text-amber-400 flex items-center gap-1 font-sans font-medium">
            <Flame className="w-3.5 h-3.5" /> India
          </span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold font-display tracking-tight mb-6 leading-[1.05]"
        >
          <span className="gradient-text drop-shadow-[0_0_40px_rgba(45,212,191,0.4)]">Hack</span>
          <span className="text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)]">Mates</span>
        </motion.h1>

        {/* Tagline / Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-lg sm:text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto mb-6 font-normal leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
        >
          Where bold student ideas evolve into <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-300 to-amber-300 font-semibold">real-world software products</span> through hackathons, peer mentorship, and relentless engineering.
        </motion.p>

        {/* Action Tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-mono text-slate-300/80 mb-10"
        >
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/5 border border-white/10">
            <Code className="w-3.5 h-3.5 text-teal-400" />
            <span>Full-Stack & AI</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/5 border border-white/10">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Hackathon Winners</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/5 border border-white/10">
            <Rocket className="w-3.5 h-3.5 text-cyan-400" />
            <span>Live Products</span>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link
            to="/projects"
            className="w-full sm:w-auto relative group overflow-hidden rounded-xl p-[1px] focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
            <span className="relative flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-950 font-mono text-sm font-semibold text-white group-hover:bg-slate-900 transition-colors">
              Explore Our Projects
              <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1.5 transition-transform" />
            </span>
          </Link>

          <Link
            to="/contact"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl glass border border-white/20 hover:border-teal-400/50 hover:bg-white/10 text-white font-mono text-sm font-semibold transition-all hover:-translate-y-0.5 shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Get in Touch / Collaborate
          </Link>
        </motion.div>

        {/* Stats Grid with Frosted Glass & Spring Counters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {[
            { label: "Hackathons", value: 10, suffix: "+", icon: Trophy, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
            { label: "Projects Built", value: 15, suffix: "+", icon: Code, color: "text-teal-400", bg: "bg-teal-400/10 border-teal-400/20" },
            { label: "Core Engineers", value: 7, suffix: "+", icon: Users, color: "text-cyan-400", bg: "bg-cyan-400/10 border-cyan-400/20" },
            { label: "Community Builders", value: 500, suffix: "+", icon: Rocket, color: "text-indigo-400", bg: "bg-indigo-400/10 border-indigo-400/20" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.85 + i * 0.1 }}
              className="glass-card rounded-2xl p-5 text-center group cursor-default"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} border flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="font-mono text-xs text-slate-400 mt-1 uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

