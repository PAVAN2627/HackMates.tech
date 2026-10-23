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
  CalendarDays,
  Pencil,
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
  updateDoc,
  onSnapshot,
  query,
  getDocs,
  where,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
} from "firebase/firestore";

interface ArchivedIntern {
  name: string;
  internId: string;
  certificateId: string;
  attendancePercentage: number;
  issueDate?: string;
  validUntil?: string;
  completionDate?: string;
  certificateIssueDate?: string;
  position?: string;
}

interface CompletedBatch {
  id: string;
  batchDate: string;
  completionDate?: string;
  issueDate?: string;
  interns: ArchivedIntern[];
  createdAt?: string;
  totalInterns: number;
}

interface EditArchivedInternState {
  batchId: string;
  internIndex: number;
  originalInternId: string;
  name: string;
  internId: string;
  certificateId: string;
  attendancePercentage: number;
  issueDate: string;
  completionDate: string;
  certificateIssueDate: string;
  position: string;
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
  const [deletingAttendance, setDeletingAttendance] = useState<string | null>(null);
  const [attendanceDeleteCount, setAttendanceDeleteCount] = useState(0);
  const [showAttendanceConfirm, setShowAttendanceConfirm] = useState(false);
  const [selectedBatchForAttendance, setSelectedBatchForAttendance] = useState<CompletedBatch | null>(null);
  const [batchCompletionDate, setBatchCompletionDate] = useState("");
  const [batchIssueDate, setBatchIssueDate] = useState("");
  const [editingIntern, setEditingIntern] = useState<EditArchivedInternState | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

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
          issueDate: intern.issueDate || "",
          validUntil: intern.validUntil || "",
          position: intern.position || "",
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

  const handleArchiveClick = async () => {
    if (selectedInterns.size === 0) {
      setArchiveError("Please select at least one intern to archive.");
      return;
    }

    const toArchive = interns.filter((i) => selectedInterns.has(i.id));

    // Lookup any missing issueDate or validUntil from verifications collection
    const enriched = await Promise.all(
      toArchive.map(async (i) => {
        let iDate = i.issueDate || "";
        let cDate = i.validUntil || "";
        let pos = i.position || "";

        if ((!iDate || !cDate) && i.internId && i.internId !== "N/A") {
          try {
            const vSnap = await getDocs(
              query(collection(db, "verifications"), where("offerId", "==", i.internId.trim().toUpperCase()))
            );
            if (!vSnap.empty) {
              const vd = vSnap.docs[0].data();
              if (!iDate && vd.issueDate) iDate = vd.issueDate;
              if (!cDate && (vd.validUntil || vd.completionDate)) cDate = vd.validUntil || vd.completionDate;
              if (!pos && vd.position) pos = vd.position;
            }
          } catch (e) {
            console.error("Error looking up verification info for archiving:", e);
          }
        }

        return {
          name: i.name,
          internId: i.internId,
          certificateId: i.certificateId,
          attendancePercentage: i.attendancePercentage,
          issueDate: iDate,
          validUntil: cDate,
          completionDate: cDate,
          position: pos,
        };
      })
    );

    // Compute sensible defaults
    const foundCDate = enriched.find((x) => x.validUntil)?.validUntil || new Date().toISOString().slice(0, 10);
    const foundIDate = enriched.find((x) => x.issueDate)?.issueDate || "";

    setBatchCompletionDate(foundCDate);
    setBatchIssueDate(foundIDate);
    setPendingArchive(enriched);
    setShowConfirmDialog(true);
  };

