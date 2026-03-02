import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Wrench, GraduationCap, Briefcase, Users, ArrowRight, Trophy, X, MessageCircle, Mail } from "lucide-react";
import { useState } from "react";

interface Service {
  icon: typeof ShoppingCart;
  title: string;
  description: string;
  features: string[];
  highlight: string;
  detailedInfo?: {
    fullDescription: string;
    pricing: string;
    terms: string[];
    support: string;
  };
}

const services: Service[] = [
  {
    icon: ShoppingCart,
    title: "Pre-Built Projects",
    description: "Ready-made academic projects with source code, documentation, and setup support.",
    features: ["Source code + docs", "Setup assistance", "Architecture walkthrough", "Diploma/BE/BTech ready"],
    highlight: "Popular",
    detailedInfo: {
      fullDescription: "Get ready-made academic projects with complete source code, comprehensive documentation, and full setup support. Perfect for Diploma, BE, and BTech students looking for quality projects.",
      pricing: "Fixed cost based on project domain and complexity",
      terms: [
        "No major changes allowed in pre-built projects",
        "Minor bug fixes and error resolution included",
        "Full mentorship provided for any issues",
        "Complete documentation and setup guide included",
      ],
      support: "If you encounter any errors or need assistance, we provide full mentorship to help you understand and resolve issues.",
    },
  },
  {
    icon: Wrench,
    title: "Custom Development",
    description: "Custom academic projects, startup MVPs, and AI integrations tailored to your needs.",
    features: ["Custom academic projects", "Startup MVPs", "AI integrations", "College-compliant"],
    highlight: "Recommended",
    detailedInfo: {
      fullDescription: "Get fully customized projects built from scratch according to your specific requirements. Perfect for academic projects, startup MVPs, and AI integrations tailored to your exact needs.",
      pricing: "Price depends on project domain and data complexity - Fixed after initial discussion",
      terms: [
        "Development time: 2 to 3 weeks",
        "Changes allowed only within the development period",
        "Requirements must be finalized before development starts",
        "Full mentorship provided till project completion",
        "Regular updates and progress tracking included",
      ],
      support: "We provide complete mentorship throughout the development process and continue support until your project is successfully completed and deployed.",
    },
  },
  {
    icon: GraduationCap,
    title: "Mentorship & Support",
    description: "Idea validation, tech stack guidance, pitch deck preparation, and demo support.",
    features: ["Idea validation", "Tech stack guidance", "Pitch deck prep", "Demo support"],
    highlight: "Available",
    detailedInfo: {
      fullDescription: "Get expert mentorship on project development, career guidance, and technical support. We help you validate ideas, choose the right tech stack, prepare pitch decks, and provide demo support for your projects.",
      pricing: "Available for interns and community members - Contact for details",
      terms: [
        "Mentorship provided to interns as part of internship program",
        "Also available to HackMates community members",
        "Includes project guidance and career counseling",
        "One-on-one sessions for personalized support",
        "Regular follow-ups and progress tracking",
      ],
      support: "Whether you're an intern or part of our community, we provide comprehensive mentorship to help you succeed in your projects and career goals.",
    },
  },
  {
    icon: Trophy,
    title: "Hackathon",
    description: "Organizing hackathons, team formation, project ideation, judging mentorship, and technical guidance for success.",
    features: ["Hackathon organizing", "Judging & mentorship", "Team matching", "Technical guidance"],
    highlight: "New",
    detailedInfo: {
      fullDescription: "We are planning to organize hackathons and provide comprehensive support including team formation, project ideation, judging mentorship, and technical guidance to help participants succeed.",
      pricing: "Stay tuned for updates on upcoming hackathons",
      terms: [
        "We are thinking of organizing hackathons - Stay tuned!",
        "Team formation and matching services",
        "Project ideation and technical guidance",
        "Judging and mentorship support",
        "Follow us for announcements and updates",
      ],
      support: "Keep an eye on our announcements for upcoming hackathon events. We'll provide complete support from team formation to final presentation!",
    },
  },
  {
    icon: Briefcase,
    title: "Internship Program",
    description: "Hands-on internship opportunities to work on real projects and gain industry experience.",
    features: ["Real project experience", "Mentorship included", "Certificate provided", "Skill development"],
    highlight: "New Launch",
    detailedInfo: {
      fullDescription: "We are currently planning to offer internship opportunities for Diploma students. Get hands-on experience with real-world projects and industry-standard practices.",
      pricing: "Contact us for pricing, syllabus, and detailed information",
      terms: [
        "12-week internship program",
        "Focus: Full Stack Web Development",
        "Designed specifically for Diploma students",
        "Hands-on project experience included",
        "Certificate of completion provided",
        "Mentorship throughout the program",
      ],
      support: "For detailed information about internship pricing, complete syllabus, and enrollment process, please contact us via WhatsApp or Email.",
    },
  },
  {
    icon: Users,
    title: "Workshops & Training",
    description: "Technical workshops on latest technologies, hackathon preparation, and skill-building sessions.",
    features: ["Tech workshops", "Hackathon prep", "Live coding sessions", "Industry insights"],
    highlight: "New Launch",
    detailedInfo: {
      fullDescription: "We conduct hands-on workshops on latest technologies including AI, career guidance sessions, and technical training. Our workshops are designed to provide practical knowledge and real-world skills.",
      pricing: "Contact us for workshop schedules and pricing details",
      terms: [
        "Hands-on technical workshops",
        "Career guidance and counseling sessions",
        "Latest technologies including AI/ML",
        "Interactive live coding sessions",
        "Industry best practices and insights",
        "Certificate of participation provided",
      ],
      support: "For more information about upcoming workshops, topics covered, schedules, and pricing, please reach out to us via WhatsApp or Email.",
    },
  },
];

