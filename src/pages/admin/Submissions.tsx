import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Send, Trash2, CheckCircle2, XCircle, Clock, ExternalLink,
  Github, Video, FileText, Globe, Link2, ChevronDown, ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePlatform } from "@/context/PlatformContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useMemo, useState } from "react";

/** Ensures a URL has an absolute protocol so it opens in a new tab correctly */
function toAbsoluteUrl(url: string): string {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

const LINK_DEFS = [
  { key: "githubLink",  label: "GitHub",  icon: Github,      color: "border-white/20 text-white/70 hover:bg-white/10" },
  { key: "liveLink",    label: "Live",    icon: Globe,       color: "border-green-500/30 text-green-400 hover:bg-green-500/10" },
  { key: "videoLink",   label: "Video",   icon: Video,       color: "border-blue-500/30 text-blue-400 hover:bg-blue-500/10" },
  { key: "pptLink",     label: "PPT",     icon: FileText,    color: "border-orange-500/30 text-orange-400 hover:bg-orange-500/10" },
  { key: "generalUrl",  label: "URL",     icon: Link2,       color: "border-white/20 text-white/70 hover:bg-white/10" },
] as const;

const AdminSubmissions = () => {
  const { loading, sessionUser, logout, submissions, users, reviewSubmission } = usePlatform();
  const [reviews, setReviews] = useState<Record<string, string>>({});
  const [reviewing, setReviewing] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const internMap = useMemo(() =>
    Object.fromEntries(users.filter((u) => u.role === "Intern").map((u) => [u.id, u])),
    [users],
  );

  if (!loading && !sessionUser) return <Navigate to="/login" replace />;
  if (!loading && sessionUser?.role !== "Admin") return <Navigate to="/login" replace />;
  if (!sessionUser) return null;

  const pending = submissions.filter((s) => s.status === "Pending" && s.submittedAt);
  const reviewed = submissions.filter((s) => s.status !== "Pending" || !s.submittedAt);

  const statusBadge = (status: string) => {
    if (status === "Approved") return <Badge className="bg-green-500/15 text-green-400 border-green-500/25"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
    if (status === "Rejected") return <Badge className="bg-red-500/15 text-red-400 border-red-500/25"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    if (status === "Reviewed") return <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/25"><CheckCircle2 className="w-3 h-3 mr-1" />Reviewed</Badge>;
    return <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/25"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
  };

  const handleReview = async (submissionId: string, status: "Approved" | "Rejected") => {
    if (!reviews[submissionId]?.trim()) return;
    setReviewing((p) => ({ ...p, [submissionId]: true }));
    try {
      const sub = submissions.find((s) => s.id === submissionId);
      const intern = sub ? internMap[sub.internId] : undefined;
      await reviewSubmission(
        submissionId,
        reviews[submissionId],
        status,
        "Admin",
        intern?.email,
        intern?.name ?? sub?.internName,
        sub?.title,
      );
      setReviews((p) => ({ ...p, [submissionId]: "" }));
    } finally {
      setReviewing((p) => ({ ...p, [submissionId]: false }));
    }
  };

  const SubmissionCard = ({ submission, index }: { submission: typeof submissions[0]; index: number }) => {
    const isOpen = expanded[submission.id];
    const hasLinks = LINK_DEFS.some(({ key }) => !!submission[key]);
    const isPending = submission.status === "Pending" && !!submission.submittedAt;

    return (
      <motion.div key={submission.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
        <div className={`rounded-xl border bg-white/5 transition-all ${isPending ? "border-yellow-500/20" : "border-white/10"}`}>
          {/* Row header */}
          <div className="p-4 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Send className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="font-semibold text-white text-sm">{submission.title}</span>
                {statusBadge(submission.status)}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-white/40">
                <span>{submission.internName}</span>
                <span>Type: {submission.type}</span>
                {submission.submittedAt && <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>}
                <span>Due: {new Date(submission.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setExpanded((p) => ({ ...p, [submission.id]: !p[submission.id] }))}
                className="text-white/40 hover:text-white transition p-1"
              >
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                onClick={async () => {
                  if (!window.confirm("Delete this submission?")) return;
                  await deleteDoc(doc(db, "submissions", submission.id));
                }}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Expanded body */}
          {isOpen && (
            <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">
              {submission.description && (
                <p className="text-sm text-white/70 leading-relaxed">{submission.description}</p>
              )}
              {submission.techStack && (
                <p className="text-xs text-white/40">Tech stack: {submission.techStack}</p>
              )}

              {/* Links — each opens in new tab */}
              {hasLinks && (
                <div className="flex flex-wrap gap-2">
                  {LINK_DEFS.map(({ key, label, icon: Icon, color }) => {
                    const url = submission[key];
                    if (!url) return null;
                    return (
                      <a
                        key={key}
                        href={toAbsoluteUrl(url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${color}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                        <ExternalLink className="w-3 h-3 opacity-50" />
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Feedback banner — shown when already reviewed, no re-review possible */}
              {submission.status !== "Pending" && (
                <div className={`p-3 rounded-lg border text-sm ${
                  submission.status === "Approved"
                    ? "bg-green-500/10 border-green-500/20 text-green-300"
                    : submission.status === "Rejected"
                    ? "bg-red-500/10 border-red-500/20 text-red-300"
                    : "bg-blue-500/10 border-blue-500/20 text-blue-300"
                }`}>
                  <p className="font-semibold mb-1">
                    {submission.status} by {submission.mentorName || "Admin"}
                  </p>
                  {submission.feedback && <p className="opacity-80">{submission.feedback}</p>}
                </div>
              )}

              {/* Review form — only for pending submitted tasks */}
              {isPending && (
                <div className="space-y-3 pt-2">
                  <Textarea
                    value={reviews[submission.id] || ""}
                    onChange={(e) => setReviews((p) => ({ ...p, [submission.id]: e.target.value }))}
                    placeholder="Write feedback for the intern (required)..."
                    className="bg-white/5 border-white/10 text-white min-h-20 text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleReview(submission.id, "Approved")}
                      disabled={reviewing[submission.id] || !reviews[submission.id]?.trim()}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      {reviewing[submission.id] ? "Approving..." : "Approve"}
                    </Button>
                    <Button
                      onClick={() => handleReview(submission.id, "Rejected")}
                      disabled={reviewing[submission.id] || !reviews[submission.id]?.trim()}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <XCircle className="w-4 h-4 mr-1.5" />
                      {reviewing[submission.id] ? "Rejecting..." : "Reject"}
                    </Button>
                  </div>
                  <p className="text-xs text-white/30">The intern will receive an email notification with your feedback.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden flex">
      <DashboardSidebar
        role="Admin"
        userName={sessionUser.email}
        onLogout={logout}
        activeSection="submissions"
        onSectionChange={() => {}}
      />
      <div className="flex-1 min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.18),_transparent_22%),linear-gradient(180deg,_rgba(2,6,23,0.96),_rgba(15,23,42,0.98))]" />
        <div className="relative z-10 min-h-screen flex flex-col">

          <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-20">
            <div className="mx-auto max-w-5xl px-6 py-4">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-white/10 text-white border-white/10">Admin</Badge>
              </div>
              <h1 className="text-2xl font-bold text-white">Submissions</h1>
              <p className="text-white/50 text-sm mt-0.5">Review and approve intern submissions</p>
            </div>
          </header>

          <main className="mx-auto max-w-5xl w-full px-6 py-6 flex-1 space-y-8">

            {/* Pending */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide">
                  Pending Review
                  <span className="ml-2 text-yellow-400">{pending.length}</span>
                </h2>
              </div>
              {pending.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 py-10 text-center text-white/30 text-sm">
                  No pending submissions
                </div>
              ) : (
                pending.map((s, i) => <SubmissionCard key={s.id} submission={s} index={i} />)
              )}
            </section>

            {/* Reviewed */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white/40" />
                <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wide">
                  Reviewed
                  <span className="ml-2">{reviewed.length}</span>
                </h2>
              </div>
              {reviewed.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 py-10 text-center text-white/30 text-sm">
                  No reviewed submissions yet
                </div>
              ) : (
                reviewed.map((s, i) => <SubmissionCard key={s.id} submission={s} index={i} />)
              )}
            </section>

          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminSubmissions;
