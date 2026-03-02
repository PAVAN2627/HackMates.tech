import { useState } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

interface VerificationData {
  id: string;
  name: string;
  type: "Employee" | "Intern";
  position: string;
  issueDate: string;
  validUntil?: string;
  status: "Active" | "Expired";
}

const Verify = () => {
  const [offerId, setOfferId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationData | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerId.trim()) return;

    setLoading(true);
    setResult(null);
    setNotFound(false);

    try {
      const q = query(
        collection(db, "verifications"),
        where("offerId", "==", offerId.trim().toUpperCase())
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        setResult({ id: doc.id, ...doc.data() } as VerificationData);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error("Error verifying:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img
          src="/verifybackground.png"
          alt="Verify Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10">
        <Navbar />
        <div className="container mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-12">
              <p className="font-mono text-sm text-primary mb-3">verify.authenticate()</p>
              <h1 className="text-4xl md:text-5xl font-bold font-display text-primary mb-4">
                Verify Offer Letter
              </h1>
              <p className="text-foreground font-bold">
                Enter the Offer Letter ID to verify authenticity
              </p>
            </div>

            {/* Search Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-elevated rounded-xl p-8 mb-8"
            >
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Offer Letter ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={offerId}
                      onChange={(e) => setOfferId(e.target.value.toUpperCase())}
                      placeholder="e.g., HM-EMP-2024-001"
                      className="w-full px-4 py-3 pl-12 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] font-mono text-sm transition-all uppercase"
                      required
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full gradient-primary text-primary-foreground font-mono text-sm py-3.5 rounded-lg hover:opacity-90 transition-opacity border-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Verify Now
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>

            {/* Result - Valid */}
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card-elevated rounded-xl p-8 border-2 border-green-500/50"
              >
                <div className="flex flex-col md:flex-row items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="flex-1 w-full">
                    <h3 className="text-xl font-bold text-green-500 mb-2 text-center md:text-left">Verified Successfully</h3>
                    <p className="text-sm text-muted-foreground mb-4 text-center md:text-left">
                      This offer letter is authentic and issued by HackMates.
                    </p>
                    
                    <div className="space-y-3 bg-secondary/50 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-sm text-muted-foreground">Name:</span>
                        <span className="text-sm font-semibold text-foreground">{result.name}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-sm text-muted-foreground">Type:</span>
                        <span className={`text-sm font-semibold px-2 py-0.5 rounded w-fit ${
                          result.type === "Employee" 
                            ? "bg-blue-500/20 text-blue-500" 
                            : "bg-purple-500/20 text-purple-500"
                        }`}>
                          {result.type}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-sm text-muted-foreground">Position:</span>
                        <span className="text-sm font-semibold text-foreground">{result.position}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-sm text-muted-foreground">Issue Date:</span>
                        <span className="text-sm font-semibold text-foreground">{result.issueDate}</span>
                      </div>
                      {result.validUntil && (
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                          <span className="text-sm text-muted-foreground">Valid Until:</span>
                          <span className="text-sm font-semibold text-foreground">{result.validUntil}</span>
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <span className={`text-sm font-semibold px-2 py-0.5 rounded w-fit ${
                          result.status === "Active" 
                            ? "bg-green-500/20 text-green-500" 
                            : "bg-red-500/20 text-red-500"
                        }`}>
                          {result.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Result - Not Found */}
            {notFound && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card-elevated rounded-xl p-8 border-2 border-red-500/50"
              >
                <div className="flex flex-col md:flex-row items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                    <XCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="flex-1 w-full">
                    <h3 className="text-xl font-bold text-red-500 mb-2 text-center md:text-left">Not Verified</h3>
                    <p className="text-sm text-muted-foreground mb-2 text-center md:text-left">
                      The offer letter ID you entered could not be verified.
                    </p>
                    <p className="text-sm text-muted-foreground text-center md:text-left">
                      Please check the ID and try again, or contact us at{" "}
                      <a href="mailto:hackmates.tech@gmail.com" className="text-primary hover:underline">
                        hackmates.tech@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Info Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 text-center"
            >
              <p className="text-foreground font-bold leading-relaxed">
                All offer letters issued by HackMates contain a unique verification ID.
                <br />
                If you have any questions, please contact us.
              </p>
            </motion.div>
          </motion.div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Verify;
