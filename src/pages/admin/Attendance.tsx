import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, CheckCircle2, Pencil, Save, Trash2, UserCheck, UserX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePlatform } from "@/context/PlatformContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useState } from "react";

const AdminAttendance = () => {
  const { loading, sessionUser, logout, attendanceSessions, users, updateAttendanceSession, deleteAttendanceSession } = usePlatform();
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    date: "",
    startTime: "",
    notes: "",
  });

  if (!loading && !sessionUser) {
    return <Navigate to="/login" replace />;
  }

  if (!loading && sessionUser?.role !== "Admin") {
    return <Navigate to="/login" replace />;
  }

  if (!sessionUser) {
    return null;
  }

  const handleLogout = () => {
    logout();
  };

  const handleEditStart = (sessionId: string, title: string, date: string, startTime: string, notes?: string) => {
    setEditingSessionId(sessionId);
    setEditForm({
      title,
      date,
      startTime,
      notes: notes || "",
    });
  };

  const handleEditSave = async () => {
    if (!editingSessionId || !editForm.title.trim() || !editForm.date || !editForm.startTime) {
      return;
    }

    setSavingEdit(true);
    try {
      await updateAttendanceSession({
        sessionId: editingSessionId,
        title: editForm.title,
        date: editForm.date,
        startTime: editForm.startTime,
        notes: editForm.notes,
      });
      setEditingSessionId(null);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm("Delete this attendance session?")) {
      return;
    }

    setDeletingSessionId(sessionId);
    try {
      await deleteAttendanceSession(sessionId);
      if (editingSessionId === sessionId) {
        setEditingSessionId(null);
      }
    } finally {
      setDeletingSessionId(null);
    }
  };

  const internUsers = users.filter((user) => user.role === "Intern");
  const totalSessions = attendanceSessions.length;
  const totalMarked = attendanceSessions.reduce((total, session) => total + session.records.length, 0);
  const totalPresent = attendanceSessions.reduce(
    (total, session) => total + session.records.filter((record) => record.status === "Present").length,
    0,
  );
  const overallPercentage = totalMarked > 0 ? Math.round((totalPresent / totalMarked) * 100) : 0;

  const mentorBuckets = attendanceSessions.reduce<Record<string, { sessions: number; marked: number }>>((acc, session) => {
    const key = session.mentorName || "Unknown mentor";
    if (!acc[key]) {
      acc[key] = { sessions: 0, marked: 0 };
    }

    acc[key].sessions += 1;
    acc[key].marked += session.records.length;
    return acc;
  }, {});

  const mentorStats = Object.entries(mentorBuckets)
    .map(([mentorName, value]) => ({ mentorName, ...value }))
    .sort((a, b) => b.sessions - a.sessions);

  const internStats = internUsers
    .map((intern) => {
      let present = 0;
      let absent = 0;

      attendanceSessions.forEach((session) => {
        const record = session.records.find((entry) => entry.internId === intern.id);
        if (!record) {
          return;
        }

        if (record.status === "Present") {
          present += 1;
        } else {
          absent += 1;
        }
      });

      const total = present + absent;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
      return {
        id: intern.id,
        name: intern.name,
        email: intern.email,
        present,
        absent,
        total,
        percentage,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden flex">
      <DashboardSidebar
        role="Admin"
        userName={sessionUser.email}
        onLogout={handleLogout}
        activeSection="attendance"
        onSectionChange={() => {}}
      />
      <div className="flex-1 min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.18),_transparent_22%),linear-gradient(180deg,_rgba(2,6,23,0.96),_rgba(15,23,42,0.98))]" />
        <div className="relative z-10 min-h-screen flex flex-col">
          <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-20">
            <div className="mx-auto max-w-7xl px-6 py-4">
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-white/10 text-white border-white/10">Admin</Badge>
                <Badge variant="outline" className="border-primary/30 text-primary">
                  Attendance
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-display text-white">Attendance Overview</h1>
              <p className="text-white/65 mt-1 max-w-3xl">
                Monitor mentor-wise sessions, every intern&apos;s present or absent history, and overall attendance percentage.
              </p>
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-6 py-8 space-y-8 flex-1">
            <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 md:grid-cols-4">
              {[
                { label: "Sessions", value: totalSessions, icon: CalendarDays, helper: "Total attendance sessions" },
                { label: "Records", value: totalMarked, icon: UserCheck, helper: "All marked entries" },
                { label: "Present", value: totalPresent, icon: CheckCircle2, helper: "Present marks" },
                { label: "Overall %", value: `${overallPercentage}%`, icon: UserX, helper: "Presence percentage" },
              ].map((item) => (
                <Card key={item.label} className="border-white/10 bg-white/5 backdrop-blur-sm text-white">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-white/60 mb-1">{item.label}</p>
                        <p className="text-3xl font-bold">{item.value}</p>
                        <p className="text-xs text-white/50 mt-2">{item.helper}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-primary/10 text-primary">
                        <item.icon className="w-5 h-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="grid gap-6 lg:grid-cols-2">
              <Card className="border-white/10 bg-white/5 text-white backdrop-blur-sm">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold">Mentor Session Summary</h3>
                  {mentorStats.length === 0 ? (
                    <p className="text-sm text-white/65">No mentor attendance sessions yet.</p>
                  ) : (
                    mentorStats.map((mentor) => (
                      <div key={mentor.mentorName} className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">{mentor.mentorName}</p>
                          <p className="text-sm text-white/60">{mentor.marked} student records marked</p>
                        </div>
                        <Badge className="bg-primary/15 text-primary border-primary/20">{mentor.sessions} sessions</Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5 text-white backdrop-blur-sm">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold">Intern Attendance Percentage</h3>
                  {internStats.length === 0 ? (
                    <p className="text-sm text-white/65">No interns found.</p>
                  ) : (
                    internStats.map((intern) => (
                      <div key={intern.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold">{intern.name}</p>
                            <p className="text-xs text-white/55">{intern.email}</p>
                          </div>
                          <Badge
                            className={
                              intern.percentage >= 75
                                ? "bg-green-500/15 text-green-300 border-green-500/20"
                                : "bg-amber-500/15 text-amber-300 border-amber-500/20"
                            }
                          >
                            {intern.percentage}%
                          </Badge>
                        </div>
                        <p className="text-sm text-white/65 mt-2">
                          Present: {intern.present} | Absent: {intern.absent} | Total Marked: {intern.total}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
              <Card className="border-white/10 bg-white/5 text-white backdrop-blur-sm">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold">Session-Wise Attendance Records</h3>
                  {attendanceSessions.length === 0 ? (
                    <p className="text-sm text-white/65">No attendance session records available.</p>
                  ) : (
                    attendanceSessions.map((session) => (
                      <div key={session.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold">{session.title}</p>
                            <p className="text-sm text-white/60">
                              {session.date} {session.startTime ? `| ${session.startTime}` : ""} | Mentor: {session.mentorName}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            <Badge
                              className={
                                session.status === "Closed"
                                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
                                  : "bg-amber-500/15 text-amber-300 border-amber-500/20"
                              }
                            >
                              {session.status}
                            </Badge>
                            <Badge variant="outline" className="border-white/20 text-white/85">
                              {session.records.length} students marked
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => handleEditStart(session.id, session.title, session.date, session.startTime, session.notes)}>
                            <Pencil className="w-4 h-4" />
                            Edit
                          </Button>
                          <Button type="button" variant="destructive" onClick={() => handleDeleteSession(session.id)} disabled={deletingSessionId === session.id}>
                            <Trash2 className="w-4 h-4" />
                            {deletingSessionId === session.id ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                        {editingSessionId === session.id && (
                          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4 space-y-3">
                            <div className="space-y-2">
                              <label className="text-sm text-white/70">Title</label>
                              <Input value={editForm.title} onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))} className="bg-white/5 border-white/10 text-white" />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <label className="text-sm text-white/70">Date</label>
                                <Input type="date" value={editForm.date} onChange={(event) => setEditForm((current) => ({ ...current, date: event.target.value }))} className="bg-white/5 border-white/10 text-white" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm text-white/70">Start time</label>
                                <Input type="time" value={editForm.startTime} onChange={(event) => setEditForm((current) => ({ ...current, startTime: event.target.value }))} className="bg-white/5 border-white/10 text-white" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm text-white/70">Notes</label>
                              <Textarea value={editForm.notes} onChange={(event) => setEditForm((current) => ({ ...current, notes: event.target.value }))} className="bg-white/5 border-white/10 text-white min-h-24" />
                            </div>
                            <Button type="button" onClick={handleEditSave} disabled={savingEdit}>
                              <Save className="w-4 h-4" />
                              {savingEdit ? "Saving..." : "Save changes"}
                            </Button>
                          </div>
                        )}
                        {session.records.length === 0 ? (
                          <p className="text-sm text-white/60">No students marked in this session yet.</p>
                        ) : (
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {session.records.map((record) => (
                              <div key={`${session.id}-${record.internId}`} className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">
                                <p className="font-medium text-sm">{record.internName}</p>
                                <p className="text-xs text-white/55">{record.internEmail}</p>
                                <Badge
                                  className={
                                    record.status === "Present"
                                      ? "mt-2 bg-green-500/15 text-green-300 border-green-500/20"
                                      : "mt-2 bg-red-500/15 text-red-300 border-red-500/20"
                                  }
                                >
                                  {record.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendance;
