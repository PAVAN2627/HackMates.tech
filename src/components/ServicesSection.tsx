import { motion } from "framer-motion";
import { ShoppingCart, Wrench, GraduationCap, Briefcase, Users, ArrowRight } from "lucide-react";

const services = [
  {
    icon: ShoppingCart,
    title: "Pre-Built Projects",
    description: "Ready-made academic projects with source code, documentation, and setup support.",
    features: ["Source code + docs", "Setup assistance", "Architecture walkthrough", "Diploma/BE/BTech ready"],
    highlight: "Popular",
    available: true,
  },
  {
    icon: Wrench,
    title: "Custom Development",
    description: "Custom academic projects, startup MVPs, and AI integrations tailored to your needs.",
    features: ["Custom academic projects", "Startup MVPs", "AI integrations", "College-compliant"],
    highlight: "Recommended",
    available: true,
  },
  {
    icon: GraduationCap,
    title: "Mentorship & Support",
    description: "Idea validation, tech stack guidance, pitch deck preparation, and demo support.",
    features: ["Idea validation", "Tech stack guidance", "Pitch deck prep", "Demo support"],
    highlight: "Available",
    available: true,
  },
  {
    icon: Briefcase,
    title: "Internship Program",
    description: "Hands-on internship opportunities to work on real projects and gain industry experience.",
    features: ["Real project experience", "Mentorship included", "Certificate provided", "Skill development"],
    highlight: "Coming Soon",
    available: false,
  },
  {
    icon: Users,
    title: "Workshops & Training",
    description: "Technical workshops on latest technologies, hackathon preparation, and skill-building sessions.",
    features: ["Tech workshops", "Hackathon prep", "Live coding sessions", "Industry insights"],
    highlight: "Coming Soon",
    available: false,
  },
];

const ServicesSection = () => (
  <section id="services" className="py-24">
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <p className="font-mono text-sm text-primary mb-3">services.list</p>
        <h2 className="text-4xl md:text-5xl font-bold font-display">
          How We <span className="gradient-text">Help</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {services.map((service, i) => (
          <motion.div
            key={service.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            whileHover={{ y: -8 }}
            className={`card-elevated rounded-xl p-6 hover:border-glow transition-all duration-300 flex flex-col relative overflow-hidden ${
              !service.available ? "opacity-75" : ""
            }`}
          >
            {/* Highlight badge */}
            <span className={`font-mono text-[10px] px-2.5 py-0.5 rounded-full self-start mb-4 ${
              service.available 
                ? "bg-accent/10 text-accent" 
                : "bg-muted text-muted-foreground"
            }`}>
              {service.highlight}
            </span>

            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-5">
              <service.icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">{service.title}</h3>
            <p className="text-sm text-muted-foreground mb-5 flex-1">{service.description}</p>
            <ul className="space-y-2.5 mb-5">
              {service.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {service.available ? (
              <a href="#contact" className="flex items-center gap-1 font-mono text-xs text-primary hover:gap-2 transition-all">
                Get Started <ArrowRight className="w-3 h-3" />
              </a>
            ) : (
              <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                Coming Soon
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
