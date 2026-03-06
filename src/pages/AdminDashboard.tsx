import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit, LogOut, Loader2, CheckCircle, XCircle } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [entries, setEntries] = useState<VerificationEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    offerId: "",
    name: "",
    type: "Employee" as "Employee" | "Intern",
    position: "",
    issueDate: "",
    validUntil: "",
    status: "Active" as "Active" | "Expired" | "Completed",
  });

  // Check if running locally
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname === '';

  useEffect(() => {
    // Block access if not localhost
    if (!isLocalhost) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setLoading(false);
      if (user) {
        fetchEntries();
      }
    });
    return () => unsubscribe();
  }, [isLocalhost]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setLoginError(error.message || "Login failed");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setEntries([]);
  };

  const fetchEntries = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "verifications"));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VerificationEntry[];
      setEntries(data);
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        await updateDoc(doc(db, "verifications", editingId), formData);
      } else {
        await addDoc(collection(db, "verifications"), formData);
      }
      
      await fetchEntries();
      resetForm();
    } catch (error) {
      console.error("Error saving entry:", error);
      alert("Error saving entry");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (entry: VerificationEntry) => {
    setFormData({
      offerId: entry.offerId,
      name: entry.name,
      type: entry.type,
      position: entry.position,
      issueDate: entry.issueDate,
      validUntil: entry.validUntil || "",
      status: entry.status,
    });
    setEditingId(entry.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    
    try {
      await deleteDoc(doc(db, "verifications", id));
      await fetchEntries();
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      offerId: "",
      name: "",
      type: "Employee",
      position: "",
      issueDate: "",
      validUntil: "",
      status: "Active",
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Block access if not localhost
  if (!isLocalhost) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">
            This page is only accessible on localhost for security reasons.
          </p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-display text-foreground mb-2">
              Admin <span className="text-primary">Dashboard</span>
            </h1>
            <p className="text-sm text-muted-foreground">Login to manage verifications</p>
          </div>

          <form onSubmit={handleLogin} className="card-elevated rounded-xl p-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-primary transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-primary transition-all"
                required
              />
            </div>
            {loginError && (
              <p className="text-sm text-red-500">{loginError}</p>
            )}
            <button
              type="submit"
              className="w-full gradient-primary text-primary-foreground font-mono text-sm py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Login
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground">
              Admin <span className="text-primary">Dashboard</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage verification entries</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 gradient-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Add New
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-elevated rounded-xl p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-foreground mb-4">
              {editingId ? "Edit Entry" : "Add New Entry"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Offer Letter ID *</label>
                <input
                  type="text"
                  value={formData.offerId}
                  onChange={(e) => setFormData({ ...formData, offerId: e.target.value.toUpperCase() })}
                  placeholder="HM-EMP-2024-001"
                  className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-primary uppercase"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as "Employee" | "Intern" })}
                  className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="Employee">Employee</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Position *</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Issue Date *</label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Valid Until (Optional)</label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "Active" | "Expired" | "Completed" })}
                  className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 gradient-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {editingId ? "Update" : "Save"}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Entries List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">All Entries ({entries.length})</h2>
          {entries.length === 0 ? (
            <div className="card-elevated rounded-xl p-12 text-center">
              <p className="text-muted-foreground">No entries yet. Add your first verification entry.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="card-elevated rounded-xl p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-foreground">{entry.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          entry.type === "Employee" 
                            ? "bg-blue-500/20 text-blue-500" 
                            : "bg-purple-500/20 text-purple-500"
                        }`}>
                          {entry.type}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          entry.status === "Active" 
                            ? "bg-green-500/20 text-green-500" 
                            : entry.status === "Completed"
                            ? "bg-blue-500/20 text-blue-500"
                            : "bg-red-500/20 text-red-500"
                        }`}>
                          {entry.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <span className="font-mono text-primary">{entry.offerId}</span> • {entry.position}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Issued: {entry.issueDate}
                        {entry.validUntil && ` • Valid Until: ${entry.validUntil}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4 text-primary" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