  const handleConfirmArchive = async () => {
    setArchiving(true);
    setArchiveError("");
    setSuccess("");

    try {
      const closeBatchDate = new Date().toISOString().slice(0, 10);
      const effectiveCompletionDate = batchCompletionDate || closeBatchDate;
      const effectiveIssueDate = batchIssueDate || "";

      // Create batch in completedBatches collection
      await addDoc(collection(db, "completedBatches"), {
        batchDate: closeBatchDate, // administrative close date
        completionDate: effectiveCompletionDate, // official graduation date
        issueDate: effectiveIssueDate, // official joining date
        interns: pendingArchive.map((p) => ({
          ...p,
          issueDate: p.issueDate || effectiveIssueDate,
          completionDate: p.completionDate || p.validUntil || effectiveCompletionDate,
          validUntil: p.validUntil || effectiveCompletionDate,
        })),
        createdAt: new Date().toISOString(),
      });

      // Ensure completion records exist in verifications collection for public authentication
      for (const intern of pendingArchive) {
        const certId = (intern.certificateId || intern.internId || "").trim().toUpperCase();
        if (certId && certId !== "N/A") {
          try {
            const vSnap = await getDocs(
              query(collection(db, "verifications"), where("offerId", "==", certId))
            );
            const actualIssueDate = intern.issueDate || effectiveIssueDate;
            const actualCompletionDate = intern.completionDate || intern.validUntil || effectiveCompletionDate;

            if (vSnap.empty) {
              await addDoc(collection(db, "verifications"), {
                offerId: certId,
                name: intern.name,
                type: "Intern",
                certificateType: "Internship Completion Certificate",
                position: intern.position || "Full Stack Web Development Intern",
                issueDate: actualIssueDate || effectiveIssueDate,
                validUntil: actualCompletionDate,
                completionDate: actualCompletionDate,
                batchClosedDate: closeBatchDate,
                status: "Completed",
                attendancePercentage: intern.attendancePercentage,
              });
            } else {
              for (const d of vSnap.docs) {
                const existingData = d.data();
                await updateDoc(d.ref, {
                  status: "Completed",
                  // PRESERVE original issue date from verification document if it exists!
                  issueDate: existingData.issueDate || actualIssueDate || effectiveIssueDate,
                  completionDate: actualCompletionDate || existingData.completionDate || existingData.validUntil || effectiveCompletionDate,
                  validUntil: actualCompletionDate || existingData.validUntil || effectiveCompletionDate,
                  certificateType: "Internship Completion Certificate",
                  batchClosedDate: closeBatchDate,
                  attendancePercentage: intern.attendancePercentage,
                });
              }
            }
          } catch (verifErr) {
            console.error("Error updating verification record for archived intern:", verifErr);
          }
        }
      }

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

  const handleDeleteBatchAttendance = async (batch: CompletedBatch) => {
    setSelectedBatchForAttendance(batch);
    setDeletingAttendance(batch.id);

    try {
      // Get all attendance sessions - we'll delete them all since batch is completed
      const allAttendanceSnap = await getDocs(collection(db, "attendanceSessions"));
      
      setAttendanceDeleteCount(allAttendanceSnap.docs.length);
      setShowAttendanceConfirm(true);
    } catch (err) {
      setArchiveError(
        err instanceof Error
          ? err.message
          : "Failed to check attendance records."
      );
    } finally {
      setDeletingAttendance(null);
    }
  };

  const handleConfirmDeleteAttendance = async () => {
    if (!selectedBatchForAttendance) return;

    setDeletingAttendance(selectedBatchForAttendance.id);
    try {
      // Delete all attendance sessions
      const allAttendanceSnap = await getDocs(collection(db, "attendanceSessions"));

      let deletedCount = 0;
      for (const docSnapshot of allAttendanceSnap.docs) {
        await deleteDoc(docSnapshot.ref);
        deletedCount++;
      }

      setSuccess(
        `Successfully deleted all ${deletedCount} attendance session(s) from mentor dashboard.`
      );
      setShowAttendanceConfirm(false);
      setSelectedBatchForAttendance(null);
      setAttendanceDeleteCount(0);
    } catch (err) {
      setArchiveError(
        err instanceof Error
          ? err.message
          : "Failed to delete attendance records."
      );
    } finally {
      setDeletingAttendance(null);
    }
  };

  const handleSaveArchivedIntern = async () => {
    if (!editingIntern) return;
    setSavingEdit(true);
    setEditError("");

    try {
      const batchToUpdate = completedBatches.find((b) => b.id === editingIntern.batchId);
      if (!batchToUpdate) {
        throw new Error("Batch record could not be found.");
      }

      const updatedInterns = [...batchToUpdate.interns];
      const updatedItem: ArchivedIntern = {
        name: editingIntern.name.trim(),
        internId: editingIntern.internId.trim().toUpperCase(),
        certificateId: (editingIntern.certificateId || editingIntern.internId).trim().toUpperCase(),
        attendancePercentage: Number(editingIntern.attendancePercentage) || 0,
        issueDate: editingIntern.issueDate || "",
        completionDate: editingIntern.completionDate || "",
        certificateIssueDate: editingIntern.certificateIssueDate || editingIntern.completionDate || editingIntern.issueDate || "",
        validUntil: editingIntern.completionDate || "",
        position: editingIntern.position.trim() || "Full Stack Web Development Intern",
      };

      updatedInterns[editingIntern.internIndex] = updatedItem;

      // 1. Update completedBatches doc
      const batchRef = doc(db, "completedBatches", editingIntern.batchId);
      await updateDoc(batchRef, {
        interns: updatedInterns,
      });

      // 2. Synchronize with verifications collection for public authentication on /verify
      const targetCertId = updatedItem.certificateId;
      const originalCertId = editingIntern.originalInternId.trim().toUpperCase();

      let vSnap = await getDocs(
        query(collection(db, "verifications"), where("offerId", "==", targetCertId))
      );
      if (vSnap.empty && originalCertId && originalCertId !== targetCertId) {
        vSnap = await getDocs(
          query(collection(db, "verifications"), where("offerId", "==", originalCertId))
        );
      }

      const verifData = {
        offerId: targetCertId,
        name: updatedItem.name,
        type: "Intern",
        certificateType: "Internship Completion Certificate",
        position: updatedItem.position,
        issueDate: updatedItem.issueDate || updatedItem.certificateIssueDate || "",
        completionDate: updatedItem.completionDate || "",
        validUntil: updatedItem.completionDate || "",
        certificateIssueDate: updatedItem.certificateIssueDate || updatedItem.completionDate || "",
        status: "Completed",
        attendancePercentage: updatedItem.attendancePercentage,
      };

      if (!vSnap.empty) {
        for (const d of vSnap.docs) {
          await updateDoc(d.ref, verifData);
        }
      } else {
        await addDoc(collection(db, "verifications"), verifData);
      }

      setSuccess(`Updated archived intern ${updatedItem.name} (${updatedItem.certificateId}) successfully.`);
      setEditingIntern(null);
    } catch (err: any) {
      console.error("Error updating archived intern:", err);
      setEditError(err?.message || "Failed to update archived intern.");
    } finally {
      setSavingEdit(false);
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
                                onClick={() => handleDeleteBatchAttendance(batch)}
                                disabled={deletingAttendance === batch.id}
                                className="text-yellow-400 hover:bg-yellow-500/10"
                                title="Delete attendance records for this batch"
                              >
                                {deletingAttendance === batch.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CalendarDays className="w-4 h-4" />
                                )}
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
                                    className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5 hover:border-white/20 transition-all space-y-2.5"
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <p className="text-sm font-semibold text-white">
                                            {intern.name}
                                          </p>
                                          {intern.position && (
                                            <span className="text-xs text-white/50">
                                              • {intern.position}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-white/60 mt-1 flex-wrap font-mono">
                                          <span className="flex items-center gap-1 text-teal-300">
                                            <Hash className="w-3 h-3" />
                                            {intern.internId}
                                          </span>
                                          <span className="text-white/40">|</span>
                                          <span>Cert ID: <strong className="text-white">{intern.certificateId || intern.internId}</strong></span>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0">
                                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                                          {intern.attendancePercentage}% Attendance
                                        </Badge>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            setEditingIntern({
                                              batchId: batch.id,
                                              internIndex: idx,
                                              originalInternId: intern.certificateId || intern.internId,
                                              name: intern.name,
                                              internId: intern.internId,
                                              certificateId: intern.certificateId || intern.internId,
                                              attendancePercentage: intern.attendancePercentage,
                                              issueDate: intern.issueDate || batch.issueDate || "",
                                              completionDate: intern.completionDate || intern.validUntil || batch.completionDate || batch.batchDate || "",
                                              certificateIssueDate: intern.certificateIssueDate || intern.completionDate || intern.issueDate || batch.completionDate || batch.batchDate || "",
                                              position: intern.position || "Full Stack Web Development Intern",
                                            })
                                          }
                                          className="h-7 text-xs border-white/15 bg-white/5 text-white hover:bg-teal-500/20 hover:text-teal-200 hover:border-teal-400/40"
                                        >
                                          <Pencil className="w-3 h-3 mr-1 text-teal-400" />
                                          Edit
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Dates Grid Display */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/5 text-xs font-mono">
                                      <div className="flex flex-col">
                                        <span className="text-white/40">Start Date</span>
                                        <span className="text-teal-300">{intern.issueDate || batch.issueDate || "—"}</span>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-white/40">Completion Date</span>
                                        <span className="text-emerald-300 font-semibold">{intern.completionDate || intern.validUntil || batch.completionDate || batch.batchDate || "—"}</span>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-white/40">Cert Issue Date</span>
                                        <span className="text-cyan-300">{intern.certificateIssueDate || intern.issueDate || batch.completionDate || batch.batchDate || "—"}</span>
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

                {/* Explicit Completion & Joining Date Configuration */}
                <div className="space-y-3 p-3.5 bg-white/5 border border-white/10 rounded-xl">
                  <div>
                    <label className="block text-xs font-medium text-emerald-400 mb-1">
                      Official Internship Completion Date *
                    </label>
                    <Input
                      type="date"
                      value={batchCompletionDate}
                      onChange={(e) => setBatchCompletionDate(e.target.value)}
                      className="bg-slate-950/80 border-white/20 text-white text-xs h-9"
                    />
                    <p className="text-[11px] text-white/50 mt-1">
                      The graduation date printed and verified on their Internship Completion Certificates.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-teal-300 mb-1">
                      Internship Joining / Start Date
                    </label>
                    <Input
                      type="date"
                      value={batchIssueDate}
                      onChange={(e) => setBatchIssueDate(e.target.value)}
                      className="bg-slate-950/80 border-white/20 text-white text-xs h-9"
                    />
                    <p className="text-[11px] text-white/50 mt-1">
                      The starting date of their internship program tenure.
                    </p>
                  </div>
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
      {/* Attendance Deletion Confirmation Dialog */}
      {showAttendanceConfirm && selectedBatchForAttendance && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-white/10 bg-slate-900 text-white max-w-md w-full">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold">
                      Delete Attendance Records
                    </h3>
                    <p className="text-sm text-white/70 mt-1">
                      Delete all attendance sessions for batch{" "}
                      <span className="font-semibold text-white">
                        {selectedBatchForAttendance.batchDate}
                      </span>
                      ?
                    </p>
                  </div>
                </div>

                <div className="rounded border border-white/10 bg-white/5 p-3">
                  <p className="text-sm font-semibold text-white">
                    {attendanceDeleteCount}{" "}
                    {attendanceDeleteCount === 1
                      ? "attendance session"
                      : "attendance sessions"}{" "}
                    will be permanently deleted
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    All attendance records will be removed from the mentor
                    dashboard.
                  </p>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
                  <p className="text-xs text-yellow-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      <span className="font-semibold">Warning:</span> This action
                      cannot be undone. Mentors will no longer see these attendance
                      records.
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/10"
                    onClick={() => {
                      setShowAttendanceConfirm(false);
                      setSelectedBatchForAttendance(null);
                      setAttendanceDeleteCount(0);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmDeleteAttendance}
                    disabled={deletingAttendance === selectedBatchForAttendance.id}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    {deletingAttendance === selectedBatchForAttendance.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Attendance
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Edit Archived Intern Modal */}
      {editingIntern && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg my-8"
          >
            <Card className="border-white/10 bg-slate-900 text-white shadow-2xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Pencil className="w-5 h-5 text-teal-400" />
                    <h3 className="text-lg font-bold">Edit Archived Intern</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingIntern(null)}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {editError && (
                  <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{editError}</span>
                  </div>
                )}

                <div className="space-y-3 text-sm">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Intern Name *
                    </label>
                    <Input
                      value={editingIntern.name}
                      onChange={(e) =>
                        setEditingIntern({ ...editingIntern, name: e.target.value })
                      }
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">
                        Intern ID *
                      </label>
                      <Input
                        value={editingIntern.internId}
                        onChange={(e) =>
                          setEditingIntern({ ...editingIntern, internId: e.target.value })
                        }
                        className="bg-white/5 border-white/10 text-white font-mono uppercase"
                        placeholder="e.g. HM-FWD-001"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">
                        Certificate ID *
                      </label>
                      <Input
                        value={editingIntern.certificateId}
                        onChange={(e) =>
                          setEditingIntern({ ...editingIntern, certificateId: e.target.value })
                        }
                        className="bg-white/5 border-white/10 text-white font-mono uppercase"
                        placeholder="e.g. HM-FWD-001"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Role / Position
                    </label>
                    <Input
                      value={editingIntern.position}
                      onChange={(e) =>
                        setEditingIntern({ ...editingIntern, position: e.target.value })
                      }
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="e.g. Full Stack Web Development Intern"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono text-teal-300 mb-1">
                        Internship Start Date
                      </label>
                      <Input
                        type="date"
                        value={editingIntern.issueDate}
                        onChange={(e) =>
                          setEditingIntern({ ...editingIntern, issueDate: e.target.value })
                        }
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-emerald-400 mb-1">
                        Internship Completion Date *
                      </label>
                      <Input
                        type="date"
                        value={editingIntern.completionDate}
                        onChange={(e) =>
                          setEditingIntern({ ...editingIntern, completionDate: e.target.value })
                        }
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono text-cyan-300 mb-1">
                        Certificate Issue Date
                      </label>
                      <Input
                        type="date"
                        value={editingIntern.certificateIssueDate}
                        onChange={(e) =>
                          setEditingIntern({ ...editingIntern, certificateIssueDate: e.target.value })
                        }
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">
                        Attendance (%)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={editingIntern.attendancePercentage}
                        onChange={(e) =>
                          setEditingIntern({
                            ...editingIntern,
                            attendancePercentage: Number(e.target.value) || 0,
                          })
                        }
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg bg-teal-500/10 border border-teal-500/20 p-2.5 text-xs text-teal-200">
                    Saving these updates will immediately update the batch and sync with the public certificate verification database.
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <Button
                    variant="outline"
                    onClick={() => setEditingIntern(null)}
                    disabled={savingEdit}
                    className="border-white/10 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveArchivedIntern}
                    disabled={savingEdit || !editingIntern.name || !editingIntern.internId}
                    className="bg-teal-600 hover:bg-teal-500 text-white"
                  >
                    {savingEdit ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
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
