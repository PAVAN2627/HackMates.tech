import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, GraduationCap, Star, UserCheck, Users, CalendarCheck, Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlatform } from "@/context/PlatformContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import type { InternPeriodSnapshot } from "@/context/PlatformContext";

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
    internPeriods,
    saveInternPeriod,
    deleteInternPeriod,
  } = usePlatform();

  const internUsers = useMemo(
    () => [...users.filter((user) => user.role === "Intern")].sort((a, b) => a.name.localeCompare(b.name)),
    [users],
  );
  const mentorUsers = useMemo(
    () => [...users.filter((user) => user.role === "Mentor")].sort((a, b) => a.name.localeCompare(b.name)),
    [users],
  );
  const [reportTab, setReportTab] = useState<"intern" | "mentor" | "periods" | "final">("intern");
  const [selectedInternId, setSelectedInternId] = useState("");
  const [adminComment, setAdminComment] = useState("");
  const [periodInternId, setPeriodInternId] = useState("");
  const [closingPeriod, setClosingPeriod] = useState(false);
  const [periodAdminComment, setPeriodAdminComment] = useState("");
  const [selectedFinalInternId, setSelectedFinalInternId] = useState("");

  useEffect(() => {
    if (!selectedInternId && internUsers.length > 0) {
      setSelectedInternId(internUsers[0].id);
    }
  }, [internUsers, selectedInternId]);

  useEffect(() => {
    if (!periodInternId && internUsers.length > 0) {
      setPeriodInternId(internUsers[0].id);
    }
  }, [internUsers, periodInternId]);

  useEffect(() => {
    if (!selectedFinalInternId && internUsers.length > 0) {
      setSelectedFinalInternId(internUsers[0].id);
    }
  }, [internUsers, selectedFinalInternId]);

  const selectedIntern = useMemo(
    () => internUsers.find((user) => user.id === selectedInternId) ?? internUsers[0] ?? null,
    [internUsers, selectedInternId],
  );

    const report = useMemo(() => {
    if (!selectedIntern) {
      return null;
    }

    // Find the most recently closed period for this intern to determine current period start
    const closedForIntern = internPeriods
      .filter((p) => p.internId === selectedIntern.id)
      .sort((a, b) => b.periodNumber - a.periodNumber);
    const lastClosed = closedForIntern[0];
    // Current period number (1 if none closed, 2 if M1 closed, 3 if M2 closed)
    const currentPeriodNumber = lastClosed ? (lastClosed.periodNumber + 1) : 1;
    // Cutoff: the exact moment the period was closed
    // Data created AFTER this timestamp belongs to the new period
    const periodCutoffDate = lastClosed ? lastClosed.closedAt : null;

    const attendanceHistory = attendanceSessions
      .flatMap((session) => {
        // Use full ISO createdAt for precise filtering; fall back to date string + "T00:00:00Z"
        if (periodCutoffDate) {
          const sessionTime = session.createdAt ?? `${session.date}T00:00:00.000Z`;
          if (sessionTime <= periodCutoffDate) return [];
        }
        const record = session.records.find((entry) => entry.internId === selectedIntern.id);
        if (!record) return [];
        return [{
          sessionId: session.id,
          sessionTitle: session.title,
          mentorName: session.mentorName,
          date: session.date,
          startTime: session.startTime,
          status: record.status,
          markedAt: record.markedAt,
        }];
      })
      .sort((a, b) => b.date.localeCompare(a.date));

    const lecturesAttended = attendanceHistory.filter((entry) => entry.status === "Present").length;
    const lecturesMissed = attendanceHistory.filter((entry) => entry.status === "Absent").length;
    const attendancePercentage =
      lecturesAttended + lecturesMissed > 0 ? Math.round((lecturesAttended / (lecturesAttended + lecturesMissed)) * 100) : 0;

    const mentorRatings: ReportFeedbackEntry[] = [
      ...feedback
        .filter((entry) => entry.internId === selectedIntern.id)
        .filter((entry) => {
          if (!periodCutoffDate) return true;
          // feedback.date is "YYYY-MM-DD", compare as date-only
          return `${entry.date}T23:59:59.999Z` > periodCutoffDate;
        })
        .map((entry) => ({
          source: "Mentor feedback",
          date: entry.date,
          mentorName: entry.mentorName,
          rating: entry.rating,
          comment: entry.comment,
        })),
      ...mentorToInternFeedbackSubmissions
        .filter((entry) => entry.internId === selectedIntern.id)
        .filter((entry) => !periodCutoffDate || entry.submittedAt > periodCutoffDate)
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
      .filter((s) => {
        if (!periodCutoffDate) return true;
        const createdAt = (s as { createdAt?: string }).createdAt;
        // Only createdAt is reliable for period assignment
        // If createdAt exists: include only if created after the period cutoff
        if (createdAt) return createdAt > periodCutoffDate;
        // No createdAt means the submission was created before we started tracking it
        // → it belongs to Month 1 regardless of its current status, exclude from new periods
        return false;
      })
      .sort((a, b) => {
        const aDate = (a as { createdAt?: string }).createdAt || a.submittedAt || a.dueDate || "";
        const bDate = (b as { createdAt?: string }).createdAt || b.submittedAt || b.dueDate || "";
        return bDate.localeCompare(aDate);
      });
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
      currentPeriodNumber,
      periodCutoffDate,
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
  }, [attendanceSessions, feedback, mentorToInternFeedbackSubmissions, performance, selectedIntern, submissions, dailyNotes, internPeriods]);

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

  const handleClosePeriod = async (periodNumber: 1 | 2 | 3) => {
    const intern = internUsers.find((u) => u.id === periodInternId);
    if (!intern || !sessionUser) return;

    // Check period not already closed for this intern
    const existing = internPeriods.find(
      (p) => p.internId === intern.id && p.periodNumber === periodNumber,
    );
    if (existing) {
      alert(`Month ${periodNumber} is already closed for ${intern.name}.`);
      return;
    }

    if (!window.confirm(`Close Month ${periodNumber} for ${intern.name}? This will save a score snapshot. The original data is NOT deleted.`)) return;

    setClosingPeriod(true);
    try {
      // Get the previous period cutoff for this intern (to filter only current period data)
      const prevPeriods = internPeriods
        .filter((p) => p.internId === intern.id && p.periodNumber < periodNumber)
        .sort((a, b) => b.periodNumber - a.periodNumber);
      const prevCutoff = prevPeriods[0]?.closedAt ?? null;

      // Calculate scores from live data, scoped to current period only
      const internAttendance = attendanceSessions.flatMap((s) => {
        if (prevCutoff) {
          const sessionTime = s.createdAt ?? `${s.date}T00:00:00.000Z`;
          if (sessionTime <= prevCutoff) return [];
        }
        const rec = s.records.find((r) => r.internId === intern.id);
        return rec ? [rec.status] : [];
      });
      const attended = internAttendance.filter((s) => s === "Present").length;
      const missed = internAttendance.filter((s) => s === "Absent").length;
      const attendancePct = attended + missed > 0 ? Math.round((attended / (attended + missed)) * 100) : 0;

      // Filter submissions: only those created in this period
      const internSubs = submissions.filter((s) => {
        if (s.internId !== intern.id) return false;
        const createdAt = (s as { createdAt?: string }).createdAt;
        if (prevCutoff) {
          // Must have been created after the previous period closed
          if (createdAt) return createdAt > prevCutoff;
          // No createdAt — belongs to Month 1 (previous periods), exclude
          return false;
        }
        // No previous period — include all
        return true;
      });
      const totalSubs = internSubs.length;
      const approvedSubs = internSubs.filter((s) => s.status === "Approved").length;
      const pendingSubs = internSubs.filter((s) => s.status === "Pending").length;
      const subScore = totalSubs > 0 ? Math.round((approvedSubs / totalSubs) * 100) : 0;

      const mentorRatings = [
        ...feedback.filter((e) => {
          if (e.internId !== intern.id) return false;
          if (prevCutoff) return `${e.date}T23:59:59.999Z` > prevCutoff;
          return true;
        }).map((e) => e.rating),
        ...mentorToInternFeedbackSubmissions.filter((e) => {
          if (e.internId !== intern.id) return false;
          if (prevCutoff) return e.submittedAt > prevCutoff;
          return true;
        }).map((e) => e.rating),
      ];
      const ratingAvg = mentorRatings.length > 0
        ? Number((mentorRatings.reduce((s, r) => s + r, 0) / mentorRatings.length).toFixed(1))
        : 0;
      const ratingScore = Math.round(ratingAvg * 10);

      const scoreParts = [
        ...(attended + missed > 0 ? [attendancePct] : []),
        ...(totalSubs > 0 ? [subScore] : []),
        ...(mentorRatings.length > 0 ? [ratingScore] : []),
      ];
      const overall = scoreParts.length > 0
        ? Math.round(scoreParts.reduce((s, v) => s + v, 0) / scoreParts.length)
        : 0;

      // Save individual month report with periodNumber
      await saveInternPeriod({
        internId: intern.id,
        internName: intern.name,
        internEmail: intern.email,
        periodNumber,
        closedAt: new Date().toISOString(),
        closedBy: sessionUser.name,
        attendancePercentage: attendancePct,
        sessionsAttended: attended,
        sessionsMissed: missed,
        totalSubmissions: totalSubs,
        approvedSubmissions: approvedSubs,
        pendingSubmissions: pendingSubs,
        submissionScore: subScore,
        mentorRatingAvg: ratingAvg,
        weeklyRatingScore: ratingScore,
        overallScore: overall,
        ...(periodAdminComment.trim() ? { adminComment: periodAdminComment.trim() } : {}),
      });

      setPeriodAdminComment("");
      alert(`Month ${periodNumber} snapshot saved for ${intern.name}. ✅ Individual month report created.`);
    } catch (err) {
      console.error(err);
      alert("Failed to save period snapshot.");
    } finally {
      setClosingPeriod(false);
    }
  };

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
            <Tabs value={reportTab} onValueChange={(v) => setReportTab(v as "intern" | "mentor" | "periods" | "final")} className="space-y-6">
              <TabsList className="bg-white/5 border border-white/10 text-white h-auto p-1 no-print">
                <TabsTrigger value="intern" className="flex items-center gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-white">
                  <GraduationCap className="w-4 h-4" />
                  Intern Report
                </TabsTrigger>
                <TabsTrigger value="mentor" className="flex items-center gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-white">
                  <UserCheck className="w-4 h-4" />
                  Mentor Report
                </TabsTrigger>
                <TabsTrigger value="periods" className="flex items-center gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-white">
                  <CalendarCheck className="w-4 h-4" />
                  Monthly Periods
                </TabsTrigger>
                <TabsTrigger value="final" className="flex items-center gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Download className="w-4 h-4" />
                  Final Report (All 3 Months)
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
                    {report?.periodCutoffDate && (
                      <p className="mt-1 text-white/40 text-xs">Month {report.currentPeriodNumber} started: {new Date(report.periodCutoffDate).toLocaleString()}</p>
                    )}
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
                        <Badge className="bg-sky-500/10 text-sky-700 border-sky-200 text-xs" style={{ backgroundColor: "#f0f9ff", color: "#0369a1", borderColor: "#bae6fd" }}>
                          Month {report.currentPeriodNumber} — Current Period
                        </Badge>
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

              {/* ── Monthly Periods Tab ── */}
              <TabsContent value="periods" className="space-y-6">

                {/* Close Period — control panel */}
                <Card className="border-white/10 bg-white/5 text-white">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-1">
                      <CalendarCheck className="w-5 h-5 text-primary" />
                      <div>
                        <h2 className="text-lg font-semibold">Close a Monthly Period</h2>
                        <p className="text-sm text-white/55">Saves a score snapshot for an intern at the end of Month 1, 2, or 3. Original data is never deleted.</p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wide text-white/50">Intern</label>
                        <select
                          value={periodInternId}
                          onChange={(e) => setPeriodInternId(e.target.value)}
                          className="h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
                        >
                          {internUsers.map((u) => (
                            <option key={u.id} value={u.id} className="text-slate-900">{u.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wide text-white/50">Admin remark (optional)</label>
                        <textarea
                          value={periodAdminComment}
                          onChange={(e) => setPeriodAdminComment(e.target.value)}
                          rows={2}
                          placeholder="Overall performance note for this month..."
                          className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/30 text-sm resize-none outline-none"
                        />
                      </div>
                    </div>

                    {/* Which months are already closed for selected intern */}
                    {(() => {
                      const closedNums = internPeriods
                        .filter((p) => p.internId === periodInternId)
                        .map((p) => p.periodNumber);
                      return (
                        <div className="flex flex-wrap gap-3">
                          {([1, 2, 3] as const).map((n) => {
                            const isClosed = closedNums.includes(n);
                            return (
                              <Button
                                key={n}
                                type="button"
                                disabled={isClosed || closingPeriod}
                                onClick={() => handleClosePeriod(n)}
                                className={isClosed
                                  ? "bg-white/10 text-white/40 cursor-not-allowed"
                                  : "bg-primary hover:bg-primary/80"}
                              >
                                <CalendarCheck className="w-4 h-4" />
                                {isClosed ? `Month ${n} — Closed ✓` : `Close Month ${n}`}
                              </Button>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Per-intern period snapshots */}
                {internUsers.map((intern) => {
                  const periods = internPeriods
                    .filter((p) => p.internId === intern.id)
                    .sort((a, b) => a.periodNumber - b.periodNumber);

                  if (periods.length === 0) return null;

                  const overallAvg = periods.length === 3
                    ? Math.round(periods.reduce((s, p) => s + p.overallScore, 0) / 3)
                    : null;

                  return (
                    <motion.div key={intern.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="border-white/10 bg-white/5 text-white">
                        <CardContent className="p-6 space-y-4">
                          {/* Intern header */}
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-lg font-bold">{intern.name}</p>
                              <p className="text-sm text-white/50">{intern.email}{intern.internId ? ` · ${intern.internId}` : ""}</p>
                            </div>
                            {overallAvg !== null && (
                              <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-center">
                                <p className="text-2xl font-bold text-primary">{overallAvg}/100</p>
                                <p className="text-xs text-white/50 mt-0.5">3-Month Overall</p>
                              </div>
                            )}
                          </div>

                          {/* Monthly snapshots */}
                          <div className="grid gap-4 md:grid-cols-3">
                            {periods.map((period) => (
                              <div key={period.id} className="rounded-xl border border-white/10 bg-slate-950/40 p-4 space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-semibold text-sm">Month {period.periodNumber}</p>
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/20 text-xs">
                                      {period.overallScore}/100
                                    </Badge>
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (!window.confirm(`Delete Month ${period.periodNumber} snapshot for ${intern.name}?`)) return;
                                        await deleteInternPeriod(period.id);
                                      }}
                                      className="text-white/30 hover:text-red-400 transition-colors"
                                      title="Delete snapshot"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="space-y-1.5 text-xs">
                                  <div className="flex justify-between text-white/60">
                                    <span>Attendance</span>
                                    <span className="font-semibold text-white">{period.attendancePercentage}%</span>
                                  </div>
                                  <div className="flex justify-between text-white/60">
                                    <span>Present / Absent</span>
                                    <span className="text-white">{period.sessionsAttended} / {period.sessionsMissed}</span>
                                  </div>
                                  <div className="flex justify-between text-white/60">
                                    <span>Submissions</span>
                                    <span className="font-semibold text-white">{period.submissionScore}%</span>
                                  </div>
                                  <div className="flex justify-between text-white/60">
                                    <span>Approved / Total</span>
                                    <span className="text-white">{period.approvedSubmissions} / {period.totalSubmissions}</span>
                                  </div>
                                  <div className="flex justify-between text-white/60">
                                    <span>Mentor Rating</span>
                                    <span className="font-semibold text-amber-300">{period.mentorRatingAvg}/10 ({period.weeklyRatingScore}%)</span>
                                  </div>
                                </div>

                                {period.adminComment && (
                                  <p className="text-xs text-white/50 italic border-t border-white/10 pt-2">"{period.adminComment}"</p>
                                )}
                                <p className="text-xs text-white/30">Closed {new Date(period.closedAt).toLocaleDateString()} by {period.closedBy}</p>
                              </div>
                            ))}

                            {/* Placeholder cards for missing months */}
                            {([1, 2, 3] as const)
                              .filter((n) => !periods.find((p) => p.periodNumber === n))
                              .map((n) => (
                                <div key={n} className="rounded-xl border border-white/5 bg-white/3 p-4 flex items-center justify-center text-center">
                                  <p className="text-xs text-white/25">Month {n}<br />Not closed yet</p>
                                </div>
                              ))}
                          </div>

                          {/* 3-month summary bar if all 3 closed */}
                          {overallAvg !== null && (
                            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                              <p className="text-xs uppercase tracking-wide text-white/50 font-medium">3-Month Score Comparison</p>
                              <div className="flex items-end gap-3">
                                {periods.map((p) => (
                                  <div key={p.id} className="flex-1 text-center">
                                    <div
                                      className="rounded-t-lg bg-primary mx-auto"
                                      style={{ height: `${Math.max(8, p.overallScore)}px`, width: "100%", backgroundColor: "#0f766e" }}
                                    />
                                    <p className="text-xs text-white/60 mt-1">M{p.periodNumber}</p>
                                    <p className="text-xs font-bold text-white">{p.overallScore}</p>
                                  </div>
                                ))}
                                <div className="flex-1 text-center border-l border-white/10 pl-3">
                                  <p className="text-xs text-white/50">Avg</p>
                                  <p className="text-lg font-bold text-primary">{overallAvg}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}

                {internUsers.every((u) => !internPeriods.some((p) => p.internId === u.id)) && (
                  <Card className="border-white/10 bg-white/5 text-white">
                    <CardContent className="p-8 text-center text-white/50 text-sm">
                      No period snapshots yet. Use the panel above to close Month 1 for each intern when the first month ends.
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* ── Final Report Tab (All 3 Months Combined) ── */}
              <TabsContent value="final" className="space-y-6">
                <Card className="border-white/10 bg-white/5 text-white no-print">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <Download className="w-5 h-5 text-primary" />
                      <div>
                        <h2 className="text-lg font-semibold">Final Report - All 3 Months</h2>
                        <p className="text-sm text-white/55">View and save a combined report showing all 3 month snapshots for an intern.</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wide text-white/50">Select intern</label>
                      <select
                        value={selectedFinalInternId}
                        onChange={(e) => setSelectedFinalInternId(e.target.value)}
                        className="h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
                      >
                        {internUsers.map((u) => (
                          <option key={u.id} value={u.id} className="text-slate-900">{u.name} {u.internId ? `(${u.internId})` : ""}</option>
                        ))}
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Final Report Print Area */}
                {(() => {
                  const finalIntern = internUsers.find((u) => u.id === selectedFinalInternId);
                  const finalPeriods = internPeriods
                    .filter((p) => p.internId === selectedFinalInternId)
                    .sort((a, b) => a.periodNumber - b.periodNumber);

                  if (!finalIntern || finalPeriods.length === 0) {
                    return (
                      <Card className="border-white/10 bg-white/5 text-white">
                        <CardContent className="p-8 text-center text-white/60">
                          {!finalIntern ? "Select an intern to view their final report." : "No period snapshots available for this intern. Periods must be closed first."}
                        </CardContent>
                      </Card>
                    );
                  }

                  const overallAvg = finalPeriods.length === 3
                    ? Math.round(finalPeriods.reduce((s, p) => s + p.overallScore, 0) / 3)
                    : Math.round(finalPeriods.reduce((s, p) => s + p.overallScore, 0) / finalPeriods.length);

                  return (
                    <motion.section
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="report-print-area space-y-6"
                    >
                      <Card className="border-white/10 bg-white text-slate-900 shadow-xl print:shadow-none print:border-slate-200">
                        <CardContent className="p-6 md:p-8 space-y-6">
                          {/* Header */}
                          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-200">
                            <div className="space-y-1">
                              <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200 text-xs">HackMates · Final Internship Report</Badge>
                              <Badge className="bg-blue-500/10 text-blue-700 border-blue-200 text-xs">All 3 Months Combined</Badge>
                              <h2 className="text-2xl font-bold text-slate-950">{finalIntern.name}</h2>
                              <p className="text-sm text-slate-500">
                                {finalIntern.email}{finalIntern.internId ? ` · ${finalIntern.internId}` : ""}
                              </p>
                            </div>
                            <div className="text-right text-xs text-slate-500 space-y-1">
                              <p>Generated: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
                              <p>Role: {finalIntern.role}</p>
                              <p>Total Periods: {finalPeriods.length}/3</p>
                            </div>
                          </div>

                          {/* Overall 3-month score */}
                          <div className="rounded-2xl bg-slate-950 text-white p-6 space-y-4" style={{ backgroundColor: "#020617" }}>
                            <div>
                              <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Overall 3-Month Performance Score</p>
                              <p className="text-6xl font-bold">{overallAvg}<span className="text-3xl text-slate-400 ml-2">/100</span></p>
                              <p className="text-sm text-slate-400 mt-3">Average of all completed months</p>
                            </div>
                          </div>

                          {/* Monthly breakdown */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-950">Monthly Breakdown</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {finalPeriods.map((period) => (
                                <div key={period.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <p className="font-bold text-slate-950">Month {period.periodNumber}</p>
                                    <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-200">
                                      {period.overallScore}/100
                                    </Badge>
                                  </div>

                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between border-b border-slate-200 pb-2">
                                      <span className="text-slate-600">Attendance</span>
                                      <span className="font-semibold text-slate-900">{period.attendancePercentage}%</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-200 pb-2">
                                      <span className="text-slate-600">Sessions: {period.sessionsAttended} / {period.sessionsAttended + period.sessionsMissed}</span>
                                      <span className="font-semibold text-emerald-600">✓</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-200 pb-2">
                                      <span className="text-slate-600">Submissions</span>
                                      <span className="font-semibold text-slate-900">{period.submissionScore}%</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-200 pb-2">
                                      <span className="text-slate-600">Approved: {period.approvedSubmissions} / {period.totalSubmissions}</span>
                                      <span className="font-semibold text-emerald-600">✓</span>
                                    </div>
                                    <div className="flex justify-between pt-2">
                                      <span className="text-slate-600">Mentor Rating</span>
                                      <span className="font-semibold text-amber-600">{period.mentorRatingAvg}/10</span>
                                    </div>
                                  </div>

                                  {period.adminComment && (
                                    <div className="rounded border border-slate-300 bg-white p-2 text-xs italic text-slate-700">
                                      "{period.adminComment}"
                                    </div>
                                  )}

                                  <p className="text-xs text-slate-400 pt-2 border-t border-slate-200">
                                    Closed: {new Date(period.closedAt).toLocaleDateString()} by {period.closedBy}
                                  </p>
                                </div>
                              ))}

                              {/* Show placeholder for missing months */}
                              {finalPeriods.length < 3 && (
                                <>
                                  {[1, 2, 3].filter((n) => !finalPeriods.find((p) => p.periodNumber === n)).map((n) => (
                                    <div key={n} className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-center text-center">
                                      <div className="text-slate-400">
                                        <p className="font-semibold text-sm">Month {n}</p>
                                        <p className="text-xs mt-1">Not closed yet</p>
                                      </div>
                                    </div>
                                  ))}
                                </>
                              )}
                            </div>
                          </div>

                          {/* Comparison chart */}
                          {finalPeriods.length > 0 && (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                              <p className="text-sm font-bold text-slate-950">Performance Trend</p>
                              <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={finalPeriods.map((p) => ({ name: `Month ${p.periodNumber}`, score: p.overallScore }))}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                                  <Bar dataKey="score" radius={[4, 4, 0, 0]} fill="#0f766e" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          )}

                          {/* Summary stats */}
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                            <p className="text-sm font-bold text-slate-950">3-Month Summary</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div className="text-center">
                                <p className="text-xl font-bold text-slate-950">
                                  {finalPeriods.reduce((sum, p) => sum + p.sessionsAttended, 0)}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">Total Present</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xl font-bold text-slate-950">
                                  {finalPeriods.reduce((sum, p) => sum + p.sessionsMissed, 0)}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">Total Absent</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xl font-bold text-slate-950">
                                  {finalPeriods.reduce((sum, p) => sum + p.totalSubmissions, 0)}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">Total Submissions</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xl font-bold text-slate-950">
                                  {finalPeriods.reduce((sum, p) => sum + p.approvedSubmissions, 0)}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">Approved</p>
                              </div>
                            </div>
                          </div>

                          {/* Footer */}
                          <p className="text-xs text-slate-400 pt-4 border-t border-slate-200">
                            This is the final comprehensive report combining all {finalPeriods.length} completed month(s) of the internship. Overall score = average of all month scores.
                          </p>
                        </CardContent>
                      </Card>
                    </motion.section>
                  );
                })()}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;