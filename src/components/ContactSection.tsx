import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Mail, 
  MapPin, 
  Send, 
  Instagram, 
  Linkedin, 
  ChevronDown, 
  MessageCircle, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  CheckCircle2 
} from "lucide-react";

const faqs = [
  {
    question: "How do I purchase a pre-built academic project?",
    answer: "Select your project from our Projects page or reach out via WhatsApp/Email. We'll share the live demo, technical documentation preview, and pricing. Once confirmed, you receive the full source code repository, documentation PDF, and live setup assistance."
  },
  {
    question: "Can you build a custom project for our college/university guidelines?",
    answer: "Yes! We specialize in custom full-stack and AI projects built specifically to comply with Diploma (MSBTE), BE, and BTech syllabi. We provide project synopsis, architecture diagrams, weekly progress demos, and complete code walkthroughs."
  },
  {
    question: "Do you provide technical mentorship and viva support?",
    answer: "Absolutely. We don't just hand over code — our engineering mentors walk you through the system architecture, database schema, algorithms, and common viva questions so you present with absolute confidence."
  },
  {
    question: "What is the typical delivery timeline for custom projects?",
    answer: "Most custom academic and MVP projects are designed, developed, and deployed within 2 to 3 weeks. If you have an urgent deadline, let us know and we'll evaluate fast-track delivery."
  },
  {
    question: "How do I apply for the 12-Week HackMates Internship?",
    answer: "We open cohort applications for Diploma and Degree engineering students periodically. Submit your details through this form with subject 'Join 12-Week Internship' or check our Services page for the latest batch syllabus and enrolment details."
  }
];

export const ContactSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section id="contact" className="relative py-20 lg:py-28 overflow-hidden bg-transparent">
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
            <span>connect.init()</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-white mb-4"
          >
            Let's <span className="gradient-text">Connect</span> & Build
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 max-w-2xl mx-auto text-base md:text-lg leading-relaxed"
          >
            Have a project idea? Need academic code with guidance? Want to join our internship cohort or collaborate on hackathons? We're one message away.
          </motion.p>
        </div>

        {/* Main Grid: Info + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto mb-20">
          {/* Left Column: Direct Contacts */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 space-y-4"
          >
            {/* Direct WhatsApp Callout */}
            <div className="p-6 rounded-2xl glass-card border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-lg">Instant WhatsApp Chat</h3>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    Fastest way to get project demos, pricing quotes, or admissions info.
                  </p>
                  <a
                    href="https://wa.me/917249830281?text=Hi%20HackMates,%20I%20have%20an%20inquiry%20regarding%20your%20services."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold shadow-md transition-all"
                  >
                    Chat on WhatsApp →
                  </a>
                </div>
              </div>
            </div>

            {/* Email Card */}
            <a
              href="mailto:hackmates.tech@gmail.com"
              className="p-5 rounded-2xl glass-card border border-white/10 hover:border-teal-400/50 flex items-center gap-4 group transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-300 group-hover:scale-110 group-hover:bg-teal-500/20 transition-all">
                <Mail className="w-5 h-5 text-teal-300" />
              </div>
              <div className="overflow-hidden">
                <p className="font-mono text-[11px] text-slate-400 uppercase tracking-wider">Official Email</p>
                <p className="font-display font-bold text-sm text-white group-hover:text-teal-300 transition-colors truncate">
                  hackmates.tech@gmail.com
                </p>
              </div>
            </a>

            {/* Social Channels */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href="https://instagram.com/hackmates.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl glass-card border border-white/10 hover:border-pink-500/50 flex items-center gap-3 group transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                  <Instagram className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <span className="font-mono text-[10px] text-slate-400 block">Instagram</span>
                  <span className="font-display font-bold text-xs text-white group-hover:text-pink-300 truncate block">
                    @hackmates.tech
                  </span>
                </div>
              </a>

              <a
                href="https://linkedin.com/company/hackmates-tech"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl glass-card border border-white/10 hover:border-blue-400/50 flex items-center gap-3 group transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-[#0077b5] flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                  <Linkedin className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <span className="font-mono text-[10px] text-slate-400 block">LinkedIn</span>
                  <span className="font-display font-bold text-xs text-white group-hover:text-blue-300 truncate block">
                    HackMates Tech
                  </span>
                </div>
              </a>
            </div>

            {/* Location Pill */}
            <div className="p-4 rounded-xl glass-card border border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">Innovation Hub</p>
                <p className="font-display font-bold text-xs text-white">Pune & Satara, Maharashtra, India</p>
              </div>
            </div>

            {/* SLA / Guarantee */}
            <div className="p-3.5 rounded-xl bg-teal-500/5 border border-teal-500/20 flex items-center gap-2.5 text-xs text-teal-300 font-mono">
              <Clock className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Typical Response Time: &lt; 2 Hours</span>
            </div>
          </motion.div>

          {/* Right Column: Interactive Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7"
          >
            <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/10 shadow-[0_0_40px_rgba(45,212,191,0.15)] relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-500" />

              {submitted ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="py-12 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border-2 border-teal-400 flex items-center justify-center mx-auto mb-4 text-teal-300 shadow-[0_0_30px_rgba(45,212,191,0.4)]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-white mb-2">Message Dispatched!</h3>
                  <p className="text-slate-300 text-sm max-w-sm mx-auto leading-relaxed mb-6">
                    Thank you for reaching out. We have received your inquiry and our engineering team will get back to you shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white font-mono text-xs hover:bg-white/[0.1] transition-all"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const name = formData.get("name");
                    const email = formData.get("email");
                    const subject = formData.get("subject");
                    const message = formData.get("message");
                    window.location.href = `mailto:hackmates.tech@gmail.com?subject=${encodeURIComponent(
                      `[HackMates Inquiry] ${subject}`
                    )}&body=${encodeURIComponent(
                      `Name: ${name}\nEmail: ${email}\nInquiry Topic: ${subject}\n\nMessage:\n${message}\n`
                    )}`;
                    setSubmitted(true);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-teal-300 mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="e.g. Rahul Sharma"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/15 text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 font-mono text-sm transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-teal-300 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="you@domain.com"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/15 text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 font-mono text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-teal-300 mb-1.5">
                      Subject / Service Area
                    </label>
                    <select
                      name="subject"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/15 text-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 font-mono text-sm transition-all"
                    >
                      <option className="bg-slate-900">Buy a Pre-Built Academic Project</option>
                      <option className="bg-slate-900">Custom Project / Startup MVP Development</option>
                      <option className="bg-slate-900">Apply for 12-Week Internship Cohort</option>
                      <option className="bg-slate-900">Host Campus Workshop / Hackathon</option>
                      <option className="bg-slate-900">General Inquiry & Collaboration</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-teal-300 mb-1.5">
                      Tell Us About Your Requirement
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      placeholder="Share project tech stack, deadline, college details, or custom goals..."
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/15 text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 font-mono text-sm resize-none transition-all"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-500 text-slate-950 font-display font-bold text-sm tracking-wide hover:opacity-95 transition-all shadow-[0_0_25px_rgba(45,212,191,0.35)] flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message to HackMates</span>
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </div>

        {/* FAQ Accordion Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 font-mono text-xs mb-3">
              <span>faq.answers()</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-extrabold font-display text-white">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className={`glass-card rounded-2xl overflow-hidden border transition-colors ${
                    isOpen ? "border-teal-400/40 shadow-[0_0_20px_rgba(45,212,191,0.15)]" : "border-white/10"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="font-display font-semibold text-white text-base pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-teal-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-6 pb-5 pt-1 text-slate-300 text-sm leading-relaxed border-t border-white/5">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
