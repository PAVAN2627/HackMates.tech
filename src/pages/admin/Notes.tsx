import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Trash2, Download, FileText, FileIcon, X, ExternalLink, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePlatform } from "@/context/PlatformContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useMemo, useState } from "react";
import type { FileAttachment } from "@/context/PlatformContext";

/** Resolve the viewable URL from base64 dataUrl */
function attachmentSrc(a: FileAttachment): string {
  return a.dataUrl ?? "";
}

function isPdf(a: FileAttachment) {
  return a.type === "application/pdf" || a.name.toLowerCase().endsWith(".pdf");
}
function isDocx(a: FileAttachment) {
  return (
    a.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    a.name.toLowerCase().endsWith(".docx") ||
    a.name.toLowerCase().endsWith(".doc")
  );
}

function getNoteSortTime(note: { date: string; createdAt?: string }) {
  const createdAt = note.createdAt ? new Date(note.createdAt).getTime() : NaN;
  if (!Number.isNaN(createdAt)) {
    return createdAt;
  }

  const noteDate = new Date(note.date).getTime();
  return Number.isNaN(noteDate) ? 0 : noteDate;
}

function matchesNoteSearch(note: { title: string; note: string; mentorName: string; internName?: string; lectureTime?: string; date: string; links?: { label: string; url: string }[] }, query: string) {
  const search = query.trim().toLowerCase();
  if (!search) {
    return true;
  }

  return [
    note.title,
    note.note,
    note.mentorName,
    note.internName ?? "",
    note.lectureTime ?? "",
    note.date,
    ...(note.links ?? []).flatMap((link) => [link.label, link.url]),
  ].join(" ").toLowerCase().includes(search);
}

function toAbsoluteUrl(url: string): string {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

const AdminNotes = () => {
  const { loading, sessionUser, logout, dailyNotes } = usePlatform();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState("");
  const [search, setSearch] = useState("");

  const sortedNotes = useMemo(() => {
    return [...dailyNotes]
      .sort((a, b) => getNoteSortTime(b) - getNoteSortTime(a))
      .filter((note) => matchesNoteSearch(note, search));
  }, [dailyNotes, search]);

  if (!loading && !sessionUser) return <Navigate to="/login" replace />;
  if (!loading && sessionUser?.role !== "Admin") return <Navigate to="/login" replace />;
  if (!sessionUser) return null;

  const openPreview = (a: FileAttachment) => {
    setPreviewUrl(attachmentSrc(a));
    setPreviewName(a.name);
  };

  const downloadAttachment = (a: FileAttachment) => {
    const src = attachmentSrc(a);
    if (!src) return;
    const link = document.createElement("a");
    link.href = src;
    link.download = a.name;
    link.target = "_blank";
    link.click();
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden flex">
      <DashboardSidebar
        role="Admin"
        userName={sessionUser.email}
        onLogout={logout}
        activeSection="notes"
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
              <h1 className="text-2xl font-bold text-white">Daily Notes</h1>
              <p className="text-white/50 text-sm mt-0.5">All lecture notes from mentors</p>
            </div>
          </header>

          <main className="mx-auto max-w-5xl w-full px-6 py-6 flex-1 space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm text-white/60">Search and review the latest mentor notes.</p>
                <p className="text-xs text-white/40">Sorted by date, newest first.</p>
              </div>
              <div className="w-full md:max-w-sm space-y-1.5">
                <label className="text-xs uppercase tracking-[0.2em] text-white/45">Search notes</label>
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Search by title, mentor, or link"
                />
              </div>
            </div>
            {sortedNotes.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 py-16 text-center text-white/40 text-sm">
                {dailyNotes.length === 0 ? "No notes yet" : "No notes match your search"}
              </div>
            ) : (
              sortedNotes.map((note, index) => (
                <motion.div key={note.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="font-semibold text-white text-sm">{note.title}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-3 text-xs text-white/40">
                          <span>{note.internName}</span>
                          <span>by {note.mentorName}</span>
                          <span>{new Date(note.date).toLocaleDateString()}</span>
                          {note.lectureTime && <span>{note.lectureTime}</span>}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/10 h-8 w-8 p-0 shrink-0"
                        onClick={async () => {
                          if (!window.confirm("Delete this note?")) return;
                          await deleteDoc(doc(db, "dailyNotes", note.id));
                        }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <p className="text-white/70 text-sm leading-relaxed">{note.note}</p>

                    {note.links && note.links.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {note.links.map((link, linkIndex) => (
                          <a
                            key={`${note.id}-link-${linkIndex}`}
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
                      <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                        {note.attachments.map((att: FileAttachment, i: number) => {
                          const src = attachmentSrc(att);
                          const pdf = isPdf(att);
                          const docx = isDocx(att);
                          return (
                            <div key={i} className="flex items-center gap-1">
                              {pdf && (
                                <Button size="sm" variant="outline"
                                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-8 gap-1.5 text-xs"
                                  onClick={() => openPreview(att)}>
                                  <FileText className="w-3.5 h-3.5" />
                                  {att.name}
                                </Button>
                              )}
                              {docx && (
                                <Button size="sm" variant="outline"
                                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 h-8 gap-1.5 text-xs"
                                  onClick={() => downloadAttachment(att)}>
                                  <FileIcon className="w-3.5 h-3.5" />
                                  {att.name}
                                  <Download className="w-3 h-3 opacity-60" />
                                </Button>
                              )}
                              {!pdf && !docx && (
                                <Button size="sm" variant="outline"
                                  className="border-white/20 text-white/70 hover:bg-white/10 h-8 gap-1.5 text-xs"
                                  onClick={() => src ? window.open(src, "_blank") : downloadAttachment(att)}>
                                  <FileIcon className="w-3.5 h-3.5" />
                                  {att.name}
                                  <ExternalLink className="w-3 h-3 opacity-60" />
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </main>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-950/80">
            <span className="text-white text-sm font-medium truncate">{previewName}</span>
            <div className="flex items-center gap-2 shrink-0">
              <a href={previewUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white border border-white/20 rounded-lg px-3 py-1.5 transition">
                <ExternalLink className="w-3.5 h-3.5" />
                Open in new tab
              </a>
              <Button size="sm" variant="ghost" className="text-white/60 hover:text-white h-8 w-8 p-0"
                onClick={() => setPreviewUrl(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <iframe
              src={previewUrl}
              title={previewName}
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotes;
