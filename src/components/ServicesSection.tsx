import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, 
  Wrench, 
  GraduationCap, 
  Briefcase, 
  Users, 
  ArrowRight, 
  Trophy, 
  X, 
  MessageCircle, 
  Mail, 
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  HelpCircle
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

interface Service {
  id: string;
  icon: typeof ShoppingCart;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  highlight: string;
  highlightType: "popular" | "recommended" | "new" | "available";
  detailedInfo: {
    fullDescription: string;
    pricing: string;
    deliveryTime?: string;
    terms: string[];
    support: string;
    brochure?: string;
  };
}

const services: Service[] = [
  {
    id: "pre-built-projects",
    icon: ShoppingCart,
    title: "Pre-Built Projects",
    tagline: "Academic Ready & Complete Source Code",
    description: "Battle-tested academic software projects with complete source code, comprehensive documentation, and guided setup assistance.",
    features: [
      "Full source code + documentation PDF",
      "Live environment setup assistance",
      "System architecture & schema walkthrough",
      "Diploma, BE, & BTech college compliant"
    ],
    highlight: "Popular",
    highlightType: "popular",
    detailedInfo: {
      fullDescription: "Access battle-tested academic projects equipped with production-quality codebases, detailed IEEE format documentation, and interactive setup assistance. Built to help students excel in practical evaluations without starting from scratch.",
      pricing: "Fixed budget-friendly cost based on project domain and stack complexity.",
      deliveryTime: "Instant delivery (within 2 hours of confirmation)",
      terms: [
        "Delivered with complete source code and schema documentation",
        "Includes setup assistance and environment verification",
        "Minor bug fixes and local dependency resolution included",
        "Complete viva voce & architecture walkthrough guide provided",
      ],
      support: "Encountering dependency or setup errors? Our engineering mentors guide you 1-on-1 until your project runs smoothly on your machine.",
    },
  },
  {
    id: "custom-development",
    icon: Wrench,
    title: "Custom Development",
    tagline: "Startup MVPs & Bespoke Software",
    description: "Custom academic projects, startup MVPs, and generative AI integrations tailored to your exact specifications.",
    features: [
      "Bespoke academic & startup MVPs",
      "Full-stack web & mobile architecture",
      "AI/ML & API integrations (Gemini, Vertex)",
      "Strict college & industry compliant standards"
    ],
    highlight: "Recommended",
    highlightType: "recommended",
    detailedInfo: {
      fullDescription: "Turn your unique concept into a functional, production-ready product. From diploma capstones to venture-backed MVPs, we architect tailored solutions with clean code, modern UX, and robust backend pipelines.",
      pricing: "Custom quote based on scope, APIs, and timeline — agreed upfront with no hidden costs.",
      deliveryTime: "2 to 3 weeks depending on technical complexity",
      terms: [
        "Iterative development with weekly progress reviews & demos",
        "Requirements frozen after initial architecture agreement",
        "Source code repository access with continuous integration",
        "Complete handover with deployment on Vercel/Render/Firebase",
      ],
      support: "Full technical mentorship throughout the build cycle and post-launch support until final viva or client handover.",
    },
  },
  {
    id: "internship-program",
    icon: Briefcase,
    title: "Internship Program",
    tagline: "12-Week MERN Stack Immersion",
    description: "Hands-on engineering internships for students to build production apps, learn modern stacks, and graduate with industry-ready proof of work.",
    features: [
      "12-week structured MERN stack curriculum",
      "Work on live HackMates products",
      "Verifiable certificate with QR verification",
      "Mentorship from experienced hackathon winners"
    ],
    highlight: "Batch #2 Open",
    highlightType: "new",
    detailedInfo: {
      fullDescription: "Following the resounding success of Internship Batch #1, HackMates offers an intensive 12-week practical internship focused on React, Node.js, Express, MongoDB, RESTful APIs, Git workflows, and cloud deployments.",
      pricing: "Affordable student fee. Includes full curriculum, project code reviews, and certificate.",
      deliveryTime: "12 Weeks (Flexible evening/weekend slots for college students)",
      terms: [
        "Hands-on project deliverables evaluated weekly",
        "Direct code reviews and architecture guidance",
        "100% attendance & capstone submission for certificate issuance",
        "Public portfolio & LinkedIn credential support",
      ],
      support: "Daily doubt clearing channels, dedicated mentor syncs, and career guidance for off-campus placements.",
      brochure: "/Program broucher.pdf",
    },
  },
  {
    id: "mentorship-support",
    icon: GraduationCap,
    title: "Mentorship & Guidance",
    tagline: "1-on-1 Engineering & Career Coaching",
    description: "Idea validation, tech stack advisory, pitch deck preparation, and live demo support for hackathons and college reviews.",
    features: [
      "Hackathon pitch deck & problem validation",
      "Modern tech stack selection roadmap",
      "System design & code review sessions",
      "Mock presentation & viva preparation"
    ],
    highlight: "Available",
    highlightType: "available",
    detailedInfo: {
      fullDescription: "Gain clarity from builders who have won national hackathons and shipped real products. We help you refine your product pitch, fix architectural bottlenecks, and present with confidence.",
      pricing: "Free for HackMates interns & active community members. Custom slots for external teams.",
      deliveryTime: "Book on-demand 45-min or 60-min sessions",
      terms: [
        "Personalized one-on-one Google Meet sessions",
        "Review of codebases, slide decks, and demo flows",
        "Actionable feedback and curated resource roadmaps",
      ],
      support: "Ongoing guidance via our community Discord and WhatsApp developer channels.",
    },
  },
  {
    id: "hackathon-services",
    icon: Trophy,
    title: "Hackathon Solutions",
    tagline: "Organizing & Community Partnering",
    description: "End-to-end hackathon organizing, intelligent team formation, problem statement curation, and judging mentorship.",
    features: [
      "Hackathon platform & team synergy matching",
      "Problem statement & rubrics design",
      "Experienced technical judges & mentors",
      "Community outreach across colleges"
    ],
    highlight: "Ecosystem",
    highlightType: "new",
    detailedInfo: {
      fullDescription: "Partner with HackMates to host electrifying hackathons. From launching the portal and matching solo participants into balanced squads, to providing experienced mentors and automated rubric judging.",
      pricing: "Institutional & club partnership models available upon inquiry.",
      deliveryTime: "Tailored around your event schedule",
      terms: [
        "Branded discovery and registration portal",
        "Synergy matching algorithm for optimal hacker teams",
        "Live mentorship sessions during 24hr / 48hr hackathons",
      ],
      support: "Dedicated technical coordinator available 24/7 during event runtime.",
    },
  },
  {
    id: "workshops-training",
    icon: Users,
    title: "Workshops & Bootcamps",
    tagline: "Hands-on Technical Masterclasses",
    description: "Interactive college workshops on generative AI, full-stack development, Git collaboration, and modern dev tools.",
    features: [
      "Hands-on AI & Web Dev workshops",
      "Real-time live coding & deployment",
      "Interactive quiz with swags & rewards",
      "Verifiable certificates of participation"
    ],
    highlight: "Campus Ready",
    highlightType: "recommended",
    detailedInfo: {
      fullDescription: "We bring high-energy, practical workshops directly to engineering and diploma campuses (e.g. ABIT Shendre AI Workshop). No dry theory — students write code, deploy live apps, and earn recognized credentials.",
      pricing: "Flexible institutional and student-club packages available.",
      deliveryTime: "1-Day (4-6 Hours) or 2-Day intensive bootcamps",
      terms: [
        "Customized curriculum based on department requirements",
        "Prerequisite setup guides distributed in advance",
        "Post-workshop project templates and certificate verification",
      ],
      support: "Complete event co-ordination, slide decks, and ongoing learner community support.",
    },
  },
];

