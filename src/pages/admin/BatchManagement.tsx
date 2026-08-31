import { useState, useMemo, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trash2,
  Archive,
  Loader2,
  Hash,
  Mail,
  BarChart3,
  Check,
  AlertCircle,
  Eye,
  X,
  BookOpen,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePlatform } from "@/context/PlatformContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  getDocs,
  where,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";

interface ArchivedIntern {
  name: string;
  internId: string;
  certificateId: string;
  attendancePercentage: number;
}

interface CompletedBatch {
  id: string;
  batchDate: string;
  interns: ArchivedIntern[];
  createdAt?: string;
  totalInterns: number;
}

const ic =
  "w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 text-sm";

const AdminBatchManagement = () => {
  const {
    loading,
    sessionUser,
    logout,
    users,
    attendanceSessions,
    deleteUserAccount,
  } = usePlatform();

  const [completedBatches, setCompletedBatches] = useState<CompletedBatch[]>([]);
  const [selectedInterns, setSelectedInterns] = useState<Set<string>>(new Set());
  const [archiverror, setArchiveError] = useState("");
  const [success, setSuccess] = useState("");
  const [archiving, setArchiving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingArchive, setPendingArchive] = useState<ArchivedIntern[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Fetch completed batches
  useEffect(() => {
    if (!sessionUser) return;
    const unsub = onSnapshot(collection(db, "completedBatches"), (snap) => {
      const batches = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        totalInterns: (d.data().interns as ArchivedIntern[]).length,
      } as CompletedBatch));
      setCompletedBatches(
        batches.sort((a, b) => b.batchDate.localeCompare(a.batchDate))
      );
    });
    return () => unsub();
  }, [sessionUser]);

  if (!loading && !sessionUser) return <Navigate to="/login" replace />;
  if (!loading && sessionUser?.role !== "Admin")
    return <Navigate to="/login" replace />;
  if (!sessionUser) return null;

  // Get interns with attendance info
  const interns = useMemo(() => {
    return users
      .filter((u) => u.role === "Intern")
      .map((intern) => {
        // Calculate attendance percentage
        const internRecords = attendanceSessions
          .flatMap((session) => session.records)
          .filter((record) => record.internId === intern.id);
        const attended = internRecords.filter(
          (r) => r.status === "Present"
        ).length;
        const total = internRecords.length;
        const attendancePercentage =
          total > 0 ? Math.round((attended / total) * 100) : 0;

        return {
          id: intern.id,
          name: intern.name,
          internId: intern.internId || "N/A",
          certificateId: intern.internId || "N/A",
          email: intern.email,
          attendancePercentage,
        };
      });
  }, [users, attendanceSessions]);

  const filteredInterns = useMemo(() => {
    return interns.filter(
      (intern) =>
        !search.trim() ||
        intern.name.toLowerCase().includes(search.toLowerCase()) ||
        intern.internId.toLowerCase().includes(search.toLowerCase()) ||
        intern.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [interns, search]);

  const toggleIntern = (internId: string) => {
    const newSelected = new Set(selectedInterns);
    if (newSelected.has(internId)) {
      newSelected.delete(internId);
    } else {
      newSelected.add(internId);
    }
    setSelectedInterns(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedInterns.size === filteredInterns.length) {
      setSelectedInterns(new Set());
    } else {
      setSelectedInterns(new Set(filteredInterns.map((i) => i.id)));
    }
  };

  const handleArchiveClick = () => {
    if (selectedInterns.size === 0) {
      setArchiveError("Please select at least one intern to archive.");
      return;
    }

    const toArchive = interns.filter((i) => selectedInterns.has(i.id));
    setPendingArchive(
      toArchive.map((i) => ({
        name: i.name,
        internId: i.internId,
        certificateId: i.certificateId,
        attendancePercentage: i.attendancePercentage,
      }))
    );
    setShowConfirmDialog(true);
  };

  const handleConfirmArchive = async () => {
    setArchiving(true);
    setArchiveError("");
    setSuccess("");

    try {
      // Create batch in completedBatches collection
      const batchDate = new Date().toISOString().slice(0, 10);
      await addDoc(collection(db, "completedBatches"), {
        batchDate,
        interns: pendingArchive,
        createdAt: new Date().toISOString(),
      });

      // Delete user accounts and related data
      for (const internId of selectedInterns) {
        try {
          // Delete user account
          await deleteUserAccount(internId);

          // Delete submissions
          const submissionsSnap = await getDocs(
            query(
              collection(db, "submissions"),
              where("internId", "==", internId)
            )
          );
          for (const docSnapshot of submissionsSnap.docs) {
            await deleteDoc(docSnapshot.ref);
          }

          // Delete feedback (all statuses: open, closed, etc.)
          const allFeedbackSnap = await getDocs(
            query(collection(db, "feedback"), where("internId", "==", internId))
          );
          for (const docSnapshot of allFeedbackSnap.docs) {
            await deleteDoc(docSnapshot.ref);
          }

          // Delete feedback form submissions
          const feedbackFormSnap = await getDocs(
            query(
              collection(db, "feedbackFormSubmissions"),
              where("internId", "==", internId)
            )
          );
          for (const docSnapshot of feedbackFormSnap.docs) {
            await deleteDoc(docSnapshot.ref);
          }

          // Delete doubts
          const doubtsSnap = await getDocs(
            query(collection(db, "doubts"), where("internId", "==", internId))
          );
          for (const docSnapshot of doubtsSnap.docs) {
            await deleteDoc(docSnapshot.ref);
          }

          // Delete mentor feedback submissions (mentorToInternFeedbackSubmissions)
          const mentorFeedbackSnap = await getDocs(
            query(
              collection(db, "mentorToInternFeedbackSubmissions"),
              where("internId", "==", internId)
            )
          );
          for (const docSnapshot of mentorFeedbackSnap.docs) {
            await deleteDoc(docSnapshot.ref);
          }

          // Delete mentor feedback (mentorFeedbackSubmissions)
          const mentorFeedbackSubmissionsSnap = await getDocs(
            query(
              collection(db, "mentorFeedbackSubmissions"),
              where("internId", "==", internId)
            )
          );
          for (const docSnapshot of mentorFeedbackSubmissionsSnap.docs) {
            await deleteDoc(docSnapshot.ref);
          }

          // Delete mentorFeedback (direct mentor feedback collection)
          const mentorFeedbackCollectionSnap = await getDocs(
            query(
              collection(db, "mentorFeedback"),
              where("internId", "==", internId)
            )
          );
          for (const docSnapshot of mentorFeedbackCollectionSnap.docs) {
            await deleteDoc(docSnapshot.ref);
          }
        } catch (err) {
          console.error(`Error deleting data for intern ${internId}:`, err);
        }
      }

      setSuccess(
        `Successfully archived ${pendingArchive.length} intern(s). User accounts and their submissions, feedback, reports, and doubts have been deleted.`
      );
      setSelectedInterns(new Set());
      setShowConfirmDialog(false);
      setPendingArchive([]);
    } catch (err) {
      setArchiveError(
        err instanceof Error
          ? err.message
          : "Failed to archive interns. Please try again."
      );
    } finally {
      setArchiving(false);
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    if (!window.confirm("Delete this archived batch? This cannot be undone."))
      return;

    setDeleting(batchId);
    try {
      await deleteDoc(doc(db, "completedBatches", batchId));
      setSuccess("Batch deleted successfully.");
    } catch (err) {
      setArchiveError(
        err instanceof Error ? err.message : "Failed to delete batch."
      );
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden flex">
      <DashboardSidebar
        role="Admin"
        userName={sessionUser.email}
        onLogout={logout}
        activeSection="batches"
        onSectionChange={() => {}}
      />
      <div className="flex-1 min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.18),_transparent_22%),linear-gradient(180deg,_rgba(2,6,23,0.96),_rgba(15,23,42,0.98))]" />
        <div className="relative z-10 min-h-screen flex flex-col">
          <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-20">
            <div className="mx-auto max-w-7xl px-6 py-4">
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-white/10 text-white border-white/10">
                  Admin
                </Badge>
                <Badge
                  variant="outline"
                  className="border-primary/30 text-primary"
                >
                  Batch Management
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-display text-white">
                Batch Management
              </h1>
              <p className="text-white/65 mt-1">
                Archive completed interns and manage archived batches.
              </p>
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-6 py-8 space-y-8 flex-1">
            {archiverror && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{archiverror}</span>
              </div>
            )}
            {success && (
              <div className="rounded-md border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-200 flex items-start gap-2">
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Active Interns Section */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Select Interns to Archive ({selectedInterns.size} selected)
              </h2>
              <Card className="border-white/10 bg-white/5">
                <CardContent className="p-6">
                  {/* Search and Controls */}
                  <div className="space-y-4 mb-6">
                    <Input
                      placeholder="Search interns by name, ID, or email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />

                    <div className="flex items-center justify-between">
                      <button
                        onClick={handleSelectAll}
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={
                            filteredInterns.length > 0 &&
                            selectedInterns.size === filteredInterns.length
                          }
                          onChange={handleSelectAll}
                          className="cursor-pointer"
                        />
                        <span>
                          {selectedInterns.size === filteredInterns.length &&
                          filteredInterns.length > 0
                            ? "Deselect All"
                            : "Select All"}
                        </span>
                      </button>

                      {selectedInterns.size > 0 && (
                        <Button
                          onClick={handleArchiveClick}
                          disabled={archiving}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          {archiving ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Archiving...
                            </>
                          ) : (
                            <>
                              <Archive className="w-4 h-4 mr-2" />
                              Archive Selected ({selectedInterns.size})
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Interns List */}
                  {filteredInterns.length === 0 ? (
                    <div className="text-center py-12 text-white/60">
                      {interns.length === 0
                        ? "No interns available"
                        : "No interns match your search"}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredInterns.map((intern, index) => (
                        <motion.div
                          key={intern.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div
                            className={`border rounded-lg p-4 flex items-start justify-between gap-3 cursor-pointer transition-colors ${
                              selectedInterns.has(intern.id)
                                ? "border-primary/40 bg-primary/5"
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                            }`}
                            onClick={() => toggleIntern(intern.id)}
                          >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <input
                                type="checkbox"
                                checked={selectedInterns.has(intern.id)}
                                onChange={() => toggleIntern(intern.id)}
                                className="cursor-pointer mt-1 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-white">
                                  {intern.name}
                                </p>
                                <p className="text-sm text-white/60 flex items-center gap-1 mt-0.5">
                                  <Mail className="w-3 h-3 shrink-0" />
                                  {intern.email}
                                </p>
                                <p className="text-xs text-primary flex items-center gap-1 mt-1">
                                  <Hash className="w-3 h-3 shrink-0" />
                                  {intern.internId}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                {intern.attendancePercentage}%
                              </Badge>
                              <span className="text-xs text-white/40">
                                Attendance
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Archived Batches Section */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Archive className="w-5 h-5 text-primary" />
                Completed Batches ({completedBatches.length})
              </h2>

              {completedBatches.length === 0 ? (
                <Card className="border-white/10 bg-white/5">
                  <CardContent className="py-12 text-center text-white/60">
                    No archived batches yet. Archive your first batch to get
                    started.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {completedBatches.map((batch, index) => (
                    <motion.div
                      key={batch.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="border-white/10 bg-white/5">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white/60 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 shrink-0" />
                                <span>Batch Date:</span>
                                <span className="text-white font-medium">
                                  {batch.batchDate}
                                </span>
                              </p>
                              <p className="text-sm text-white/60 mt-1">
                                <span className="text-white font-semibold">
                                  {batch.totalInterns}
                                </span>{" "}
                                intern(s) archived
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setExpandedBatch(
                                    expandedBatch === batch.id ? null : batch.id
                                  )
                                }
                                className="text-primary hover:bg-primary/10"
                                title="View batch details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteBatch(batch.id)}
                                disabled={deleting === batch.id}
                                className="text-red-400 hover:bg-red-500/10"
                              >
                                {deleting === batch.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Expanded Batch Details */}
                          {expandedBatch === batch.id && (
                            <div className="pt-4 border-t border-white/10 space-y-3">
                              <p className="text-xs text-white/50 uppercase tracking-wide font-semibold">
                                Archived Interns
                              </p>
                              <div className="space-y-2">
                                {batch.interns.map((intern, idx) => (
                                  <div
                                    key={idx}
                                    className="rounded border border-white/10 bg-white/5 p-3"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-white">
                                          {intern.name}
                                        </p>
                                        <p className="text-xs text-white/60 flex items-center gap-1 mt-0.5">
                                          <Hash className="w-3 h-3 shrink-0" />
                                          {intern.internId}
                                        </p>
                                      </div>
                                      <div className="flex flex-col items-end gap-1 shrink-0">
                                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                                          {intern.attendancePercentage}% Attendance
                                        </Badge>
                                        <span className="text-xs text-white/40">
                                          Cert:{" "}
                                          {intern.certificateId.slice(-4)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-white/10 bg-slate-900 text-white max-w-md w-full">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold">
                      Confirm Archive
                    </h3>
                    <p className="text-sm text-white/70 mt-1">
                      You are about to archive{" "}
                      <span className="font-semibold text-white">
                        {pendingArchive.length}
                      </span>{" "}
                      intern(s). Their accounts and all associated submissions,
                      feedback, and doubts will be permanently deleted.
                    </p>
                  </div>
                </div>

                <div className="rounded border border-white/10 bg-white/5 p-3 max-h-40 overflow-y-auto">
                  <p className="text-xs text-white/50 uppercase tracking-wide mb-2">
                    Interns to Archive
                  </p>
                  <ul className="space-y-1 text-sm">
                    {pendingArchive.map((intern, idx) => (
                      <li key={idx} className="text-white/80 flex items-center gap-2">
                        <span className="w-1 h-1 bg-primary rounded-full" />
                        <span>{intern.name}</span>
                        <span className="text-white/50">
                          ({intern.attendancePercentage}%)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/30 rounded p-3">
                  <p className="text-xs text-orange-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      <span className="font-semibold">Verified - Will be deleted:</span> User
                      accounts, submissions, all feedback (open/closed), mentor feedback, reports, doubts
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/10"
                    onClick={() => {
                      setShowConfirmDialog(false);
                      setPendingArchive([]);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmArchive}
                    disabled={archiving}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {archiving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Archiving...
                      </>
                    ) : (
                      <>
                        <Archive className="w-4 h-4 mr-2" />
                        Confirm Archive
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminBatchManagement;
