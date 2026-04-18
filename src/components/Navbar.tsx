import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Moon, Sun, LogIn, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { usePlatform } from "@/context/PlatformContext";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Journey", href: "/journey" },
  { label: "Team", href: "/team" },
  { label: "Projects", href: "/projects" },
  { label: "Services", href: "/services" },
  { label: "Gallery", href: "/gallery" },
  { label: "Verify", href: "/verify" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { sessionUser } = usePlatform();
  const [dark, setDark] = useState(() => {
    // Initialize from localStorage or default to true
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    // Save theme preference to localStorage
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll to top when location changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? "bg-background/80 backdrop-blur-md shadow-lg border-b border-border/50" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 group">
          <img 
            src="/hackmatesroundlogo.png" 
            alt="HackMates Logo" 
            className="w-18 h-12 md:w-26 md:h-18 rounded-full group-hover:shadow-[0_0_15px_hsl(var(--glow-primary)/0.4)] transition-shadow object-cover"
          />
          <span className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Hack<span className="text-primary">Mates</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`font-mono text-sm font-bold hover:text-primary transition-colors relative group uppercase tracking-wider ${
                scrolled ? "text-foreground" : "text-white"
              }`}
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
          <Button asChild className="h-10 px-4">
            <Link to={sessionUser ? (sessionUser.role === "Admin" ? "/admin" : "/dashboard") : "/login"}>
              {sessionUser ? (
                <>
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Login
                </>
              )}
            </Link>
          </Button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDark(!dark)}
            className={`p-2 rounded-lg border transition-all ${
              scrolled 
                ? "border-border hover:border-primary text-muted-foreground hover:text-primary" 
                : "border-white/50 hover:border-primary text-white hover:text-primary"
            }`}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </motion.button>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={() => setDark(!dark)}
            className={`p-2 rounded-lg border transition-all ${
              scrolled 
                ? "border-border text-muted-foreground" 
                : "border-white/50 text-white"
            }`}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className={scrolled ? "text-foreground" : "text-white"}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/90 backdrop-blur-md border-t border-border overflow-hidden"
          >
            <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className="font-mono text-sm text-foreground font-bold hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <Button asChild className="w-full justify-center">
                <Link to={sessionUser ? (sessionUser.role === "Admin" ? "/admin" : "/dashboard") : "/login"} onClick={() => setIsOpen(false)}>
                  {sessionUser ? "Open dashboard" : "Login"}
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