const highlightBadges = {
  popular: "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]",
  recommended: "bg-teal-500/15 border-teal-500/40 text-teal-300 shadow-[0_0_12px_rgba(45,212,191,0.25)]",
  new: "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]",
  available: "bg-violet-500/15 border-violet-500/40 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.25)]",
};

export const ServicesSection = () => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const open = searchParams.get("open");
    if (open) {
      const match = services.find(
        (s) => s.title.toLowerCase() === decodeURIComponent(open).toLowerCase() || s.id === open.toLowerCase()
      );
      if (match) setSelectedService(match);
    }
  }, [searchParams]);

  return (
    <section id="services" className="relative py-20 lg:py-28 overflow-hidden bg-transparent">
      {/* Ambient Aurora Glow Spheres */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute top-1/4 -left-48 w-[520px] h-[520px] bg-teal-500/10 rounded-full blur-[130px] animate-aurora-1" 
      />
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute bottom-1/4 -right-48 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-aurora-2" 
      />

      {/* Cyber Grid Texture Overlay */}
      <div className="absolute inset-0 tech-grid-bg opacity-20 pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 font-mono text-xs shadow-[0_0_15px_rgba(45,212,191,0.2)] mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>services.solutions</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-white mb-4"
          >
            Engineering <span className="gradient-text">Services</span> & Solutions
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 max-w-2xl mx-auto text-base md:text-lg leading-relaxed"
          >
            From turnkey academic software projects and custom startup MVPs to hands-on 12-week engineering internships and university tech workshops.
          </motion.p>

          {/* Value Propositions Strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mt-10"
          >
            <div className="p-4 rounded-xl glass-card border border-white/10 text-center">
              <div className="flex items-center justify-center gap-1.5 text-teal-300 font-display text-xl font-bold">
                <ShieldCheck className="w-5 h-5 text-teal-400" />
                <span>100% Tested</span>
              </div>
              <p className="font-mono text-[11px] text-slate-400 mt-1 uppercase tracking-wider">Clean Architecture</p>
            </div>

            <div className="p-4 rounded-xl glass-card border border-white/10 text-center">
              <div className="flex items-center justify-center gap-1.5 text-cyan-300 font-display text-xl font-bold">
                <Clock className="w-5 h-5 text-cyan-400" />
                <span>2-3 Weeks</span>
              </div>
              <p className="font-mono text-[11px] text-slate-400 mt-1 uppercase tracking-wider">Fast Turnaround</p>
            </div>

            <div className="p-4 rounded-xl glass-card border border-white/10 text-center">
              <div className="flex items-center justify-center gap-1.5 text-amber-400 font-display text-xl font-bold">
                <Users className="w-5 h-5 text-amber-400" />
                <span>1-on-1 Mentors</span>
              </div>
              <p className="font-mono text-[11px] text-slate-400 mt-1 uppercase tracking-wider">Personalized Support</p>
            </div>

            <div className="p-4 rounded-xl glass-card border border-white/10 text-center">
              <div className="flex items-center justify-center gap-1.5 text-violet-400 font-display text-xl font-bold">
                <Zap className="w-5 h-5 text-violet-400" />
                <span>Compliant</span>
              </div>
              <p className="font-mono text-[11px] text-slate-400 mt-1 uppercase tracking-wider">Diploma & BE Ready</p>
            </div>
          </motion.div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, i) => {
            const Icon = service.icon;
            const badgeStyle = highlightBadges[service.highlightType];

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, scale: 1.015 }}
                className="glass-card group relative rounded-2xl p-7 border border-white/10 hover:border-teal-400/50 transition-all duration-300 shadow-xl hover:shadow-[0_12px_40px_-10px_rgba(45,212,191,0.25)] flex flex-col justify-between overflow-hidden cursor-pointer"
                onClick={() => setSelectedService(service)}
              >
                {/* Ambient Top Glow Line */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Top Bar with Badge & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-13 h-13 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-300 group-hover:scale-110 group-hover:bg-teal-500/20 group-hover:border-teal-400 transition-all shadow-md">
                      <Icon className="w-6 h-6 text-teal-300" />
                    </div>

                    <span className={`font-mono text-[11px] font-semibold px-3 py-1 rounded-full border backdrop-blur-md ${badgeStyle}`}>
                      {service.highlight}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="font-display text-xl font-bold text-white group-hover:text-teal-300 transition-colors mb-1.5">
                    {service.title}
                  </h3>
                  <p className="font-mono text-xs text-teal-300/80 mb-3">
                    {service.tagline}
                  </p>

                  <p className="text-sm text-slate-300 leading-relaxed mb-6 line-clamp-3">
                    {service.description}
                  </p>

                  {/* Feature Checklist */}
                  <ul className="space-y-2.5 mb-6">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-xs text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Trigger Action */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="font-mono text-xs text-teal-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5">
                    Explore Specifications <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Instant Info
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Service Detail Modal (Z-INDEX 100 to never overlap with Navbar) */}
        <AnimatePresence>
          {selectedService && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-2xl flex items-center justify-center p-4 pt-24 pb-12 overflow-y-auto"
              onClick={() => setSelectedService(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 320 }}
                className="glass-card border border-white/15 rounded-3xl max-w-2xl w-full shadow-[0_0_60px_rgba(45,212,191,0.25)] overflow-hidden my-auto relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedService(null)}
                  className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-slate-900/80 border border-white/20 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-900 transition-colors backdrop-blur-md"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="p-6 md:p-8 max-h-[85vh] overflow-y-auto space-y-6">
                  {/* Modal Header */}
                  <div className="flex items-start gap-4 pr-10">
                    <div className="w-14 h-14 rounded-2xl bg-teal-500/15 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0 shadow-lg">
                      <selectedService.icon className="w-7 h-7 text-teal-300" />
                    </div>
                    <div>
                      <span className={`font-mono text-xs px-2.5 py-0.5 rounded-full border mb-1.5 inline-block ${highlightBadges[selectedService.highlightType]}`}>
                        {selectedService.highlight}
                      </span>
                      <h3 className="font-display text-2xl md:text-3xl font-bold text-white">
                        {selectedService.title}
                      </h3>
                      <p className="font-mono text-xs text-teal-300 mt-0.5">
                        {selectedService.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Full Description */}
                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                    <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                      {selectedService.detailedInfo.fullDescription}
                    </p>
                  </div>

                  {/* Pricing & Timeline Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30">
                      <h4 className="font-mono text-xs text-teal-300 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-semibold">
                        <Zap className="w-4 h-4 text-teal-400" />
                        Pricing Model
                      </h4>
                      <p className="text-sm text-slate-200">
                        {selectedService.detailedInfo.pricing}
                      </p>
                    </div>

                    {selectedService.detailedInfo.deliveryTime && (
                      <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                        <h4 className="font-mono text-xs text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-semibold">
                          <Clock className="w-4 h-4 text-cyan-400" />
                          Delivery Timeline
                        </h4>
                        <p className="text-sm text-slate-200">
                          {selectedService.detailedInfo.deliveryTime}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Terms & Deliverables */}
                  <div>
                    <h4 className="font-mono text-xs text-teal-400 uppercase tracking-wider mb-3 flex items-center gap-2 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                      What Is Included & Terms
                    </h4>
                    <div className="space-y-2">
                      {selectedService.detailedInfo.terms.map((term, index) => (
                        <div key={index} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 mt-2" />
                          <span>{term}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Support Statement */}
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <h4 className="font-mono text-xs text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-semibold">
                      <HelpCircle className="w-4 h-4 text-amber-400" />
                      Dedicated Mentorship & Support
                    </h4>
                    <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                      {selectedService.detailedInfo.support}
                    </p>
                  </div>

                  {/* Program Brochure if Available */}
                  {selectedService.detailedInfo.brochure && (
                    <a
                      href={selectedService.detailedInfo.brochure}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-teal-500/40 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-sm font-semibold transition-colors shadow-md"
                    >
                      <FileText className="w-4 h-4" />
                      Download 12-Week Program Syllabus & Brochure (PDF)
                    </a>
                  )}

                  {/* Direct Contact CTAs */}
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-xs font-mono text-slate-400 text-center mb-3">
                      Ready to get started or request a custom proposal?
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <a
                        href={`https://wa.me/917249830281?text=Hi%20HackMates,%20I%20am%20interested%20in%20${encodeURIComponent(selectedService.title)}.%20Please%20share%20more%20details.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Chat on WhatsApp
                      </a>
                      <a
                        href={`mailto:hackmates.tech@gmail.com?subject=${encodeURIComponent(`Inquiry: ${selectedService.title}`)}&body=${encodeURIComponent(`Hi HackMates Team,\n\nI want to discuss requirements regarding ${selectedService.title}.\n\nMy Details:\nName:\nCollege / Organization:\nContact Number:\nRequirements:\n`)}`}
                        className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-bold shadow-[0_0_20px_rgba(45,212,191,0.35)] transition-all"
                      >
                        <Mail className="w-4 h-4" />
                        Send Email Inquiry
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
