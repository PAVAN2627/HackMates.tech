import { motion } from "framer-motion";
import { Linkedin, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="relative z-10 bg-card border-t border-border">
    <div className="container mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        {/* Brand Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <img 
              src="/hackmatesroundlogo.png" 
              alt="HackMates Logo" 
              className="w-10 h-10 rounded-full"
            />
            <span className="font-display text-xl font-bold text-foreground">
              Hack<span className="text-primary">Mates</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Building innovative solutions through hackathons, collaboration, and relentless passion for technology.
          </p>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="font-display font-semibold text-foreground mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
            <li><Link to="/journey" className="text-sm text-muted-foreground hover:text-primary transition-colors">Journey</Link></li>
            <li><Link to="/team" className="text-sm text-muted-foreground hover:text-primary transition-colors">Team</Link></li>
            <li><Link to="/projects" className="text-sm text-muted-foreground hover:text-primary transition-colors">Projects</Link></li>
          </ul>
        </motion.div>

        {/* Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-display font-semibold text-foreground mb-4">Services</h3>
          <ul className="space-y-2">
            <li><Link to="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pre-Built Projects</Link></li>
            <li><Link to="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">Custom Development</Link></li>
            <li><Link to="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">Mentorship</Link></li>
            <li><Link to="/gallery" className="text-sm text-muted-foreground hover:text-primary transition-colors">Gallery</Link></li>
          </ul>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-display font-semibold text-foreground mb-4">Get in Touch</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <a href="mailto:hackmates.tech@gmail.com" className="hover:text-primary transition-colors">
                hackmates.tech@gmail.com
              </a>
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Maharashtra, India</span>
            </li>
          </ul>
          
          {/* Social Links */}
          <div className="flex gap-4 mt-4">
            <a
              href="mailto:hackmates.tech@gmail.com"
              className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all"
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com/hackmates.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com/company/hackmates-tech"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="pt-8 border-t border-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} HackMates. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              UDYAM Registration: <span className="font-mono">UDYAM-MH-30-0185921</span>
            </p>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
