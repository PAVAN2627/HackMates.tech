import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Loader2, 
  Home, 
  Shield, 
  Zap, 
  Users, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2,
  MessageCircle
} from "lucide-react";
import { useNavigate, Navigate, Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePlatform } from "@/context/PlatformContext";
import { useSEO } from "@/hooks/useSEO";

const features = [
  { 
    icon: Zap, 
    title: "Real-time Milestone Tracking", 
    desc: "Track attendance, weekly submissions, daily lecture notes, and evaluations live." 
  },
  { 
    icon: Users, 
    title: "Unified Multi-Role Portal", 
    desc: "Dedicated workspaces tailored for active Interns, Mentors, and Program Admins." 
  },
  { 
    icon: Shield, 
    title: "Cryptographically Verified", 
    desc: "Seamless cryptographic registry verification for completion credentials & letters." 
  },
];

const Login = () => {
  useSEO({
    title: "Member & Leadership Portal Sign In — HackMates",
    description: "Access the HackMates student developer dashboard for task management, lecture notes, performance tracking, and verified credentials.",
    canonical: "/login",
  });

  const navigate = useNavigate();
  const { loading, sessionUser, login } = usePlatform();
  const sessionRole = sessionUser?.role ?? null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!sessionUser) return;
    navigate(sessionRole === "Admin" ? "/admin" : "/dashboard", { replace: true });
  }, [navigate, sessionUser, sessionRole]);

  if (!loading && sessionUser) {
    return <Navigate to={sessionRole === "Admin" ? "/admin" : "/dashboard"} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (!user) {
        setError("Invalid email or password combination. Please re-check your credentials.");
        return;
      }
      navigate(user.role === "Admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in. Please verify your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-foreground relative overflow-hidden flex items-center justify-center px-4 py-12 selection:bg-teal-500/30 selection:text-teal-200">
      {/* Background Gradients & Ambient Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-500/15 via-slate-950/80 to-slate-950" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] animate-pulse delay-1000" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">

        {/* Left Column — Branding & Highlights (7 cols) */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.6, ease: "easeOut" }} 
          className="hidden lg:flex lg:col-span-7 flex-col gap-8 pr-4"
        >
          {/* Logo & Category Badge */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-300" />
                <img 
                  src="/hackmatesroundlogo.png" 
                  alt="HackMates" 
                  className="relative w-12 h-12 rounded-full object-cover border border-white/20 shadow-lg" 
                />
              </div>
              <div>
                <span className="font-display font-bold text-2xl tracking-tight text-white block">
                  Hack<span className="text-teal-400">Mates</span>
                </span>
                <span className="text-[11px] font-mono tracking-widest uppercase text-slate-400 block -mt-1">
                  Innovation Ecosystem
                </span>
              </div>
            </Link>
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unified Platform • Interns, Mentors & Leadership</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-extrabold font-display text-white leading-[1.15] tracking-tight">
              Where ambitious builders <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-300 to-teal-400">
                engineer the future.
              </span>
            </h1>

            <p className="text-slate-300/80 text-base leading-relaxed max-w-lg">
              Sign in to manage your active sprints, review lecture notes, access personalized feedback, and track your verified credentials.
            </p>
          </div>

          {/* Features cards */}
          <div className="space-y-3.5 pt-2">
            {features.map(({ icon: Icon, title, desc }, index) => (
              <motion.div 
                key={title} 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.1 }}
                className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-teal-500/30 hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0 mt-0.5 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.15)]">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white font-display">{title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Micro trust stats */}
          <div className="flex items-center gap-6 pt-2 border-t border-white/10 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              100% Secure Encryption
            </span>
            <span>UDYAM-MH-26-1146095</span>
          </div>
        </motion.div>

        {/* Right Column — Login Card (5 cols) */}
        <motion.div 
          initial={{ opacity: 0, y: 25, scale: 0.98 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          transition={{ duration: 0.6, delay: 0.1 }} 
          className="lg:col-span-5"
        >
          <div className="rounded-3xl border border-white/15 bg-slate-900/80 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.65)] relative overflow-hidden">
            {/* Top decorative gradient sheen */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500" />

            {/* Mobile Header Logo */}
            <div className="flex lg:hidden items-center justify-between gap-3 mb-6">
              <Link to="/" className="flex items-center gap-2.5">
                <img src="/hackmatesroundlogo.png" alt="HackMates" className="w-9 h-9 rounded-full object-cover border border-white/20" />
                <span className="font-display font-bold text-xl text-white">Hack<span className="text-teal-400">Mates</span></span>
              </Link>
              <Link to="/" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono">
                <Home className="w-3.5 h-3.5" /> Home
              </Link>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold font-display text-white tracking-tight">
                Welcome back
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Enter your credentials to enter your workspace
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-medium">
                  Registered Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 pl-10 bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:border-transparent rounded-xl transition-all"
                    placeholder="name@hackmates.tech"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-medium">
                    Password
                  </label>
                  <a
                    href="https://wa.me/917249830281?text=Hi%20HackMates%20Support,%20I%20need%20help%20recovering%20my%20dashboard%20password."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-mono text-teal-400 hover:text-teal-300 hover:underline transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pl-10 pr-10 bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:border-transparent rounded-xl transition-all"
                    placeholder="••••••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 leading-relaxed font-mono flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-11 rounded-xl bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold font-display shadow-lg shadow-teal-500/25 transition-all duration-300 mt-2" 
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In to Workspace
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <div className="pt-2 text-center">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors py-1"
                >
                  <Home className="w-3.5 h-3.5" />
                  Return to Main Portal
                </Link>
              </div>
            </form>

            {/* Assistance Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Need help logging in?</span>
              <a
                href="https://wa.me/917249830281?text=Hi%20HackMates,%20I%20need%20assistance%20logging%20into%20my%20dashboard."
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-400 hover:text-teal-300 inline-flex items-center gap-1 font-semibold"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Contact Desk
              </a>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Login;
