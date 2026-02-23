import { motion } from "framer-motion";
import { ArrowDown, Zap, Trophy, Users, Code } from "lucide-react";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-40 dark:opacity-50"
        >
          <source src="/cinematic-hackathon-scene-generation_3sPFUDst.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
      </div>

      {/* Animated particles overlay */}
      <div className="absolute inset-0 particles-bg pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-8xl lg:text-9xl font-bold font-display mb-6 leading-none"
        >
          <span className="gradient-text">Hack</span>
          <span className="text-foreground">Mates</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 font-light leading-relaxed"
        >
          Where ideas transform into impactful products through hackathons,
          collaboration, and relentless building.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="font-mono text-xs text-primary/60 mb-12 flex items-center justify-center gap-2"
        >
          <Code className="w-3 h-3" />
          <span>Build</span>
          <span className="text-accent">•</span>
          <span>Compete</span>
          <span className="text-accent">•</span>
          <span>Innovate</span>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-wrap justify-center gap-4 mb-20"
        >
          <a
            href="#projects"
            className="gradient-primary text-primary-foreground font-mono text-sm px-8 py-3.5 rounded-lg hover:opacity-90 transition-all border-glow hover-scale"
          >
            Explore Projects →
          </a>
          <a
            href="#contact"
            className="border border-primary/50 text-primary font-mono text-sm px-8 py-3.5 rounded-lg hover:bg-primary/10 transition-all hover-scale"
          >
            Join the Team
          </a>
        </motion.div>

        {/* Stats with animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {[
            { icon: Trophy, label: "Hackathons", value: "15+" },
            { icon: Zap, label: "Projects", value: "30+" },
            { icon: Users, label: "Members", value: "12+" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + i * 0.15 }}
              className="text-center group"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/20 transition-colors">
                <stat.icon className="w-5 h-5 text-accent" />
              </div>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="font-mono text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="mt-20"
        >
          <ArrowDown className="w-5 h-5 text-muted-foreground/50 mx-auto" />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
