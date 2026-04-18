import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users2, Trash2, Plus, Loader2, Mail, Pencil, Save, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePlatform } from "@/context/PlatformContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useState, FormEvent, useMemo } from "react";

const AdminUsers = () => {
  const { loading, sessionUser, logout, users, fees, createUser, deleteUserAccount, upsertInternFee } = usePlatform();
  const [savingUser, setSavingUser] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [editingFeeInternId, setEditingFeeInternId] = useState<string | null>(null);
  const [savingFee, setSavingFee] = useState(false);
  const [userError, setUserError] = useState("");
  const [userSuccess, setUserSuccess] = useState("");
  const [feeForm, setFeeForm] = useState({
    label: "Internship Fee",
    amount: "",
    paidAmount: "",
    dueDate: "",
  });
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Intern" as "Intern" | "Mentor",
  });

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

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    setDeletingUserId(userId);
    setUserError("");
    setUserSuccess("");
    try {
      await deleteUserAccount(userId);
      setUserSuccess("User deleted from Authentication and Firestore.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete user.";
      setUserError(message);
      console.error("Error deleting user:", error);
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userForm.name.trim() || !userForm.email.trim() || !userForm.password.trim()) {
      setUserError("All fields are required");
      return;
    }

    setSavingUser(true);
    setUserError("");
    setUserSuccess("");

    try {
      await createUser({
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role,
      });
      setUserForm({ name: "", email: "", password: "", role: "Intern" });
      setUserSuccess("User created and welcome credentials email sent successfully.");
    } catch (error) {
      setUserError(error instanceof Error ? error.message : "Failed to create user");
    } finally {
      setSavingUser(false);
    }
  };

  const interns = users.filter((user) => user.role === "Intern");
  const mentors = users.filter((user) => user.role === "Mentor");
  const feeByInternId = useMemo(() => {
    const map = new Map<string, (typeof fees)[number]>();
    fees.forEach((entry) => {
      if (!map.has(entry.internId)) {
        map.set(entry.internId, entry);
      }
    });
    return map;
  }, [fees]);

  const startFeeEdit = (internId: string) => {
    const existing = feeByInternId.get(internId);
    setEditingFeeInternId(internId);
    setFeeForm({
      label: existing?.label || "Internship Fee",
      amount: existing ? String(existing.amount) : "",
      paidAmount: existing ? String(existing.paidAmount) : "",
      dueDate: existing?.dueDate || "",
    });
  };

  const handleSaveFee = async (internId: string) => {
    setSavingFee(true);
    setUserError("");
    setUserSuccess("");
    try {
      await upsertInternFee({
        internId,
        label: feeForm.label,
        amount: Number(feeForm.amount) || 0,
        paidAmount: Number(feeForm.paidAmount) || 0,
        dueDate: feeForm.dueDate,
      });
      setUserSuccess("Fee details updated successfully.");
      setEditingFeeInternId(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update fee details.";
      setUserError(message);
    } finally {
      setSavingFee(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden flex">
      <DashboardSidebar
        role="Admin"
        userName={sessionUser.email}
        onLogout={handleLogout}
        activeSection="users"
        onSectionChange={() => {}}
      />
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
              <p className="text-white/65 mt-1">
                Add interns and mentors, manage user profiles.
              </p>
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-6 py-8 space-y-8 flex-1">
            {/* Add User Form */}
            <Card className="border-white/10 bg-white/5 text-white">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New User
                </h3>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full name"
                    value={userForm.name}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-white/40"
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={userForm.email}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-white/40"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={userForm.password}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, password: e.target.value }))}
                    className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-white/40"
                  />
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, role: e.target.value as "Intern" | "Mentor" }))}
                    className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-2 text-white"
                  >
                    <option value="Intern" className="text-black">Intern</option>
                    <option value="Mentor" className="text-black">Mentor</option>
                  </select>

                  {userError && (
                    <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                      {userError}
                    </div>
                  )}

                  {userSuccess && (
                    <div className="rounded-md border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-200">
                      {userSuccess}
                    </div>
                  )}

                  <Button type="submit" disabled={savingUser} className="w-full">
                    {savingUser ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add User
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Users Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Interns */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Interns ({interns.length})</h3>
                <div className="space-y-2">
                  {interns.length === 0 ? (
                    <Card className="border-white/10 bg-white/5">
                      <CardContent className="pt-6 text-center py-8">
                        <p className="text-white/60">No interns yet</p>
                      </CardContent>
                    </Card>
                  ) : (
                    interns.map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{user.name}</p>
                              <p className="text-sm text-white/60 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </p>
                              {(() => {
                                const fee = feeByInternId.get(user.id);
                                if (!fee) {
                                  return <p className="text-xs text-white/50 mt-2">No fee details set</p>;
                                }

                                const amount = Number(fee.amount) || 0;
                                const paid = Number(fee.paidAmount) || 0;
                                const remaining = Math.max(amount - paid, 0);
                                const percentage = amount > 0 ? Math.min(100, Math.round((paid / amount) * 100)) : 0;
                                return (
                                  <div className="mt-2 text-xs text-white/70 space-y-1">
                                    <p>{fee.label}: Paid {paid} / {amount} ({percentage}%)</p>
                                    <p>Remaining: {remaining}{fee.dueDate ? ` • Due ${fee.dueDate}` : ""}</p>
                                  </div>
                                );
                              })()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startFeeEdit(user.id)}
                                className="text-primary hover:bg-primary/10"
                                title="Edit fee"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={deletingUserId === user.id}
                                className="text-red-400 hover:bg-red-500/10"
                              >
                                {deletingUserId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                              </Button>
                            </div>
                          </CardContent>
                          {editingFeeInternId === user.id && (
                            <CardContent className="pt-0 pb-4 px-4">
                              <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-3">
                                <Input
                                  placeholder="Fee label"
                                  value={feeForm.label}
                                  onChange={(event) => setFeeForm((current) => ({ ...current, label: event.target.value }))}
                                  className="bg-white/5 border-white/10 text-white"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                  <Input
                                    type="number"
                                    min={0}
                                    placeholder="Total fee"
                                    value={feeForm.amount}
                                    onChange={(event) => setFeeForm((current) => ({ ...current, amount: event.target.value }))}
                                    className="bg-white/5 border-white/10 text-white"
                                  />
                                  <Input
                                    type="number"
                                    min={0}
                                    placeholder="Paid amount"
                                    value={feeForm.paidAmount}
                                    onChange={(event) => setFeeForm((current) => ({ ...current, paidAmount: event.target.value }))}
                                    className="bg-white/5 border-white/10 text-white"
                                  />
                                </div>
                                <Input
                                  type="date"
                                  value={feeForm.dueDate}
                                  onChange={(event) => setFeeForm((current) => ({ ...current, dueDate: event.target.value }))}
                                  className="bg-white/5 border-white/10 text-white"
                                />
                                <div className="flex gap-2">
                                  <Button type="button" onClick={() => handleSaveFee(user.id)} disabled={savingFee} className="flex-1">
                                    {savingFee ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save fee
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                                    onClick={() => setEditingFeeInternId(null)}
                                  >
                                    <X className="w-4 h-4" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Mentors */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Mentors ({mentors.length})</h3>
                <div className="space-y-2">
                  {mentors.length === 0 ? (
                    <Card className="border-white/10 bg-white/5">
                      <CardContent className="pt-6 text-center py-8">
                        <p className="text-white/60">No mentors yet</p>
                      </CardContent>
                    </Card>
                  ) : (
                    mentors.map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{user.name}</p>
                              <p className="text-sm text-white/60 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={deletingUserId === user.id}
                              className="text-red-400 hover:bg-red-500/10"
                            >
                              {deletingUserId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
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
