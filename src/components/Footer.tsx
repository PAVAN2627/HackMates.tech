import { motion } from "framer-motion";
import { Linkedin, Instagram, Mail } from "lucide-react";

const Footer = () => (
  <footer className="py-10 border-t border-border">
    <div className="container mx-auto px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center gap-2"
        >
          <img 
            src="/hackmatesroundlogo.png" 
            alt="HackMates Logo" 
            className="w-8 h-8 rounded-full"
          />
          <span className="font-display text-sm font-semibold text-foreground">
            Hack<span className="text-primary">Mates</span>
          </span>
          <span className="text-muted-foreground text-xs ml-2">© {new Date().getFullYear()}</span>
        </motion.div>

        <div className="flex gap-6">
          <a
            href="mailto:hackmates.tech@gmail.com"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Email"
          >
            <Mail className="w-4 h-4" />
          </a>
          <a
            href="https://instagram.com/hackmates.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Instagram"
          >
            <Instagram className="w-4 h-4" />
          </a>
          <a
            href="https://linkedin.com/company/hackmates-tech"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
