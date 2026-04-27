import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Home, Shield, Zap, Users } from "lucide-react";
import { useNavigate, Navigate, Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePlatform } from "@/context/PlatformContext";

const features = [
  { icon: Zap, title: "Real-time dashboard", desc: "Track performance, submissions, and attendance live." },
  { icon: Users, title: "Role-based access", desc: "Separate views for interns, mentors, and admins." },
  { icon: Shield, title: "Secure & verified", desc: "Certificate verification for every intern and mentor." },
];

const Login = () => {
  const navigate = useNavigate();
  const { loading, sessionUser, login } = usePlatform();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!sessionUser) return;
    navigate(sessionUser.role === "Admin" ? "/admin" : "/dashboard", { replace: true });
  }, [navigate, sessionUser]);

  if (!loading && sessionUser) {
    return <Navigate to={sessionUser.role === "Admin" ? "/admin" : "/dashboard"} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (!user) { setError("Invalid email or password."); return; }
      navigate(user.role === "Admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4 py-12">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(15,118,110,0.3),_transparent_40%),radial-gradient(ellipse_at_bottom_right,_rgba(249,115,22,0.15),_transparent_40%),linear-gradient(135deg,_rgba(2,6,23,1),_rgba(15,23,42,0.98))]" />
      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="relative z-10 w-full max-w-4xl grid lg:grid-cols-2 gap-12 items-center">

        {/* Left — branding */}
        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="hidden lg:flex flex-col gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/hackmatesroundlogo.png" alt="HackMates" className="w-12 h-12 rounded-full object-cover" />
            <span className="text-2xl font-bold text-white">Hack<span className="text-primary">Mates</span></span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Your internship journey,<br />
              <span className="text-primary">all in one place.</span>
            </h1>
            <p className="text-white/60 text-base leading-relaxed">
              HackMates is a platform built for interns and mentors to collaborate, track progress, and grow together.
            </p>
          </div>

          <div className="space-y-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-white/50 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — form */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl p-8 shadow-2xl">
            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-3 mb-8">
              <img src="/hackmatesroundlogo.png" alt="HackMates" className="w-10 h-10 rounded-full object-cover" />
              <span className="text-xl font-bold text-white">Hack<span className="text-primary">Mates</span></span>
            </div>

            <div className="mb-7">
              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="text-white/50 text-sm mt-1">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/70">Email address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/70">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-11 font-semibold" disabled={submitting}>
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Signing in...</>
                  : <>Sign in <ArrowRight className="w-4 h-4 ml-2" /></>
                }
              </Button>

              <Link
                to="/"
                className="flex items-center justify-center gap-2 w-full h-10 rounded-lg border border-white/10 bg-white/5 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Home className="w-4 h-4" />
                Back to home
              </Link>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
