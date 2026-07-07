import { useState, useMemo, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Trash2, Pencil, Save, X, Award, Search, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { usePlatform } from "@/context/PlatformContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";

interface AchievementCert {
  id: string;
  certId: string;
  name: string;
  certificateType: "Winner" | "1st Runner Up" | "2nd Runner Up" | "Participant";
  eventName: string;
  issueDate: string;
}

const ic = "w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 text-sm";
const sc = "w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-white text-sm";

const emptyForm = (): Omit<AchievementCert, "id"> => ({
  certId: "",
  name: "",
  certificateType: "Participant" as AchievementCert["certificateType"],
  eventName: "",
  issueDate: new Date().toISOString().slice(0, 10),
});

const AdminCertificates = () => {
  const { loading, sessionUser, logout } = usePlatform();
  const [certs, setCerts] = useState<AchievementCert[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"All" | "Winner" | "Participant">("All");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    if (!sessionUser) return;
    const unsub = onSnapshot(collection(db, "achievementCerts"), (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AchievementCert));
      setCerts(items.sort((a, b) => b.issueDate.localeCompare(a.issueDate)));
    });
    return () => unsub();
  }, [sessionUser]);

  const filtered = useMemo(() => certs.filter((c) => {
    const matchSearch = !search.trim()
      || c.name.toLowerCase().includes(search.toLowerCase())
      || c.certId.toLowerCase().includes(search.toLowerCase())
      || c.eventName.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "All" || c.certificateType === filterType;
    return matchSearch && matchType;
  }), [certs, search, filterType]);

  if (!loading && !sessionUser) return <Navigate to="/login" replace />;
  if (!loading && sessionUser?.role !== "Admin") return <Navigate to="/login" replace />;
  if (!sessionUser) return null;

  const openForm = (cert?: AchievementCert) => {
    setError(""); setSuccess("");
    if (cert) {
      setEditingId(cert.id);
      setForm({ certId: cert.certId, name: cert.name, certificateType: cert.certificateType, eventName: cert.eventName, issueDate: cert.issueDate });
    } else {
      setEditingId(null);
      setForm(emptyForm());
    }
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm()); setError(""); };

  const handleSave = async () => {
    if (!form.certId.trim() || !form.name.trim() || !form.eventName.trim() || !form.issueDate) {
      setError("All fields are required."); return;
    }
    setSaving(true); setError(""); setSuccess("");
    try {
      const payload = {
        certId: form.certId.trim().toUpperCase(),
        name: form.name.trim(),
        certificateType: form.certificateType,
        eventName: form.eventName.trim(),
        issueDate: form.issueDate,
      };
      if (editingId) {
        await updateDoc(doc(db, "achievementCerts", editingId), payload);
        setSuccess("Certificate updated.");
      } else {
        await addDoc(collection(db, "achievementCerts"), payload);
        setSuccess("Certificate issued.");
      }
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this certificate? It can no longer be verified.")) return;
    setDeletingId(id);
    try { await deleteDoc(doc(db, "achievementCerts", id)); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to delete."); }
    finally { setDeletingId(null); }
  };

  const handleCopy = (certId: string) => {
    navigator.clipboard.writeText(certId);
    setCopiedId(certId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden flex">
      <DashboardSidebar role="Admin" userName={sessionUser.email} onLogout={logout} activeSection="certificates" onSectionChange={() => {}} />
      <div className="flex-1 min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.18),_transparent_22%),linear-gradient(180deg,_rgba(2,6,23,0.96),_rgba(15,23,42,0.98))]" />
        <div className="relative z-10 min-h-screen flex flex-col">

          <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-20">
            <div className="mx-auto max-w-6xl px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-white/10 text-white border-white/10">Admin</Badge>
                    <Badge variant="outline" className="border-primary/30 text-primary">Certificates</Badge>
                  </div>
                  <h1 className="text-3xl font-bold text-white">Achievement Certificates</h1>
                  <p className="text-white/55 text-sm mt-0.5">Issue and manage Hackathon / Bootcamp / Event certificates. Verifiable at hackmates.tech/verify</p>
                </div>
                <Button onClick={() => openForm()} className="bg-primary hover:bg-primary/80">
                  <Plus className="w-4 h-4" />
                  Issue Certificate
                </Button>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-6xl w-full px-6 py-8 space-y-6 flex-1">
            {error && <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">{error}</div>}
            {success && <div className="rounded-md border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-200">{success}</div>}

            {/* Form */}
            {showForm && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-white/10 bg-white/5 text-white">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{editingId ? "Edit Certificate" : "Issue New Certificate"}</h3>
                      <button onClick={closeForm} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs text-white/50 uppercase tracking-wide">Certificate ID <span className="text-white/30 normal-case">(enter manually)</span></label>
                        <input
                          className={ic}
                          value={form.certId}
                          onChange={(e) => setForm((f) => ({ ...f, certId: e.target.value.toUpperCase() }))}
                          placeholder="e.g. HM-RIFT-2024-001"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-white/50 uppercase tracking-wide">Name of Participant / Winner</label>
                        <input
                          className={ic}
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder="Full name as on certificate"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-white/50 uppercase tracking-wide">Certificate Type</label>
                        <select className={sc} value={form.certificateType} onChange={(e) => setForm((f) => ({ ...f, certificateType: e.target.value as AchievementCert["certificateType"] }))}>
                          <option value="Winner">Winner</option>
                          <option value="1st Runner Up">1st Runner Up</option>
                          <option value="2nd Runner Up">2nd Runner Up</option>
                          <option value="Participant">Participant</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-white/50 uppercase tracking-wide">Event / Program Name</label>
                        <input
                          className={ic}
                          value={form.eventName}
                          onChange={(e) => setForm((f) => ({ ...f, eventName: e.target.value }))}
                          placeholder="e.g. RIFT Hackathon 2024, Web Dev Bootcamp"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-white/50 uppercase tracking-wide">Date of Issue</label>
                        <input type="date" className={ic} value={form.issueDate} onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))} />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                      <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/80">
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : editingId ? "Update" : "Issue Certificate"}
                      </Button>
                      <Button variant="outline" className="border-white/10 text-white hover:bg-white/10" onClick={closeForm}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, ID, or event..." className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
              </div>
              <div className="flex gap-2">
                {(["All", "Winner", "Participant"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${filterType === t ? "bg-primary border-primary text-white" : "border-white/10 text-white/60 hover:bg-white/5"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <Badge className="bg-white/10 text-white/60 border-white/10">{filtered.length} total</Badge>
            </div>

            {/* List */}
            {filtered.length === 0 ? (
              <Card className="border-white/10 bg-white/5 text-white">
                <CardContent className="py-16 text-center text-white/40 space-y-2">
                  <Award className="w-10 h-10 mx-auto opacity-30" />
                  <p>{certs.length === 0 ? "No certificates issued yet." : "No certificates match your search."}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((cert, i) => (
                  <motion.div key={cert.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card className="border-white/10 bg-white/5 text-white">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{cert.name}</p>
                            <p className="text-xs text-white/50 truncate mt-0.5">{cert.eventName}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => handleCopy(cert.certId)} className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors" title="Copy ID">
                              {copiedId === cert.certId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => openForm(cert)} className="p-1.5 rounded text-white/40 hover:text-primary hover:bg-primary/10 transition-colors">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(cert.id)} disabled={deletingId === cert.id} className="p-1.5 rounded text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Badge className={
                            cert.certificateType === "Winner" ? "bg-amber-500/15 text-amber-300 border-amber-500/20" :
                            cert.certificateType === "1st Runner Up" ? "bg-orange-500/15 text-orange-300 border-orange-500/20" :
                            cert.certificateType === "2nd Runner Up" ? "bg-slate-400/15 text-slate-300 border-slate-400/20" :
                            "bg-blue-500/15 text-blue-300 border-blue-500/20"
                          }>
                            {cert.certificateType}
                          </Badge>
                          <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/20">Verified</Badge>
                        </div>

                        <div className="space-y-1 text-xs text-white/55">
                          <div className="flex justify-between">
                            <span>Certificate ID</span>
                            <span className="font-mono text-white/80 font-medium">{cert.certId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Date of Issue</span>
                            <span className="text-white/70">{new Date(cert.issueDate).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminCertificates;
