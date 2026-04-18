import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, GraduationCap, UserCheck, MessageSquareMore, Send, Star, Wallet, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePlatform } from "@/context/PlatformContext";
import DashboardSidebar from "@/components/DashboardSidebar";

const AdminDashboard = () => {
  const { loading, sessionUser, logout, adminStats, feedback, fees } = usePlatform();

  const thisMonthKey = new Date().toISOString().slice(0, 7);
  const thisMonthFeedback = feedback.filter((e) => e.date.startsWith(thisMonthKey));
  const monthlyOverallRating = thisMonthFeedback.length > 0
    ? Number((thisMonthFeedback.reduce((s, e) => s + e.rating, 0) / thisMonthFeedback.length).toFixed(1))
    : 0;
  const recentFeedback = feedback.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);
  const weeklyAverageRating = recentFeedback.length > 0
    ? Number((recentFeedback.reduce((s, e) => s + e.rating, 0) / recentFeedback.length).toFixed(1))
    : 0;
  const totalFeeAmount = fees.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalFeePaid = fees.reduce((s, e) => s + (Number(e.paidAmount) || 0), 0);
  const totalFeeRemaining = Math.max(totalFeeAmount - totalFeePaid, 0);
  const pendingFeeCount = fees.filter((e) => e.status === "Pending").length;

  if (!loading && !sessionUser) return <Navigate to="/login" replace />;
  if (!loading && sessionUser?.role !== "Admin") return <Navigate to="/login" replace />;
  if (!sessionUser) return null;

  const statGroups = [
    {
      title: "Users",
      stats: [
        { label: "Total Users", value: adminStats.users, icon: Users, color: "text-primary bg-primary/10" },
        { label: "Interns", value: adminStats.interns, icon: GraduationCap, color: "text-blue-400 bg-blue-400/10" },
        { label: "Mentors", value: adminStats.mentors, icon: UserCheck, color: "text-teal-400 bg-teal-400/10" },
      ],
    },
    {
      title: "Activity",
      stats: [
        { label: "Open Doubts", value: adminStats.openDoubts, icon: MessageSquareMore, color: "text-yellow-400 bg-yellow-400/10" },
        { label: "Pending Submissions", value: adminStats.pendingSubmissions, icon: Send, color: "text-orange-400 bg-orange-400/10" },
      ],
    },
    {
      title: "Fees",
      stats: [
        { label: "Pending Fee Entries", value: pendingFeeCount, icon: Wallet, color: "text-red-400 bg-red-400/10" },
        { label: "Fee Remaining (₹)", value: totalFeeRemaining.toLocaleString(), icon: Wallet, color: "text-rose-400 bg-rose-400/10" },
      ],
    },
    {
      title: "Feedback",
      stats: [
        { label: "Weekly Avg", value: `${weeklyAverageRating}/10`, icon: Star, color: "text-green-400 bg-green-400/10" },
        { label: "This Month Avg", value: `${monthlyOverallRating}/10`, icon: TrendingUp, color: "text-emerald-400 bg-emerald-400/10" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden flex">
      <DashboardSidebar
        role="Admin"
        userName={sessionUser.email}
        onLogout={logout}
        activeSection="overview"
        onSectionChange={() => {}}
      />
      <div className="flex-1 min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.18),_transparent_22%),linear-gradient(180deg,_rgba(2,6,23,0.96),_rgba(15,23,42,0.98))]" />
        <div className="relative z-10 min-h-screen flex flex-col">

          <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-20">
            <div className="mx-auto max-w-5xl px-6 py-4">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-white/10 text-white border-white/10">Admin</Badge>
                <span className="text-white/40 text-xs">{sessionUser.email}</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
              <p className="text-white/50 text-sm mt-0.5">Monitor all interns, mentors, and platform activity.</p>
            </div>
          </header>

          <main className="mx-auto max-w-5xl w-full px-6 py-6 space-y-6 flex-1">

            {/* Stat groups */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {statGroups.map((group, gi) => (
                <motion.div
                  key={group.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gi * 0.06 }}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">{group.title}</p>
                  <div className="space-y-3">
                    {group.stats.map((s) => {
                      const Icon = s.icon;
                      return (
                        <div key={s.label} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm text-white/70">{s.label}</span>
                          </div>
                          <span className="text-lg font-bold text-white">{s.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick actions */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Quick Actions</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Submissions Pending", value: adminStats.pendingSubmissions, color: "text-orange-400" },
                  { label: "Questions Open", value: adminStats.openDoubts, color: "text-blue-400" },
                  { label: "Total Users", value: adminStats.users, color: "text-green-400" },
                ].map((q) => (
                  <div key={q.label} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                    <p className={`text-2xl font-bold ${q.color}`}>{q.value}</p>
                    <p className="text-xs text-white/50 mt-1">{q.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
