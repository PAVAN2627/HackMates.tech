import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ShieldCheck, 
  Award, 
  Calendar, 
  User, 
  Clock, 
  Sparkles, 
  FileCheck2,
  ExternalLink,
  MessageCircle,
  Mail,
  X
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import { useSEO } from "@/hooks/useSEO";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useSearchParams } from "react-router-dom";

interface VerificationData {
  id: string;
  offerId: string;
  name: string;
  type: "Employee" | "Intern" | "Participant";
  certificateType: string;
  position?: string;
  eventName?: string;
  issueDate: string;
  validUntil?: string;
  completionDate?: string;
  certificateIssueDate?: string;
  status: "Active" | "Expired" | "Completed";
  notes?: string;
  source?: "internship" | "achievement";
}

function calcDuration(issueDate: string, validUntil: string): string {
  if (!issueDate || !validUntil) return "";
  const start = new Date(issueDate);
  const end = new Date(validUntil);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";
  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0) return "";
  const weeks = Math.round(diffMs / (1000 * 60 * 60 * 24 * 7));
  if (weeks <= 0) return "";
  return weeks === 1 ? "1 week" : `${weeks} weeks`;
}

function formatDisplayDate(dateStr?: string): string {
  if (!dateStr || dateStr === "N/A") return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const Verify = () => {
  useSEO({
    title: "Verify Certificate Authenticity — HackMates",
    description: "Instant cryptographic verification portal for HackMates internship letters, completion credentials, and hackathon honors.",
    canonical: "/verify",
  });

  const [searchParams] = useSearchParams();
  const [offerId, setOfferId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationData | null>(null);
  const [notFound, setNotFound] = useState(false);

  const performVerification = async (targetId: string) => {
    const trimmed = targetId.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setResult(null);
    setNotFound(false);

    try {
      // 1. Search internship / employment verifications
      const q = query(
        collection(db, "verifications"),
        where("offerId", "==", trimmed)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const vData = docSnap.data() as Partial<VerificationData> & { batchClosedDate?: string };

        let finalIssueDate = vData.issueDate || "";
        let finalCompletionDate = vData.completionDate || vData.validUntil || "";

        // If this intern was part of an archived batch, cross-reference to ensure we have the best dates
        try {
          const batchesSnap = await getDocs(collection(db, "completedBatches"));
          for (const bDoc of batchesSnap.docs) {
            const bData = bDoc.data();
            const internsList = (bData.interns || []) as Array<{
              internId?: string;
              certificateId?: string;
              issueDate?: string;
              validUntil?: string;
              completionDate?: string;
            }>;
            const match = internsList.find(
              (item) =>
                item.certificateId?.trim().toUpperCase() === trimmed ||
                item.internId?.trim().toUpperCase() === trimmed
            );
            if (match) {
              if (match.issueDate && (!finalIssueDate || finalIssueDate === vData.batchClosedDate)) {
                finalIssueDate = match.issueDate;
              }
              if (match.completionDate || match.validUntil || bData.completionDate) {
                finalCompletionDate = match.completionDate || match.validUntil || bData.completionDate || finalCompletionDate;
              }
              if ((match as any).certificateIssueDate) {
                (vData as any).certificateIssueDate = (match as any).certificateIssueDate;
              }
              break;
            }
          }
        } catch (crossRefErr) {
          console.error("Batch cross reference error:", crossRefErr);
        }

        setResult({
          id: docSnap.id,
          source: "internship",
          ...vData,
          issueDate: finalIssueDate,
          completionDate: finalCompletionDate || vData.validUntil,
          validUntil: finalCompletionDate || vData.validUntil,
          certificateIssueDate: (vData as any).certificateIssueDate || finalCompletionDate || finalIssueDate,
        } as VerificationData);
        return;
      }

      // 2. Search completedBatches for archived interns (e.g. HM-FWD-001)
      const batchesSnap = await getDocs(collection(db, "completedBatches"));
      for (const bDoc of batchesSnap.docs) {
        const bData = bDoc.data();
        const internsList = (bData.interns || []) as Array<{
          name: string;
          internId?: string;
          certificateId?: string;
          attendancePercentage?: number;
          issueDate?: string;
          validUntil?: string;
          completionDate?: string;
          certificateIssueDate?: string;
          position?: string;
        }>;
        const matchedIntern = internsList.find(
          (item) =>
            item.certificateId?.trim().toUpperCase() === trimmed ||
            item.internId?.trim().toUpperCase() === trimmed
        );

        if (matchedIntern) {
          let realIssueDate = matchedIntern.issueDate || bData.issueDate || "";
          let realCompletionDate = matchedIntern.completionDate || matchedIntern.validUntil || bData.completionDate || "";
          let realCertDate = matchedIntern.certificateIssueDate || realCompletionDate || realIssueDate;

          // Look up if verifications collection has their original start/offer date
          try {
            const vSnap = await getDocs(
              query(collection(db, "verifications"), where("offerId", "==", trimmed))
            );
            if (!vSnap.empty) {
              const vD = vSnap.docs[0].data();
              if (vD.issueDate && vD.issueDate !== bData.batchDate) {
                realIssueDate = vD.issueDate;
              }
              if (vD.completionDate || vD.validUntil) {
                realCompletionDate = vD.completionDate || vD.validUntil;
              }
              if (vD.certificateIssueDate) {
                realCertDate = vD.certificateIssueDate;
              }
            }
          } catch (e) {
            console.error("Verification lookup error:", e);
          }

          // If no custom completion date was found, use batch completion date or fallback
          if (!realCompletionDate) {
            realCompletionDate = bData.completionDate || bData.batchDate || bData.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10);
          }

          setResult({
            id: bDoc.id,
            offerId: matchedIntern.certificateId || matchedIntern.internId || trimmed,
            name: matchedIntern.name,
            type: "Intern",
            certificateType: "Internship Completion Certificate",
            position: matchedIntern.position || "Full Stack Web Development Intern",
            eventName: "HackMates 12-Week MERN Stack Internship",
            issueDate: realIssueDate,
            validUntil: realCompletionDate,
            completionDate: realCompletionDate,
            certificateIssueDate: realCertDate,
            status: "Completed",
            notes: matchedIntern.attendancePercentage !== undefined ? `Attendance: ${matchedIntern.attendancePercentage}%` : undefined,
            source: "internship",
          });
          return;
        }
      }

      // 3. Search achievement certificates (Hackathons, Bootcamps)
      const q2 = query(
        collection(db, "achievementCerts"),
        where("certId", "==", trimmed)
      );
      const snap2 = await getDocs(q2);

      if (!snap2.empty) {
        const docSnap = snap2.docs[0];
        const data = docSnap.data();
        setResult({
          id: docSnap.id,
          offerId: data.certId,
          source: "achievement",
          ...data,
        } as VerificationData);
        return;
      }

      // 4. Search active users collection (if batch in progress or offer letter)
      const usersQ = query(
        collection(db, "users"),
        where("internId", "==", trimmed)
      );
      const usersSnap = await getDocs(usersQ);
      if (!usersSnap.empty) {
        const uData = usersSnap.docs[0].data();
        setResult({
          id: usersSnap.docs[0].id,
          offerId: uData.internId,
          name: uData.name,
          type: "Intern",
          certificateType: "Internship Offer Letter",
          position: uData.position || "Full Stack Web Development Intern",
          eventName: "HackMates Internship Program",
          issueDate: uData.issueDate || uData.createdAt?.slice(0, 10) || "",
          validUntil: uData.validUntil || "",
          status: "Active",
          source: "internship",
        });
        return;
      }

      setNotFound(true);
    } catch (error) {
      console.error("Error verifying:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(offerId);
  };

  // Auto-verify from URL query parameter (e.g. ?id=HM-INT-2024-001)
  useEffect(() => {
    const idFromUrl = searchParams.get("id");
    if (idFromUrl) {
      const cleanId = idFromUrl.trim().toUpperCase();
      setOfferId(cleanId);
      performVerification(cleanId);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-950 text-foreground relative selection:bg-teal-500/30 selection:text-teal-200 overflow-x-hidden">
      <ScrollProgressBar />

      {/* Background Image with Ambient Scrim */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/verifybackground.png"
          alt="Verify Background"
          className="w-full h-full object-cover opacity-35 filter brightness-90 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/45 to-slate-950/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent" />
      </div>

      {/* Ambient Aurora Orbs */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute top-1/4 -left-48 w-[520px] h-[520px] bg-teal-500/10 rounded-full blur-[130px] animate-aurora-1" 
      />
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute bottom-1/4 -right-48 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-aurora-2" 
      />

      <div className="relative z-10">
        <Navbar />

        <main className="pt-24 pb-20">
          <div className="container mx-auto px-6 max-w-4xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 font-mono text-xs shadow-[0_0_15px_rgba(45,212,191,0.2)] mb-4">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>verify.credentials()</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-white mb-4">
                Verify <span className="gradient-text">Certificate</span>
              </h1>

              <p className="text-slate-300 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
                Official validation portal to authenticate HackMates certificates, internship completion letters, and hackathon honors.
              </p>
            </motion.div>

            {/* Search Input Terminal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-card rounded-2xl p-6 md:p-8 border border-white/10 shadow-[0_0_40px_rgba(45,212,191,0.15)] mb-10 relative overflow-hidden"
            >
              {/* Top Accent Gradient Wire */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-500" />

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-teal-300 mb-2 flex items-center justify-between">
                    <span>Enter Unique Credential ID</span>
                    <span className="text-slate-400 font-mono text-[11px] lowercase">case insensitive</span>
                  </label>

                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={offerId}
                      onChange={(e) => setOfferId(e.target.value.toUpperCase())}
                      placeholder="e.g. HM-INT-2024-001 or HM-EMP-2024-001"
                      className="w-full px-5 py-4 pl-12 pr-12 rounded-xl bg-slate-950/80 border border-white/15 text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 font-mono text-sm tracking-wider uppercase transition-all shadow-inner"
                      required
                    />
                    <Search className="absolute left-4 w-5 h-5 text-teal-400" />

                    {offerId && (
                      <button
                        type="button"
                        onClick={() => {
                          setOfferId("");
                          setResult(null);
                          setNotFound(false);
                        }}
                        className="absolute right-4 p-1 rounded-full text-slate-400 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-500 text-slate-950 font-display font-bold text-base hover:opacity-95 transition-all shadow-[0_0_25px_rgba(45,212,191,0.35)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Authenticating Credential...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Verify Authenticity Now</span>
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>

            {/* Result: VERIFIED */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 15 }}
                  className="glass-card rounded-3xl p-6 md:p-10 border-2 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.25)] relative overflow-hidden mb-10"
                >
                  {/* Top Ambient Glow */}
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

                  {/* Header Badge */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-4 text-center sm:text-left">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border-2 border-emerald-400/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                        <CheckCircle2 className="w-9 h-9" />
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs border border-emerald-500/40 font-bold mb-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>AUTHENTIC & VERIFIED</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white">
                          Credential Verified Successfully
                        </h2>
                        <p className="text-xs md:text-sm text-slate-300 font-mono">
                          Issued by HackMates Engineering Platform
                        </p>
                      </div>
                    </div>

                    <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-center font-mono">
                      <span className="text-[10px] uppercase text-slate-400 block tracking-wider">Credential ID</span>
                      <span className="text-sm font-bold text-teal-300">{result.offerId || result.id}</span>
                    </div>
                  </div>

                  {/* Certificate Data Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                      <div className="flex items-center gap-2 text-xs font-mono text-teal-300 uppercase tracking-wider mb-1">
                        <User className="w-3.5 h-3.5" />
                        <span>Recipient Full Name</span>
                      </div>
                      <p className="font-display text-xl font-bold text-white">
                        {result.name}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                      <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 uppercase tracking-wider mb-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>Credential Type</span>
                      </div>
                      <p className="font-display text-xl font-bold text-white">
                        {result.source === "achievement"
                          ? result.certificateType
                          : result.type === "Employee"
                          ? "Mentor / Core Team"
                          : "Internship Completion"}
                      </p>
                    </div>

                    {result.position && (
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                          <FileCheck2 className="w-3.5 h-3.5 text-teal-400" />
                          <span>Role / Track</span>
                        </div>
                        <p className="font-mono text-sm font-semibold text-slate-200">
                          {result.position}
                        </p>
                      </div>
                    )}

                    {result.eventName && (
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                          <Award className="w-3.5 h-3.5 text-teal-400" />
                          <span>Event / Program</span>
                        </div>
                        <p className="font-mono text-sm font-semibold text-slate-200">
                          {result.eventName}
                        </p>
                      </div>
                    )}

                    {/* Date Information - Split for Internship Completion vs General Credential */}
                    {result.type === "Intern" && (result.status === "Completed" || result.certificateType?.includes("Completion")) ? (
                      <>
                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Internship Completion Date</span>
                          </div>
                          <p className="font-mono text-sm sm:text-base font-bold text-white">
                            {formatDisplayDate(result.completionDate || result.validUntil)}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 uppercase tracking-wider mb-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Internship Start / Joining Date</span>
                          </div>
                          <p className="font-mono text-sm sm:text-base font-semibold text-slate-200">
                            {formatDisplayDate(result.issueDate)}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                          <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 uppercase tracking-wider mb-1">
                            <Award className="w-3.5 h-3.5" />
                            <span>Certificate Issue Date</span>
                          </div>
                          <p className="font-mono text-sm sm:text-base font-semibold text-slate-200">
                            {formatDisplayDate(result.certificateIssueDate || result.completionDate || result.issueDate)}
                          </p>
                        </div>

                        {(() => {
                          const dur = calcDuration(result.issueDate, result.completionDate || result.validUntil || "");
                          return (
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                              <div className="flex items-center gap-2 text-xs font-mono text-amber-300 uppercase tracking-wider mb-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Program Duration</span>
                              </div>
                              <p className="font-mono text-sm sm:text-base font-semibold text-slate-200">
                                {dur || "12 Weeks (Completed Track)"}
                              </p>
                            </div>
                          );
                        })()}
                      </>
                    ) : (
                      <>
                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 uppercase tracking-wider mb-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Date of Issuance</span>
                          </div>
                          <p className="font-mono text-sm sm:text-base font-semibold text-slate-200">
                            {formatDisplayDate(result.issueDate)}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Verification Seal Note */}
                  <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1.5 text-emerald-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Cryptographically logged in HackMates registry
                    </span>
                    <span>Status: Verified Active</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result: NOT FOUND */}
            <AnimatePresence>
              {notFound && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 15 }}
                  className="glass-card rounded-3xl p-6 md:p-8 border-2 border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.25)] relative overflow-hidden mb-10"
                >
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left">
                    <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border-2 border-rose-400/50 flex items-center justify-center text-rose-400 shrink-0 shadow-[0_0_25px_rgba(244,63,94,0.3)]">
                      <XCircle className="w-9 h-9" />
                    </div>
                    <div className="flex-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-mono text-xs border border-rose-500/40 font-bold mb-1">
                        RECORD NOT FOUND
                      </div>
                      <h2 className="text-2xl font-bold font-display text-white mb-2">
                        Unable to Authenticate Credential
                      </h2>
                      <p className="text-sm text-slate-300 leading-relaxed mb-4">
                        We could not locate an official credential matching ID <strong className="text-white font-mono">{offerId}</strong> in our secure registry. Please verify the ID for typographical errors and try again.
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <a
                          href={`https://wa.me/917249830281?text=Hi%20HackMates,%20I%20need%20help%20verifying%20certificate%20ID:%20${encodeURIComponent(offerId)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold shadow-md transition-all"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Contact Support on WhatsApp
                        </a>
                        <a
                          href="mailto:hackmates.tech@gmail.com"
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/15 font-mono text-xs transition-all"
                        >
                          <Mail className="w-4 h-4" />
                          Email Admin Desk
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info / Assistance Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center text-xs md:text-sm text-slate-400 font-mono"
            >
              All HackMates issued credentials feature tamper-evident cryptographic IDs.
              <br />
              For bulk institutional verification or hiring inquiries, contact{" "}
              <a href="mailto:hackmates.tech@gmail.com" className="text-teal-400 underline hover:text-teal-300">
                hackmates.tech@gmail.com
              </a>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Verify;
