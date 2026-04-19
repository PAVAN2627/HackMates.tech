import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, Plus, Loader2, Mail, Pencil, Save, X, Hash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePlatform } from "@/context/PlatformContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useState, FormEvent, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc, setDoc } from "firebase/firestore";

interface VerifForm {
  offerId: string;
  name: string;
  position: string;
  status: "Active" | "Completed" | "Expired";
  issueDate: string;
  validUntil: string;
}

const emptyVerif = (): VerifForm => ({
  offerId: "", name: "", position: "", status: "Active", issueDate: "", validUntil: "",
});

const ic = "w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 text-sm";
const sc = "w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-white text-sm";

const AdminUsers = () => {
  const { loading, sessionUser, logout, users, fees, createUser, deleteUserAccount, upsertInternFee } = usePlatform();

  // ── All hooks before early returns ──
  const [savingUser, setSavingUser] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [editingFeeInternId, setEditingFeeInternId] = useState<string | null>(null);
  const [savingFee, setSavingFee] = useState(false);
  const [userError, setUserError] = useState("");
  const [userSuccess, setUserSuccess] = useState("");
  const [feeForm, setFeeForm] = useState({ label: "Internship Fee", amount: "", paidAmount: "", dueDate: "" });
  const [userForm, setUserForm] = useState({
    name: "", email: "", password: "", role: "Intern" as "Intern" | "Mentor",
    internId: "", mentorId: "", position: "", issueDate: "", validUntil: "",
  });
  const [editingVerifUserId, setEditingVerifUserId] = useState<string | null>(null);
  const [verifDocId, setVerifDocId] = useState<string | null>(null);
  const [verifForm, setVerifForm] = useState<VerifForm>(emptyVerif());
  const [savingVerif, setSavingVerif] = useState(false);

  const interns = useMemo(() => users.filter((u) => u.role === "Intern"), [users]);
  const mentors = useMemo(() => users.filter((u) => u.role === "Mentor"), [users]);
  const feeByInternId = useMemo(() => {
    const map = new Map<string, (typeof fees)[number]>();
    fees.forEach((e) => { if (!map.has(e.internId)) map.set(e.internId, e); });
    return map;
  }, [fees]);

  // ── Early returns after all hooks ──
  if (!loading && !sessionUser) return <Navigate to="/login" replace />;
  if (!loading && sessionUser?.role !== "Admin") return <Navigate to="/login" replace />;
  if (!sessionUser) return null;

  const handleLogout = () => logout();

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    setDeletingUserId(userId); setUserError(""); setUserSuccess("");
    try {
      await deleteUserAccount(userId);
      setUserSuccess("User deleted successfully.");
    } catch (err) {
      setUserError(err instanceof Error ? err.message : "Failed to delete user.");
    } finally { setDeletingUserId(null); }
  };

  const handleCreateUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userForm.name.trim() || !userForm.email.trim() || !userForm.password.trim()) {
      setUserError("Name, email and password are required"); return;
    }
    setSavingUser(true); setUserError(""); setUserSuccess("");
    try {
      await createUser({
        name: userForm.name, email: userForm.email, password: userForm.password, role: userForm.role,
        internId: userForm.role === "Intern" ? userForm.internId : undefined,
        mentorId: userForm.role === "Mentor" ? userForm.mentorId : undefined,
        position: userForm.position, issueDate: userForm.issueDate, validUntil: userForm.validUntil,
      });
      setUserForm({ name: "", email: "", password: "", role: "Intern", internId: "", mentorId: "", position: "", issueDate: "", validUntil: "" });
      setUserSuccess("User created and welcome email sent.");
    } catch (err) {
      setUserError(err instanceof Error ? err.message : "Failed to create user");
    } finally { setSavingUser(false); }
  };

  const startFeeEdit = (internId: string) => {
    const ex = feeByInternId.get(internId);
    setEditingFeeInternId(internId);
    setFeeForm({ label: ex?.label || "Internship Fee", amount: ex ? String(ex.amount) : "", paidAmount: ex ? String(ex.paidAmount) : "", dueDate: ex?.dueDate || "" });
  };

  const handleSaveFee = async (internId: string) => {
    setSavingFee(true); setUserError(""); setUserSuccess("");
    try {
      await upsertInternFee({ internId, label: feeForm.label, amount: Number(feeForm.amount) || 0, paidAmount: Number(feeForm.paidAmount) || 0, dueDate: feeForm.dueDate });
      setUserSuccess("Fee details updated."); setEditingFeeInternId(null);
    } catch (err) {
      setUserError(err instanceof Error ? err.message : "Failed to update fee.");
    } finally { setSavingFee(false); }
  };

  const startVerifEdit = async (userId: string, offerId: string | undefined, userName: string) => {
    setEditingVerifUserId(userId);
    setVerifDocId(null);
    setVerifForm({ ...emptyVerif(), name: userName });
    if (!offerId) return;
    try {
      const snap = await getDocs(query(collection(db, "verifications"), where("offerId", "==", offerId.toUpperCase())));
      if (!snap.empty) {
        const d = snap.docs[0];
        const data = d.data();
        setVerifDocId(d.id);
        setVerifForm({
          offerId: data.offerId || offerId.toUpperCase(),
          name: data.name || userName,
          position: data.position || "",
          status: data.status || "Active",
          issueDate: data.issueDate || "",
          validUntil: data.validUntil || "",
        });
      } else {
        setVerifForm((f) => ({ ...f, offerId: offerId.toUpperCase() }));
      }
    } catch {
      setVerifForm((f) => ({ ...f, offerId: offerId.toUpperCase() }));
    }
  };

  const handleSaveVerif = async (userId: string, type: "Intern" | "Mentor") => {
    if (!verifForm.offerId.trim()) { setUserError("Certificate ID is required."); return; }
    setSavingVerif(true); setUserError(""); setUserSuccess("");
    try {
      const payload = {
        offerId: verifForm.offerId.trim().toUpperCase(),
        name: verifForm.name.trim(),
        type: type === "Mentor" ? "Employee" : "Intern",
        certificateType: "Offer Letter",
        position: verifForm.position.trim(),
        status: verifForm.status,
        issueDate: verifForm.issueDate,
        validUntil: type === "Intern" ? verifForm.validUntil : "",
        ...(verifForm.status === "Completed" ? { completionDate: new Date().toISOString().slice(0, 10) } : {}),
      };
      if (verifDocId) {
        await updateDoc(doc(db, "verifications", verifDocId), payload);
      } else {
        await setDoc(doc(collection(db, "verifications")), payload);
      }
      const idField = type === "Intern" ? "internId" : "mentorId";
      await updateDoc(doc(db, "users", userId), { [idField]: verifForm.offerId.trim().toUpperCase() });
      setUserSuccess("Verification details saved.");
      setEditingVerifUserId(null);
    } catch (err) {
      setUserError(err instanceof Error ? err.message : "Failed to save verification.");
    } finally { setSavingVerif(false); }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden flex">
      <DashboardSidebar role="Admin" userName={sessionUser.email} onLogout={handleLogout} activeSection="users" onSectionChange={() => {}} />
      <div className="flex-1 min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.18),_transparent_22%),linear-gradient(180deg,_rgba(2,6,23,0.96),_rgba(15,23,42,0.98))]" />
        <div className="relative z-10 min-h-screen flex flex-col">
          <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-20">
            <div className="mx-auto max-w-7xl px-6 py-4">
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-white/10 text-white border-white/10">Admin</Badge>
                <Badge variant="outline" className="border-primary/30 text-primary">User Management</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-display text-white">Users</h1>
              <p className="text-white/65 mt-1">Add interns and mentors, manage user profiles.</p>
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-6 py-8 space-y-8 flex-1">
            {userError && <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">{userError}</div>}
            {userSuccess && <div className="rounded-md border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-200">{userSuccess}</div>}

            {/* Add User Form */}
            <Card className="border-white/10 bg-white/5 text-white">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Plus className="w-5 h-5" /> Add New User</h3>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <input type="text" placeholder="Full name" value={userForm.name} onChange={(e) => setUserForm((p) => ({ ...p, name: e.target.value }))} className={ic} />
                  <input type="email" placeholder="Email address" value={userForm.email} onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))} className={ic} />
                  <input type="password" placeholder="Password" value={userForm.password} onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))} className={ic} />
                  <select value={userForm.role} onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value as "Intern" | "Mentor", internId: "", mentorId: "", position: "", issueDate: "", validUntil: "" }))} className={sc}>
                    <option value="Intern">Intern</option>
                    <option value="Mentor">Mentor</option>
                  </select>
                  <div className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-4">
                    <p className="text-xs text-white/50 uppercase tracking-wide">Verification Details</p>
                    {userForm.role === "Intern"
                      ? <input type="text" placeholder="Intern ID (e.g. HM-INT-2024-001)" value={userForm.internId} onChange={(e) => setUserForm((p) => ({ ...p, internId: e.target.value.toUpperCase() }))} className={`${ic} font-mono`} />
                      : <input type="text" placeholder="Mentor ID (e.g. HM-EMP-2024-001)" value={userForm.mentorId} onChange={(e) => setUserForm((p) => ({ ...p, mentorId: e.target.value.toUpperCase() }))} className={`${ic} font-mono`} />
                    }
                    <input type="text" placeholder="Position (e.g. Full Stack Developer)" value={userForm.position} onChange={(e) => setUserForm((p) => ({ ...p, position: e.target.value }))} className={ic} />
                    {userForm.role === "Intern" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-xs text-white/50 mb-1 block">Issue Date</label><input type="date" value={userForm.issueDate} onChange={(e) => setUserForm((p) => ({ ...p, issueDate: e.target.value }))} className={ic} /></div>
                        <div><label className="text-xs text-white/50 mb-1 block">Valid Until</label><input type="date" value={userForm.validUntil} onChange={(e) => setUserForm((p) => ({ ...p, validUntil: e.target.value }))} className={ic} /></div>
                      </div>
                    )}
                  </div>
                  <Button type="submit" disabled={savingUser} className="w-full">
                    {savingUser ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</> : <><Plus className="w-4 h-4 mr-2" />Add User</>}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Interns */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Interns ({interns.length})</h3>
                <div className="space-y-2">
                  {interns.length === 0
                    ? <Card className="border-white/10 bg-white/5"><CardContent className="py-8 text-center text-white/60">No interns yet</CardContent></Card>
                    : interns.map((user, index) => (
                      <motion.div key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                        <Card className="border-white/10 bg-white/5 text-white">
                          <CardContent className="p-4 flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold">{user.name}</p>
                              <p className="text-sm text-white/60 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3 shrink-0" />{user.email}</p>
                              {user.internId && <p className="text-xs text-primary flex items-center gap-1 mt-1"><Hash className="w-3 h-3 shrink-0" />{user.internId}</p>}
                              {(() => {
                                const fee = feeByInternId.get(user.id);
                                if (!fee) return <p className="text-xs text-white/40 mt-2">No fee set</p>;
                                const amount = Number(fee.amount) || 0;
                                const paid = Number(fee.paidAmount) || 0;
                                const pct = amount > 0 ? Math.min(100, Math.round((paid / amount) * 100)) : 0;
                                return (
                                  <div className="mt-2 text-xs text-white/60 space-y-0.5">
                                    <p>{fee.label}: {paid} / {amount} ({pct}%)</p>
                                    <p>Remaining: {Math.max(amount - paid, 0)}{fee.dueDate ? ` • Due ${fee.dueDate}` : ""}</p>
                                  </div>
                                );
                              })()}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button variant="ghost" size="icon" onClick={() => startVerifEdit(user.id, user.internId, user.name)} className="text-yellow-400 hover:bg-yellow-500/10" title="Edit verification">
                                <Hash className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => startFeeEdit(user.id)} className="text-primary hover:bg-primary/10" title="Edit fee">
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)} disabled={deletingUserId === user.id} className="text-red-400 hover:bg-red-500/10">
                                {deletingUserId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                              </Button>
                            </div>
                          </CardContent>

                          {/* Verification edit */}
                          {editingVerifUserId === user.id && (
                            <CardContent className="pt-0 pb-4 px-4">
                              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 space-y-3">
                                <p className="text-xs text-yellow-400 uppercase tracking-wide font-semibold">Edit Verification</p>
                                <input type="text" placeholder="Certificate ID" value={verifForm.offerId} onChange={(e) => setVerifForm((f) => ({ ...f, offerId: e.target.value.toUpperCase() }))} className={`${ic} font-mono`} />
                                <input type="text" placeholder="Name" value={verifForm.name} onChange={(e) => setVerifForm((f) => ({ ...f, name: e.target.value }))} className={ic} />
                                <input type="text" placeholder="Position" value={verifForm.position} onChange={(e) => setVerifForm((f) => ({ ...f, position: e.target.value }))} className={ic} />
                                <select value={verifForm.status} onChange={(e) => setVerifForm((f) => ({ ...f, status: e.target.value as VerifForm["status"] }))} className={sc}>
                                  <option value="Active">Active</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Expired">Expired</option>
                                </select>
                                <div className="grid grid-cols-2 gap-3">
                                  <div><label className="text-xs text-white/50 mb-1 block">Issue Date</label><input type="date" value={verifForm.issueDate} onChange={(e) => setVerifForm((f) => ({ ...f, issueDate: e.target.value }))} className={ic} /></div>
                                  <div><label className="text-xs text-white/50 mb-1 block">Valid Until</label><input type="date" value={verifForm.validUntil} onChange={(e) => setVerifForm((f) => ({ ...f, validUntil: e.target.value }))} className={ic} /></div>
                                </div>
                                <div className="flex gap-2">
                                  <Button type="button" onClick={() => handleSaveVerif(user.id, "Intern")} disabled={savingVerif} className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white">
                                    {savingVerif ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}Save
                                  </Button>
                                  <Button type="button" variant="outline" className="border-white/10 text-white hover:bg-white/10" onClick={() => setEditingVerifUserId(null)}>
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          )}

                          {/* Fee edit */}
                          {editingFeeInternId === user.id && (
                            <CardContent className="pt-0 pb-4 px-4">
                              <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-3">
                                <Input placeholder="Fee label" value={feeForm.label} onChange={(e) => setFeeForm((c) => ({ ...c, label: e.target.value }))} className="bg-white/5 border-white/10 text-white" />
                                <div className="grid grid-cols-2 gap-3">
                                  <Input type="number" min={0} placeholder="Total fee" value={feeForm.amount} onChange={(e) => setFeeForm((c) => ({ ...c, amount: e.target.value }))} className="bg-white/5 border-white/10 text-white" />
                                  <Input type="number" min={0} placeholder="Paid amount" value={feeForm.paidAmount} onChange={(e) => setFeeForm((c) => ({ ...c, paidAmount: e.target.value }))} className="bg-white/5 border-white/10 text-white" />
                                </div>
                                <Input type="date" value={feeForm.dueDate} onChange={(e) => setFeeForm((c) => ({ ...c, dueDate: e.target.value }))} className="bg-white/5 border-white/10 text-white" />
                                <div className="flex gap-2">
                                  <Button type="button" onClick={() => handleSaveFee(user.id)} disabled={savingFee} className="flex-1">
                                    {savingFee ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}Save fee
                                  </Button>
                                  <Button type="button" variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => setEditingFeeInternId(null)}>
                                    <X className="w-4 h-4 mr-1" />Cancel
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      </motion.div>
                    ))
                  }
                </div>
              </div>

              {/* Mentors */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Mentors ({mentors.length})</h3>
                <div className="space-y-2">
                  {mentors.length === 0
                    ? <Card className="border-white/10 bg-white/5"><CardContent className="py-8 text-center text-white/60">No mentors yet</CardContent></Card>
                    : mentors.map((user, index) => (
                      <motion.div key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                        <Card className="border-white/10 bg-white/5 text-white">
                          <CardContent className="p-4 flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold">{user.name}</p>
                              <p className="text-sm text-white/60 flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</p>
                              {user.mentorId && <p className="text-xs text-primary flex items-center gap-1 mt-1"><Hash className="w-3 h-3 shrink-0" />{user.mentorId}</p>}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button variant="ghost" size="icon" onClick={() => startVerifEdit(user.id, user.mentorId, user.name)} className="text-yellow-400 hover:bg-yellow-500/10" title="Edit verification">
                                <Hash className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)} disabled={deletingUserId === user.id} className="text-red-400 hover:bg-red-500/10">
                                {deletingUserId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                              </Button>
                            </div>
                          </CardContent>

                          {/* Verification edit — Mentor: no dates */}
                          {editingVerifUserId === user.id && (
                            <CardContent className="pt-0 pb-4 px-4">
                              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 space-y-3">
                                <p className="text-xs text-yellow-400 uppercase tracking-wide font-semibold">Edit Verification</p>
                                <input type="text" placeholder="Certificate ID" value={verifForm.offerId} onChange={(e) => setVerifForm((f) => ({ ...f, offerId: e.target.value.toUpperCase() }))} className={`${ic} font-mono`} />
                                <input type="text" placeholder="Name" value={verifForm.name} onChange={(e) => setVerifForm((f) => ({ ...f, name: e.target.value }))} className={ic} />
                                <input type="text" placeholder="Position" value={verifForm.position} onChange={(e) => setVerifForm((f) => ({ ...f, position: e.target.value }))} className={ic} />
                                <select value={verifForm.status} onChange={(e) => setVerifForm((f) => ({ ...f, status: e.target.value as VerifForm["status"] }))} className={sc}>
                                  <option value="Active">Active</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Expired">Expired</option>
                                </select>
                                <div className="flex gap-2">
                                  <Button type="button" onClick={() => handleSaveVerif(user.id, "Mentor")} disabled={savingVerif} className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white">
                                    {savingVerif ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}Save
                                  </Button>
                                  <Button type="button" variant="outline" className="border-white/10 text-white hover:bg-white/10" onClick={() => setEditingVerifUserId(null)}>
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      </motion.div>
                    ))
                  }
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
