﻿import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, ArrowUpRight, BadgeCheck, BookOpen, CalendarDays, CheckCircle2, ClipboardCheck, FileText, Home, LogOut, MessageSquareMore, Pencil, Send, Sparkles, Star, Trash2, UserCheck, UserX } from "lucide-react";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlatform } from "../context/PlatformContext";
import type { SubmissionEnabledFields } from "../context/PlatformContext";
import { sendPlatformEmail } from "../lib/email";
import { db } from "@/lib/firebase";
import DashboardSidebar from "@/components/DashboardSidebar";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const dashboardMetrics = [
  { key: "performance", label: "Performance", icon: BadgeCheck },
  { key: "fees", label: "Fees", icon: FileText },
  { key: "doubts", label: "Doubts", icon: MessageSquareMore },
  { key: "submissions", label: "Submissions", icon: Send },
  { key: "feedback", label: "Feedback", icon: Star },
  { key: "notes", label: "Notes", icon: BookOpen },
  { key: "attendance", label: "Attendance", icon: ClipboardCheck },
] as const;

const lectureTimeOptions = ["6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM"] as const;

const defaultEnabledFields: SubmissionEnabledFields = {
  submissionTitle: true,
  generalUrl: false,
  videoLink: false,
  githubLink: true,
  pptLink: false,
  liveLink: true,
  description: true,
  techStack: true,
  attachments: true,
};

function submissionStatusBadgeClass(status: string) {
  if (status === "Approved") {
    return "bg-green-500/15 text-green-300 border-green-500/30";
  }

  if (status === "Reviewed") {
    return "bg-sky-500/15 text-sky-300 border-sky-500/30";
  }

  return "bg-amber-500/20 text-amber-200 border-amber-500/35";
}

/** Ensures a URL has an absolute protocol so it opens in a new tab correctly */
function toAbsoluteUrl(url: string): string {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function getWeekStartIso(dateText: string) {
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) {
    return dateText;
  }

  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return date.toISOString().slice(0, 10);
}