const ServicesSection = () => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  return (
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
            className="card-elevated rounded-xl p-6 hover:border-glow transition-all duration-300 flex flex-col relative overflow-hidden"
          >
            {/* Highlight badge */}
            <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full self-start mb-4 bg-accent/10 text-accent">
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
            {service.detailedInfo ? (
              <button
                onClick={() => setSelectedService(service)}
                className="flex items-center gap-1 font-mono text-xs text-primary hover:gap-2 transition-all"
              >
                Click here for Info <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <a href="/contact" className="flex items-center gap-1 font-mono text-xs text-primary hover:gap-2 transition-all">
                Click here for Info <ArrowRight className="w-3 h-3" />
              </a>
            )}
          </motion.div>
        ))}
      </div>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService && selectedService.detailedInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4"
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="card-elevated rounded-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                      <selectedService.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-accent uppercase tracking-wider block mb-1">
                        {selectedService.highlight}
                      </span>
                      <h3 className="font-display text-xl font-bold text-foreground">{selectedService.title}</h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedService(null)}
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  {selectedService.detailedInfo.fullDescription}
                </p>

                <div className="mb-6">
                  <h4 className="font-mono text-xs text-primary mb-3 uppercase tracking-wider">Pricing</h4>
                  <p className="text-sm text-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                    {selectedService.detailedInfo.pricing}
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className="font-mono text-xs text-primary mb-3 uppercase tracking-wider">Terms & Conditions</h4>
                  <div className="space-y-2">
                    {selectedService.detailedInfo.terms.map((term, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
                        {term}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-mono text-xs text-primary mb-3 uppercase tracking-wider">Support</h4>
                  <p className="text-sm text-foreground bg-accent/5 p-3 rounded-lg border border-accent/10">
                    {selectedService.detailedInfo.support}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center mb-3">
                    Interested in this service? Contact us:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href={`https://wa.me/917249830281?text=Hi, I need more information about ${selectedService.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp Now
                    </a>
                    <a
                      href={`mailto:hackmates.tech@gmail.com?subject=Inquiry about ${selectedService.title}`}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </a>
                  </div>
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

export default ServicesSection;
