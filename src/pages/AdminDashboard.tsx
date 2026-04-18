import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Edit, Loader2, LogOut, Plus, Shield, Trash2, Users2, BadgeCheck, AlertCircle, Sparkles } from "lucide-react";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { usePlatform } from "../context/PlatformContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardSidebar from "@/components/DashboardSidebar";

interface VerificationEntry {
  id: string;
  offerId: string;
  name: string;
  type: "Employee" | "Intern";
  position: string;
  issueDate: string;
  validUntil?: string;
  status: "Active" | "Expired" | "Completed";
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { loading, sessionUser, logout, users, createUser, adminStats } = usePlatform();
  const [activeTab, setActiveTab] = useState("users");
  const [activeSection, setActiveSection] = useState("users");
  const [savingUser, setSavingUser] = useState(false);
  const [userError, setUserError] = useState("");
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [verifications, setVerifications] = useState<VerificationEntry[]>([]);
  const [loadingVerifications, setLoadingVerifications] = useState(true);
  const [savingVerification, setSavingVerification] = useState(false);
  const [editingVerificationId, setEditingVerificationId] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState("");
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Intern" as "Intern" | "Mentor",
  });
  const [verificationForm, setVerificationForm] = useState({
    offerId: "",
    name: "",
    type: "Intern" as "Employee" | "Intern",
    position: "",
    issueDate: "",
    validUntil: "",
    status: "Active" as "Active" | "Expired" | "Completed",
  });

  useEffect(() => {
    const loadVerifications = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "verifications"));
        const data = querySnapshot.docs.map((snapshot) => ({
          id: snapshot.id,
          ...snapshot.data(),
        })) as VerificationEntry[];
        setVerifications(data);
      } catch (error) {
        console.error("Error fetching verifications:", error);
      } finally {
        setLoadingVerifications(false);
      }
    };

    loadVerifications();
  }, []);

  if (!loading && !sessionUser) {
    return <Navigate to="/login" replace />;
  }

  if (!loading && sessionUser?.role !== "Admin") {
    return <Navigate to={sessionUser?.role === "Mentor" ? "/dashboard" : "/login"} replace />;
  }

  if (!sessionUser) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const resetVerificationForm = () => {
    setVerificationForm({
      offerId: "",
      name: "",
      type: "Intern",
      position: "",
      issueDate: "",
      validUntil: "",
      status: "Active",
    });
    setEditingVerificationId(null);
    setShowVerificationForm(false);
    setVerificationError("");
  };

  const refreshVerifications = async () => {
    const querySnapshot = await getDocs(collection(db, "verifications"));
    const data = querySnapshot.docs.map((snapshot) => ({
      id: snapshot.id,
      ...snapshot.data(),
    })) as VerificationEntry[];
    setVerifications(data);
  };

  const handleUserSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUserError("");
    setSavingUser(true);

    try {
      await createUser({
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role,
      });
      setUserForm({ name: "", email: "", password: "", role: "Intern" });
    } catch (error) {
      setUserError(error instanceof Error ? error.message : "Unable to create user.");
    } finally {
      setSavingUser(false);
    }
  };

  const handleVerificationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setVerificationError("");
    setSavingVerification(true);

    const payload = {
      offerId: verificationForm.offerId.trim().toUpperCase(),
      name: verificationForm.name.trim(),
      type: verificationForm.type,
      position: verificationForm.position.trim(),
      issueDate: verificationForm.issueDate,
      validUntil: verificationForm.validUntil || undefined,
      status: verificationForm.status,
    };

    try {
      if (editingVerificationId) {
        await updateDoc(doc(db, "verifications", editingVerificationId), payload);
      } else {
        await addDoc(collection(db, "verifications"), payload);
      }

      await refreshVerifications();
      resetVerificationForm();
    } catch (error) {
      console.error("Error saving verification:", error);
      setVerificationError("Unable to save verification entry.");
    } finally {
      setSavingVerification(false);
    }
  };

  const handleEditVerification = (entry: VerificationEntry) => {
    setVerificationForm({
      offerId: entry.offerId,
      name: entry.name,
      type: entry.type,
      position: entry.position,
      issueDate: entry.issueDate,
      validUntil: entry.validUntil || "",
      status: entry.status,
    });
    setEditingVerificationId(entry.id);
    setShowVerificationForm(true);
    setActiveTab("certificates");
  };

  const handleDeleteVerification = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "verifications", id));
      await refreshVerifications();
    } catch (error) {
      console.error("Error deleting verification:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden flex">
      <DashboardSidebar
        role="Admin"
        userName={sessionUser.email}
        onLogout={handleLogout}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className="flex-1 min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.18),_transparent_22%),linear-gradient(180deg,_rgba(2,6,23,0.96),_rgba(15,23,42,0.98))]" />
        <div className="relative z-10 min-h-screen flex flex-col">
        <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-20">
          <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-white/10 text-white border-white/10">Admin</Badge>
                <Badge variant="outline" className="border-primary/30 text-primary">{sessionUser.email}</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-display text-white">Admin control room</h1>
              <p className="text-white/65 mt-1 max-w-2xl">
                Add interns and mentors, manage verification records, and keep the internship workflow organized.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => setActiveTab("users")}>
                <Users2 className="w-4 h-4" />
                Users
              </Button>
              <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => setActiveTab("certificates")}>
                <BadgeCheck className="w-4 h-4" />
                Verifications
              </Button>
              <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 md:grid-cols-5">
            {[
              { label: "Users", value: adminStats.users, icon: Users2 },
              { label: "Interns", value: adminStats.interns, icon: Sparkles },
              { label: "Mentors", value: adminStats.mentors, icon: Shield },
              { label: "Open doubts", value: adminStats.openDoubts, icon: AlertCircle },
              { label: "Pending submissions", value: adminStats.pendingSubmissions, icon: CheckCircle2 },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className="border-white/10 bg-white/5 text-white backdrop-blur-sm">
                  <CardContent className="p-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-white/60">{item.label}</p>
                      <p className="text-3xl font-bold mt-2">{item.value}</p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </motion.section>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/5 border border-white/10 text-white w-full flex-wrap h-auto p-2">
              <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-white">Users</TabsTrigger>
              <TabsTrigger value="certificates" className="data-[state=active]:bg-primary data-[state=active]:text-white">Verifications</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <Card className="border-white/10 bg-slate-950/70 text-white">
                  <CardHeader>
                    <CardTitle>Add user</CardTitle>
                    <CardDescription className="text-white/60">Create intern or mentor accounts with Firebase login access.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUserSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm text-white/70">Name</label>
                        <Input value={userForm.name} onChange={(event) => setUserForm({ ...userForm, name: event.target.value })} className="bg-white/5 border-white/10 text-white" placeholder="Riya Sharma" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-white/70">Email</label>
                        <Input type="email" value={userForm.email} onChange={(event) => setUserForm({ ...userForm, email: event.target.value })} className="bg-white/5 border-white/10 text-white" placeholder="riya@hackmates.local" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm text-white/70">Role</label>
                          <select value={userForm.role} onChange={(event) => setUserForm({ ...userForm, role: event.target.value as "Intern" | "Mentor" })} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white">
                            <option value="Intern">Intern</option>
                            <option value="Mentor">Mentor</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-white/70">Password</label>
                          <Input type="text" value={userForm.password} onChange={(event) => setUserForm({ ...userForm, password: event.target.value })} className="bg-white/5 border-white/10 text-white" placeholder="Initial password" required />
                        </div>
                      </div>

                      {userError && (
                        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                          {userError}
                        </div>
                      )}

                      <Button type="submit" className="w-full" disabled={savingUser}>
                        {savingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Create user
                      </Button>

                      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/65 leading-relaxed">
                        New users are created in Firebase Auth and their role profile is written to Firestore for real-time dashboard access.
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-slate-950/70 text-white">
                  <CardHeader>
                    <CardTitle>Current users</CardTitle>
                    <CardDescription className="text-white/60">Users synced from Firestore with role-based access.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold">{user.name}</p>
                            <Badge variant={user.role === "Mentor" ? "secondary" : "default"}>{user.role}</Badge>
                          </div>
                          <p className="text-sm text-white/60 mt-1">{user.email}</p>
                        </div>
                        <p className="text-xs text-white/45 font-mono">{new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="certificates">
              <div className="space-y-6">
                <Card className="border-white/10 bg-slate-950/70 text-white">
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div>
                      <CardTitle>Verification records</CardTitle>
                      <CardDescription className="text-white/60">Maintain public certificate and offer-letter lookups.</CardDescription>
                    </div>
                    <Button type="button" onClick={() => setShowVerificationForm((current) => !current)}>
                      <Plus className="w-4 h-4" />
                      {showVerificationForm ? "Close form" : "Add record"}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {showVerificationForm && (
                      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-white/5 p-5 mb-6">
                        <form onSubmit={handleVerificationSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm text-white/70">Offer ID</label>
                            <Input value={verificationForm.offerId} onChange={(event) => setVerificationForm({ ...verificationForm, offerId: event.target.value.toUpperCase() })} className="bg-white/5 border-white/10 text-white uppercase" placeholder="HM-INT-2026-001" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm text-white/70">Name</label>
                            <Input value={verificationForm.name} onChange={(event) => setVerificationForm({ ...verificationForm, name: event.target.value })} className="bg-white/5 border-white/10 text-white" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm text-white/70">Type</label>
                            <select value={verificationForm.type} onChange={(event) => setVerificationForm({ ...verificationForm, type: event.target.value as "Employee" | "Intern" })} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white">
                              <option value="Employee">Employee</option>
                              <option value="Intern">Intern</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm text-white/70">Position</label>
                            <Input value={verificationForm.position} onChange={(event) => setVerificationForm({ ...verificationForm, position: event.target.value })} className="bg-white/5 border-white/10 text-white" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm text-white/70">Issue date</label>
                            <Input type="date" value={verificationForm.issueDate} onChange={(event) => setVerificationForm({ ...verificationForm, issueDate: event.target.value })} className="bg-white/5 border-white/10 text-white" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm text-white/70">Valid until</label>
                            <Input type="date" value={verificationForm.validUntil} onChange={(event) => setVerificationForm({ ...verificationForm, validUntil: event.target.value })} className="bg-white/5 border-white/10 text-white" />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-sm text-white/70">Status</label>
                            <select value={verificationForm.status} onChange={(event) => setVerificationForm({ ...verificationForm, status: event.target.value as "Active" | "Expired" | "Completed" })} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white">
                              <option value="Active">Active</option>
                              <option value="Expired">Expired</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>

                          {verificationError && (
                            <div className="md:col-span-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                              {verificationError}
                            </div>
                          )}

                          <div className="md:col-span-2 flex gap-3">
                            <Button type="submit" disabled={savingVerification}>
                              {savingVerification ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              {editingVerificationId ? "Update record" : "Save record"}
                            </Button>
                            <Button type="button" variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={resetVerificationForm}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </motion.div>
                    )}

                    {loadingVerifications ? (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-white/60">Loading verifications...</div>
                    ) : verifications.length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-white/60">No verification records yet.</div>
                    ) : (
                      <div className="grid gap-4">
                        {verifications.map((entry) => (
                          <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <p className="font-semibold">{entry.name}</p>
                                <Badge variant={entry.type === "Employee" ? "secondary" : "default"}>{entry.type}</Badge>
                                <Badge variant={entry.status === "Active" ? "default" : entry.status === "Completed" ? "secondary" : "destructive"}>{entry.status}</Badge>
                              </div>
                              <p className="text-sm text-white/65"><span className="font-mono text-primary">{entry.offerId}</span> • {entry.position}</p>
                              <p className="text-xs text-white/50 mt-1">Issued {entry.issueDate}{entry.validUntil ? ` • Valid until ${entry.validUntil}` : ""}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button type="button" variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => handleEditVerification(entry)}>
                                <Edit className="w-4 h-4" />
                                Edit
                              </Button>
                              <Button type="button" variant="destructive" onClick={() => handleDeleteVerification(entry.id)}>
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-white/5 text-white backdrop-blur-sm">
                  <CardContent className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-sm text-white/60">Next improvement</p>
                      <p className="font-semibold">Move the user store to Firestore or a backend auth service when you want real passwords and stronger access control.</p>
                    </div>
                    <Badge className="bg-primary/15 text-primary border-primary/20">Realtime ready</Badge>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
