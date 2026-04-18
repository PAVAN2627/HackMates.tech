import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, LogIn } from "lucide-react";
import { useNavigate, Navigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePlatform } from "@/context/PlatformContext";

const Login = () => {
  const navigate = useNavigate();
  const { loading, sessionUser, login } = usePlatform();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!sessionUser) {
      return;
    }

    if (sessionUser.role === "Admin") {
      navigate("/admin", { replace: true });
      return;
    }

    navigate("/dashboard", { replace: true });
  }, [navigate, sessionUser]);

  if (!loading && sessionUser) {
    return <Navigate to={sessionUser.role === "Admin" ? "/admin" : "/dashboard"} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const authenticatedUser = await login(email, password);
      if (!authenticatedUser) {
        setError("Invalid email or password.");
        return;
      }

      navigate(authenticatedUser.role === "Admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.25),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.16),_transparent_28%),linear-gradient(135deg,_rgba(2,6,23,0.98),_rgba(15,23,42,0.92))]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:44px_44px]" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-5xl grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white space-y-6"
          >
            <Badge className="bg-white/10 text-white border-white/15 px-3 py-1.5 text-xs tracking-[0.3em] uppercase">
              Firebase role access
            </Badge>
            <div className="space-y-4 max-w-xl">
              <h1 className="text-4xl md:text-6xl font-bold font-display leading-tight">
                One login for <span className="text-primary">interns</span>, <span className="text-primary">mentors</span>, and <span className="text-primary">admin</span>.
              </h1>
              <p className="text-base md:text-lg text-white/75 leading-relaxed">
                Sign in with your Firebase account. Admin can create user profiles, interns can track performance and submissions, and mentors can answer doubts, add lecture notes, and review work in real time.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 max-w-2xl">
              {[
                ["3", "Monthly performance trend"],
                ["6", "Core dashboard sections"],
                ["1", "Admin user management panel"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-primary">{value}</div>
                  <div className="text-sm text-white/70 mt-1">{label}</div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm max-w-2xl text-sm text-white/75 leading-relaxed">
              Log in with the email and password created in Firebase Auth. User role and dashboard access are resolved from the Firestore profile attached to that account.
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-white/10 bg-slate-950/75 text-white shadow-2xl backdrop-blur-xl">
              <CardHeader className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center text-primary">
                  <LogIn className="w-6 h-6" />
                </div>
                <CardTitle className="text-3xl font-display text-white">Sign in</CardTitle>
                <CardDescription className="text-white/65">
                  Access your role-based dashboard using your Firebase account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Email</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/35 focus-visible:ring-primary"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Password</label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/35 focus-visible:ring-primary"
                      placeholder="Enter password"
                      required
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full h-12 text-sm font-semibold" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Signing in
                      </>
                    ) : (
                      <>
                        Continue to dashboard
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70 leading-relaxed">
                    Admin users can add interns or mentors from the admin panel. The app reads live profile data from Firestore after sign-in.
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
