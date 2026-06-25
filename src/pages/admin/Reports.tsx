import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, GraduationCap, Star, UserCheck, Users } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlatform } from "@/context/PlatformContext";
import DashboardSidebar from "@/components/DashboardSidebar";

type ReportFeedbackEntry = {
  source: string;
  date: string;
  mentorName: string;
  rating: number;
  comment: string;
};

function averageScore(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
}

function formatMonth(value: string) {
  const [year, month] = value.split("-");
  if (!year || !month) {
    return value;
  }

  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

const AdminReports = () => {
  const {
    loading,
    sessionUser,
    logout,
    users,
    performance,
    feedback,
    attendanceSessions,
    mentorToInternFeedbackSubmissions,
    mentorFeedbackSubmissions,
    submissions,
    dailyNotes,
  } = usePlatform();

  const internUsers = useMemo(
    () => [...users.filter((user) => user.role === "Intern")].sort((a, b) => a.name.localeCompare(b.name)),
    [users],
  );
  const mentorUsers = useMemo(
    () => [...users.filter((user) => user.role === "Mentor")].sort((a, b) => a.name.localeCompare(b.name)),
    [users],
  );
  const [reportTab, setReportTab] = useState<"intern" | "mentor">("intern");
  const [selectedInternId, setSelectedInternId] = useState("");
  const [adminComment, setAdminComment] = useState("");

  useEffect(() => {
    if (!selectedInternId && internUsers.length > 0) {
      setSelectedInternId(internUsers[0].id);
    }
  }, [internUsers, selectedInternId]);

  const selectedIntern = useMemo(
    () => internUsers.find((user) => user.id === selectedInternId) ?? internUsers[0] ?? null,
    [internUsers, selectedInternId],
  );

    const report = useMemo(() => {
    if (!selectedIntern) {
      return null;
    }

    const attendanceHistory = attendanceSessions
      .flatMap((session) => {
        const record = session.records.find((entry) => entry.internId === selectedIntern.id);
        if (!record) {
          return [];
        }

        return [
          {
            sessionId: session.id,
            sessionTitle: session.title,
            mentorName: session.mentorName,
            date: session.date,
            startTime: session.startTime,
            status: record.status,
            markedAt: record.markedAt,
          },
        ];
      })
      .sort((a, b) => b.date.localeCompare(a.date));

    const lecturesAttended = attendanceHistory.filter((entry) => entry.status === "Present").length;
    const lecturesMissed = attendanceHistory.filter((entry) => entry.status === "Absent").length;
    const attendancePercentage =
      lecturesAttended + lecturesMissed > 0 ? Math.round((lecturesAttended / (lecturesAttended + lecturesMissed)) * 100) : 0;

    const mentorRatings: ReportFeedbackEntry[] = [
      ...feedback
        .filter((entry) => entry.internId === selectedIntern.id)
        .map((entry) => ({
          source: "Mentor feedback",
          date: entry.date,
          mentorName: entry.mentorName,
          rating: entry.rating,
          comment: entry.comment,
        })),
      ...mentorToInternFeedbackSubmissions
        .filter((entry) => entry.internId === selectedIntern.id)
        .map((entry) => ({
          source: "Form feedback",
          date: entry.submittedAt,
          mentorName: entry.mentorName,
          rating: entry.rating,
          comment: entry.comment,
        })),
    ].sort((a, b) => b.date.localeCompare(a.date));

    const feedbackAverage = averageScore(mentorRatings.map((entry) => entry.rating));
    const submissionsList = submissions
      .filter((s) => s.internId === selectedIntern.id)
      .sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? ""));
    const submissionCounts = submissionsList.reduce(
      (acc, cur) => {
        acc.total += 1;
        acc[cur.status] = (acc[cur.status] || 0) + 1;
        return acc;
      },
      { total: 0 } as Record<string, number>,
    );

    const notesList = dailyNotes
      .filter((n) => n.internId === selectedIntern.id)
      .sort((a, b) => (b.createdAt ?? b.date).localeCompare(a.createdAt ?? a.date));
    const performanceHistory = [...performance.filter((entry) => entry.internId === selectedIntern.id)]
      .sort((a, b) => b.month.localeCompare(a.month))
      .map((entry) => ({
        ...entry,
        monthLabel: formatMonth(entry.month),
      }));
    const performanceAverage = averageScore(performanceHistory.map((entry) => entry.score));

    // Overall score: weighted average of attendance, mentor ratings (converted to 0-100), and monthly performance
    // Each component is only included if data exists for it
    const scoreParts: number[] = [];
    if (attendancePercentage > 0 || lecturesAttended + lecturesMissed > 0) {
      scoreParts.push(attendancePercentage);
    }
    if (mentorRatings.length > 0) {
      scoreParts.push(Math.round(feedbackAverage * 10));
    }
    if (performanceHistory.length > 0) {
      scoreParts.push(performanceAverage);
    }
    const overallScore = scoreParts.length > 0 ? Math.round(averageScore(scoreParts)) : 0;

    // Performance score shown on the stat card: monthly average if available, else feedback-based
    const displayPerformanceScore = performanceHistory.length > 0
      ? performanceAverage
      : mentorRatings.length > 0
        ? Math.round(feedbackAverage * 10)
        : 0;

    // Submission summary
    const totalSubmissions = submissionCounts.total ?? 0;
    const approvedSubmissions = submissionCounts["Approved"] ?? 0;
    const pendingSubmissions = submissionCounts["Pending"] ?? 0;
    const reviewedSubmissions = submissionCounts["Reviewed"] ?? 0;
    // Submission score: approved out of total (0-100)
    const submissionScore = totalSubmissions > 0 ? Math.round((approvedSubmissions / totalSubmissions) * 100) : 0;

    // Weekly rating score (feedbackAverage on 0-10 → 0-100)
    const weeklyRatingScore = mentorRatings.length > 0 ? Math.round(feedbackAverage * 10) : 0;

    // New overall score = avg of attendance + submission score + weekly rating (only non-zero parts)
    const newScoreParts: number[] = [];
    if (lecturesAttended + lecturesMissed > 0) newScoreParts.push(attendancePercentage);
    if (totalSubmissions > 0) newScoreParts.push(submissionScore);
    if (mentorRatings.length > 0) newScoreParts.push(weeklyRatingScore);
    const newOverallScore = newScoreParts.length > 0 ? Math.round(averageScore(newScoreParts)) : 0;

    return {
      attendanceHistory,
      lecturesAttended,
      lecturesMissed,
      attendancePercentage,
      mentorRatings,
      feedbackAverage,
      submissionsList,
      submissionCounts,
      totalSubmissions,
      approvedSubmissions,
      pendingSubmissions,
      reviewedSubmissions,
      submissionScore,
      weeklyRatingScore,
      notesList,
      performanceHistory,
      performanceAverage,
      displayPerformanceScore,
      overallScore: newOverallScore,
    };
  }, [attendanceSessions, feedback, mentorToInternFeedbackSubmissions, performance, selectedIntern]);

  // ── Mentor report ──────────────────────────────────────────────────────────
  const mentorReports = useMemo(() => {
    return mentorUsers.map((mentor) => {
      // All anonymous intern→mentor submissions for this mentor
      const subs = mentorFeedbackSubmissions.filter(
        (s) => s.mentorId === mentor.id || s.mentorName === mentor.name,
      );
      const ratings = subs.map((s) => s.rating);
      const avgRating = averageScore(ratings);
      const totalSessions = attendanceSessions.filter((s) => s.mentorId === mentor.id || s.mentorName === mentor.name).length;
      return { mentor, subs, avgRating, totalReviews: subs.length, totalSessions };
    });
  }, [mentorUsers, mentorFeedbackSubmissions, attendanceSessions]);

  if (!loading && !sessionUser) return <Navigate to="/login" replace />;
  if (!loading && sessionUser?.role !== "Admin") return <Navigate to="/login" replace />;
  if (!sessionUser) return null;

  const handleLogout = () => {
    logout();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden flex">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 8mm;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          body * {
            visibility: hidden !important;
          }

          .report-print-area,
          .report-print-area * {
            visibility: visible !important;
          }

          .report-print-area {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            margin: 0 !important;
          }

          .no-print,
          .no-print * {
            display: none !important;
          }

          body {
            background: white !important;
          }

          .recharts-tooltip-wrapper,
          .recharts-active-dot {
            display: none !important;
          }

          .report-print-area .space-y-5 > * + * {
            margin-top: 0.75rem !important;
          }
        }
      `}</style>
      <DashboardSidebar
        role="Admin"
        userName={sessionUser.email}
        onLogout={handleLogout}
        activeSection="reports"
        onSectionChange={() => {}}
      />
      <div className="flex-1 min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.18),_transparent_22%),linear-gradient(180deg,_rgba(2,6,23,0.96),_rgba(15,23,42,0.98))]" />
        <div className="relative z-10 min-h-screen flex flex-col">
          <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-20 no-print">
            <div className="mx-auto max-w-7xl px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-white/10 text-white border-white/10">Admin</Badge>
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      Reports
                    </Badge>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold font-display text-white">Reports</h1>
                  <p className="text-white/65 mt-1 max-w-3xl">
                    Intern performance reports and mentor rating summaries.
                  </p>
                </div>
                <Button type="button" onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Download className="w-4 h-4" />
                  Save as PDF
                </Button>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl px-6 py-8 flex-1">
            <Tabs value={reportTab} onValueChange={(v) => setReportTab(v as "intern" | "mentor")} className="space-y-6">
              <TabsList className="bg-white/5 border border-white/10 text-white h-auto p-1 no-print">
                <TabsTrigger value="intern" className="flex items-center gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-white">
                  <GraduationCap className="w-4 h-4" />
                  Intern Report
                </TabsTrigger>
                <TabsTrigger value="mentor" className="flex items-center gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-white">
                  <UserCheck className="w-4 h-4" />
                  Mentor Report
                </TabsTrigger>
              </TabsList>

              {/* ── Intern Report Tab ── */}
              <TabsContent value="intern" className="space-y-8">
            <Card className="border-white/10 bg-white/5 text-white no-print">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <h2 className="text-lg font-semibold">Select intern</h2>
                    <p className="text-sm text-white/55">Choose one student to generate a complete report card.</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wide text-white/50">Intern profile</label>
                    <select
                      value={selectedInternId}
                      onChange={(event) => setSelectedInternId(event.target.value)}
                      className="h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
                    >
                      {internUsers.map((intern) => (
                        <option key={intern.id} value={intern.id} className="text-slate-900">
                          {intern.name} {intern.internId ? `(${intern.internId})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-950/30 p-4 text-sm text-white/60">
                    The report uses live data from attendance sessions, feedback entries, and performance records.
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wide text-white/50">Admin performance message</label>
                  <textarea
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    rows={3}
                    placeholder="e.g. Pavan has shown consistent improvement in technical skills and demonstrated strong problem-solving ability throughout the internship..."
                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/30 text-sm resize-none outline-none"
                  />
                  <p className="text-xs text-white/35">This message will appear on the printed report card.</p>
                </div>
              </CardContent>
            </Card>

            {!selectedIntern || !report ? (
              <Card className="border-white/10 bg-white/5 text-white">
                <CardContent className="p-8 text-center text-white/60">No intern profiles are available yet.</CardContent>
              </Card>
            ) : (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="report-print-area space-y-6"
              >
                <Card className="border-white/10 bg-white text-slate-900 shadow-xl print:shadow-none print:border-slate-200">
                  <CardContent className="p-6 md:p-8 space-y-5">

                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-200">
                      <div className="space-y-1">
                        <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200 text-xs">HackMates · Intern Performance Report</Badge>
                        <h2 className="text-2xl font-bold text-slate-950">{selectedIntern.name}</h2>
                        <p className="text-sm text-slate-500">
                          {selectedIntern.email}{selectedIntern.internId ? ` · ${selectedIntern.internId}` : ""}
                        </p>
                      </div>
                      <div className="text-right text-xs text-slate-500 space-y-1">
                        <p>Generated: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
                        <p>Role: {selectedIntern.role}</p>
                        {selectedIntern.mentorId && <p>ID: {selectedIntern.mentorId}</p>}
                      </div>
                    </div>

                    {/* Overall score — prominent */}
                    <div className="rounded-2xl bg-slate-950 text-white p-5 flex flex-wrap items-center justify-between gap-4" style={{ backgroundColor: "#020617", color: "#ffffff" }}>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Overall Performance Score</p>
                        <p className="text-5xl font-bold">{report.overallScore}<span className="text-2xl text-slate-400 ml-1">/100</span></p>
                        <p className="text-xs text-slate-400 mt-2">Calculated from: Attendance + Submissions + Mentor Rating</p>
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-emerald-400" style={{ color: "#34d399" }}>{report.attendancePercentage}%</p>
                          <p className="text-xs text-slate-400 mt-0.5" style={{ color: "#94a3b8" }}>Attendance</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-sky-400" style={{ color: "#38bdf8" }}>{report.submissionScore}%</p>
                          <p className="text-xs text-slate-400 mt-0.5" style={{ color: "#94a3b8" }}>Submissions</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-amber-400" style={{ color: "#fbbf24" }}>{report.weeklyRatingScore > 0 ? `${report.weeklyRatingScore}%` : "—"}</p>
                          <p className="text-xs text-slate-400 mt-0.5" style={{ color: "#94a3b8" }}>Mentor Rating</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                      {[
                        { label: "Sessions", value: report.lecturesAttended + report.lecturesMissed, color: "#0f172a" },
                        { label: "Present", value: report.lecturesAttended, color: "#047857" },
                        { label: "Absent", value: report.lecturesMissed, color: "#be123c" },
                        { label: "Submissions", value: report.totalSubmissions, color: "#0f172a" },
                        { label: "Approved", value: report.approvedSubmissions, color: "#047857" },
                        { label: "Pending", value: report.pendingSubmissions, color: "#b45309" },
                      ].map((s) => (
                        <div key={s.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center" style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}>
                          <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                          <p className="text-xs text-slate-500 mt-0.5" style={{ color: "#64748b" }}>{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Attendance pie */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}>
                        <p className="text-xs uppercase tracking-wide text-slate-500 mb-3 font-medium">Attendance</p>
                        <div className="flex items-center gap-4">
                          <ResponsiveContainer width={160} height={160}>
                            <PieChart>
                              <Pie
                                data={[
                                  { name: "Present", value: report.lecturesAttended },
                                  { name: "Absent", value: report.lecturesMissed },
                                ]}
                                dataKey="value"
                                innerRadius={46}
                                outerRadius={68}
                                paddingAngle={3}
                                startAngle={90}
                                endAngle={-270}
                              >
                                <Cell fill="#10b981" />
                                <Cell fill="#f43f5e" />
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />Present: <b>{report.lecturesAttended}</b></div>
                            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />Absent: <b>{report.lecturesMissed}</b></div>
                            <div className="text-slate-500 font-semibold">{report.attendancePercentage}% attendance</div>
                          </div>
                        </div>
                      </div>

                      {/* Score breakdown bar */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}>
                        <p className="text-xs uppercase tracking-wide text-slate-500 mb-3 font-medium">Score Breakdown</p>
                        <ResponsiveContainer width="100%" height={160}>
                          <BarChart
                            data={[
                              { label: "Attendance", score: report.attendancePercentage },
                              { label: "Submissions", score: report.submissionScore },
                              { label: "Rating", score: report.weeklyRatingScore },
                            ]}
                            margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                              <Cell fill="#10b981" />
                              <Cell fill="#3b82f6" />
                              <Cell fill="#f59e0b" />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Mentor rating row */}
                    {report.mentorRatings.length > 0 && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Mentor Rating Average</p>
                          <p className="text-lg font-bold text-slate-900">{report.feedbackAverage}/10 <span className="text-slate-500 font-normal text-sm">({report.weeklyRatingScore}%)</span></p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map((n) => (
                            <Star key={n} className={`w-5 h-5 ${report.feedbackAverage >= n * 2 ? "fill-amber-400 text-amber-400" : report.feedbackAverage >= n * 2 - 1 ? "fill-amber-400/40 text-amber-400/40" : "text-slate-300"}`} />
                          ))}
                          <span className="text-xs text-slate-500 ml-2">from {report.mentorRatings.length} review{report.mentorRatings.length !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    )}

                    {/* Admin performance message */}
                    {adminComment.trim() && (
                      <div className="rounded-xl border border-slate-300 bg-slate-50 p-4 space-y-1">
                        <p className="text-xs uppercase tracking-wide text-slate-400 font-medium">Admin Remark</p>
                        <p className="text-sm text-slate-800 leading-relaxed">{adminComment.trim()}</p>
                      </div>
                    )}

                    {/* Footer */}
                    <p className="text-xs text-slate-400 pt-2 border-t border-slate-200">
                      This report is generated by HackMates. Overall score = average of attendance %, submission approval %, and mentor rating %. Data is live from the HackMates platform.
                    </p>
                  </CardContent>
                </Card>
              </motion.section>
            )}
              </TabsContent>

              {/* ── Mentor Report Tab ── */}
              <TabsContent value="mentor" className="space-y-6">
                {mentorUsers.length === 0 ? (
                  <Card className="border-white/10 bg-white/5 text-white">
                    <CardContent className="p-8 text-center text-white/60">No mentor profiles found.</CardContent>
                  </Card>
                ) : (
                  mentorReports.map(({ mentor, subs, avgRating, totalReviews, totalSessions }, i) => (
                    <motion.div key={mentor.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <Card className="border-white/10 bg-white/5 text-white">
                        <CardContent className="p-6 space-y-5">
                          {/* Mentor header */}
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <h2 className="text-xl font-bold">{mentor.name}</h2>
                              <p className="text-sm text-white/50">{mentor.email}</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center">
                                <p className="text-2xl font-bold text-amber-400">{avgRating > 0 ? `${avgRating}/10` : "—"}</p>
                                <p className="text-xs text-white/50 mt-0.5">Avg rating</p>
                              </div>
                              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center">
                                <p className="text-2xl font-bold text-yellow-300">{avgRating > 0 ? `${Math.round(avgRating * 10)}%` : "—"}</p>
                                <p className="text-xs text-white/50 mt-0.5">Rating %</p>
                              </div>
                              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center">
                                <p className="text-2xl font-bold text-primary">{totalReviews}</p>
                                <p className="text-xs text-white/50 mt-0.5">Reviews</p>
                              </div>
                              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center">
                                <p className="text-2xl font-bold text-emerald-400">{totalSessions}</p>
                                <p className="text-xs text-white/50 mt-0.5">Sessions</p>
                              </div>
                            </div>
                          </div>

                          {/* Star bar */}
                          {avgRating > 0 && (
                            <div className="flex items-center gap-2">
                              {[1,2,3,4,5].map((n) => (
                                <Star key={n} className={`w-5 h-5 ${avgRating >= n * 2 ? "fill-amber-400 text-amber-400" : avgRating >= n * 2 - 1 ? "fill-amber-400/50 text-amber-400/50" : "text-white/20"}`} />
                              ))}
                              <span className="text-sm text-white/60 ml-1">{avgRating} / 10 ({Math.round(avgRating * 10)}%) from {totalReviews} intern{totalReviews !== 1 ? "s" : ""}</span>
                            </div>
                          )}

                          {/* Anonymous feedback list */}
                          {totalReviews === 0 ? (
                            <p className="text-sm text-white/40 italic">No feedback received from interns yet.</p>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-xs uppercase tracking-wide text-white/40 font-medium">Feedback from interns (anonymous)</p>
                              {subs.map((sub, idx) => (
                                <div key={sub.id ?? idx} className="rounded-xl border border-white/10 bg-slate-950/40 p-4 space-y-2">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-1.5">
                                      {[1,2,3,4,5].map((n) => (
                                        <Star key={n} className={`w-4 h-4 ${sub.rating >= n * 2 ? "fill-amber-400 text-amber-400" : sub.rating >= n * 2 - 1 ? "fill-amber-400/50 text-amber-400/50" : "text-white/20"}`} />
                                      ))}
                                      <span className="text-xs text-white/60 ml-1">{sub.rating}/10</span>
                                    </div>
                                    <span className="text-xs text-white/40">{new Date(sub.submittedAt).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-xs text-white/35 italic">Anonymous intern</p>
                                  {sub.review && <p className="text-sm text-white/75">{sub.review}</p>}
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;