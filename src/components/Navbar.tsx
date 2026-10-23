import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogIn, LayoutDashboard, Sparkles } from "lucide-react";
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
  const sessionRole = sessionUser?.role ?? null;
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-3 sm:pt-4 transition-all duration-300 pointer-events-none">
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`pointer-events-auto max-w-6xl mx-auto rounded-full transition-all duration-300 ${
          scrolled
            ? "bg-slate-950/85 backdrop-blur-2xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.6)] py-2.5 px-5 sm:px-6"
            : "bg-slate-950/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] py-3 px-6"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-teal-500/30 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
              <img
                src="/hackmatesroundlogo.png"
                alt="HackMates"
                className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-white/20"
              />
            </div>
            <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white">
              Hack<span className="gradient-text-teal">Mates</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`relative px-3.5 py-1.5 rounded-full font-mono text-xs uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? "text-teal-300 font-bold"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activePill"
                      className="absolute inset-0 rounded-full bg-teal-500/15 border border-teal-500/30 -z-10 shadow-[0_0_15px_rgba(45,212,191,0.2)]"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Actions & Controls */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to={sessionUser ? (sessionRole === "Admin" ? "/admin" : "/dashboard") : "/login"}
              className="relative group overflow-hidden rounded-full p-[1px] focus:outline-none"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full opacity-70 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-950 font-mono text-xs font-semibold text-white group-hover:bg-slate-900 transition-colors">
                {sessionUser ? (
                  <>
                    <LayoutDashboard className="w-3.5 h-3.5 text-teal-400" />
                    Dashboard
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5 text-teal-400" />
                    Login
                  </>
                )}
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation menu"
              className="p-1.5 rounded-lg text-slate-200 hover:text-white"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden pt-4 pb-2 border-t border-white/10 mt-3 flex flex-col gap-2 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`px-3 py-2 rounded-xl font-mono text-xs uppercase tracking-wider transition-colors ${
                      location.pathname === item.href
                        ? "bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30"
                        : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="pt-2">
                <Button asChild className="w-full justify-center gradient-primary text-slate-950 font-bold rounded-xl h-10">
                  <Link
                    to={sessionUser ? (sessionRole === "Admin" ? "/admin" : "/dashboard") : "/login"}
                    onClick={() => setIsOpen(false)}
                  >
                    {sessionUser ? "Open Dashboard" : "Login to Platform"}
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  );
};

export default Navbar;
