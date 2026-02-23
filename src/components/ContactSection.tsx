import { motion } from "framer-motion";
import { Mail, MessageSquare, MapPin, Send, Instagram, Linkedin } from "lucide-react";
import { useState } from "react";

const ContactSection = () => {
  const [submitted, setSubmitted] = useState(false);

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
            <p className="text-muted-foreground leading-relaxed">
              Have a project idea? Need a custom solution? Want to join the team?
              We'd love to hear from you.
            </p>
            <div className="space-y-4">
              <motion.a
                href="mailto:hackmates.tech@gmail.com"
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">hackmates.tech@gmail.com</span>
              </motion.a>

              <motion.a
                href="https://instagram.com/hackmates.tech"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Instagram className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">hackmates.tech</span>
              </motion.a>

              <motion.a
                href="https://linkedin.com/company/hackmates-tech"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Linkedin className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">hackmates.tech</span>
              </motion.a>

              <motion.div
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">India</span>
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
      </div>
    </section>
  );
};

export default ContactSection;
