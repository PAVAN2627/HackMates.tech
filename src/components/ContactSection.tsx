import { motion } from "framer-motion";
import { Mail, MessageSquare, MapPin, Send, Instagram, Linkedin, ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "How do I purchase a pre-built project?",
    answer: "Contact us via email or the form above with your requirements. We'll share project details, demo, and pricing. Once confirmed, we'll deliver the complete source code with documentation."
  },
  {
    question: "Can you build a custom project for my college?",
    answer: "Yes! We specialize in custom academic projects for Diploma, BE, and BTech students. Share your requirements, and we'll create a tailored solution that meets your college guidelines."
  },
  {
    question: "Do you provide project support after delivery?",
    answer: "Absolutely! We offer setup assistance, code walkthrough, and post-delivery support to ensure you understand and can present your project confidently."
  },
  {
    question: "How long does it take to complete a custom project?",
    answer: "Typically 1-2 weeks depending on complexity. We work closely with you throughout the development process and ensure timely delivery."
  },
  {
    question: "Can I join the HackMates team?",
    answer: "We're always looking for passionate developers! If you love hackathons, building projects, and innovation, reach out to us with your portfolio and skills."
  }
];

const ContactSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section id="contact" className="py-24 bg-secondary/30 particles-bg">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="font-mono text-sm text-primary mb-3">connect.init()</p>
          <h2 className="text-4xl md:text-5xl font-bold font-display">
            Let's <span className="gradient-text">Connect</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="text-foreground font-bold leading-relaxed text-lg">
              Have a project idea? Need a custom solution? Want to join the team?
              We'd love to hear from you.
            </p>
            <div className="space-y-4">
              <motion.a
                href="mailto:hackmates.tech@gmail.com"
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all shadow-sm">
                  <Mail className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                </div>
                <span className="text-base text-foreground font-bold group-hover:text-primary transition-colors">hackmates.tech@gmail.com</span>
              </motion.a>

              <motion.a
                href="https://instagram.com/hackmates.tech"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-all shadow-sm">
                  <Instagram className="w-5 h-5 text-white" />
                </div>
                <span className="text-base text-foreground font-bold group-hover:text-primary transition-colors">hackmates.tech</span>
              </motion.a>

              <motion.a
                href="https://linkedin.com/company/hackmates-tech"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0077B5] flex items-center justify-center group-hover:scale-110 transition-all shadow-sm">
                  <Linkedin className="w-5 h-5 text-white" />
                </div>
                <span className="text-base text-foreground font-bold group-hover:text-primary transition-colors">hackmates.tech</span>
              </motion.a>

              <motion.div
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 group"
              >
                <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center group-hover:scale-110 transition-all shadow-sm">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-base text-foreground font-bold group-hover:text-primary transition-colors">Maharashtra, India</span>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {submitted ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="card-elevated rounded-xl p-8 text-center"
              >
                <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                  <Send className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2 text-lg">Message Sent!</h3>
                <p className="text-sm text-muted-foreground">We'll get back to you within 24 hours.</p>
              </motion.div>
            ) : (
              <form
                action="mailto:hackmates.tech@gmail.com"
                method="post"
                encType="text/plain"
                onSubmit={(e) => { 
                  e.preventDefault(); 
                  const formData = new FormData(e.currentTarget);
                  const name = formData.get('name');
                  const email = formData.get('email');
                  const subject = formData.get('subject');
                  const message = formData.get('message');
                  window.location.href = `mailto:hackmates.tech@gmail.com?subject=${encodeURIComponent(subject as string)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
                  setSubmitted(true);
                }}
                className="space-y-4"
              >
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] font-mono text-sm transition-all"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] font-mono text-sm transition-all"
                />
                <select 
                  name="subject"
                  className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] font-mono text-sm transition-all"
                >
                  <option>Buy a Project</option>
                  <option>Custom Development</option>
                  <option>Join the Team</option>
                  <option>Collaboration</option>
                  <option>Other</option>
                </select>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Tell us about your idea..."
                  required
                  className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] font-mono text-sm resize-none transition-all"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full gradient-primary text-primary-foreground font-mono text-sm py-3.5 rounded-lg hover:opacity-90 transition-opacity border-glow"
                >
                  Send Message →
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 max-w-3xl mx-auto"
        >
          <div className="text-center mb-10">
            <p className="font-mono text-sm text-primary mb-3">faq.help()</p>
            <h3 className="text-3xl md:text-4xl font-bold font-display text-foreground">
              Frequently Asked <span className="text-primary">Questions</span>
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-elevated rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="font-display font-semibold text-foreground pr-4">{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-primary flex-shrink-0 transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === index ? "auto" : 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
