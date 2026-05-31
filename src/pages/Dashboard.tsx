﻿import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, ArrowUpRight, BadgeCheck, BookOpen, CalendarDays, CheckCircle2, ClipboardCheck, Clock, FileText, Home, Link2, LogOut, MessageSquareMore, Pencil, Plus, Send, Sparkles, Star, Trash2, UserCheck, UserX, X } from "lucide-react";
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

type NoteLinkDraft = { label: string; url: string };

type MentorFeedbackDisplayEntry = {
  id: string;
  mentorName: string;
  rating: number;
  comment: string;
  date: string;
  source: "Mentor review" | "Mentor form";
};

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

function getNoteSortTime(note: { date: string; createdAt?: string }) {
  const createdAt = note.createdAt ? new Date(note.createdAt).getTime() : NaN;
  if (!Number.isNaN(createdAt)) {
    return createdAt;
  }

  const noteDate = new Date(note.date).getTime();
  return Number.isNaN(noteDate) ? 0 : noteDate;
}

function normalizeTenPointRating(value: number) {
  return Number.isFinite(value) && value >= 0 && value <= 10
    ? Number(value.toFixed(1))
    : Number.NaN;
}

function matchesNoteSearch(note: { title: string; note: string; mentorName: string; internName?: string; lectureTime?: string; date: string; links?: { label: string; url: string }[] }, query: string) {
  const search = query.trim().toLowerCase();
  if (!search) {
    return true;
  }

  const haystack = [
    note.title,
    note.note,
    note.mentorName,
    note.internName ?? "",
    note.lectureTime ?? "",
    note.date,
    ...(note.links ?? []).flatMap((link) => [link.label, link.url]),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(search);
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
    submitMentorToInternFeedbackForm,
  } = usePlatform();
  const dashboardRole: "Admin" | "Mentor" | "Intern" = sessionUser?.role ?? "Intern";

  const sessionRole = sessionUser?.role ?? null;
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
  const [noteLinks, setNoteLinks] = useState<NoteLinkDraft[]>([{ label: "", url: "" }]);
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSearch, setNoteSearch] = useState("");
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
  // tracks mentorIds submitted this session before Firestore snapshot catches up
  const [justSubmittedMentorIds, setJustSubmittedMentorIds] = useState<Set<string>>(new Set());
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState<string | null>(null);

  // Mentor-to-intern form state (mentor fills feedback about interns)
  const [mtiRatings, setMtiRatings] = useState<Record<string, number>>({});
  const [mtiComments, setMtiComments] = useState<Record<string, string>>({});
  const [submitMtiFeedbackLoading, setSubmitMtiFeedbackLoading] = useState(false);
  const [justSubmittedMtiKeys, setJustSubmittedMtiKeys] = useState<Set<string>>(new Set());
  const [mtiSuccessMsg, setMtiSuccessMsg] = useState<string | null>(null);

  const internUsers = useMemo(() => users.filter((user) => user.role === "Intern"), [users]);
  const currentInternData = sessionUser?.role === "Intern" ? internData : null;
  const internDailyNotes = useMemo(() => {
    const notes = [...(currentInternData?.dailyNotes ?? [])].sort((a, b) => getNoteSortTime(b) - getNoteSortTime(a));
    return notes.filter((note) => matchesNoteSearch(note, noteSearch));
  }, [currentInternData?.dailyNotes, noteSearch]);
  const mentorDailyNotes = useMemo(() => {
    const notes = [...mentorData.dailyNotes].sort((a, b) => getNoteSortTime(b) - getNoteSortTime(a));
    return notes.filter((note) => matchesNoteSearch(note, noteSearch));
  }, [mentorData.dailyNotes, noteSearch]);
  const mentorTasks = useMemo(
    () => (currentInternData?.submissions ?? []).filter((entry) => entry.type === "Mentor Task"),
    [currentInternData?.submissions],
  );
  const internMentorRatingEntries = useMemo(() => {
    const mentorReviews = (currentInternData?.feedback ?? []).map((entry) => ({
      date: entry.date,
      rating: entry.rating,
      comment: entry.comment,
      mentorName: entry.mentorName?.trim() || "Mentor",
      source: "Mentor review" as const,
    }));

    const mentorFormReviews = (currentInternData?.mentorToInternFeedbackSubmissions ?? []).map((entry) => ({
      date: entry.submittedAt,
      rating: entry.rating,
      comment: entry.comment,
      mentorName: entry.mentorName?.trim() || "Mentor",
      source: "Mentor form" as const,
    }));

    return [...mentorReviews, ...mentorFormReviews].sort((a, b) => b.date.localeCompare(a.date));
  }, [currentInternData?.feedback, currentInternData?.mentorToInternFeedbackSubmissions]);
  const internWeeklyFeedback = useMemo(() => {
    const feedbackEntries = [...internMentorRatingEntries];
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
  }, [internMentorRatingEntries]);
  const internCurrentMonthFeedback = useMemo(() => {
    const monthKey = new Date().toISOString().slice(0, 7);
    return internMentorRatingEntries.filter((entry) => entry.date.startsWith(monthKey));
  }, [internMentorRatingEntries]);
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
  const internOverallMentorRating = useMemo(() => {
    const mentorRatings = internMentorRatingEntries.map((entry) => entry.rating);

    if (mentorRatings.length === 0) {
      return 0;
    }

    const total = mentorRatings.reduce((sum, rating) => sum + rating, 0);
    return Number((total / mentorRatings.length).toFixed(1));
  }, [internMentorRatingEntries]);
  const internMentorFeedbackEntries = useMemo<MentorFeedbackDisplayEntry[]>(() => {
    return internMentorRatingEntries.map((entry, index) => ({
      id: `${entry.source}-${index}-${entry.date}`,
      mentorName: entry.mentorName,
      rating: entry.rating,
      comment: entry.comment,
      date: entry.date,
      source: entry.source,
    }));
  }, [internMentorRatingEntries]);
  const internPerformanceOverallScore = useMemo(() => {
    // Prefer weekly mentor feedback when available
    if (internWeeklyFeedback.length > 0) {
      const total = internWeeklyFeedback.reduce((sum, entry) => sum + entry.avgRating, 0);
      return Math.round((total / internWeeklyFeedback.length) * 10);
    }

    const monthlyPerformance = (currentInternData?.performance ?? []);
    if (monthlyPerformance.length > 0) {
      const total = monthlyPerformance.reduce((sum, entry) => sum + entry.score, 0);
      return Math.round(total / monthlyPerformance.length);
    }

    // Fallback to overall weekly average rating if no weekly or monthly records exist
    if (internWeeklyAverageRating > 0) {
      return Math.round(internWeeklyAverageRating * 10);
    }

    return 0;
  }, [currentInternData?.performance, internWeeklyAverageRating, internWeeklyFeedback]);
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
    if (!sessionUser || sessionRole !== "Mentor") {
      return;
    }

    const openSessions = mentorData.attendanceSessions.filter((session) => session.status !== "Closed");
    const fallbackSession = openSessions[0] ?? mentorData.attendanceSessions[0];

    if (!selectedAttendanceSessionId && fallbackSession) {
      setSelectedAttendanceSessionId(fallbackSession.id);
    }
  }, [mentorData.attendanceSessions, selectedAttendanceSessionId, sessionUser, sessionRole]);

  useEffect(() => {
    if (!sessionUser) {
      return;
    }

    if (sessionRole === "Admin") {
      navigate("/admin", { replace: true });
      return;
    }
  }, [navigate, sessionUser, sessionRole]);

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
    if (sessionRole !== "Intern") {
      return;
    }

    if (selectedMentorForm && !mentorFeedbackForms.some((form) => form.id === selectedMentorForm)) {
      setSelectedMentorForm(null);
    }
  }, [mentorFeedbackForms, selectedMentorForm, sessionRole]);

  useEffect(() => {
    if (!sessionUser || sessionRole !== "Mentor") {
      return;
    }

    if (!selectedClosedAttendanceSessionId && closedAttendanceSessions.length > 0) {
      setSelectedClosedAttendanceSessionId(closedAttendanceSessions[0].id);
    }
  }, [closedAttendanceSessions, selectedClosedAttendanceSessionId, sessionUser, sessionRole]);

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

  const isMentor = sessionRole === "Mentor";

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
    console.log("note submit pre-check", { noteInternIds, noteTitle, noteBody });

    if (noteInternIds.length === 0) {
      alert("Please select at least one intern.");
      return;
    }

    if (!noteTitle.trim()) {
      alert("Please provide a title for the note.");
      return;
    }

    if (!noteBody.trim()) {
      alert("Please provide the note body.");
      return;
    }

    console.log("note submit debug", { noteInternIds, internCount: internUsers.length, internIdsInState: internUsers.map((u) => u.id) });

    // Build selected interns from the selected ids. If a user is missing from `internUsers` (stale state),
    // fall back to a minimal object so the note can still be submitted for that id.
    const selectedInterns = noteInternIds.map((id) => {
      const found = internUsers.find((user) => user.id === id);
      return found ?? { id, name: id };
    });

    setNoteSaving(true);
    try {
      console.log("Submitting daily note", { noteTitle, noteBody, noteLectureDate, noteLectureTime, noteFiles, noteLinks, noteInternIds });
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
            links: noteLinks.filter((link) => link.url.trim()).map((link) => ({ label: link.label.trim(), url: link.url.trim() })),
          }),
        ),
      );

      setNoteTitle("");
      setNoteBody("");
      setNoteFiles([]);
      setNoteLinks([{ label: "", url: "" }]);
      alert("Note saved successfully.");
    } catch (error) {
      console.error("Failed to save daily note:", error);
      alert("Unable to save note right now. Check console for errors. If you see 'Missing or insufficient permissions', update Firestore rules.");
    } finally {
      setNoteSaving(false);
    }
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

    const normalizedRating = normalizeTenPointRating(feedbackRating);
    if (Number.isNaN(normalizedRating)) {
      alert("Please enter a valid rating between 0 and 10.");
      return;
    }

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

  const sendAttendanceEmails = async (
    records: Array<{ internName: string; internEmail: string; status: "Present" | "Absent" }>,
    sessionTitle: string,
    sessionDate: string,
    sessionStartTime: string,
    sessionStatus: "Open" | "Closed",
    subjectPrefix = "Attendance",
    messagePrefix = "Your attendance record has been updated by your mentor.",
  ) => {
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
              <p style="margin:0 0 16px;">${messagePrefix}</p>
              <table style="width:100%;border-collapse:collapse;margin:0 0 18px;">
                <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Session</strong></td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${sessionTitle}</td></tr>
                <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Date</strong></td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${sessionDate}</td></tr>
                <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Start Time</strong></td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${sessionStartTime}</td></tr>
                <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Your Status</strong></td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${record.status}</td></tr>
                <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;"><strong>Session Status</strong></td><td style="padding:10px 12px;border:1px solid #e2e8f0;">${sessionStatus}</td></tr>
              </table>
              <a href="${loginUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:11px 16px;border-radius:10px;font-weight:600;">Open Dashboard</a>
              <p style="margin:18px 0 0;">Regards,<br/>HackMates Team</p>
            </div>
          </div>
        </div>
      `;

      return sendPlatformEmail({
        email: record.internEmail,
        subject: `${subjectPrefix} ${record.status} - ${sessionTitle}`,
        message: `${messagePrefix} Attendance: ${record.status}. Session: ${sessionTitle} on ${sessionDate} ${sessionStartTime}. Session status: ${sessionStatus}.`,
        html,
      });
    }));
  };

  const handleUpdateAttendanceSession = async () => {
    if (!selectedAttendanceSessionId || !attendanceTitle.trim() || !attendanceDate || !attendanceStartTime) {
      alert("Please select a session and ensure title, date, and start time are set before saving.");
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

    console.log("handleUpdateAttendanceSession called", { selectedAttendanceSessionId, attendanceDrafts, attendanceTitle, attendanceDate, attendanceStartTime });

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

      await sendAttendanceEmails(records, attendanceTitle, attendanceDate, attendanceStartTime, attendanceSessionStatus);

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
      await sendAttendanceEmails(
        selectedAttendanceSession.records,
        attendanceTitle || selectedAttendanceSession.title,
        attendanceDate || selectedAttendanceSession.date,
        attendanceStartTime || selectedAttendanceSession.startTime,
        "Open",
        "Attendance session reopened",
        "Your attendance session has been reopened by your mentor.",
      );
      setAttendanceSessionStatus("Open");
      alert("Session reopened and attendance email sent.");
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
  const openDoubts = sessionRole === "Intern"
    ? currentInternData?.doubts.filter((entry) => entry.status === "Open").length ?? 0
    : mentorData.doubts.filter((entry) => entry.status === "Open").length;
  const pendingSubmissions = sessionRole === "Intern"
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
  const internPerformanceChartData = internWeeklyFeedback.length > 0
    ? internWeeklyFeedback.map((entry) => ({
      month: entry.weekStart.slice(5),
      score: Math.round((entry.avgRating / 10) * 100),
    }))
    : (currentInternData?.performance ?? []).map((entry) => ({
      month: entry.month.slice(0, 7),
      score: entry.score,
    }));
  const internTabValue = sessionRole === "Intern"
    ? ((activeSection === "overview" || dashboardMetrics.some((item) => item.key === activeSection)) ? activeSection : "overview")
    : "performance";

  const showMentorOverview = activeSection === "overview";
  const showInternOverview = sessionRole === "Intern" && activeSection === "overview";
  const showMentorNotes = activeSection === "notes";
  const showMentorDoubts = activeSection === "doubts";
  const showMentorSubmissions = activeSection === "submissions";
  const showMentorFeedback = activeSection === "feedback";
  const showMentorAttendance = activeSection === "attendance";
  const currentMentorIdentifiers = new Set([
    sessionUser.uid,
    sessionUser.id,
    sessionUser.mentorId,
    sessionUser.email,
    sessionUser.name,
  ]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.trim().toLowerCase()));
  const mentorFeedbackHistory = mentorData.feedback
    .filter((entry) => entry.mentorName === sessionUser.name)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
  const receivedMentorFeedback = (mentorFeedbackSubmissions ?? [])
    .filter((entry) => currentMentorIdentifiers.has(String(entry.mentorId || "").trim().toLowerCase()))
    .slice()
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const internGaveMentorFeedback = mentorFeedback
    .filter((entry) => entry.internId === sessionUser.uid)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden flex">
      <DashboardSidebar
        role={sessionRole}
        userName={sessionUser.name}
        onLogout={handleLogout}
        activeSection={activeSection}
        onSectionChange={(section) => {
          setActiveSection(section);
        }}
      />
      <div className="flex-1 min-h-screen min-w-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(249,115,22,0.18),_transparent_22%),linear-gradient(180deg,_rgba(8,15,33,0.96),_rgba(2,6,23,0.98))]" />
        <div className="relative z-10 min-h-screen flex flex-col">
        <header className="border-b border-white/10 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-20">
          <div className="w-full px-4 lg:px-6 py-4 pl-16 lg:pl-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge className="bg-white/10 text-white border-white/10">{sessionRole}</Badge>
                <Badge variant="outline" className="border-primary/30 text-primary">{sessionUser.name}</Badge>
                {!isMentor && sessionUser.internId && (
                  <Badge variant="outline" className="border-white/20 text-white/60 font-mono text-xs">{sessionUser.internId}</Badge>
                )}
                {isMentor && sessionUser.mentorId && (
                  <Badge variant="outline" className="border-white/20 text-white/60 font-mono text-xs">{sessionUser.mentorId}</Badge>
                )}
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

        <main className="w-full px-4 lg:px-6 py-6 lg:py-8 space-y-6 lg:space-y-8 min-w-0">
          {(showInternOverview || showMentorOverview) && (() => {
            const overviewCards = sessionRole === "Mentor" ? [
              { label: "Submission Forms Open", value: `${mentorActiveSubmissionForms.length}`, helper: "Awaiting intern completion", icon: Send },
              { label: "Attendance Sessions", value: `${mentorLectureCount}`, helper: "Sessions created", icon: ClipboardCheck },
              { label: "Open Doubts", value: `${openDoubts}`, helper: "Unanswered questions", icon: MessageSquareMore },
            ] : [
              { label: "Performance", value: `${internWeeklyAverageRating || 0}/10`, helper: `Weekly avg ${internOverallMentorRating || 0}/10`, icon: BadgeCheck },
              { label: "Mentor feedback", value: `${internOverallMentorRating || 0}/10`, helper: `${internMentorFeedbackEntries.length} ratings received`, icon: Star },
              { label: "Fees", value: `${pendingFees}`, helper: "Pending items", icon: FileText },
              { label: "Doubts", value: `${openDoubts}`, helper: "Open questions", icon: MessageSquareMore },
              { label: "Submissions", value: `${pendingSubmissions}`, helper: "Awaiting review", icon: Send },
            ];
            return (
              <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 grid-cols-2 lg:grid-cols-5">
                {overviewCards.map((item) => {
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
            );
          })()}

          {sessionRole === "Intern" ? (
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
                      {attendanceTotal === 0 ? (
                        <p className="text-sm text-white/60 rounded-xl border border-white/10 bg-white/5 p-4">No attendance has been marked yet.</p>
                      ) : (
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
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-white/10 bg-slate-950/70 text-white">
                    <CardHeader>
                      <CardTitle>Weekly performance trend</CardTitle>
                      <CardDescription className="text-white/60">Weekly scores from the mentor review timeline.</CardDescription>
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
                    <CardTitle>Weekly performance</CardTitle>
                    <CardDescription className="text-white/60">Overall performance till now, with week-by-week breakdown.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                        <p className="text-sm text-white/70">Overall performance</p>
                        <p className="text-3xl font-bold mt-1">{internPerformanceOverallScore}%</p>
                        <p className="text-xs text-white/55 mt-2">Based on all recorded weekly mentor reviews.</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-white/70">Weekly records</p>
                        <p className="text-3xl font-bold mt-1">{internWeeklyFeedback.length}</p>
                        <p className="text-xs text-white/55 mt-2">Grouped by week from mentor feedback.</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-white/70">Overall mentor rating</p>
                        <p className="text-3xl font-bold mt-1">{internOverallMentorRating || 0}/10</p>
                        <p className="text-xs text-white/55 mt-2">Average of all mentor ratings and feedback form scores.</p>
                      </div>
                    </div>

                    {internWeeklyFeedback.length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">No weekly performance records yet.</div>
                    ) : (
                      internWeeklyFeedback.map((entry) => (
                        <div key={entry.weekStart} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-semibold">Week of {entry.weekStart}</p>
                              <p className="text-sm text-white/65 mt-1">{entry.latestRemark}</p>
                            </div>
                            <Badge className="bg-primary/15 text-primary border-primary/20">{entry.avgRating}/10</Badge>
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
                              <option key={task.id} value={task.id} className="text-black">{task.title} · Due {task.dueDate}</option>
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
                              Lecture: {submission.lectureDate || "-"}{submission.lectureTime ? ` · ${submission.lectureTime}` : ""}
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
                  {dashboardRole === "Mentor" && (
                    <Card className="border-white/10 bg-slate-950/70 text-white">
                      <CardHeader>
                        <CardTitle>Feedback received</CardTitle>
                        <CardDescription className="text-white/60">Anonymous ratings and reviews from interns.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {receivedMentorFeedback.length === 0 ? (
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/65">No feedback received yet.</div>
                        ) : (
                          receivedMentorFeedback.map((entry) => (
                            <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-1.5">
                                  {[1,2,3,4,5].map((n) => (
                                    <Star key={n} className={`w-4 h-4 ${entry.rating >= n * 2 ? "fill-yellow-400 text-yellow-400" : entry.rating >= n * 2 - 1 ? "fill-yellow-400/50 text-yellow-400/50" : "text-white/20"}`} />
                                  ))}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-white/10 text-white/70 border-white/10 text-xs">Marks: {entry.rating}/10</Badge>
                                  <span className="text-xs text-white/40">{new Date(entry.submittedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <p className="text-sm text-white/75">{entry.review}</p>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Intern sees feedback from mentors — with mentor name, stars, comment */}
                  {sessionRole === "Intern" && internMentorFeedbackEntries.length > 0 && (
                    <Card className="border-white/10 bg-slate-950/70 text-white">
                      <CardHeader>
                        <CardTitle>Mentor feedback</CardTitle>
                        <CardDescription className="text-white/60">Ratings, stars, and comments submitted by your mentors.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-sm text-white/60">Total reviews</p>
                            <p className="text-3xl font-bold mt-2">{internMentorFeedbackEntries.length}</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-sm text-white/60">Average rating</p>
                            <p className="text-3xl font-bold mt-2">{internOverallMentorRating || 0}/10</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-sm text-white/60">Mentors</p>
                            <p className="text-3xl font-bold mt-2">
                              {new Set(internMentorFeedbackEntries.map((entry) => entry.mentorName)).size}
                            </p>
                          </div>
                        </div>

                        {internMentorFeedbackEntries.length === 0 ? (
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/65">No mentor feedback received yet.</div>
                        ) : (
                          internMentorFeedbackEntries.map((entry) => (
                            <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm text-white">{entry.mentorName}</span>
                                  <Badge className="bg-white/10 text-white/60 border-white/10 text-xs">{entry.source}</Badge>
                                </div>
                                <span className="text-xs text-white/40">{new Date(entry.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <Star
                                    key={n}
                                    className={`w-4 h-4 ${entry.rating >= n * 2 ? "fill-yellow-400 text-yellow-400" : entry.rating >= n * 2 - 1 ? "fill-yellow-400/50 text-yellow-400/50" : "text-white/20"}`}
                                  />
                                ))}
                                <Badge className="bg-white/10 text-white/70 border-white/10 text-xs ml-1">Marks: {entry.rating}/10</Badge>
                              </div>
                              <p className="text-sm text-white/75">{entry.comment}</p>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {dashboardRole === "Intern" && (
                    <Card className="border-white/10 bg-slate-950/70 text-white">
                      <CardHeader>
                        <CardTitle>Mentor Rating Forms</CardTitle>
                        <CardDescription className="text-white/60">Active forms assigned to you will appear here.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {mentorFeedbackForms.length === 0 ? (
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/65">
                            No active mentor rating forms are available right now.
                          </div>
                        ) : selectedMentorForm ? (
                          (() => {
                            const form = mentorFeedbackForms.find((f) => f.id === selectedMentorForm);
                            if (!form) return null;
                            const myInternId = sessionUser.uid || sessionUser.id;

                            const isSubmitted = (mentorId: string) =>
                              justSubmittedMentorIds.has(mentorId) ||
                              mentorFeedbackSubmissions?.some(
                                (s) => s.mentorId === mentorId && s.formId === form.id && s.internId === myInternId,
                              );

                            const pendingMentors = form.mentorIds.filter((mid) => !isSubmitted(mid));
                            const doneMentors = form.mentorIds.filter((mid) => isSubmitted(mid));

                            return (
                              <div className="space-y-4">
                                {/* Success popup */}
                                {feedbackSuccessMsg && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300"
                                  >
                                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                                    {feedbackSuccessMsg}
                                  </motion.div>
                                )}

                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedMentorForm(null);
                                    setMentorRatings({});
                                    setMentorReviews({});
                                    setJustSubmittedMentorIds(new Set());
                                    setFeedbackSuccessMsg(null);
                                  }}
                                  className="bg-white/15 border-white/30 text-white hover:bg-white/25"
                                >
                                  ← Back to Forms
                                </Button>

                                <h3 className="font-semibold text-lg">
                                  Rating: {form.mentorNames.join(", ")}
                                </h3>

                                {/* ── Pending mentors ── */}
                                {pendingMentors.length === 0 ? (
                                  <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4 text-sm text-green-300 text-center">
                                    ✓ You have rated all mentors in this form!
                                  </div>
                                ) : (
                                  pendingMentors.map((mentorId) => {
                                    const idx = form.mentorIds.indexOf(mentorId);
                                    return (
                                      <div key={mentorId} className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
                                        <h4 className="font-semibold text-white">{form.mentorNames[idx]}</h4>

                                        <div className="space-y-2">
                                          <label className="text-sm text-white/70">Rating (out of 10)</label>
                                          <Input
                                            type="number"
                                            min={0}
                                            max={10}
                                            step="0.1"
                                            value={mentorRatings[mentorId] ?? ""}
                                            onChange={(event) => setMentorRatings({
                                              ...mentorRatings,
                                              [mentorId]: event.target.value === "" ? Number.NaN : Number(event.target.value),
                                            })}
                                            className="bg-white/5 border-white/10 text-white"
                                          />
                                          <p className="text-xs text-white/45">Enter a score from 0 to 10.</p>
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
                                            const rating = normalizeTenPointRating(mentorRatings[mentorId]);
                                            if (Number.isNaN(rating) || !mentorReviews[mentorId]?.trim()) {
                                              alert("Please provide a valid rating between 0 and 10 and a review.");
                                              return;
                                            }
                                            setSubmitMentorFeedbackLoading(true);
                                            try {
                                              await submitMentorFeedbackForm({
                                                formId: form.id,
                                                mentorId,
                                                mentorName: form.mentorNames[idx],
                                                internId: myInternId,
                                                internName: sessionUser.name,
                                                internEmail: sessionUser.email,
                                                rating,
                                                review: mentorReviews[mentorId],
                                              });

                                              // Mark as submitted locally immediately
                                              setJustSubmittedMentorIds((prev) => new Set([...prev, mentorId]));
                                              setMentorRatings((prev) => { const n = { ...prev }; delete n[mentorId]; return n; });
                                              setMentorReviews((prev) => { const n = { ...prev }; delete n[mentorId]; return n; });

                                              const remainingAfter = pendingMentors.filter((mid) => mid !== mentorId);
                                              if (remainingAfter.length === 0) {
                                                setFeedbackSuccessMsg(`All done! You've rated all mentors in this form.`);
                                              } else {
                                                setFeedbackSuccessMsg(`Feedback for ${form.mentorNames[idx]} submitted successfully!`);
                                                setTimeout(() => setFeedbackSuccessMsg(null), 3000);
                                              }
                                            } catch (error) {
                                              console.error("Error submitting feedback:", error);
                                              alert("Failed to submit feedback. You may have already submitted for this mentor.");
                                            } finally {
                                              setSubmitMentorFeedbackLoading(false);
                                            }
                                          }}
                                          disabled={submitMentorFeedbackLoading || Number.isNaN(normalizeTenPointRating(mentorRatings[mentorId])) || !mentorReviews[mentorId]?.trim()}
                                          className="w-full bg-primary hover:bg-primary/80"
                                        >
                                          {submitMentorFeedbackLoading ? "Submitting..." : "Submit Feedback"}
                                        </Button>
                                      </div>
                                    );
                                  })
                                )}

                                {/* ── Already submitted section ── */}
                                {doneMentors.length > 0 && (
                                  <div className="space-y-2 pt-2">
                                    <p className="text-xs text-white/40 uppercase tracking-wide font-medium">Already submitted</p>
                                    {doneMentors.map((mentorId) => {
                                      const idx = form.mentorIds.indexOf(mentorId);
                                      const sub = mentorFeedbackSubmissions?.find(
                                        (s) => s.mentorId === mentorId && s.formId === form.id && s.internId === myInternId,
                                      );
                                      return (
                                        <div key={mentorId} className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 flex items-start gap-3">
                                          <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                                          <div className="flex-1 min-w-0">
                                            <p className="font-medium text-white/80 text-sm">{form.mentorNames[idx]}</p>
                                            {sub && (
                                              <div className="mt-1 space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">{sub.rating}/10</span>
                                                  <span className="text-xs text-white/40">{new Date(sub.submittedAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs text-white/55 line-clamp-2">{sub.review}</p>
                                              </div>
                                            )}
                                          </div>
                                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30 shrink-0 text-xs">Submitted</Badge>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })()
                        ) : (
                          <div className="space-y-3">
                            {mentorFeedbackForms
                              .filter((form) => {
                                const myInternId = sessionUser.uid || sessionUser.id;
                                return !form.mentorIds.every((mid) =>
                                  mentorFeedbackSubmissions?.some((s) => s.mentorId === mid && s.formId === form.id && s.internId === myInternId)
                                );
                              })
                              .map((form) => {
                                const myInternId = sessionUser.uid || sessionUser.id;
                                const submittedIds = form.mentorIds.filter((mid) =>
                                  mentorFeedbackSubmissions?.some((s) => s.mentorId === mid && s.formId === form.id && s.internId === myInternId)
                                );
                                const pendingNames = form.mentorIds
                                  .filter((mid) => !submittedIds.includes(mid))
                                  .map((mid) => form.mentorNames[form.mentorIds.indexOf(mid)]);
                                const remaining = pendingNames.length;
                                return (
                                  <motion.div
                                    key={form.id}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => {
                                      setSelectedMentorForm(form.id);
                                      setJustSubmittedMentorIds(new Set());
                                      setFeedbackSuccessMsg(null);
                                    }}
                                    className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="font-semibold text-sm">Rate: {pendingNames.join(", ")}</p>
                                        <p className="text-xs text-white/50 mt-1">
                                          {remaining} mentor{remaining !== 1 ? "s" : ""} remaining
                                          {submittedIds.length > 0 && ` · ${submittedIds.length} submitted`}
                                        </p>
                                      </div>
                                      <Badge className="bg-blue-500/20 text-blue-300 shrink-0">View Form</Badge>
                                    </div>
                                  </motion.div>
                                );
                              })}

                            {/* All done state */}
                            {mentorFeedbackForms.length > 0 && mentorFeedbackForms.every((form) => {
                              const myInternId = sessionUser.uid || sessionUser.id;
                              return form.mentorIds.every((mid) =>
                                mentorFeedbackSubmissions?.some((s) => s.mentorId === mid && s.formId === form.id && s.internId === myInternId)
                              );
                            }) && (
                              <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4 text-sm text-green-300 text-center">
                                ✓ You have submitted feedback for all mentors. Thank you!
                              </div>
                            )}
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
                    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p className="text-sm text-white/70">Lecture notes</p>
                        <p className="text-xs text-white/45">Search the latest mentor notes by title, link, or keyword.</p>
                      </div>
                      <div className="w-full md:max-w-sm space-y-1.5">
                        <label className="text-xs uppercase tracking-[0.2em] text-white/45">Search notes</label>
                        <Input
                          value={noteSearch}
                          onChange={(event) => setNoteSearch(event.target.value)}
                          className="bg-white/5 border-white/10 text-white"
                          placeholder="Search lecture notes"
                        />
                      </div>
                    </div>
                    {internDailyNotes.length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/65">
                        {currentInternData?.dailyNotes.length === 0 ? "No notes have been posted yet." : "No notes match your search."}
                      </div>
                    ) : (
                      internDailyNotes.map((entry) => (
                        <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold">{entry.title}</p>
                            <Badge variant="secondary">{entry.date}</Badge>
                          </div>
                          {entry.lectureTime && <p className="text-sm text-white/60 mt-2">Lecture time: {entry.lectureTime}</p>}
                          <p className="text-sm text-white/70 mt-3">{entry.note}</p>
                          <p className="text-sm text-white/55 mt-2">Mentor: {entry.mentorName}</p>
                          {entry.links && entry.links.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {entry.links.map((link, index) => (
                                <a
                                  key={`${entry.id}-link-${index}`}
                                  href={toAbsoluteUrl(link.url)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200 hover:bg-cyan-500/20 transition-colors"
                                >
                                  <Link2 className="w-3 h-3" />
                                  {link.label?.trim() || link.url}
                                </a>
                              ))}
                            </div>
                          )}
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
                                      📄 {file.name}
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
                                      📎 {file.name}
                                    </a>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
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
                              <p className="text-sm text-white/60">{entry.date} <Clock className="inline-block w-3 h-3 text-white/60 mx-2" /> {entry.startTime || "Session time not set"}</p>
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
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <label className="text-sm text-white/70">Note links</label>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-8 border-white/10 bg-white/5 px-3 text-xs text-white hover:bg-white/10"
                          onClick={() => setNoteLinks((current) => [...current, { label: "", url: "" }])}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add link
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {noteLinks.map((link, index) => (
                          <div key={`${index}-${link.url}`} className="grid gap-2 md:grid-cols-[1fr_1.2fr_auto]">
                            <Input
                              value={link.label}
                              onChange={(event) => setNoteLinks((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item))}
                              className="bg-white/5 border-white/10 text-white"
                              placeholder="Label like YouTube recap or Drive notes"
                            />
                            <Input
                              value={link.url}
                              onChange={(event) => setNoteLinks((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, url: event.target.value } : item))}
                              className="bg-white/5 border-white/10 text-white"
                              placeholder="Paste YouTube or Drive link"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="h-10 border-white/10 bg-white/5 px-3 text-xs text-white hover:bg-white/10"
                              onClick={() => setNoteLinks((current) => current.length === 1 ? [{ label: "", url: "" }] : current.filter((_, itemIndex) => itemIndex !== index))}
                              disabled={noteLinks.length === 1}
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
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
                    <Button type="submit" className="w-full" disabled={noteSaving}>
                      <BookOpen className="w-4 h-4" />
                      {noteSaving ? "Saving..." : "Save note"}
                    </Button>
                  </form>

                  <div className="mt-6 space-y-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p className="text-sm font-medium text-white/70">All lecture notes</p>
                        <p className="text-xs text-white/45">Newest notes appear first.</p>
                      </div>
                      <div className="w-full md:max-w-sm space-y-1.5">
                        <label className="text-xs uppercase tracking-[0.2em] text-white/45">Search notes</label>
                        <Input
                          value={noteSearch}
                          onChange={(event) => setNoteSearch(event.target.value)}
                          className="bg-white/5 border-white/10 text-white"
                          placeholder="Search by title, mentor, note, or link"
                        />
                      </div>
                    </div>
                    {mentorDailyNotes.length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                        {mentorData.dailyNotes.length === 0 ? "No lecture notes yet." : "No notes match your search."}
                      </div>
                    ) : (
                      mentorDailyNotes.map((note) => (
                        <div key={note.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold text-sm">{note.title}</p>
                            <Badge variant="secondary" className="text-xs">{note.date.slice(0, 10)}</Badge>
                          </div>
                          <p className="text-xs text-white/50">
                            {note.internName} · by {note.mentorName}
                            {note.lectureTime ? ` · ${note.lectureTime}` : ""}
                          </p>
                          <p className="text-sm text-white/75">{note.note}</p>
                          {note.links && note.links.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {note.links.map((link, index) => (
                                <a
                                  key={`${note.id}-link-${index}`}
                                  href={toAbsoluteUrl(link.url)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200 hover:bg-cyan-500/20 transition-colors"
                                >
                                  <Link2 className="w-3 h-3" />
                                  {link.label?.trim() || link.url}
                                </a>
                              ))}
                            </div>
                          )}
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
                                    {pdf ? "📄" : "📎"} {file.name}
                                  </a>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
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
                            <p className="text-sm text-white/60">{submission.internName} · {submission.type}</p>
                          </div>
                          <Badge className={submissionStatusBadgeClass(submission.status)}>{submission.status}</Badge>
                        </div>
                        <p className="text-sm text-white/60">Due {submission.dueDate}</p>
                        {(submission.lectureDate || submission.lectureTime) && (
                          <p className="text-sm text-white/60">Lecture: {submission.lectureDate || "-"}{submission.lectureTime ? ` · ${submission.lectureTime}` : ""}</p>
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
                                  <p className="text-xs text-white/60 mt-1">{entry.date} · {entry.rating}/10</p>
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

                  {sessionRole === "Mentor" && (
                    <Card className="border-white/10 bg-slate-950/70 text-white">
                      <CardHeader>
                        <CardTitle>Feedback received</CardTitle>
                        <CardDescription className="text-white/60">Anonymous ratings and reviews from interns.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {receivedMentorFeedback.length === 0 ? (
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/65">No feedback received yet.</div>
                        ) : (
                          receivedMentorFeedback.map((entry) => (
                            <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-1.5">
                                  {[1,2,3,4,5].map((n) => (
                                    <Star key={n} className={`w-4 h-4 ${entry.rating >= n * 2 ? "fill-yellow-400 text-yellow-400" : entry.rating >= n * 2 - 1 ? "fill-yellow-400/50 text-yellow-400/50" : "text-white/20"}`} />
                                  ))}
                                  <span className="text-xs text-white/60 ml-1">{entry.rating}/10</span>
                                </div>
                                <span className="text-xs text-white/40">{new Date(entry.submittedAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-white/75">{entry.review}</p>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Mentor fills feedback forms about interns (admin-created) */}
                  {sessionRole === "Mentor" && mentorData.mentorToInternFeedbackForms && mentorData.mentorToInternFeedbackForms.length > 0 && (
                    <Card className="border-white/10 bg-slate-950/70 text-white">
                      <CardHeader>
                        <CardTitle>Intern Feedback Forms</CardTitle>
                        <CardDescription className="text-white/60">Admin-assigned forms — rate and review your interns.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Global success popup */}
                        {mtiSuccessMsg && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300"
                          >
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            {mtiSuccessMsg}
                          </motion.div>
                        )}

                        {mentorData.mentorToInternFeedbackForms.map((form) => {
                          const myMentorId = sessionUser.uid || sessionUser.id;

                          const isMtiSubmitted = (internId: string) => {
                            const key = `${form.id}-${internId}`;
                            return justSubmittedMtiKeys.has(key) ||
                              mentorData.mentorToInternFeedbackSubmissions?.some(
                                (s) => s.internId === internId && s.formId === form.id && s.mentorId === myMentorId,
                              );
                          };

                          const pendingInterns = form.internIds.filter((id) => !isMtiSubmitted(id));
                          const doneInterns = form.internIds.filter((id) => isMtiSubmitted(id));

                          return (
                            <div key={form.id} className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-4">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-semibold text-white text-sm">
                                  {pendingInterns.length > 0
                                    ? `Pending: ${pendingInterns.map((id) => form.internNames[form.internIds.indexOf(id)]).join(", ")}`
                                    : "All interns reviewed"}
                                </p>
                                <Badge className={form.status === "Active" ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"}>
                                  {form.status}
                                </Badge>
                              </div>

                              {/* Pending interns */}
                              {pendingInterns.map((internId) => {
                                const idx = form.internIds.indexOf(internId);
                                const submissionKey = `${form.id}-${internId}`;
                                return (
                                  <div key={internId} className="rounded-lg border border-white/10 bg-slate-950/40 p-4 space-y-3">
                                    <h4 className="font-semibold text-white text-sm">{form.internNames[idx]}</h4>
                                    {form.status === "Active" ? (
                                      <>
                                        <div className="space-y-2">
                                          <label className="text-sm text-white/70">Rating (out of 10)</label>
                                          <Input
                                            type="number"
                                            min={0}
                                            max={10}
                                            step="0.1"
                                            value={mtiRatings[submissionKey] ?? ""}
                                            onChange={(event) => setMtiRatings((prev) => ({
                                              ...prev,
                                              [submissionKey]: event.target.value === "" ? Number.NaN : Number(event.target.value),
                                            }))}
                                            className="bg-white/5 border-white/10 text-white"
                                          />
                                          <p className="text-xs text-white/45">Enter a score from 0 to 10.</p>
                                        </div>
                                        <div className="space-y-2">
                                          <label className="text-sm text-white/70">Feedback</label>
                                          <Textarea
                                            placeholder="Your feedback for this intern..."
                                            value={mtiComments[submissionKey] || ""}
                                            onChange={(e) => setMtiComments((prev) => ({ ...prev, [submissionKey]: e.target.value }))}
                                            className="bg-white/5 border-white/10 text-white min-h-20"
                                          />
                                        </div>
                                        <Button
                                          type="button"
                                          disabled={submitMtiFeedbackLoading || Number.isNaN(normalizeTenPointRating(mtiRatings[submissionKey])) || !mtiComments[submissionKey]?.trim()}
                                          className="w-full bg-primary hover:bg-primary/80"
                                          onClick={async () => {
                                            const rating = normalizeTenPointRating(mtiRatings[submissionKey]);
                                            if (Number.isNaN(rating) || !mtiComments[submissionKey]?.trim()) {
                                              alert("Please provide a valid rating between 0 and 10 and feedback");
                                              return;
                                            }
                                            setSubmitMtiFeedbackLoading(true);
                                            try {
                                              await submitMentorToInternFeedbackForm({
                                                formId: form.id,
                                                internId,
                                                internName: form.internNames[idx],
                                                mentorId: myMentorId,
                                                mentorName: sessionUser.name,
                                                rating,
                                                comment: mtiComments[submissionKey],
                                              });
                                              // Mark locally immediately
                                              setJustSubmittedMtiKeys((prev) => new Set([...prev, submissionKey]));
                                              setMtiRatings((prev) => { const n = { ...prev }; delete n[submissionKey]; return n; });
                                              setMtiComments((prev) => { const n = { ...prev }; delete n[submissionKey]; return n; });

                                              const stillPending = pendingInterns.filter((id) => id !== internId);
                                              if (stillPending.length === 0) {
                                                setMtiSuccessMsg("All done! You've reviewed all interns in this form.");
                                              } else {
                                                setMtiSuccessMsg(`Feedback for ${form.internNames[idx]} submitted!`);
                                                setTimeout(() => setMtiSuccessMsg(null), 3000);
                                              }
                                            } catch (error) {
                                              console.error("Error submitting feedback:", error);
                                              alert("Failed to submit feedback. You may have already submitted for this intern.");
                                            } finally {
                                              setSubmitMtiFeedbackLoading(false);
                                            }
                                          }}
                                        >
                                          {submitMtiFeedbackLoading ? "Submitting..." : "Submit Feedback"}
                                        </Button>
                                      </>
                                    ) : (
                                      <p className="text-xs text-white/40 italic">This form is closed.</p>
                                    )}
                                  </div>
                                );
                              })}

                              {/* Already submitted interns */}
                              {doneInterns.length > 0 && (
                                <div className="space-y-2 pt-1">
                                  <p className="text-xs text-white/40 uppercase tracking-wide font-medium">Already submitted</p>
                                  {doneInterns.map((internId) => {
                                    const idx = form.internIds.indexOf(internId);
                                    const sub = mentorData.mentorToInternFeedbackSubmissions?.find(
                                      (s) => s.internId === internId && s.formId === form.id && s.mentorId === myMentorId,
                                    );
                                    return (
                                      <div key={internId} className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 flex items-start gap-3">
                                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-white/80 text-sm">{form.internNames[idx]}</p>
                                          {sub && (
                                            <div className="mt-1 space-y-0.5">
                                              <div className="flex items-center gap-2">
                                                {[1,2,3,4,5].map((n) => (
                                                  <Star key={n} className={`w-3.5 h-3.5 ${sub.rating >= n * 2 ? "fill-yellow-400 text-yellow-400" : "text-white/20"}`} />
                                                ))}
                                                <span className="text-xs text-white/50">{sub.rating}/10 · {new Date(sub.submittedAt).toLocaleDateString()}</span>
                                              </div>
                                              <p className="text-xs text-white/55 line-clamp-2">{sub.comment}</p>
                                            </div>
                                          )}
                                        </div>
                                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30 shrink-0 text-xs">Submitted</Badge>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
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
                          <option key={session.id} value={session.id} className="text-black">{session.date} · {session.title} · {session.status === "Closed" ? "Closed" : "Active"}</option>
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
                                <p className="text-xs text-white/60 mt-1">{session.date}{session.startTime ? <><Clock className="inline-block w-3 h-3 text-white/60 mx-2" />{session.startTime}</> : ""}</p>
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
                              <p className="text-xs text-white/60 mt-1">{selectedClosedAttendanceSession.date}{selectedClosedAttendanceSession.startTime ? <><Clock className="inline-block w-3 h-3 text-white/60 mx-2" />{selectedClosedAttendanceSession.startTime}</> : ""}</p>
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