function formatDateLabel(dateText: string) {
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) {
    return dateText;
  }

  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
}

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    loading,
    sessionUser,
    users,
    internData,
    mentorData,
    logout,
    addDoubt,
    addSubmission,
    updateSubmissionResponse,
    addDailyNote,
    addFeedback,
    answerDoubt,
    reviewSubmission,
    createAttendanceSession,
    updateAttendanceSession,
    deleteAttendanceSession,
    mentorFeedback,
    mentorFeedbackForms,
    mentorFeedbackSubmissions,
    submitMentorFeedbackForm,
  } = usePlatform();

  const [doubtTopic, setDoubtTopic] = useState("");
  const [doubtQuestion, setDoubtQuestion] = useState("");
  const [selectedMentorTaskId, setSelectedMentorTaskId] = useState("");
  const [submissionLectureDate, setSubmissionLectureDate] = useState(new Date().toISOString().slice(0, 10));
  const [submissionLectureTime, setSubmissionLectureTime] = useState("");
  const [submissionResponseTitle, setSubmissionResponseTitle] = useState("");
  const [submissionGeneralUrl, setSubmissionGeneralUrl] = useState("");
  const [submissionVideoLink, setSubmissionVideoLink] = useState("");
  const [submissionGithubLink, setSubmissionGithubLink] = useState("");
  const [submissionPptLink, setSubmissionPptLink] = useState("");
  const [submissionLiveLink, setSubmissionLiveLink] = useState("");
  const [submissionDescription, setSubmissionDescription] = useState("");
  const [submissionTechStack, setSubmissionTechStack] = useState("");
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([]);
  const [mentorSubmissionInternIds, setMentorSubmissionInternIds] = useState<string[]>([]);
  const [mentorSubmissionTitle, setMentorSubmissionTitle] = useState("");
  const [mentorSubmissionDueDate, setMentorSubmissionDueDate] = useState("");
  const [mentorEnabledFields, setMentorEnabledFields] = useState<SubmissionEnabledFields>(defaultEnabledFields);
  const [noteInternIds, setNoteInternIds] = useState<string[]>([]);
  const [noteLectureDate, setNoteLectureDate] = useState(new Date().toISOString().slice(0, 10));
  const [noteLectureTime, setNoteLectureTime] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [noteFiles, setNoteFiles] = useState<File[]>([]);
  const [feedbackInternId, setFeedbackInternId] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(7);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [editingFeedbackId, setEditingFeedbackId] = useState("");
  const [editingFeedbackRating, setEditingFeedbackRating] = useState(7);
  const [editingFeedbackComment, setEditingFeedbackComment] = useState("");
  const [doubtAnswers, setDoubtAnswers] = useState<Record<string, string>>({});
  const [submissionReviews, setSubmissionReviews] = useState<Record<string, string>>({});
  const [attendanceTitle, setAttendanceTitle] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceStartTime, setAttendanceStartTime] = useState("");
  const [attendanceNotes, setAttendanceNotes] = useState("");
  const [attendanceSessionStatus, setAttendanceSessionStatus] = useState<"Open" | "Closed">("Open");
  const [selectedAttendanceSessionId, setSelectedAttendanceSessionId] = useState("");
  const [selectedClosedAttendanceSessionId, setSelectedClosedAttendanceSessionId] = useState("");
  const [attendanceDrafts, setAttendanceDrafts] = useState<Record<string, "Present" | "Absent">>({});
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [attendanceUpdating, setAttendanceUpdating] = useState(false);
  const [attendanceDeleting, setAttendanceDeleting] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedMentorForm, setSelectedMentorForm] = useState<string | null>(null);
  const [mentorRatings, setMentorRatings] = useState<Record<string, number>>({});
  const [mentorReviews, setMentorReviews] = useState<Record<string, string>>({});
  const [submitMentorFeedbackLoading, setSubmitMentorFeedbackLoading] = useState(false);

  const internUsers = useMemo(() => users.filter((user) => user.role === "Intern"), [users]);
  const currentInternData = sessionUser?.role === "Intern" ? internData : null;
  const mentorTasks = useMemo(
    () => (currentInternData?.submissions ?? []).filter((entry) => entry.type === "Mentor Task"),
    [currentInternData?.submissions],
  );
  const internWeeklyFeedback = useMemo(() => {
    const feedbackEntries = [...(currentInternData?.feedback ?? [])].sort((a, b) => b.date.localeCompare(a.date));
    const weeklyMap = new Map<string, { weekStart: string; total: number; count: number; remarks: string[] }>();

    feedbackEntries.forEach((entry) => {
      const weekStart = getWeekStartIso(entry.date);
      const bucket = weeklyMap.get(weekStart) ?? { weekStart, total: 0, count: 0, remarks: [] };
      bucket.total += entry.rating;
      bucket.count += 1;
      if (entry.comment?.trim()) {
        bucket.remarks.push(entry.comment.trim());
      }
      weeklyMap.set(weekStart, bucket);
    });

    return Array.from(weeklyMap.values())
      .sort((a, b) => b.weekStart.localeCompare(a.weekStart))
      .map((item) => ({
        ...item,
        avgRating: item.count > 0 ? Number((item.total / item.count).toFixed(1)) : 0,
        latestRemark: item.remarks[0] || "No remark added.",
      }));
  }, [currentInternData?.feedback]);
  const internCurrentMonthFeedback = useMemo(() => {
    const monthKey = new Date().toISOString().slice(0, 7);
    return (currentInternData?.feedback ?? []).filter((entry) => entry.date.startsWith(monthKey));
  }, [currentInternData?.feedback]);
  const internMonthlyOverallRating = useMemo(() => {
    if (internCurrentMonthFeedback.length === 0) {
      return 0;
    }

    const total = internCurrentMonthFeedback.reduce((sum, entry) => sum + entry.rating, 0);
    return Number((total / internCurrentMonthFeedback.length).toFixed(1));
  }, [internCurrentMonthFeedback]);
  const internWeeklyAverageRating = useMemo(() => {
    if (internWeeklyFeedback.length === 0) {
      return 0;
    }

    const total = internWeeklyFeedback.reduce((sum, entry) => sum + entry.avgRating, 0);
    return Number((total / internWeeklyFeedback.length).toFixed(1));
  }, [internWeeklyFeedback]);
  const internPerformanceOverallScore = useMemo(() => {
    // Calculate overall performance from monthly records
    const monthlyPerformance = (currentInternData?.performance ?? []);
    if (monthlyPerformance.length > 0) {
      const total = monthlyPerformance.reduce((sum, entry) => sum + entry.score, 0);
      return Math.round(total / monthlyPerformance.length);
    }

    // Fallback to weekly average rating if no monthly records
    if (internWeeklyAverageRating > 0) {
      return Math.round(internWeeklyAverageRating * 10);
    }

    return 0;
  }, [currentInternData?.performance, internWeeklyAverageRating]);
  const internMonthlyPerformanceSummary = useMemo(() => {
    const monthlyMap = new Map<string, { month: string; total: number; count: number; remarks: string[] }>();

    (currentInternData?.performance ?? []).forEach((entry) => {
      const month = entry.month.slice(0, 7);
      const bucket = monthlyMap.get(month) ?? { month, total: 0, count: 0, remarks: [] };
      bucket.total += entry.score;
      bucket.count += 1;
      if (entry.remark?.trim()) {
        bucket.remarks.push(entry.remark.trim());
      }
      monthlyMap.set(month, bucket);
    });

    return Array.from(monthlyMap.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((item) => {
        const [year, month] = item.month.split("-");
        const monthLabel = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(undefined, {
          month: "long",
          year: "numeric",
        });

        return {
          ...item,
          monthLabel,
          averageScore: item.count > 0 ? Math.round(item.total / item.count) : 0,
          latestRemark: item.remarks[0] || "No remark added.",
        };
      });
  }, [currentInternData?.performance]);
  const selectedMentorTask = useMemo(
    () => mentorTasks.find((entry) => entry.id === selectedMentorTaskId),
    [mentorTasks, selectedMentorTaskId],
  );
  const selectedMentorTaskFields = selectedMentorTask?.enabledFields ?? defaultEnabledFields;

  useEffect(() => {
    if (internUsers.length === 0) {
      return;
    }

    if (noteInternIds.length === 0) {
      setNoteInternIds([internUsers[0].id]);
    }

    if (!feedbackInternId) {
      setFeedbackInternId(internUsers[0].id);
    }

    if (mentorSubmissionInternIds.length === 0) {
      setMentorSubmissionInternIds([internUsers[0].id]);
    }
  }, [feedbackInternId, internUsers, mentorSubmissionInternIds, noteInternIds]);

  useEffect(() => {
    if (sessionUser?.role !== "Intern") {
      return;
    }

    if (!selectedMentorTaskId && mentorTasks.length > 0) {
      setSelectedMentorTaskId(mentorTasks[0].id);
    }

    if (selectedMentorTaskId && !mentorTasks.some((task) => task.id === selectedMentorTaskId)) {
      setSelectedMentorTaskId(mentorTasks[0]?.id || "");
    }
  }, [mentorTasks, selectedMentorTaskId, sessionUser?.role]);

  useEffect(() => {
    if (!selectedMentorTask) {
      setSubmissionResponseTitle("");
      setSubmissionLectureDate(new Date().toISOString().slice(0, 10));
      setSubmissionLectureTime("");
      setSubmissionGeneralUrl("");
      setSubmissionVideoLink("");
      setSubmissionGithubLink("");
      setSubmissionPptLink("");
      setSubmissionLiveLink("");
      setSubmissionDescription("");
      setSubmissionTechStack("");
      setSubmissionFiles([]);
      return;
    }

    setSubmissionResponseTitle(selectedMentorTask.submissionTitle || "");
    setSubmissionLectureDate(selectedMentorTask.lectureDate || new Date().toISOString().slice(0, 10));
    setSubmissionLectureTime(selectedMentorTask.lectureTime || "");
    setSubmissionGeneralUrl(selectedMentorTask.generalUrl || "");
    setSubmissionVideoLink(selectedMentorTask.videoLink || "");
    setSubmissionGithubLink(selectedMentorTask.githubLink || "");
    setSubmissionPptLink(selectedMentorTask.pptLink || "");
    setSubmissionLiveLink(selectedMentorTask.liveLink || "");
    setSubmissionDescription(selectedMentorTask.description || "");
    setSubmissionTechStack(selectedMentorTask.techStack || "");
    setSubmissionFiles([]);
  }, [selectedMentorTask]);

  useEffect(() => {
    if (!sessionUser || sessionUser.role !== "Mentor") {
      return;
    }

    const openSessions = mentorData.attendanceSessions.filter((session) => session.status !== "Closed");
    const fallbackSession = openSessions[0] ?? mentorData.attendanceSessions[0];

    if (!selectedAttendanceSessionId && fallbackSession) {
      setSelectedAttendanceSessionId(fallbackSession.id);
    }
  }, [mentorData.attendanceSessions, selectedAttendanceSessionId, sessionUser]);

  useEffect(() => {
    if (!sessionUser) {
      return;
    }

    if (sessionUser.role === "Admin") {
      navigate("/admin", { replace: true });
      return;
    }
  }, [navigate, sessionUser]);

  const selectedAttendanceSession = mentorData.attendanceSessions.find((session) => session.id === selectedAttendanceSessionId);
  const closedAttendanceSessions = mentorData.attendanceSessions.filter((session) => session.status === "Closed");
  const selectedClosedAttendanceSession = closedAttendanceSessions.find((session) => session.id === selectedClosedAttendanceSessionId);

  useEffect(() => {
    if (!selectedAttendanceSession) {
      setAttendanceDrafts({});
      return;
    }

    setAttendanceTitle(selectedAttendanceSession.title);
    setAttendanceDate(selectedAttendanceSession.date);
    setAttendanceStartTime(selectedAttendanceSession.startTime);
    setAttendanceNotes(selectedAttendanceSession.notes || "");
    setAttendanceSessionStatus(selectedAttendanceSession.status === "Closed" ? "Closed" : "Open");
    setAttendanceDrafts(
      selectedAttendanceSession.records.reduce<Record<string, "Present" | "Absent">>((acc, record) => {
        acc[record.internId] = record.status;
        return acc;
      }, {}),
    );
  }, [selectedAttendanceSession]);

  useEffect(() => {
    if (!sessionUser || sessionUser.role !== "Mentor") {
      return;
    }

    if (!selectedClosedAttendanceSessionId && closedAttendanceSessions.length > 0) {
      setSelectedClosedAttendanceSessionId(closedAttendanceSessions[0].id);
    }
  }, [closedAttendanceSessions, selectedClosedAttendanceSessionId, sessionUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-white/70 text-sm">Loading dashboard...</p>
      </div>
    );
  }

  if (!loading && !sessionUser) {
    return <Navigate to="/login" replace />;
  }

  if (!loading && sessionUser?.role === "Admin") {
    return <Navigate to="/admin" replace />;
  }

  if (!sessionUser) {
    return null;
  }

  const isMentor = sessionUser.role === "Mentor";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleInternDoubtSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!doubtTopic.trim() || !doubtQuestion.trim()) {
      return;
    }

    await addDoubt({
      internId: sessionUser.id,
      internName: sessionUser.name,
      topic: doubtTopic,
      question: doubtQuestion,
    });
    setDoubtTopic("");
    setDoubtQuestion("");
  };

  const handleSubmissionSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedMentorTaskId || !selectedMentorTask) {
      return;
    }

    if (selectedMentorTaskFields.submissionTitle && !submissionResponseTitle.trim()) {
      return;
    }

    try {
      await updateSubmissionResponse({
        submissionId: selectedMentorTaskId,
        submissionTitle: submissionResponseTitle,
        lectureDate: submissionLectureDate,
        lectureTime: submissionLectureTime,
        generalUrl: submissionGeneralUrl,
        videoLink: submissionVideoLink,
        githubLink: submissionGithubLink,
        pptLink: submissionPptLink,
        liveLink: submissionLiveLink,
        description: submissionDescription,
        techStack: submissionTechStack,
        files: submissionFiles,
      });
    } catch (error) {
      console.error("Failed to submit task response:", error);
      alert("Unable to submit right now. If you see 'Missing or insufficient permissions', deploy updated firestore.rules.");
      return;
    }

    setSubmissionResponseTitle("");
    setSubmissionLectureTime("");
    setSubmissionGeneralUrl("");
    setSubmissionVideoLink("");
    setSubmissionGithubLink("");
    setSubmissionPptLink("");
    setSubmissionLiveLink("");
    setSubmissionDescription("");
    setSubmissionTechStack("");
    setSubmissionFiles([]);
  };

  const handleMentorCreateSubmission = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mentorSubmissionInternIds.length === 0 || !mentorSubmissionTitle.trim() || !mentorSubmissionDueDate) {
      return;
    }

    const enabledFieldValues = Object.values(mentorEnabledFields);
    if (!enabledFieldValues.some((value) => value)) {
      alert("Please enable at least one field for the intern to fill in.");
      return;
    }

    const selectedInterns = internUsers.filter((user) => mentorSubmissionInternIds.includes(user.id));
    if (selectedInterns.length === 0) {
      return;
    }

    try {
      await Promise.all(
        selectedInterns.map((intern) =>
          addSubmission({
            internId: intern.id,
            internName: intern.name,
            title: mentorSubmissionTitle,
            type: "Mentor Task",
            dueDate: mentorSubmissionDueDate,
            enabledFields: mentorEnabledFields,
            taskCreatedBy: "Mentor",
          }),
        ),
      );
    } catch (error) {
      console.error("Failed to create mentor submission task:", error);
      alert("Unable to create submission task. If you see 'Missing or insufficient permissions', deploy updated firestore.rules.");
      return;
    }

    setMentorSubmissionTitle("");
    setMentorSubmissionDueDate("");
    setMentorEnabledFields(defaultEnabledFields);
  };

  const handleMentorNoteSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (noteInternIds.length === 0 || !noteTitle.trim() || !noteBody.trim()) {
      return;
    }

    const selectedInterns = internUsers.filter((user) => noteInternIds.includes(user.id));
    if (selectedInterns.length === 0) {
      return;
    }

    await Promise.all(
      selectedInterns.map((intern) =>
        addDailyNote({
          internId: intern.id,
          internName: intern.name,
          date: noteLectureDate,
          lectureTime: noteLectureTime,
          title: noteTitle,
          note: noteBody,
          mentorName: sessionUser.name,
          files: noteFiles,
        }),
      ),
    );

    setNoteTitle("");
    setNoteBody("");
    setNoteFiles([]);
  };

  const handleMentorFeedbackSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!feedbackInternId || !feedbackComment.trim()) {
      return;
    }

    const intern = internUsers.find((user) => user.id === feedbackInternId);
    if (!intern) {
      alert("Selected intern not found. Please select again.");
      return;
    }

    const normalizedRating = Number.isFinite(feedbackRating)
      ? Math.max(0, Math.min(10, Number(feedbackRating.toFixed(1))))
      : 0;

    try {
      await addFeedback({
        internId: feedbackInternId,
        internName: intern.name,
        date: new Date().toISOString().slice(0, 10),
        mentorName: sessionUser.name,
        rating: normalizedRating,
        comment: feedbackComment,
      });
      setFeedbackComment("");
      setFeedbackRating(7);
      alert("Feedback saved successfully.");
    } catch (error) {
      console.error("Failed to save mentor feedback:", error);
      alert("Unable to save feedback right now.");
    }
  };

  const submitDoubtAnswer = (doubtId: string) => {
    const answer = doubtAnswers[doubtId]?.trim();
    if (!answer) {
      return;
    }

    void answerDoubt(doubtId, answer, sessionUser.name);
    setDoubtAnswers((current) => ({ ...current, [doubtId]: "" }));
  };

  const submitReview = (submissionId: string, status: "Reviewed" | "Approved") => {
    const feedbackText = submissionReviews[submissionId]?.trim();
    if (!feedbackText) {
      return;
    }

    const sub = mentorData.submissions.find((s) => s.id === submissionId);
    const intern = sub ? users.find((u) => u.id === sub.internId) : undefined;
    void reviewSubmission(submissionId, feedbackText, status, sessionUser.name, intern?.email, intern?.name ?? sub?.internName, sub?.title);
    setSubmissionReviews((current) => ({ ...current, [submissionId]: "" }));
  };

  const handleCreateAttendanceSession = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!attendanceTitle.trim() || !attendanceDate || !attendanceStartTime) {
      return;
    }

    setAttendanceSaving(true);
    try {
      const session = await createAttendanceSession({
        mentorId: sessionUser.id,
        mentorName: sessionUser.name,
        title: attendanceTitle,
        date: attendanceDate,
        startTime: attendanceStartTime,
        notes: attendanceNotes,
      });

      setAttendanceTitle("");
      setAttendanceNotes("");
      setSelectedAttendanceSessionId(session.id);
    } finally {
      setAttendanceSaving(false);
    }
  };

  const handleMarkAttendance = async (internId: string, status: "Present" | "Absent") => {
    if (!selectedAttendanceSessionId) {
      return;
    }

    setAttendanceDrafts((current) => ({ ...current, [internId]: status }));
  };

  const handleUpdateAttendanceSession = async () => {
    if (!selectedAttendanceSessionId || !attendanceTitle.trim() || !attendanceDate || !attendanceStartTime) {
      return;
    }

    if (selectedAttendanceSession?.status === "Closed") {
      alert("This session is closed. Reopen it first to edit attendance.");
      return;
    }

    const missingMark = internUsers.some((intern) => !attendanceDrafts[intern.id]);
    if (missingMark) {
      alert("Please mark Present or Absent for every intern before saving.");
      return;
    }

    const records = internUsers.map((intern) => ({
      internId: intern.id,
      internName: intern.name,
      internEmail: intern.email,
      status: attendanceDrafts[intern.id] ?? "Absent",
      markedAt: selectedAttendanceSession?.records.find((record) => record.internId === intern.id)?.markedAt || new Date().toISOString(),
    }));

    setAttendanceUpdating(true);
    try {
      await updateAttendanceSession({
        sessionId: selectedAttendanceSessionId,
        title: attendanceTitle,
        date: attendanceDate,
        startTime: attendanceStartTime,
        notes: attendanceNotes,
        records,
        internIds: internUsers.map((intern) => intern.id),
        status: attendanceSessionStatus,
      });

      const loginUrl = "https://www.hackmates.tech/login";
      await Promise.allSettled(records.map((record) => {
        const html = `
          <div style="font-family:Segoe UI,Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a;">
            <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 8px 24px rgba(15,23,42,0.08);">
              <div style="padding:20px 24px;background:linear-gradient(135deg,#0f766e,#1d4ed8);color:#ffffff;">
                <p style="margin:0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.85;">HackMates</p>
                <h2 style="margin:8px 0 0;font-size:24px;line-height:1.3;">Attendance ${record.status}</h2>
              </div>
              <div style="padding:24px;line-height:1.7;">
                <p style="margin:0 0 10px;">Hi ${record.internName},</p>
                <p style="margin:0 0 16px;">Your attendance record has been updated by your mentor.</p>
                <table style="width:100%;border-collapse:collapse;margin:0 0 18px;">
                  <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Session</strong></td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${attendanceTitle}</td></tr>
                  <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Date</strong></td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${attendanceDate}</td></tr>
                  <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Start Time</strong></td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${attendanceStartTime}</td></tr>
                  <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Your Status</strong></td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${record.status}</td></tr>
                  <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Session Status</strong></td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${attendanceSessionStatus}</td></tr>
                </table>
                <a href="${loginUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:11px 16px;border-radius:10px;font-weight:600;">Open Dashboard</a>
                <p style="margin:18px 0 0;">Regards,<br/>HackMates Team</p>
              </div>
            </div>
          </div>
        `;

        return sendPlatformEmail({
          email: record.internEmail,
          subject: `Attendance ${record.status} - ${attendanceTitle}`,
          message: `Attendance: ${record.status}. Session: ${attendanceTitle} on ${attendanceDate} ${attendanceStartTime}. Session status: ${attendanceSessionStatus}.`,
          html,
        });
      }));

      setAttendanceDrafts({});
      if (attendanceSessionStatus === "Closed") {
        setSelectedClosedAttendanceSessionId(selectedAttendanceSessionId);
      }
      alert(attendanceSessionStatus === "Closed" ? "Attendance saved and session closed." : "Attendance saved and session set to active.");
    } finally {
      setAttendanceUpdating(false);
    }
  };

  const handleReopenAttendanceSession = async () => {
    if (!selectedAttendanceSessionId || !selectedAttendanceSession || selectedAttendanceSession.status !== "Closed") {
      return;
    }

    setAttendanceUpdating(true);
    try {
      await updateAttendanceSession({
        sessionId: selectedAttendanceSessionId,
        title: attendanceTitle,
        date: attendanceDate,
        startTime: attendanceStartTime,
        notes: attendanceNotes,
        records: selectedAttendanceSession.records,
        internIds: selectedAttendanceSession.internIds,
        status: "Open",
      });
      setAttendanceSessionStatus("Open");
      alert("Session reopened. You can now edit Present/Absent.");
    } finally {
      setAttendanceUpdating(false);
    }
  };

  const handleDeleteAttendanceSession = async () => {
    if (!selectedAttendanceSessionId) {
      return;
    }

    if (!window.confirm("Delete this attendance session?")) {
      return;
    }

    setAttendanceDeleting(true);
    try {
      await deleteAttendanceSession(selectedAttendanceSessionId);
      setSelectedAttendanceSessionId("");
      setAttendanceTitle("");
      setAttendanceNotes("");
    } finally {
      setAttendanceDeleting(false);
    }
  };

  const pendingFees = currentInternData ? currentInternData.fees.filter((entry) => entry.status === "Pending").length : 0;
  const openDoubts = sessionUser.role === "Intern"
    ? currentInternData?.doubts.filter((entry) => entry.status === "Open").length ?? 0
    : mentorData.doubts.filter((entry) => entry.status === "Open").length;
  const pendingSubmissions = sessionUser.role === "Intern"
    ? currentInternData?.submissions.filter((entry) => entry.status === "Pending").length ?? 0
    : mentorData.submissions.filter((entry) => entry.status === "Pending").length;
  const attendanceTotal = currentInternData?.attendance.length ?? 0;
  const attendancePresent = currentInternData?.attendance.filter((entry) => entry.status === "Present").length ?? 0;
  const attendancePercentage = attendanceTotal > 0 ? Math.round((attendancePresent / attendanceTotal) * 100) : 0;
  const mentorLectureCount = mentorData.attendanceSessions.length;
  const mentorAttendanceRecords = mentorData.attendanceSessions.flatMap((session) => session.records);
  const mentorAttendancePresent = mentorAttendanceRecords.filter((record) => record.status === "Present").length;
  const mentorAttendanceAbsent = mentorAttendanceRecords.length - mentorAttendancePresent;
  const mentorAttendanceRate = mentorAttendanceRecords.length > 0
    ? Math.round((mentorAttendancePresent / mentorAttendanceRecords.length) * 100)
    : 0;
  const mentorActiveSubmissionForms = mentorData.submissions.filter(
    (submission) => submission.type === "Mentor Task" && submission.status === "Pending",
  );
  const mentorAttendanceGraphData = mentorData.attendanceSessions
    .slice(0, 6)
    .map((session) => {
      const total = session.records.length;
      const present = session.records.filter((record) => record.status === "Present").length;
      const percent = total > 0 ? Math.round((present / total) * 100) : 0;
      return {
        id: session.id,
        label: `${session.date.slice(5)} ${session.title.slice(0, 10)}`,
        percent,
        total,
      };
    })
    .reverse();
  const mentorAttendancePieData = [
    { name: "Present", value: mentorAttendancePresent },
    { name: "Absent", value: mentorAttendanceAbsent },
  ];
  const internAttendancePresent = currentInternData?.attendance.filter((entry) => entry.status === "Present").length ?? 0;
  const internAttendanceAbsent = Math.max(attendanceTotal - internAttendancePresent, 0);
  const internAttendancePieData = [
    { name: "Present", value: internAttendancePresent },
    { name: "Absent", value: internAttendanceAbsent },
  ];
  const internSubmissionPending = currentInternData?.submissions.filter((entry) => entry.status === "Pending").length ?? 0;
  const internSubmissionResolved = Math.max((currentInternData?.submissions.length ?? 0) - internSubmissionPending, 0);
  const internSubmissionPieData = [
    { name: "Pending", value: internSubmissionPending },
    { name: "Resolved", value: internSubmissionResolved },
  ];
  const internPerformanceChartData = (currentInternData?.performance.length ?? 0) > 0
    ? (currentInternData?.performance ?? []).map((entry) => ({
      month: entry.month.slice(0, 7),
      score: entry.score,
    }))
    : internWeeklyFeedback.map((entry) => ({
      month: entry.weekStart.slice(5),
      score: Math.round((entry.avgRating / 10) * 100),
    }));
  const internTabValue = sessionUser.role === "Intern"
    ? ((activeSection === "overview" || dashboardMetrics.some((item) => item.key === activeSection)) ? activeSection : "overview")
    : "performance";

  const showMentorOverview = activeSection === "overview";
  const showInternOverview = sessionUser.role === "Intern" && activeSection === "overview";
  const showMentorNotes = activeSection === "notes";
  const showMentorDoubts = activeSection === "doubts";
  const showMentorSubmissions = activeSection === "submissions";
  const showMentorFeedback = activeSection === "feedback";
  const showMentorAttendance = activeSection === "attendance";
  const mentorFeedbackHistory = mentorData.feedback
    .filter((entry) => entry.mentorName === sessionUser.name)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
  const receivedMentorFeedback = mentorFeedback
    .filter((entry) => entry.mentorId === sessionUser.uid)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
  const internGaveMentorFeedback = mentorFeedback
    .filter((entry) => entry.internId === sessionUser.uid)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden flex">
      <DashboardSidebar
        role={sessionUser.role}
        userName={sessionUser.name}
        onLogout={handleLogout}
        activeSection={activeSection}
        onSectionChange={(section) => {
          setActiveSection(section);
        }}
      />
      <div className="flex-1 min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(249,115,22,0.18),_transparent_22%),linear-gradient(180deg,_rgba(8,15,33,0.96),_rgba(2,6,23,0.98))]" />
        <div className="relative z-10 min-h-screen flex flex-col">
        <header className="border-b border-white/10 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-20">
          <div className="w-full px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-white/10 text-white border-white/10">{sessionUser.role}</Badge>
                <Badge variant="outline" className="border-primary/30 text-primary">{sessionUser.name}</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-display text-white">
                {isMentor ? "Mentor Command Center" : "Intern Learning Dashboard"}
              </h1>
              <p className="text-white/65 mt-1 max-w-2xl">
                {isMentor
                  ? "Track doubts, add lecture notes, review submissions, and keep feedback moving for the internship cohort."
                  : "Monitor your 3-month performance, fees, daily notes, feedback, doubts, and weekly submissions from one place."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              {!isMentor && (
                <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => navigate("/verify")}> 
                  <ArrowUpRight className="w-4 h-4" />
                  Verify certificate
                </Button>
              )}
              <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="w-full px-6 py-8 space-y-8">
          {(showInternOverview || showMentorOverview) && (
            <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 md:grid-cols-4">
              {[
                { label: "Performance", value: sessionUser.role === "Intern" ? `${internMonthlyOverallRating || 0}/10` : `${mentorData.performance.length}`, helper: sessionUser.role === "Intern" ? `Weekly avg ${internWeeklyAverageRating || 0}/10` : "Recorded reviews", icon: BadgeCheck },
                ...(sessionUser.role === "Intern" ? [{ label: "Fees", value: `${pendingFees}`, helper: "Pending items", icon: FileText }] : []),
                { label: "Doubts", value: `${openDoubts}`, helper: "Open questions", icon: MessageSquareMore },
                { label: "Submissions", value: `${pendingSubmissions}`, helper: "Awaiting review", icon: Send },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.label} className="border-white/10 bg-white/5 text-white backdrop-blur-sm">
                    <CardContent className="p-5 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-white/60">{item.label}</p>
                        <p className="text-3xl font-bold mt-2">{item.value}</p>
                        <p className="text-sm text-white/65 mt-1">{item.helper}</p>
                      </div>
                      <div className="w-11 h-11 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </motion.section>
          )}

          {sessionUser.role === "Intern" ? (
            <Tabs value={internTabValue} onValueChange={setActiveSection} className="space-y-6">
              <TabsContent value="overview">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="border-white/10 bg-slate-950/70 text-white">
                    <CardHeader>
                      <CardTitle>Intern overview</CardTitle>
                      <CardDescription className="text-white/60">Your key work items at a glance.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                      {[
                        { label: "Performance", value: `${internMonthlyOverallRating || 0}/10`, helper: `Weekly avg ${internWeeklyAverageRating || 0}/10` },
                        { label: "Pending submissions", value: `${pendingSubmissions}`, helper: "Tasks awaiting review" },
                        { label: "Attendance", value: `${attendancePercentage}%`, helper: `${attendancePresent}/${attendanceTotal} present` },
                        { label: "Fees pending", value: `${pendingFees}`, helper: "Outstanding fee entries" },
                      ].map((item) => (
                        <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-sm text-white/60">{item.label}</p>
                          <p className="text-3xl font-bold mt-2">{item.value}</p>
                          <p className="text-xs text-white/50 mt-2">{item.helper}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-white/10 bg-slate-950/70 text-white">
                    <CardHeader>
                      <CardTitle>Attendance pie chart</CardTitle>
                      <CardDescription className="text-white/60">Present vs absent in your marked sessions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie data={internAttendancePieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={4}>
                            {internAttendancePieData.map((entry, index) => (
                              <Cell key={entry.name} fill={index === 0 ? "#22c55e" : "#ef4444"} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="border-white/10 bg-slate-950/70 text-white">
                    <CardHeader>
                      <CardTitle>Performance trend</CardTitle>
                      <CardDescription className="text-white/60">Monthly scores from the mentor review timeline.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {internPerformanceChartData.length === 0 ? (
                        <p className="text-sm text-white/60">No performance reviews yet.</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart data={internPerformanceChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                            <XAxis dataKey="month" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip />
                            <Bar dataKey="score" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-white/10 bg-slate-950/70 text-white">
                    <CardHeader>
                      <CardTitle>Submission pie chart</CardTitle>
                      <CardDescription className="text-white/60">Pending vs resolved submissions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie data={internSubmissionPieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={4}>
                            {internSubmissionPieData.map((entry, index) => (
                              <Cell key={entry.name} fill={index === 0 ? "#f59e0b" : "#8b5cf6"} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="performance">
                <Card className="border-white/10 bg-slate-950/70 text-white">
                  <CardHeader>
                    <CardTitle>Three-month performance</CardTitle>
                    <CardDescription className="text-white/60">Overall performance till now, with month-by-month breakdown.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                        <p className="text-sm text-white/70">Overall performance</p>
                        <p className="text-3xl font-bold mt-1">{internPerformanceOverallScore}%</p>
                        <p className="text-xs text-white/55 mt-2">Based on all recorded monthly mentor reviews.</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-white/70">Monthly records</p>
                        <p className="text-3xl font-bold mt-1">{currentInternData?.performance.length ?? 0}</p>
                        <p className="text-xs text-white/55 mt-2">April, May, June style monthly entries.</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-white/70">Weekly mentor feedback</p>
                        <p className="text-3xl font-bold mt-1">{internWeeklyAverageRating || 0}/10</p>
                        <p className="text-xs text-white/55 mt-2">Average of weekly ratings from mentor feedback.</p>
                      </div>
                    </div>

                    {internMonthlyPerformanceSummary.length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">No monthly performance records yet.</div>
                    ) : (
                      internMonthlyPerformanceSummary.map((entry) => (
                        <div key={entry.month} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-semibold">{entry.monthLabel}</p>
                              <p className="text-sm text-white/65 mt-1">{entry.latestRemark}</p>
                            </div>
                            <Badge className="bg-primary/15 text-primary border-primary/20">{entry.averageScore}%</Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="fees">
                <Card className="border-white/10 bg-slate-950/70 text-white">
                  <CardHeader>
                    <CardTitle>Fee status</CardTitle>
                    <CardDescription className="text-white/60">Track paid and pending program installments.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    {currentInternData?.fees.map((entry) => (
                      <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        {(() => {
                          const amount = Number(entry.amount) || 0;
                          const paid = Number(entry.paidAmount) || 0;
                          const remaining = Math.max(amount - paid, 0);
                          const percentage = amount > 0 ? Math.min(100, Math.round((paid / amount) * 100)) : 0;
                          return (
                            <>
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold">{entry.label}</p>
                          <Badge variant={entry.status === "Paid" ? "default" : "destructive"}>{entry.status}</Badge>
                        </div>
                        <p className="text-sm text-white/65 mt-2">Due date: {entry.dueDate || "Not set"}</p>
                        <p className="text-sm text-white/65">Paid {paid} of {amount} ({percentage}%)</p>
                        <p className="text-sm text-white/65">Remaining: {remaining}</p>
                        <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
                        </div>
                            </>
                          );
                        })()}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="doubts">
                <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                  <Card className="border-white/10 bg-slate-950/70 text-white">
                    <CardHeader>
                      <CardTitle>Ask a doubt</CardTitle>
                      <CardDescription className="text-white/60">Send your question to mentors.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleInternDoubtSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm text-white/70">Topic</label>
                          <Input value={doubtTopic} onChange={(event) => setDoubtTopic(event.target.value)} className="bg-white/5 border-white/10 text-white" placeholder="React forms" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-white/70">Question</label>
                          <Textarea value={doubtQuestion} onChange={(event) => setDoubtQuestion(event.target.value)} className="bg-white/5 border-white/10 text-white min-h-32" placeholder="Describe what you are stuck on." />
                        </div>
                        <Button type="submit" className="w-full">
                          <Send className="w-4 h-4" />
                          Submit doubt
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  <Card className="border-white/10 bg-slate-950/70 text-white">
                    <CardHeader>
                      <CardTitle>Your questions</CardTitle>
                      <CardDescription className="text-white/60">Replies from mentors appear here.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {currentInternData?.doubts.map((doubt) => (
                        <div key={doubt.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold">{doubt.topic}</p>
                            <Badge variant={doubt.status === "Answered" ? "default" : "secondary"}>{doubt.status}</Badge>
                          </div>
                          <p className="text-sm text-white/70 mt-2">{doubt.question}</p>
                          {doubt.answer && <p className="text-sm text-primary mt-3">Answer: {doubt.answer}</p>}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="submissions">
                <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                  <Card className="border-white/10 bg-slate-950/70 text-white">
                    <CardHeader>
                      <CardTitle>Submit mentor task</CardTitle>
                      <CardDescription className="text-white/60">Mentor controls which fields are enabled for your submission.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmissionSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm text-white/70">Mentor task</label>
                          <select value={selectedMentorTaskId} onChange={(event) => setSelectedMentorTaskId(event.target.value)} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white">
                            <option value="">Select task</option>
                            {mentorTasks.map((task) => (
                              <option key={task.id} value={task.id} className="text-black">{task.title} â€¢ Due {task.dueDate}</option>
                            ))}
                          </select>
                        </div>

                        {!selectedMentorTaskId && (
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                            Select a mentor task to see the required and optional fields.
                          </div>
                        )}

                        {!!selectedMentorTask && (
                        <>
                          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                            <p className="font-semibold text-white">{selectedMentorTask.title}</p>
                            <p className="text-sm text-white/70 mt-1">Due: {selectedMentorTask.dueDate}</p>
                          </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          {selectedMentorTaskFields.submissionTitle && (
                            <div className="space-y-2 sm:col-span-2">
                              <label className="text-sm text-white/70">Submission title</label>
                              <Input value={submissionResponseTitle} onChange={(event) => setSubmissionResponseTitle(event.target.value)} className="bg-white/5 border-white/10 text-white" placeholder="My completed project" required />
                            </div>
                          )}
                          <div className="space-y-2">
                            <label className="text-sm text-white/70">Type</label>
                            <Input value={selectedMentorTask.type} className="bg-white/5 border-white/10 text-white" disabled />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm text-white/70">Lecture date</label>
                            <Input type="date" value={submissionLectureDate} onChange={(event) => setSubmissionLectureDate(event.target.value)} className="bg-white/5 border-white/10 text-white" />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <p className="text-sm text-white/60 rounded-xl border border-white/10 bg-white/5 p-3">
                              Lecture time is not required for intern task or project submissions.
                            </p>
                          </div>

                          {selectedMentorTaskFields.generalUrl && (
                            <div className="space-y-2 sm:col-span-2">
                              <label className="text-sm text-white/70">URL</label>
                              <Input value={submissionGeneralUrl} onChange={(event) => setSubmissionGeneralUrl(event.target.value)} className="bg-white/5 border-white/10 text-white" placeholder="https://example.com" />
                            </div>
                          )}
                          {selectedMentorTaskFields.videoLink && (
                            <div className="space-y-2 sm:col-span-2">
                              <label className="text-sm text-white/70">Video link</label>
                              <Input value={submissionVideoLink} onChange={(event) => setSubmissionVideoLink(event.target.value)} className="bg-white/5 border-white/10 text-white" placeholder="https://youtu.be/..." />
                            </div>
                          )}
                          {selectedMentorTaskFields.githubLink && (
                            <div className="space-y-2 sm:col-span-2">
                              <label className="text-sm text-white/70">GitHub link</label>
                              <Input value={submissionGithubLink} onChange={(event) => setSubmissionGithubLink(event.target.value)} className="bg-white/5 border-white/10 text-white" placeholder="https://github.com/..." />
                            </div>
                          )}
                          {selectedMentorTaskFields.pptLink && (
                            <div className="space-y-2 sm:col-span-2">
                              <label className="text-sm text-white/70">PPT link</label>
                              <Input value={submissionPptLink} onChange={(event) => setSubmissionPptLink(event.target.value)} className="bg-white/5 border-white/10 text-white" placeholder="https://drive.google.com/..." />
                            </div>
                          )}
                          {selectedMentorTaskFields.liveLink && (
                            <div className="space-y-2 sm:col-span-2">
                              <label className="text-sm text-white/70">Live link</label>
                              <Input value={submissionLiveLink} onChange={(event) => setSubmissionLiveLink(event.target.value)} className="bg-white/5 border-white/10 text-white" placeholder="https://project.vercel.app" />
                            </div>
                          )}
                          {selectedMentorTaskFields.techStack && (
                            <div className="space-y-2 sm:col-span-2">
                              <label className="text-sm text-white/70">Tech stack</label>
                              <Input value={submissionTechStack} onChange={(event) => setSubmissionTechStack(event.target.value)} className="bg-white/5 border-white/10 text-white" placeholder="React, Firebase" />
                            </div>
                          )}
                          {selectedMentorTaskFields.description && (
                            <div className="space-y-2 sm:col-span-2">
                              <label className="text-sm text-white/70">Description</label>
                              <Textarea value={submissionDescription} onChange={(event) => setSubmissionDescription(event.target.value)} className="bg-white/5 border-white/10 text-white min-h-24" placeholder="Explain your implementation and progress." />
                            </div>
                          )}
                          {selectedMentorTaskFields.attachments && (
                            <div className="space-y-2 sm:col-span-2">
                              <label className="text-sm text-white/70">Attachments</label>
                              <Input
                                type="file"
                                accept=".pdf,.doc,.docx,image/*"
                                multiple
                                onChange={(event) => setSubmissionFiles(Array.from(event.target.files ?? []))}
                                className="bg-white/5 border-white/10 text-white file:text-white file:border-0 file:bg-white/10 file:rounded-md"
                              />
                            </div>
                          )}
                        </div>

                        <Button type="submit" className="w-full">
                          <CheckCircle2 className="w-4 h-4" />
                          Submit task
                        </Button>
                        </>
                        )}
                      </form>
                    </CardContent>
                  </Card>

                  <Card className="border-white/10 bg-slate-950/70 text-white">
                    <CardHeader>
                      <CardTitle>Your submissions</CardTitle>
                      <CardDescription className="text-white/60">Track weekly tasks and project handoffs.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {currentInternData?.submissions.map((submission) => (
                        <div key={submission.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold">{submission.title}</p>
                              <p className="text-sm text-white/65">{submission.type}</p>
                            </div>
                            <Badge className={submissionStatusBadgeClass(submission.status)}>{submission.status}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/60 mt-3">
                            <CalendarDays className="w-4 h-4" />
                            Due {submission.dueDate}
                          </div>
                          {(submission.lectureDate || submission.lectureTime) && (
                            <p className="text-sm text-white/60 mt-2">
                              Lecture: {submission.lectureDate || "-"}{submission.lectureTime ? ` â€¢ ${submission.lectureTime}` : ""}
                            </p>
                          )}
                          {!!submission.description && <p className="text-sm text-white/70 mt-2">{submission.description}</p>}
                          {!!submission.techStack && <p className="text-sm text-white/60 mt-2">Tech stack: {submission.techStack}</p>}
                          {(submission.generalUrl || submission.videoLink || submission.githubLink || submission.pptLink || submission.liveLink) && (
                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                              {submission.generalUrl && <a href={toAbsoluteUrl(submission.generalUrl)} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-3 py-1 text-white/80 hover:bg-white/10">URL</a>}
                              {submission.videoLink && <a href={toAbsoluteUrl(submission.videoLink)} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-3 py-1 text-white/80 hover:bg-white/10">Video</a>}
                              {submission.githubLink && <a href={toAbsoluteUrl(submission.githubLink)} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-3 py-1 text-white/80 hover:bg-white/10">GitHub</a>}
                              {submission.pptLink && <a href={toAbsoluteUrl(submission.pptLink)} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-3 py-1 text-white/80 hover:bg-white/10">PPT</a>}
                              {submission.liveLink && <a href={toAbsoluteUrl(submission.liveLink)} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-3 py-1 text-white/80 hover:bg-white/10">Live</a>}
                            </div>
                          )}
                          {submission.feedback && (
                            <div className={`mt-3 p-3 rounded-xl border text-sm ${
                              submission.status === "Approved"
                                ? "bg-green-500/10 border-green-500/20 text-green-300"
                                : submission.status === "Rejected"
                                ? "bg-red-500/10 border-red-500/20 text-red-300"
                                : "bg-blue-500/10 border-blue-500/20 text-blue-300"
                            }`}>
                              <p className="text-xs opacity-70 mb-1">
                                {submission.status} by {submission.mentorName || "Mentor/Admin"}
                              </p>
                              <p>{submission.feedback}</p>
                            </div>
                          )}
                          {submission.attachments && submission.attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-xs uppercase tracking-[0.2em] text-white/45">Files</p>
                              <div className="flex flex-wrap gap-2">
                                {submission.attachments.map((file) => {
                                  const src = file.dataUrl ?? "";
                                  return (
                                    <a
                                      key={`${submission.id}-${file.name}`}
                                      href={src}
                                      download={file.name}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75 hover:bg-white/10 transition-colors"
                                    >
                                      ðŸ“Ž {file.name}
                                    </a>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="feedback">
                <div className="space-y-6">
                  {sessionUser.role === "Mentor" && (
                    <Card className="border-white/10 bg-slate-950/70 text-white">
                      <CardHeader>
                        <CardTitle>Feedback received</CardTitle>
                        <CardDescription className="text-white/60">Feedback received from interns about you.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {receivedMentorFeedback.length === 0 ? (
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/65">No feedback received yet.</div>
                        ) : (
                          receivedMentorFeedback.map((entry) => (
                            <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="font-semibold">{entry.mentorName}</p>
                                  <p className="text-xs text-white/55 mt-1">{entry.date}</p>
                                </div>
                                <Badge className="bg-primary/15 text-primary border-primary/20">{entry.rating}/10</Badge>
                              </div>
                              <p className="text-sm text-white/75 mt-3">{entry.comment}</p>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {sessionUser.role === "Intern" && mentorFeedbackForms && mentorFeedbackForms.length > 0 && (
                    <Card className="border-white/10 bg-slate-950/70 text-white">
                      <CardHeader>
                        <CardTitle>Mentor Rating Forms</CardTitle>
                        <CardDescription className="text-white/60">Submit your feedback and ratings for your mentors</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedMentorForm ? (
                          <div className="space-y-4">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedMentorForm(null);
                                setMentorRatings({});
                                setMentorReviews({});
                              }}
                              className="bg-white/15 border-white/30 text-white hover:bg-white/25"
                            >
                              ← Back to Forms
                            </Button>

                            {mentorFeedbackForms
                              .filter((f) => f.id === selectedMentorForm)
                              .map((form) => (
                                <div key={form.id} className="space-y-4">
                                  <h3 className="font-semibold text-lg">Rating: {form.mentorNames.join(", ")}</h3>

                                  {form.mentorIds.map((mentorId, idx) => {
                                    const alreadySubmitted = mentorFeedbackSubmissions?.some(
                                      (s) => s.mentorId === mentorId && s.formId === form.id,
                                    );

                                    return (
                                      <div key={mentorId} className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
                                        <h4 className="font-semibold text-white">{form.mentorNames[idx]}</h4>
                                        {alreadySubmitted ? (
                                          <Badge className="bg-green-500/20 text-green-300">Already Submitted</Badge>
                                        ) : (
                                          <>
                                            <div className="space-y-2">
                                              <label className="text-sm text-white/70">Rating (1-5 stars)</label>
                                              <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((num) => (
                                                  <button
                                                    key={num}
                                                    type="button"
                                                    onClick={() => setMentorRatings({ ...mentorRatings, [mentorId]: num })}
                                                    className="transition hover:scale-110"
                                                  >
                                                    <Star className={`w-7 h-7 ${(mentorRatings[mentorId] || 0) >= num ? "fill-yellow-400 text-yellow-400" : "text-white/25"}`} />
                                                  </button>
                                                ))}
                                              </div>
                                            </div>

                                            <div className="space-y-2">
                                              <label className="text-sm text-white/70">Review</label>
                                              <Textarea
                                                placeholder="Your feedback for the mentor..."
                                                value={mentorReviews[mentorId] || ""}
                                                onChange={(e) => setMentorReviews({ ...mentorReviews, [mentorId]: e.target.value })}
                                                className="bg-white/5 border-white/10 text-white min-h-20"
                                              />
                                            </div>

                                            <Button
                                              type="button"
                                              onClick={async () => {
                                                if (!mentorRatings[mentorId] || !mentorReviews[mentorId]?.trim()) {
                                                  alert("Please provide both rating and review");
                                                  return;
                                                }

                                                setSubmitMentorFeedbackLoading(true);
                                                try {
                                                  await submitMentorFeedbackForm({
                                                    formId: form.id,
                                                    mentorId,
                                                    mentorName: form.mentorNames[idx],
                                                    internId: sessionUser.uid || sessionUser.id,
                                                    internName: sessionUser.name,
                                                    internEmail: sessionUser.email,
                                                    rating: mentorRatings[mentorId],
                                                    review: mentorReviews[mentorId],
                                                  });

                                                  alert("Thank you! Your feedback has been submitted");
                                                  setMentorRatings({});
                                                  setMentorReviews({});
                                                  setSelectedMentorForm(null);
                                                } catch (error) {
                                                  console.error("Error submitting feedback:", error);
                                                  alert("Failed to submit feedback");
                                                } finally {
                                                  setSubmitMentorFeedbackLoading(false);
                                                }
                                              }}
                                              disabled={submitMentorFeedbackLoading || !mentorRatings[mentorId] || !mentorReviews[mentorId]?.trim()}
                                              className="w-full bg-primary hover:bg-primary/80"
                                            >
                                              {submitMentorFeedbackLoading ? "Submitting..." : "Submit Feedback"}
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {mentorFeedbackForms.map((form) => (
                              <motion.div
                                key={form.id}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setSelectedMentorForm(form.id)}
                                className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-semibold">Rate: {form.mentorNames.join(", ")}</p>
                                    <p className="text-sm text-white/60 mt-1">
                                      {form.mentorIds.length} mentor{form.mentorIds.length !== 1 ? "s" : ""}
                                    </p>
                                  </div>
                                  <Badge className="bg-blue-500/20 text-blue-300">View Form</Badge>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="notes">
                <Card className="border-white/10 bg-slate-950/70 text-white">
                  <CardHeader>
                    <CardTitle>Daily notes</CardTitle>
                    <CardDescription className="text-white/60">Lecture-end notes added by mentors.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentInternData?.dailyNotes.map((entry) => (
                      <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold">{entry.title}</p>
                          <Badge variant="secondary">{entry.date}</Badge>
                        </div>
                        {entry.lectureTime && <p className="text-sm text-white/60 mt-2">Lecture time: {entry.lectureTime}</p>}
                        <p className="text-sm text-white/70 mt-3">{entry.note}</p>
                        <p className="text-sm text-white/55 mt-2">Mentor: {entry.mentorName}</p>
                        {entry.attachments && entry.attachments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs uppercase tracking-[0.2em] text-white/45">Files</p>
                            <div className="flex flex-wrap gap-2">
                              {entry.attachments.map((file) => {
                                const src = file.dataUrl ?? "";
                                const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
                                return isPdf ? (
                                  <a
                                    key={`${entry.id}-${file.name}`}
                                    href={src}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs text-red-400 hover:bg-red-500/20 transition-colors"
                                  >
                                    ðŸ“„ {file.name}
                                  </a>
                                ) : (
                                  <a
                                    key={`${entry.id}-${file.name}`}
                                    href={src}
                                    download={file.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75 hover:bg-white/10 transition-colors"
                                  >
                                    ðŸ“Ž {file.name}
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attendance">
                <Card className="border-white/10 bg-slate-950/70 text-white">
                  <CardHeader>
                    <CardTitle>Attendance tracker</CardTitle>
                    <CardDescription className="text-white/60">See your marked present or absent history per session.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-white/70">Present in {attendancePresent} of {attendanceTotal} marked sessions</p>
                      <Badge className="bg-primary/15 text-primary border-primary/20">{attendancePercentage}% attendance</Badge>
                    </div>
                    {currentInternData?.attendance.length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/65">No attendance has been marked yet.</div>
                    ) : (
                      currentInternData?.attendance.map((entry) => (
                        <div key={`${entry.sessionId}-${entry.markedAt}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold">{entry.sessionTitle}</p>
                              <p className="text-sm text-white/60">{entry.date} â€¢ {entry.startTime || "Session time not set"}</p>
                            </div>
                            <Badge variant={entry.status === "Present" ? "default" : "destructive"}>{entry.status}</Badge>
                          </div>
                          <p className="text-sm text-white/65 mt-2">Marked by {entry.mentorName}</p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="grid gap-6 grid-cols-1">
              {showMentorOverview && (
                <>
                  <Card className="border-white/10 bg-slate-950/70 text-white">
                    <CardHeader>
                      <CardTitle>Mentor overview</CardTitle>
                      <CardDescription className="text-white/60">Lecture progress, attendance trend, and active forms.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-white/60">Total lectures</p>
                        <p className="text-3xl font-bold mt-2">{mentorLectureCount}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-white/60">Attendance rate</p>
                        <p className="text-3xl font-bold mt-2">{mentorAttendanceRate}%</p>
                        <p className="text-xs text-white/55 mt-2">Present {mentorAttendancePresent} / {mentorAttendanceRecords.length}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-white/60">Active submission forms</p>
                        <p className="text-3xl font-bold mt-2">{mentorActiveSubmissionForms.length}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-white/10 bg-slate-950/70 text-white">
                    <CardHeader>
                      <CardTitle>Attendance charts</CardTitle>
                      <CardDescription className="text-white/60">Pie chart and bar graph for attendance insights.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 lg:grid-cols-2">
                      {mentorAttendanceGraphData.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/65">No attendance sessions yet.</div>
                      ) : (
                        <>
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-sm text-white/70 mb-3">Overall distribution</p>
                            <div className="h-56">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie data={mentorAttendancePieData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={4}>
                                    <Cell fill="#2dd4bf" />
                                    <Cell fill="#f87171" />
                                  </Pie>
                                  <Tooltip formatter={(value: number, name: string) => [`${value}`, name]} />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="mt-2 flex items-center gap-4 text-xs text-white/70">
                              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-teal-400" />Present</span>
                              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-rose-400" />Absent</span>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-sm text-white/70 mb-3">Session-wise percentage</p>
                            <div className="h-56">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={mentorAttendanceGraphData} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                                  <XAxis dataKey="label" stroke="rgba(255,255,255,0.65)" fontSize={11} tickLine={false} axisLine={false} />
                                  <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.65)" fontSize={11} tickLine={false} axisLine={false} />
                                  <Tooltip formatter={(value: number) => [`${value}%`, "Attendance"]} />
                                  <Bar dataKey="percent" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-white/10 bg-slate-950/70 text-white">
                    <CardHeader>
                      <CardTitle>Active submission forms</CardTitle>
                      <CardDescription className="text-white/60">Mentor tasks waiting for intern completion.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {mentorActiveSubmissionForms.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/65">No active submission forms.</div>
                      ) : (
                        mentorActiveSubmissionForms.slice(0, 8).map((submission) => (
                          <div key={submission.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="font-semibold">{submission.title}</p>
                                <p className="text-sm text-white/60">{submission.internName}</p>
                              </div>
                              <Badge className={submissionStatusBadgeClass(submission.status)}>{submission.status}</Badge>
                            </div>
                            <p className="text-xs text-white/55 mt-2">Due {submission.dueDate}</p>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </>
              )}

              {showMentorNotes && (
              <Card className="border-white/10 bg-slate-950/70 text-white">
                <CardHeader>
                  <CardTitle>Lecture note board</CardTitle>
                  <CardDescription className="text-white/60">Add daily notes after each session.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleMentorNoteSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <label className="text-sm text-white/70">Select Interns (multiple)</label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="h-8 border-white/10 bg-white/5 px-3 text-xs text-white hover:bg-white/10"
                            onClick={() => setNoteInternIds(internUsers.map((user) => user.id))}
                            disabled={internUsers.length === 0 || noteInternIds.length === internUsers.length}
                          >
                            Select all
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-8 border-white/10 bg-white/5 px-3 text-xs text-white hover:bg-white/10"
                            onClick={() => setNoteInternIds([])}
                            disabled={noteInternIds.length === 0}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                      <div className="rounded-md border border-white/10 bg-white/5 p-3 space-y-2 max-h-40 overflow-y-auto">
                        {internUsers.map((user) => {
                          const checked = noteInternIds.includes(user.id);
                          return (
                            <label key={user.id} className="flex items-center gap-3 text-sm text-white/85 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  setNoteInternIds((current) =>
                                    checked ? current.filter((id) => id !== user.id) : [...current, user.id],
                                  );
                                }}
                                className="h-4 w-4 accent-primary"
                              />
                              <span>{user.name}</span>
                            </label>
                          );
                        })}
                      </div>
                      <p className="text-xs text-white/55">Selected: {noteInternIds.length} intern(s)</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-white/70">Title</label>
                      <Input value={noteTitle} onChange={(event) => setNoteTitle(event.target.value)} className="bg-white/5 border-white/10 text-white" placeholder="State management recap" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm text-white/70">Lecture date</label>
                        <Input type="date" value={noteLectureDate} onChange={(event) => setNoteLectureDate(event.target.value)} className="bg-white/5 border-white/10 text-white" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-white/70">Lecture time</label>
                        <select value={noteLectureTime} onChange={(event) => setNoteLectureTime(event.target.value)} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white">
                          <option value="">Select lecture time</option>
                          {lectureTimeOptions.map((time) => (
                            <option key={time} value={time} className="text-black">{time}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-white/70">Note</label>
                      <Textarea value={noteBody} onChange={(event) => setNoteBody(event.target.value)} className="bg-white/5 border-white/10 text-white min-h-32" placeholder="Write what was covered in the lecture." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-white/70">Attachments</label>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,image/*"
                        multiple
                        onChange={(event) => setNoteFiles(Array.from(event.target.files ?? []))}
                        className="bg-white/5 border-white/10 text-white file:text-white file:border-0 file:bg-white/10 file:rounded-md"
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <BookOpen className="w-4 h-4" />
                      Save note
                    </Button>
                  </form>

                  {/* All notes â€” visible to all mentors */}
                  {mentorData.dailyNotes.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <p className="text-sm font-medium text-white/70">All lecture notes</p>
                      {mentorData.dailyNotes.map((note) => (
                        <div key={note.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold text-sm">{note.title}</p>
                            <Badge variant="secondary" className="text-xs">{note.date.slice(0, 10)}</Badge>
                          </div>
                          <p className="text-xs text-white/50">
                            {note.internName} Â· by {note.mentorName}
                            {note.lectureTime ? ` Â· ${note.lectureTime}` : ""}
                          </p>
                          <p className="text-sm text-white/75">{note.note}</p>
                          {note.attachments && note.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {note.attachments.map((file) => {
                                const src = file.dataUrl ?? "";
                                const pdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
                                return (
                                  <a
                                    key={file.name}
                                    href={src}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download={!pdf ? file.name : undefined}
                                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                                      pdf
                                        ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                                        : "border-white/10 text-white/70 hover:bg-white/10"
                                    }`}
                                  >
                                    {pdf ? "ðŸ“„" : "ðŸ“Ž"} {file.name}
                                  </a>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              )}

                {showMentorDoubts && (
                <Card className="border-white/10 bg-slate-950/70 text-white">
                  <CardHeader>
                    <CardTitle>Doubts inbox</CardTitle>
                    <CardDescription className="text-white/60">Review and answer learner questions.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mentorData.doubts.length === 0 && (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/65 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-primary" />
                        No doubts pending right now.
                      </div>
                    )}
                    {mentorData.doubts.map((doubt) => (
                      <div key={doubt.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold">{doubt.topic}</p>
                            <p className="text-sm text-white/60">{doubt.internName}</p>
                          </div>
                          <Badge variant={doubt.status === "Answered" ? "default" : "destructive"}>{doubt.status}</Badge>
                        </div>
                        <p className="text-sm text-white/72">{doubt.question}</p>
                        {doubt.answer && <p className="text-sm text-primary">Answer: {doubt.answer}</p>}
                        <div className="space-y-2">
                          <Textarea value={doubtAnswers[doubt.id] ?? ""} onChange={(event) => setDoubtAnswers((current) => ({ ...current, [doubt.id]: event.target.value }))} className="bg-white/5 border-white/10 text-white min-h-24" placeholder="Write your reply" />
                          <Button type="button" onClick={() => submitDoubtAnswer(doubt.id)} className="w-full">
                            <MessageSquareMore className="w-4 h-4" />
                            Send answer
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                )}

                {showMentorSubmissions && (
                <Card className="border-white/10 bg-slate-950/70 text-white">
                  <CardHeader>
                    <CardTitle>Review submissions</CardTitle>
                    <CardDescription className="text-white/60">Mark tasks reviewed or approved with feedback.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form onSubmit={handleMentorCreateSubmission} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-white/75 font-medium">Create submission task for intern(s)</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <label className="text-sm text-white/70">Select Interns (multiple)</label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="h-8 border-white/10 bg-white/5 px-3 text-xs text-white hover:bg-white/10"
                              onClick={() => setMentorSubmissionInternIds(internUsers.map((user) => user.id))}
                              disabled={internUsers.length === 0 || mentorSubmissionInternIds.length === internUsers.length}
                            >
                              Select all
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-8 border-white/10 bg-white/5 px-3 text-xs text-white hover:bg-white/10"
                              onClick={() => setMentorSubmissionInternIds([])}
                              disabled={mentorSubmissionInternIds.length === 0}
                            >
                              Clear
                            </Button>
                          </div>
                        </div>
                        <div className="rounded-md border border-white/10 bg-white/5 p-3 space-y-2 max-h-40 overflow-y-auto">
                          {internUsers.map((user) => {
                            const checked = mentorSubmissionInternIds.includes(user.id);
                            return (
                              <label key={user.id} className="flex items-center gap-3 text-sm text-white/85 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {
                                    setMentorSubmissionInternIds((current) =>
                                      checked ? current.filter((id) => id !== user.id) : [...current, user.id],
                                    );
                                  }}
                                  className="h-4 w-4 accent-primary"
                                />
                                <span>{user.name}</span>
                              </label>
                            );
                          })}
                        </div>
                        <p className="text-xs text-white/55">Selected: {mentorSubmissionInternIds.length} intern(s)</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-white/70">Title</label>
                        <Input value={mentorSubmissionTitle} onChange={(event) => setMentorSubmissionTitle(event.target.value)} className="bg-white/5 border-white/10 text-white" placeholder="Landing page assignment" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-white/70">Due date</label>
                        <Input type="date" value={mentorSubmissionDueDate} onChange={(event) => setMentorSubmissionDueDate(event.target.value)} className="bg-white/5 border-white/10 text-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-white/70">Choose active fields for intern submit</label>
                        <div className="rounded-md border border-white/10 bg-white/5 p-3 grid sm:grid-cols-2 gap-2">
                          {([
                            ["submissionTitle", "Submission title"],
                            ["generalUrl", "URL"],
                            ["videoLink", "Video link"],
                            ["githubLink", "GitHub link"],
                            ["pptLink", "PPT link"],
                            ["liveLink", "Live link"],
                            ["description", "Description"],
                            ["techStack", "Tech stack"],
                            ["attachments", "Attachments"],
                          ] as Array<[Extract<keyof SubmissionEnabledFields, string>, string]>).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-sm text-white/85 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={mentorEnabledFields[key]}
                                onChange={() =>
                                  setMentorEnabledFields((current) => ({
                                    ...current,
                                    [key]: !current[key],
                                  }))
                                }
                                className="h-4 w-4 accent-primary"
                              />
                              <span>{label}</span>
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-white/55">Intern will only see selected fields in submit form.</p>
                      </div>
                      <Button type="submit" className="w-full">
                        <Send className="w-4 h-4" />
                        Add submission task
                      </Button>
                    </form>

                    {mentorData.submissions.map((submission) => (
                      <div key={submission.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold">{submission.title}</p>
                            <p className="text-sm text-white/60">{submission.internName} â€¢ {submission.type}</p>
                          </div>
                          <Badge className={submissionStatusBadgeClass(submission.status)}>{submission.status}</Badge>
                        </div>
                        <p className="text-sm text-white/60">Due {submission.dueDate}</p>
                        {(submission.lectureDate || submission.lectureTime) && (
                          <p className="text-sm text-white/60">Lecture: {submission.lectureDate || "-"}{submission.lectureTime ? ` â€¢ ${submission.lectureTime}` : ""}</p>
                        )}
                        {!!submission.description && <p className="text-sm text-white/70">{submission.description}</p>}
                        {!!submission.techStack && <p className="text-sm text-white/60">Tech stack: {submission.techStack}</p>}
                        {(submission.generalUrl || submission.videoLink || submission.githubLink || submission.pptLink || submission.liveLink) && (
                          <div className="flex flex-wrap gap-2 text-xs">
                            {submission.generalUrl && <a href={toAbsoluteUrl(submission.generalUrl)} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-3 py-1 text-white/80 hover:bg-white/10">URL</a>}
                            {submission.videoLink && <a href={toAbsoluteUrl(submission.videoLink)} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-3 py-1 text-white/80 hover:bg-white/10">Video</a>}
                            {submission.githubLink && <a href={toAbsoluteUrl(submission.githubLink)} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-3 py-1 text-white/80 hover:bg-white/10">GitHub</a>}
                            {submission.pptLink && <a href={toAbsoluteUrl(submission.pptLink)} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-3 py-1 text-white/80 hover:bg-white/10">PPT</a>}
                            {submission.liveLink && <a href={toAbsoluteUrl(submission.liveLink)} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-3 py-1 text-white/80 hover:bg-white/10">Live</a>}
                          </div>
                        )}
                        {/* Already reviewed â€” show feedback banner, no edit */}
                        {submission.status !== "Pending" ? (
                          <div className={`rounded-xl border p-3 text-sm ${
                            submission.status === "Approved"
                              ? "bg-green-500/10 border-green-500/20 text-green-300"
                              : submission.status === "Rejected"
                              ? "bg-red-500/10 border-red-500/20 text-red-300"
                              : "bg-blue-500/10 border-blue-500/20 text-blue-300"
                          }`}>
                            <p className="text-xs opacity-70 mb-1">
                              {submission.status} by {submission.mentorName || "Mentor/Admin"}
                            </p>
                            {submission.feedback && <p>{submission.feedback}</p>}
                          </div>
                        ) : submission.submittedAt ? (
                          /* Pending + submitted â€” show review form */
                          <>
                            <Textarea value={submissionReviews[submission.id] ?? ""} onChange={(event) => setSubmissionReviews((current) => ({ ...current, [submission.id]: event.target.value }))} className="bg-white/5 border-white/10 text-white min-h-24" placeholder="Feedback for the submission" />
                            <div className="grid grid-cols-2 gap-3">
                              <Button type="button" variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => submitReview(submission.id, "Reviewed")}>Reviewed</Button>
                              <Button type="button" onClick={() => submitReview(submission.id, "Approved")}>
                                <CheckCircle2 className="w-4 h-4" />
                                Approve
                              </Button>
                            </div>
                          </>
                        ) : (
                          /* Pending + not yet submitted by intern */
                          <p className="text-xs text-white/40 italic">Waiting for intern to submit</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
                )}

                {showMentorFeedback && (
                <div className="space-y-6">
                  <Card className="border-white/10 bg-slate-950/70 text-white">
                    <CardHeader>
                      <CardTitle>Feedback board</CardTitle>
                      <CardDescription className="text-white/60">Add rating-based mentor feedback.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                    <form onSubmit={handleMentorFeedbackSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="space-y-2">
                        <label className="text-sm text-white/70">Intern</label>
                          <select value={feedbackInternId} onChange={(event) => setFeedbackInternId(event.target.value)} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white">
                          <option value="">Select intern</option>
                          {internUsers.map((user) => (
                            <option key={user.id} value={user.id} className="text-black">{user.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-white/70">Rating</label>
                        <Input type="number" min={0} max={10} step="0.1" value={feedbackRating} onChange={(event) => setFeedbackRating(Number(event.target.value))} className="bg-white/5 border-white/10 text-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-white/70">Feedback</label>
                        <Textarea value={feedbackComment} onChange={(event) => setFeedbackComment(event.target.value)} className="bg-white/5 border-white/10 text-white min-h-28" placeholder="What should the intern improve next?" />
                      </div>
                      <Button type="submit" className="w-full">
                        <Sparkles className="w-4 h-4" />
                        Save feedback
                      </Button>
                    </form>

                    <div className="space-y-3">
                      <p className="text-sm text-white/75">Your feedback history</p>
                      {mentorFeedbackHistory.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">No feedback entries from you yet.</div>
                      ) : (
                        mentorFeedbackHistory.map((entry) => {
                          const internName = entry.internName || internUsers.find((user) => user.id === entry.internId)?.name || entry.internId;
                          const isEditing = editingFeedbackId === entry.id;

                          return (
                            <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold">{internName}</p>
                                  <p className="text-xs text-white/60 mt-1">{entry.date} â€¢ {entry.rating}/10</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                                    onClick={() => {
                                      setEditingFeedbackId(entry.id);
                                      setEditingFeedbackRating(entry.rating);
                                      setEditingFeedbackComment(entry.comment);
                                    }}
                                  >
                                    <Pencil className="w-4 h-4" />
                                    Edit
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={async () => {
                                      if (!window.confirm("Delete this feedback?")) {
                                        return;
                                      }
                                      try {
                                        await deleteDoc(doc(db, "feedback", entry.id));
                                      } catch (error) {
                                        console.error("Failed to delete feedback:", error);
                                        alert("Unable to delete feedback right now.");
                                      }
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </Button>
                                </div>
                              </div>

                              {isEditing ? (
                                <div className="space-y-3 rounded-xl border border-white/10 bg-slate-950/40 p-3">
                                  <div className="space-y-2">
                                    <label className="text-xs text-white/65">Rating (out of 10)</label>
                                    <Input
                                      type="number"
                                      min={0}
                                      max={10}
                                      step="0.1"
                                      value={editingFeedbackRating}
                                      onChange={(event) => setEditingFeedbackRating(Number(event.target.value))}
                                      className="bg-white/5 border-white/10 text-white"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs text-white/65">Comment</label>
                                    <Textarea
                                      value={editingFeedbackComment}
                                      onChange={(event) => setEditingFeedbackComment(event.target.value)}
                                      className="bg-white/5 border-white/10 text-white min-h-24"
                                    />
                                  </div>
                                  <div className="grid sm:grid-cols-2 gap-2">
                                    <Button
                                      type="button"
                                      onClick={async () => {
                                        if (!editingFeedbackComment.trim()) {
                                          return;
                                        }

                                        const normalizedRating = Number.isFinite(editingFeedbackRating)
                                          ? Math.max(0, Math.min(10, Number(editingFeedbackRating.toFixed(1))))
                                          : 0;

                                        try {
                                          await updateDoc(doc(db, "feedback", entry.id), {
                                            rating: normalizedRating,
                                            comment: editingFeedbackComment.trim(),
                                          });
                                          setEditingFeedbackId("");
                                          setEditingFeedbackComment("");
                                          setEditingFeedbackRating(7);
                                        } catch (error) {
                                          console.error("Failed to update feedback:", error);
                                          alert("Unable to update feedback right now.");
                                        }
                                      }}
                                    >
                                      Save changes
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                                      onClick={() => {
                                        setEditingFeedbackId("");
                                        setEditingFeedbackComment("");
                                        setEditingFeedbackRating(7);
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-white/75">{entry.comment}</p>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                    </CardContent>
                  </Card>

                  {sessionUser.role === "Mentor" && (
                    <Card className="border-white/10 bg-slate-950/70 text-white">
                      <CardHeader>
                        <CardTitle>Feedback received</CardTitle>
                        <CardDescription className="text-white/60">Admin-created mentor feedback for you.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {receivedMentorFeedback.length === 0 ? (
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/65">No feedback received yet.</div>
                        ) : (
                          receivedMentorFeedback.map((entry) => (
                            <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="font-semibold">{entry.mentorName}</p>
                                  <p className="text-xs text-white/55 mt-1">{entry.date}</p>
                                </div>
                                <Badge className="bg-primary/15 text-primary border-primary/20">{entry.rating}/10</Badge>
                              </div>
                              <p className="text-sm text-white/75 mt-3">{entry.comment}</p>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {sessionUser.role === "Intern" && mentorFeedbackForms && mentorFeedbackForms.length > 0 && (
                    <Card className="border-white/10 bg-slate-950/70 text-white">
                      <CardHeader>
                        <CardTitle>Mentor Rating Forms</CardTitle>
                        <CardDescription className="text-white/60">Submit your feedback and ratings for your mentors</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedMentorForm ? (
                          <div className="space-y-4">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedMentorForm(null);
                                setMentorRatings({});
                                setMentorReviews({});
                              }}
                              className="bg-white/15 border-white/30 text-white hover:bg-white/25"
                            >
                              ← Back to Forms
                            </Button>

                            {mentorFeedbackForms
                              .filter((f) => f.id === selectedMentorForm)
                              .map((form) => (
                                <div key={form.id} className="space-y-4">
                                  <h3 className="font-semibold text-lg">Rating: {form.mentorNames.join(", ")}</h3>

                                  {form.mentorIds.map((mentorId, idx) => {
                                    const alreadySubmitted = mentorFeedbackSubmissions?.some(
                                      (s) => s.mentorId === mentorId && s.formId === form.id
                                    );

                                    return (
                                      <div
                                        key={mentorId}
                                        className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3"
                                      >
                                        <h4 className="font-semibold text-white">{form.mentorNames[idx]}</h4>
                                        {alreadySubmitted ? (
                                          <Badge className="bg-green-500/20 text-green-300">Already Submitted</Badge>
                                        ) : (
                                          <>
                                            <div className="space-y-2">
                                              <label className="text-sm text-white/70">Rating (1-5 stars)</label>
                                              <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((num) => (
                                                  <button
                                                    key={num}
                                                    type="button"
                                                    onClick={() => setMentorRatings({ ...mentorRatings, [mentorId]: num })}
                                                    className="transition hover:scale-110"
                                                  >
                                                    <Star className={`w-7 h-7 ${(mentorRatings[mentorId] || 0) >= num ? "fill-yellow-400 text-yellow-400" : "text-white/25"}`} />
                                                  </button>
                                                ))}
                                              </div>
                                            </div>

                                            <div className="space-y-2">
                                              <label className="text-sm text-white/70">Review</label>
                                              <Textarea
                                                placeholder="Your feedback for the mentor..."
                                                value={mentorReviews[mentorId] || ""}
                                                onChange={(e) => setMentorReviews({ ...mentorReviews, [mentorId]: e.target.value })}
                                                className="bg-white/5 border-white/10 text-white min-h-20"
                                              />
                                            </div>

                                            <Button
                                              onClick={async () => {
                                                if (!mentorRatings[mentorId] || !mentorReviews[mentorId]?.trim()) {
                                                  alert("Please provide both rating and review");
                                                  return;
                                                }

                                                setSubmitMentorFeedbackLoading(true);
                                                try {
                                                  await submitMentorFeedbackForm({
                                                    formId: form.id,
                                                    mentorId,
                                                    mentorName: form.mentorNames[idx],
                                                    internId: sessionUser.uid || sessionUser.id,
                                                    internName: sessionUser.name,
                                                    internEmail: sessionUser.email,
                                                    rating: mentorRatings[mentorId],
                                                    review: mentorReviews[mentorId],
                                                  });

                                                  alert("Thank you! Your feedback has been submitted");
                                                  setMentorRatings({});
                                                  setMentorReviews({});
                                                  setSelectedMentorForm(null);
                                                } catch (error) {
                                                  console.error("Error submitting feedback:", error);
                                                  alert("Failed to submit feedback");
                                                } finally {
                                                  setSubmitMentorFeedbackLoading(false);
                                                }
                                              }}
                                              disabled={submitMentorFeedbackLoading || !mentorRatings[mentorId] || !mentorReviews[mentorId]?.trim()}
                                              className="w-full bg-primary hover:bg-primary/80"
                                            >
                                              {submitMentorFeedbackLoading ? "Submitting..." : "Submit Feedback"}
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {mentorFeedbackForms.map((form) => (
                              <motion.div
                                key={form.id}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setSelectedMentorForm(form.id)}
                                className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-semibold">Rate: {form.mentorNames.join(", ")}</p>
                                    <p className="text-sm text-white/60 mt-1">
                                      {form.mentorIds.length} mentor{form.mentorIds.length !== 1 ? "s" : ""}
                                    </p>
                                  </div>
                                  <Badge className="bg-blue-500/20 text-blue-300">View Form</Badge>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
                )}

                {showMentorAttendance && (
                <Card className="border-white/10 bg-slate-950/70 text-white">
                  <CardHeader>
                    <CardTitle>Attendance control</CardTitle>
                    <CardDescription className="text-white/60">Create today\'s lecture session and mark each intern present or absent.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <form onSubmit={handleCreateAttendanceSession} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="space-y-2">
                        <label className="text-sm text-white/70">Session title</label>
                        <Input value={attendanceTitle} onChange={(event) => setAttendanceTitle(event.target.value)} className="bg-white/5 border-white/10 text-white" placeholder="Frontend Live Session" required />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm text-white/70">Date</label>
                          <Input type="date" value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)} className="bg-white/5 border-white/10 text-white" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-white/70">Start time</label>
                          <select
                            value={attendanceStartTime}
                            onChange={(event) => setAttendanceStartTime(event.target.value)}
                            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white"
                            required
                          >
                            <option value="">Select start time</option>
                            {lectureTimeOptions.map((time) => (
                              <option key={time} value={time} className="text-black">{time}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-white/70">Notes</label>
                        <Textarea value={attendanceNotes} onChange={(event) => setAttendanceNotes(event.target.value)} className="bg-white/5 border-white/10 text-white min-h-24" placeholder="Optional context for this attendance session" />
                      </div>
                      <Button type="submit" className="w-full" disabled={attendanceSaving}>
                        <ClipboardCheck className="w-4 h-4" />
                        {attendanceSaving ? "Creating session..." : "Create attendance session"}
                      </Button>
                    </form>

                    <div className="space-y-3">
                      <label className="text-sm text-white/70">Select attendance session</label>
                      <select value={selectedAttendanceSessionId} onChange={(event) => setSelectedAttendanceSessionId(event.target.value)} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white">
                        <option value="">Select attendance session</option>
                        {mentorData.attendanceSessions.map((session) => (
                          <option key={session.id} value={session.id} className="text-black">{session.date} â€¢ {session.title} â€¢ {session.status === "Closed" ? "Closed" : "Active"}</option>
                        ))}
                      </select>
                      {selectedAttendanceSession?.notes && (
                        <p className="text-sm text-white/65 rounded-xl border border-white/10 bg-white/5 p-3">{selectedAttendanceSession.notes}</p>
                      )}
                      {selectedAttendanceSessionId && (
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                          <p className="text-xs text-white/70">Session mode</p>
                          {selectedAttendanceSession?.status === "Closed" ? (
                            <div className="space-y-2">
                              <p className="rounded-md border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white/80">Closed (locked)</p>
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                                onClick={handleReopenAttendanceSession}
                                disabled={attendanceUpdating || !selectedAttendanceSessionId}
                              >
                                Reopen to Active
                              </Button>
                            </div>
                          ) : (
                            <select
                              value={attendanceSessionStatus}
                              onChange={(event) => setAttendanceSessionStatus(event.target.value as "Open" | "Closed")}
                              className="w-full rounded-md border border-white/10 bg-slate-950/40 px-3 py-2 text-white"
                            >
                              <option value="Open" className="text-black">Active (Open)</option>
                              <option value="Closed" className="text-black">Closed</option>
                            </select>
                          )}
                        </div>
                      )}
                      {mentorData.attendanceSessions.length === 0 && (
                        <p className="text-sm text-white/60 rounded-xl border border-white/10 bg-white/5 p-3">No attendance sessions found. Create one to start.</p>
                      )}
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                          onClick={handleUpdateAttendanceSession}
                          disabled={!selectedAttendanceSessionId || attendanceUpdating || selectedAttendanceSession?.status === "Closed"}
                        >
                          {attendanceUpdating ? "Saving..." : attendanceSessionStatus === "Closed" ? "Save attendance & close session" : "Save attendance & set active"}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={handleDeleteAttendanceSession}
                          disabled={!selectedAttendanceSessionId || attendanceDeleting}
                        >
                          {attendanceDeleting ? "Deleting..." : "Delete selected session"}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {selectedAttendanceSession?.status === "Closed" && (
                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
                          This session is closed. Intern statuses are read-only here. Use "Reopen to Active" to edit.
                        </div>
                      )}
                      {internUsers.map((intern) => {
                        const existingRecord = selectedAttendanceSession?.records.find((record) => record.internId === intern.id);
                        const selectedStatus = attendanceDrafts[intern.id] ?? existingRecord?.status;
                        return (
                          <div key={intern.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <p className="font-semibold">{intern.name}</p>
                              <p className="text-sm text-white/60">{intern.email}</p>
                              {selectedStatus && (
                                <p className="text-xs text-white/50 mt-1">Selected: {selectedStatus}</p>
                              )}
                            </div>
                            {selectedAttendanceSession?.status === "Closed" ? (
                              <Badge variant={selectedStatus === "Present" ? "default" : "destructive"}>{selectedStatus || "Not marked"}</Badge>
                            ) : (
                              <div className="grid grid-cols-2 gap-2 min-w-[220px]">
                                <Button
                                  type="button"
                                  variant={selectedStatus === "Present" ? "default" : "outline"}
                                  className={selectedStatus === "Present" ? "" : "border-white/10 bg-white/5 text-white hover:bg-white/10"}
                                  onClick={() => handleMarkAttendance(intern.id, "Present")}
                                  disabled={!selectedAttendanceSessionId}
                                >
                                  <UserCheck className="w-4 h-4" />
                                  Present
                                </Button>
                                <Button
                                  type="button"
                                  variant={selectedStatus === "Absent" ? "destructive" : "outline"}
                                  className={selectedStatus === "Absent" ? "" : "border-white/10 bg-white/5 text-white hover:bg-white/10"}
                                  onClick={() => handleMarkAttendance(intern.id, "Absent")}
                                  disabled={!selectedAttendanceSessionId}
                                >
                                  <UserX className="w-4 h-4" />
                                  Absent
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr] pt-2">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                        <p className="font-semibold text-white">Closed sessions</p>
                        {closedAttendanceSessions.length === 0 ? (
                          <p className="text-sm text-white/60">No closed attendance sessions yet.</p>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {closedAttendanceSessions.map((session) => (
                              <button
                                key={session.id}
                                type="button"
                                onClick={() => setSelectedClosedAttendanceSessionId(session.id)}
                                className={`w-full text-left rounded-xl border px-3 py-2 transition-colors ${
                                  selectedClosedAttendanceSessionId === session.id
                                    ? "border-primary/40 bg-primary/10"
                                    : "border-white/10 bg-white/5 hover:bg-white/10"
                                }`}
                              >
                                <p className="font-medium text-white">{session.title}</p>
                                <p className="text-xs text-white/60 mt-1">{session.date} {session.startTime ? `â€¢ ${session.startTime}` : ""}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                        <p className="font-semibold text-white">Closed session details</p>
                        {!selectedClosedAttendanceSession ? (
                          <p className="text-sm text-white/60">Select a closed session to view present and absent interns.</p>
                        ) : (
                          <>
                            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                              <p className="font-medium text-white">{selectedClosedAttendanceSession.title}</p>
                              <p className="text-xs text-white/60 mt-1">{selectedClosedAttendanceSession.date} {selectedClosedAttendanceSession.startTime ? `â€¢ ${selectedClosedAttendanceSession.startTime}` : ""}</p>
                            </div>
                            {selectedClosedAttendanceSession.records.length === 0 ? (
                              <p className="text-sm text-white/60">No attendance records stored for this session.</p>
                            ) : (
                              <div className="grid gap-2 max-h-72 overflow-y-auto pr-1">
                                {selectedClosedAttendanceSession.records.map((record) => (
                                  <div key={`${selectedClosedAttendanceSession.id}-${record.internId}`} className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 flex items-center justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-medium text-white">{record.internName}</p>
                                      <p className="text-xs text-white/55">{record.internEmail}</p>
                                    </div>
                                    <Badge variant={record.status === "Present" ? "default" : "destructive"}>{record.status}</Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )}
            </div>
          )}

          <Separator className="bg-white/10" />

        </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


