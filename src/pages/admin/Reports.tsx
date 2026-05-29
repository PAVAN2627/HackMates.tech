import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BadgeCheck, CalendarDays, Download, FileText, GraduationCap, Star, TrendingUp, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
    submissions,
    dailyNotes,
  } = usePlatform();

  const internUsers = useMemo(
    () => [...users.filter((user) => user.role === "Intern")].sort((a, b) => a.name.localeCompare(b.name)),
    [users],
  );
  const [selectedInternId, setSelectedInternId] = useState("");

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

    const overallScoreParts = [attendancePercentage, performanceAverage, feedbackAverage ? Math.round(feedbackAverage * 10) : 0].filter(
      (value) => value > 0,
    );
    const overallScore = averageScore(overallScoreParts);

    return {
      attendanceHistory,
      lecturesAttended,
      lecturesMissed,
      attendancePercentage,
      mentorRatings,
      feedbackAverage,
      submissionsList,
      submissionCounts,
      notesList,
      performanceHistory,
      performanceAverage,
      overallScore,
    };
  }, [attendanceSessions, feedback, mentorToInternFeedbackSubmissions, performance, selectedIntern]);

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
            margin: 12mm;
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
                  <h1 className="text-3xl md:text-4xl font-bold font-display text-white">Intern Performance Report</h1>
                  <p className="text-white/65 mt-1 max-w-3xl">
                    Generate a profile-wise report for any intern, including attendance, feedback, performance, and a printable PDF view.
                  </p>
                </div>
                <Button type="button" onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Download className="w-4 h-4" />
                  Save as PDF
                </Button>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl px-6 py-8 space-y-8 flex-1">
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
                  <CardContent className="p-6 md:p-8 space-y-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-2">
                        <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200">Intern Report</Badge>
                        <div>
                          <h2 className="text-3xl font-bold font-display text-slate-950">{selectedIntern.name}</h2>
                          <p className="text-sm text-slate-500">
                            {selectedIntern.email} {selectedIntern.internId ? `| ${selectedIntern.internId}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="grid gap-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-emerald-600" />
                          Generated {new Date().toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-emerald-600" />
                          {selectedIntern.position || "Intern profile"}
                        </div>
                        {selectedIntern.mentorId && (
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-600" />
                            {selectedIntern.mentorId}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                      {[
                        { label: "Attendance %", value: `${report.attendancePercentage}%`, icon: BadgeCheck, tone: "text-emerald-700 bg-emerald-50" },
                        { label: "Lectures attended", value: report.lecturesAttended, icon: CalendarDays, tone: "text-sky-700 bg-sky-50" },
                        { label: "Lectures missed", value: report.lecturesMissed, icon: CalendarDays, tone: "text-rose-700 bg-rose-50" },
                        { label: "Feedback avg", value: `${report.feedbackAverage}/10`, icon: Star, tone: "text-amber-700 bg-amber-50" },
                        { label: "Overall score", value: `${report.overallScore}/100`, icon: TrendingUp, tone: "text-violet-700 bg-violet-50" },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                              <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${item.tone}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                            </div>
                            <p className="mt-3 text-2xl font-bold text-slate-950">{item.value}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-semibold text-slate-950">Attendance Summary</h3>
                          <Badge className="bg-slate-900 text-white">{report.attendanceHistory.length} sessions</Badge>
                        </div>
                        <p className="text-sm text-slate-600">
                          Lectures attended: <span className="font-semibold text-slate-900">{report.lecturesAttended}</span> | Lectures missed: <span className="font-semibold text-slate-900">{report.lecturesMissed}</span>
                        </p>
                        <div className="space-y-3 max-h-72 overflow-auto pr-1">
                          {report.attendanceHistory.length === 0 ? (
                            <p className="text-sm text-slate-500">No attendance records for this intern yet.</p>
                          ) : (
                            report.attendanceHistory.map((entry) => (
                              <div key={entry.sessionId} className="rounded-xl border border-slate-200 bg-white p-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div>
                                    <p className="font-semibold text-slate-950">{entry.sessionTitle}</p>
                                    <p className="text-xs text-slate-500">
                                      {entry.date} {entry.startTime ? `| ${entry.startTime}` : ""} | Mentor: {entry.mentorName}
                                    </p>
                                  </div>
                                  <Badge
                                    className={
                                      entry.status === "Present"
                                        ? "bg-emerald-500/10 text-emerald-700 border-emerald-200"
                                        : "bg-rose-500/10 text-rose-700 border-rose-200"
                                    }
                                  >
                                    {entry.status}
                                  </Badge>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-semibold text-slate-950">Feedback Summary</h3>
                          <Badge className="bg-slate-900 text-white">{report.mentorRatings.length} ratings</Badge>
                        </div>
                        <p className="text-sm text-slate-600">
                          Average rating: <span className="font-semibold text-slate-900">{report.feedbackAverage}/10</span>
                        </p>
                        <div className="space-y-3 max-h-72 overflow-auto pr-1">
                          {report.mentorRatings.length === 0 ? (
                            <p className="text-sm text-slate-500">No feedback has been recorded for this intern yet.</p>
                          ) : (
                            report.mentorRatings.map((entry, index) => (
                              <div key={`${entry.source}-${entry.date}-${index}`} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div>
                                    <p className="font-semibold text-slate-950">{entry.mentorName}</p>
                                    <p className="text-xs text-slate-500">
                                      {entry.source} | {new Date(entry.date).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <Badge className="bg-amber-500/10 text-amber-700 border-amber-200">{entry.rating}/10</Badge>
                                </div>
                                <p className="text-sm text-slate-600">{entry.comment}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-semibold text-slate-950">Submissions</h3>
                          <Badge className="bg-slate-900 text-white">{report.submissionCounts?.total ?? 0}</Badge>
                        </div>
                        <p className="text-sm text-slate-600">Total submissions: <span className="font-semibold text-slate-900">{report.submissionCounts?.total ?? 0}</span></p>
                        <div className="space-y-3 max-h-72 overflow-auto pr-1">
                          {(!report.submissionsList || report.submissionsList.length === 0) ? (
                            <p className="text-sm text-slate-500">No submissions recorded for this intern.</p>
                          ) : (
                            report.submissionsList.map((s) => (
                              <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold text-slate-900">{s.title}</p>
                                    <p className="text-xs text-slate-500">{s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : "-"}</p>
                                  </div>
                                  <Badge className={s.status === "Approved" ? "bg-emerald-500/10 text-emerald-700" : s.status === "Reviewed" ? "bg-sky-500/10 text-sky-700" : "bg-amber-500/10 text-amber-700"}>{s.status}</Badge>
                                </div>
                                {s.feedback && <p className="text-sm text-slate-600 mt-2">{s.feedback}</p>}
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-semibold text-slate-950">Notes</h3>
                          <Badge className="bg-slate-900 text-white">{report.notesList?.length ?? 0}</Badge>
                        </div>
                        <p className="text-sm text-slate-600">Recent daily notes and lecture remarks.</p>
                        <div className="space-y-3 max-h-72 overflow-auto pr-1">
                          {(!report.notesList || report.notesList.length === 0) ? (
                            <p className="text-sm text-slate-500">No notes available for this intern.</p>
                          ) : (
                            report.notesList.map((n) => (
                              <div key={n.id} className="rounded-xl border border-slate-200 bg-white p-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold text-slate-900">{n.title}</p>
                                    <p className="text-xs text-slate-500">{n.date}</p>
                                  </div>
                                  <span className="text-xs text-slate-500">{n.lectureTime || ""}</span>
                                </div>
                                <p className="text-sm text-slate-600 mt-2">{n.note}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold text-slate-950">Performance Records</h3>
                        <Badge className="bg-slate-900 text-white">Average {report.performanceAverage}</Badge>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {report.performanceHistory.length === 0 ? (
                          <p className="text-sm text-slate-500">No monthly performance records found.</p>
                        ) : (
                          report.performanceHistory.map((entry) => (
                            <div key={entry.id} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                              <div className="flex items-center justify-between gap-3">
                                <p className="font-semibold text-slate-950">{entry.monthLabel}</p>
                                <Badge className="bg-violet-500/10 text-violet-700 border-violet-200">{entry.score}/100</Badge>
                              </div>
                              <p className="text-sm text-slate-600">{entry.remark || "No remark added."}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                      This report combines attendance sessions, mentor feedback, form-based mentor feedback, and monthly performance records.
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;