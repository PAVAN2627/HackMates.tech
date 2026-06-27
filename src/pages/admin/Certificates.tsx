import { useState, useMemo } from "react";
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
import { useEffect } from "react";

interface AchievementCert {
  id: string;
  certId: string;          // e.g. HM-CERT-2024-001
  name: string;            // Name on certificate
  type: "Intern" | "Mentor" | "Participant";
  certificateType: "Hackathon Participation" | "Hackathon Winner" | "Bootcamp" | "Workshop" | "Training" | "Other";
  eventName: string;       // e.g. "RIFT Hackathon 2024"
  issueDate: string;
  status: "Active" | "Expired";
  notes?: string;
}

const CERT_TYPES = [
  "Hackathon Participation",
  "Hackathon Winner",
  "Bootcamp",
  "Workshop",
  "Training",
  "Other",
] as const;

const ic = "w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 text-sm";
const sc = "w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-white text-sm";

function generateCertId(type: string) {
  const prefix = type === "Hackathon Winner" ? "HM-WIN" : type === "Bootcamp" ? "HM-BOOT" : type === "Workshop" ? "HM-WS" : "HM-CERT";
  const year = new Date().getFullYear();
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `${prefix}-${year}-${rand}`;
}

const AdminCertificates = () => {
  const { loading, sessionUser, logout } = usePlatform();
  const [certs, setCerts] = useState<AchievementCert[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const emptyForm = (): Omit<AchievementCert, "id"> => ({
    certId: generateCertId("Hackathon Participation"),
    name: "",
    type: "Intern",
    certificateType: "Hackathon Participation",
    eventName: "",
    issueDate: new Date().toISOString().slice(0, 10),
    status: "Active",
    notes: "",
  });

  const [form, setForm] = useState(emptyForm());

  // Load certs from Firestore
  useEffect(() => {
    if (!sessionUser) return;
    const unsub = onSnapshot(collection(db, "achievementCerts"), (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AchievementCert));
      setCerts(items.sort((a, b) => b.issueDate.localeCompare(a.issueDate)));
    });
    return () => unsub();
  }, [sessionUser]);

  const filtered = useMemo(() => {
    return certs.filter((c) => {
      const matchSearch = !search.trim()
        || c.name.toLowerCase().includes(search.toLowerCase())
        || c.certId.toLowerCase().includes(search.toLowerCase())
        || c.eventName.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === "All" || c.certificateType === filterType;
      return matchSearch && matchType;
    });
  }, [certs, search, filterType]);

  if (!loading && !sessionUser) return <Navigate to="/login" replace />;
  if (!loading && sessionUser?.role !== "Admin") return <Navigate to="/login" replace />;
  if (!sessionUser) return null;

  const handleSave = async () => {
    if (!form.name.trim() || !form.certId.trim() || !form.eventName.trim() || !form.issueDate) {
      setError("Name, Certificate ID, Event Name and Issue Date are required.");
      return;
    }
    setSaving(true); setError(""); setSuccess("");
    try {
      const payload: Omit<AchievementCert, "id"> = {
        certId: form.certId.trim().toUpperCase(),
        name: form.name.trim(),
        type: form.type,
        certificateType: form.certificateType,
        eventName: form.eventName.trim(),
        issueDate: form.issueDate,
        status: form.status,
        ...(form.notes?.trim() ? { notes: form.notes.trim() } : {}),
      };

      if (editingId) {
        await updateDoc(doc(db, "achievementCerts", editingId), payload);
        setSuccess("Certificate updated.");
        setEditingId(null);
      } else {
        await addDoc(collection(db, "achievementCerts"), payload);
        setSuccess("Certificate issued.");
      }
      setForm(emptyForm());
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally { setSaving(false); }
  };

  const handleEdit = (cert: AchievementCert) => {
    setEditingId(cert.id);
    setForm({
      certId: cert.certId,
      name: cert.name,
      type: cert.type,
      certificateType: cert.certificateType,
      eventName: cert.eventName,
      issueDate: cert.issueDate,
      status: cert.status,
      notes: cert.notes || "",
    });
    setShowForm(true);
    setError(""); setSuccess("");
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

  const certTypeColor = (t: string) => {
    if (t === "Hackathon Winner") return "bg-amber-500/15 text-amber-300 border-amber-500/20";
    if (t === "Hackathon Participation") return "bg-blue-500/15 text-blue-300 border-blue-500/20";
    if (t === "Bootcamp") return "bg-emerald-500/15 text-emerald-300 border-emerald-500/20";
    if (t === "Workshop") return "bg-violet-500/15 text-violet-300 border-violet-500/20";
    if (t === "Training") return "bg-cyan-500/15 text-cyan-300 border-cyan-500/20";
    return "bg-white/10 text-white/60 border-white/10";
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
                  <p className="text-white/55 text-sm mt-0.5">Issue and manage Hackathon, Bootcamp, Workshop certificates. All are publicly verifiable.</p>
                </div>
                <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm()); setError(""); setSuccess(""); }} className="bg-primary hover:bg-primary/80">
                  <Plus className="w-4 h-4" />
                  Issue Certificate
                </Button>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-6xl w-full px-6 py-8 space-y-6 flex-1">
            {error && <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">{error}</div>}
            {success && <div className="rounded-md border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-200">{success}</div>}

            {/* Issue / Edit Form */}
            {showForm && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-white/10 bg-white/5 text-white">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white">{editingId ? "Edit Certificate" : "Issue New Certificate"}</h3>
                      <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs text-white/50 uppercase tracking-wide">Certificate ID</label>
                        <div className="flex gap-2">
                          <input className={ic} value={form.certId} onChange={(e) => setForm((f) => ({ ...f, certId: e.target.value.toUpperCase() }))} placeholder="HM-CERT-2024-001" />
                          <Button type="button" variant="outline" className="border-white/10 text-white hover:bg-white/10 shrink-0" onClick={() => setForm((f) => ({ ...f, certId: generateCertId(f.certificateType) }))}>
                            Auto
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-white/50 uppercase tracking-wide">Name on Certificate</label>
                        <input className={ic} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name exactly as on certificate" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-white/50 uppercase tracking-wide">Certificate Type</label>
                        <select className={sc} value={form.certificateType} onChange={(e) => setForm((f) => ({ ...f, certificateType: e.target.value as AchievementCert["certificateType"], certId: generateCertId(e.target.value) }))}>
                          {CERT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-white/50 uppercase tracking-wide">Recipient Type</label>
                        <select className={sc} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AchievementCert["type"] }))}>
                          <option value="Intern">Intern</option>
                          <option value="Mentor">Mentor / Employee</option>
                          <option value="Participant">External Participant</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-white/50 uppercase tracking-wide">Event / Program Name</label>
                        <input className={ic} value={form.eventName} onChange={(e) => setForm((f) => ({ ...f, eventName: e.target.value }))} placeholder="e.g. RIFT Hackathon 2024, Web Dev Bootcamp" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-white/50 uppercase tracking-wide">Issue Date</label>
                        <input type="date" className={ic} value={form.issueDate} onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-white/50 uppercase tracking-wide">Status</label>
                        <select className={sc} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as AchievementCert["status"] }))}>
                          <option value="Active">Active</option>
                          <option value="Expired">Expired</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-white/50 uppercase tracking-wide">Notes (optional)</label>
                        <input className={ic} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="e.g. 1st Place, Team: TechBuilders" />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/80">
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : editingId ? "Update Certificate" : "Issue Certificate"}
                      </Button>
                      <Button variant="outline" className="border-white/10 text-white hover:bg-white/10" onClick={() => { setShowForm(false); setEditingId(null); }}>
                        Cancel
                      </Button>
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
              <select className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white text-sm" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="All">All types</option>
                {CERT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <Badge className="bg-white/10 text-white/60 border-white/10">{filtered.length} certificates</Badge>
            </div>

            {/* Certificate List */}
            {filtered.length === 0 ? (
              <Card className="border-white/10 bg-white/5 text-white">
                <CardContent className="py-16 text-center text-white/40">
                  <Award className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>{certs.length === 0 ? "No certificates issued yet. Click \"Issue Certificate\" to get started." : "No certificates match your search."}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((cert, i) => (
                  <motion.div key={cert.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card className="border-white/10 bg-white/5 text-white hover:bg-white/8 transition-colors">
                      <CardContent className="p-4 space-y-3">
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">{cert.name}</p>
                            <p className="text-xs text-white/50 mt-0.5 truncate">{cert.eventName}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => handleCopy(cert.certId)} className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors" title="Copy certificate ID">
                              {copiedId === cert.certId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => handleEdit(cert)} className="p-1.5 rounded text-white/40 hover:text-primary hover:bg-primary/10 transition-colors" title="Edit">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(cert.id)} disabled={deletingId === cert.id} className="p-1.5 rounded text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1.5">
                          <Badge className={certTypeColor(cert.certificateType)}>{cert.certificateType}</Badge>
                          <Badge className={cert.status === "Active" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20" : "bg-red-500/15 text-red-300 border-red-500/20"}>{cert.status}</Badge>
                          <Badge className="bg-white/10 text-white/50 border-white/10 text-xs">{cert.type}</Badge>
                        </div>

                        {/* Details */}
                        <div className="space-y-1 text-xs text-white/55">
                          <div className="flex items-center justify-between">
                            <span>Certificate ID</span>
                            <span className="font-mono text-white/80 font-medium">{cert.certId}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Issue Date</span>
                            <span className="text-white/70">{cert.issueDate ? new Date(cert.issueDate).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—"}</span>
                          </div>
                          {cert.notes && (
                            <div className="pt-1 border-t border-white/5 text-white/45 italic">{cert.notes}</div>
                          )}
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
