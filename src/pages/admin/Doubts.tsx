import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePlatform } from "@/context/PlatformContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";

const AdminDoubts = () => {
  const { loading, sessionUser, logout, doubts, answerDoubt } = usePlatform();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answering, setAnswering] = useState<Record<string, boolean>>({});

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

  const handleDeleteDoubt = async (doubtId: string) => {
    if (!window.confirm("Delete this doubt?")) return;
    try {
      await deleteDoc(doc(db, "doubts", doubtId));
    } catch (error) {
      console.error("Error deleting doubt:", error);
    }
  };

  const handleAnswerDoubt = async (doubtId: string) => {
    if (!answers[doubtId]?.trim()) return;
    setAnswering((prev) => ({ ...prev, [doubtId]: true }));
    try {
      await answerDoubt(doubtId, answers[doubtId], "Admin");
      setAnswers((prev) => ({ ...prev, [doubtId]: "" }));
    } catch (error) {
      console.error("Error answering doubt:", error);
    } finally {
      setAnswering((prev) => ({ ...prev, [doubtId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden flex">
      <DashboardSidebar
        role="Admin"
        userName={sessionUser.email}
        onLogout={handleLogout}
        activeSection="doubts"
        onSectionChange={() => {}}
      />
      <div className="flex-1 min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.18),_transparent_22%),linear-gradient(180deg,_rgba(2,6,23,0.96),_rgba(15,23,42,0.98))]" />
        <div className="relative z-10 min-h-screen flex flex-col">
          <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-20">
            <div className="mx-auto max-w-7xl px-6 py-4">
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-white/10 text-white border-white/10">Admin</Badge>
                <Badge variant="outline" className="border-primary/30 text-primary">All Doubts</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-display text-white">Student Doubts</h1>
              <p className="text-white/65 mt-1">
                View and answer all doubts from interns.
              </p>
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-6 py-8 space-y-4 flex-1">
            {doubts.length === 0 ? (
              <Card className="border-white/10 bg-white/5 text-white">
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-white/60">No doubts yet</p>
                </CardContent>
              </Card>
            ) : (
              doubts.map((doubt, index) => (
                <motion.div
                  key={doubt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all ${doubt.answer ? "border-green-500/20" : ""}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold">{doubt.internName}</p>
                            <Badge variant="outline" className="border-white/10 text-white/70">{doubt.internId}</Badge>
                            {doubt.answer && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                          </div>
                          <p className="font-medium text-primary mb-2">{doubt.topic}</p>
                          <p className="text-white/75">{doubt.question}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDoubt(doubt.id)}
                          className="text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {doubt.answer && (
                        <div className="my-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                          <p className="text-xs text-green-400 mb-1">Answered by {doubt.mentorName || "Admin"}</p>
                          <p className="text-white/80 text-sm">{doubt.answer}</p>
                        </div>
                      )}

                      {!doubt.answer && (
                        <div className="mt-4 space-y-2">
                          <Textarea
                            value={answers[doubt.id] || ""}
                            onChange={(e) => setAnswers((prev) => ({ ...prev, [doubt.id]: e.target.value }))}
                            placeholder="Type your answer here..."
                            className="bg-white/5 border-white/10 text-white min-h-20"
                          />
                          <Button
                            onClick={() => handleAnswerDoubt(doubt.id)}
                            disabled={answering[doubt.id]}
                            className="w-full"
                          >
                            {answering[doubt.id] ? "Answering..." : "Answer Doubt"}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDoubts;
