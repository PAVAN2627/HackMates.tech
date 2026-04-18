import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Trash2, Plus, X, MessageSquare, Users, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlatform } from "@/context/PlatformContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useMemo, useState } from "react";

const AdminFeedback = () => {
  const {
    loading, sessionUser, logout,
    feedback, mentorFeedbackSubmissions, users,
    mentorFeedbackForms, createMentorFeedbackForm, updateMentorFeedbackFormStatus,
  } = usePlatform();

  const [activeTab, setActiveTab] = useState("mentor-to-intern");
  const [editingId, setEditingId] = useState("");
  const [editingRating, setEditingRating] = useState(7);
  const [editingComment, setEditingComment] = useState("");
  const [showFormCreator, setShowFormCreator] = useState(false);
  const [selectedMentors, setSelectedMentors] = useState<string[]>([]);
  const [selectedInterns, setSelectedInterns] = useState<string[]>([]);
  const [formCreating, setFormCreating] = useState(false);

  const internUsers = useMemo(() => users.filter((u) => u.role === "Intern"), [users]);
  const mentorUsers = useMemo(() => users.filter((u) => u.role === "Mentor"), [users]);

  const sortedMentorFeedback = useMemo(
    () => (feedback ?? []).slice().sort((a, b) => b.date.localeCompare(a.date)),
    [feedback],
  );
  const sortedInternSubmissions = useMemo(
    () => (mentorFeedbackSubmissions ?? []).slice().sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
    [mentorFeedbackSubmissions],
  );

  if (!loading && !sessionUser) return <Navigate to="/login" replace />;
  if (!loading && sessionUser?.role !== "Admin") return <Navigate to="/login" replace />;
  if (!sessionUser) return null;

  const ratingColor = (r: number) => r >= 8 ? "text-green-400" : r >= 6 ? "text-yellow-400" : "text-red-400";
  const starColor = (r: number) => r >= 4 ? "text-green-400" : r >= 3 ? "text-yellow-400" : "text-red-400";

  const startEdit = (id: string, rating: number, comment: string) => {
    setEditingId(id); setEditingRating(rating); setEditingComment(comment);
  };
  const cancelEdit = () => { setEditingId(""); setEditingRating(7); setEditingComment(""); };
  const saveEdit = async (id: string) => {
    if (!editingComment.trim()) return;
    await updateDoc(doc(db, "feedback", id), {
      rating: Math.max(0, Math.min(10, Number(editingRating.toFixed(1)))),
      comment: editingComment.trim(),
    });
    cancelEdit();
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden flex">
      <DashboardSidebar
        role="Admin"
        userName={sessionUser.email}
        onLogout={logout}
        activeSection="feedback"
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
              <h1 className="text-2xl font-bold text-white">Feedback Center</h1>
              <p className="text-white/50 text-sm mt-0.5">Manage all feedback between mentors and interns</p>
            </div>
          </header>

          {/* Stats */}
          <div className="mx-auto max-w-5xl w-full px-6 pt-6">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Mentor → Intern", count: sortedMentorFeedback.length, icon: <MessageSquare className="w-4 h-4" /> },
                { label: "Intern → Mentor", count: sortedInternSubmissions.length, icon: <Users className="w-4 h-4" /> },
                { label: "Rating Forms", count: mentorFeedbackForms?.length ?? 0, icon: <ClipboardList className="w-4 h-4" /> },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
                  <div className="text-primary">{s.icon}</div>
                  <div>
                    <p className="text-xl font-bold text-white">{s.count}</p>
                    <p className="text-xs text-white/50">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <main className="mx-auto max-w-5xl w-full px-6 py-6 flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
              <TabsList className="bg-white/5 border border-white/10 text-white grid grid-cols-3 h-auto p-1">
                <TabsTrigger value="mentor-to-intern" className="flex items-center gap-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-white text-sm">
                  <MessageSquare className="w-4 h-4" />
                  Mentor → Intern
                </TabsTrigger>
                <TabsTrigger value="intern-to-mentor" className="flex items-center gap-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-white text-sm">
                  <Users className="w-4 h-4" />
                  Intern → Mentor
                </TabsTrigger>
                <TabsTrigger value="rating-forms" className="flex items-center gap-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-white text-sm">
                  <ClipboardList className="w-4 h-4" />
                  Rating Forms
                </TabsTrigger>
              </TabsList>

              {/* ── Tab 1: Mentor → Intern feedback ── */}
              <TabsContent value="mentor-to-intern" className="space-y-3">
                <p className="text-white/50 text-sm">Feedback submitted by mentors about intern performance.</p>
                {sortedMentorFeedback.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 py-16 text-center text-white/40 text-sm">
                    No feedback yet
                  </div>
                ) : (
                  sortedMentorFeedback.map((entry, i) => (
                    <motion.div key={entry.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-semibold text-white text-sm">{entry.internName}</span>
                              <Badge variant="outline" className="border-white/10 text-white/50 text-xs">Intern</Badge>
                              <span className="text-white/40 text-xs">by {entry.mentorName}</span>
                            </div>
                            <p className="text-white/70 text-sm leading-relaxed">{entry.comment}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                              <span>{new Date(entry.date).toLocaleDateString()}</span>
                              <span className={`flex items-center gap-1 font-medium ${ratingColor(entry.rating)}`}>
                                <Star className="w-3 h-3 fill-current" />{entry.rating}/10
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/10 h-8 px-3"
                              onClick={() => startEdit(entry.id, entry.rating, entry.comment)}>
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" className="h-8 px-3"
                              onClick={async () => {
                                if (!window.confirm("Delete this feedback?")) return;
                                await deleteDoc(doc(db, "feedback", entry.id));
                              }}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                        {editingId === entry.id && (
                          <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-white/60 text-xs">Rating (0–10)</Label>
                                <Input type="number" min={0} max={10} step="0.1"
                                  value={editingRating}
                                  onChange={(e) => setEditingRating(Number(e.target.value))}
                                  className="bg-white/5 border-white/10 text-white h-9" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-white/60 text-xs">Comment</Label>
                              <Textarea value={editingComment}
                                onChange={(e) => setEditingComment(e.target.value)}
                                className="bg-white/5 border-white/10 text-white min-h-20 text-sm" />
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => saveEdit(entry.id)}>Save</Button>
                              <Button size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/10" onClick={cancelEdit}>Cancel</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </TabsContent>

              {/* ── Tab 2: Intern → Mentor submissions ── */}
              <TabsContent value="intern-to-mentor" className="space-y-3">
                <p className="text-white/50 text-sm">Ratings and reviews submitted by interns about their mentors.</p>
                {sortedInternSubmissions.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 py-16 text-center text-white/40 text-sm">
                    No intern submissions yet
                  </div>
                ) : (
                  sortedInternSubmissions.map((sub, i) => (
                    <motion.div key={sub.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-semibold text-white text-sm">{sub.internName}</span>
                          <Badge variant="outline" className="border-white/10 text-white/50 text-xs">Intern</Badge>
                          <span className="text-white/40 text-xs">rated</span>
                          <span className="font-medium text-white/80 text-sm">{sub.mentorName}</span>
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed">{sub.review}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                          <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                          <span className={`flex items-center gap-1 font-medium ${starColor(sub.rating)}`}>
                            <Star className="w-3 h-3 fill-current" />{sub.rating}/5
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </TabsContent>

              {/* ── Tab 3: Rating Forms ── */}
              <TabsContent value="rating-forms" className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-white/50 text-sm">Forms that interns use to rate and review their mentors.</p>
                  <Button size="sm" className="bg-primary hover:bg-primary/80"
                    onClick={() => setShowFormCreator(!showFormCreator)}>
                    <Plus className="w-4 h-4 mr-1" />
                    New Form
                  </Button>
                </div>

                {showFormCreator && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-primary/30 bg-white/5 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white text-sm">Create Mentor Rating Form</h3>
                      <X className="w-4 h-4 cursor-pointer text-white/50 hover:text-red-400"
                        onClick={() => { setShowFormCreator(false); setSelectedMentors([]); setSelectedInterns([]); }} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white/60 text-xs uppercase tracking-wide">Mentors to be rated</Label>
                        <div className="space-y-2 max-h-40 overflow-y-auto rounded-lg border border-white/10 bg-white/5 p-3">
                          {mentorUsers.length === 0 && <p className="text-white/30 text-sm">No mentors found</p>}
                          {mentorUsers.map((m) => (
                            <Label key={m.id} className="flex items-center gap-2 cursor-pointer text-white/80 font-normal text-sm">
                              <input type="checkbox" className="w-4 h-4 accent-primary"
                                checked={selectedMentors.includes(m.id)}
                                onChange={(e) => setSelectedMentors(e.target.checked
                                  ? [...selectedMentors, m.id]
                                  : selectedMentors.filter((id) => id !== m.id))} />
                              {m.name}
                            </Label>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/60 text-xs uppercase tracking-wide">Target interns (empty = all)</Label>
                        <div className="space-y-2 max-h-40 overflow-y-auto rounded-lg border border-white/10 bg-white/5 p-3">
                          {internUsers.length === 0 && <p className="text-white/30 text-sm">No interns found</p>}
                          {internUsers.map((intern) => (
                            <Label key={intern.id} className="flex items-center gap-2 cursor-pointer text-white/80 font-normal text-sm">
                              <input type="checkbox" className="w-4 h-4 accent-primary"
                                checked={selectedInterns.includes(intern.id)}
                                onChange={(e) => setSelectedInterns(e.target.checked
                                  ? [...selectedInterns, intern.id]
                                  : selectedInterns.filter((id) => id !== intern.id))} />
                              {intern.name}
                            </Label>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button disabled={formCreating || selectedMentors.length === 0}
                      className="w-full bg-primary hover:bg-primary/80"
                      onClick={async () => {
                        if (selectedMentors.length === 0) { alert("Select at least one mentor"); return; }
                        setFormCreating(true);
                        try {
                          const mentorNames = selectedMentors
                            .map((id) => mentorUsers.find((u) => u.id === id)?.name)
                            .filter(Boolean) as string[];
                          await createMentorFeedbackForm({
                            mentorIds: selectedMentors,
                            mentorNames,
                            targetInternIds: selectedInterns.length === 0 ? [] : selectedInterns,
                          });
                          setShowFormCreator(false);
                          setSelectedMentors([]);
                          setSelectedInterns([]);
                        } catch (err) {
                          console.error(err);
                          alert("Failed to create form");
                        } finally {
                          setFormCreating(false);
                        }
                      }}>
                      {formCreating ? "Creating..." : "Create Form"}
                    </Button>
                  </motion.div>
                )}

                {(!mentorFeedbackForms || mentorFeedbackForms.length === 0) ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 py-16 text-center text-white/40 text-sm">
                    No forms created yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mentorFeedbackForms.map((form, i) => (
                      <motion.div key={form.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-semibold text-white text-sm">{form.mentorNames.join(", ")}</span>
                              <Badge className={form.status === "Active"
                                ? "bg-green-500/20 text-green-300 border-green-500/30"
                                : "bg-red-500/20 text-red-300 border-red-500/30"}>
                                {form.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-white/40">
                              For: {form.targetInternIds.length === 0 ? "All interns" : `${form.targetInternIds.length} intern(s)`}
                              {" · "}Created {new Date(form.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button size="sm" variant="outline"
                            className="border-white/20 text-white hover:bg-white/10 shrink-0"
                            onClick={() => updateMentorFeedbackFormStatus(form.id, form.status === "Active" ? "Closed" : "Active")}>
                            {form.status === "Active" ? "Close" : "Reopen"}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedback;
