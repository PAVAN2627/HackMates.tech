import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img
          src="/contactbackgrond.png"
          alt="Privacy Policy Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10">
        <Navbar />
        <div className="container mx-auto px-6 py-24 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <p className="font-mono text-sm text-primary mb-3">legal.privacy</p>
              <h1 className="text-4xl md:text-5xl font-bold font-display text-primary mb-4">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="prose prose-lg max-w-none space-y-6">
              <section className="card-elevated rounded-xl p-6">
                <h2 className="text-2xl font-bold font-display text-foreground mb-4">Information We Collect</h2>
                <p className="text-foreground/80 leading-relaxed">
                  We collect information you provide directly to us when you contact us through our website, including your name, email address, and any messages you send. We use this information solely to respond to your inquiries and provide our services.
                </p>
              </section>

              <section className="card-elevated rounded-xl p-6">
                <h2 className="text-2xl font-bold font-display text-foreground mb-4">How We Use Your Information</h2>
                <ul className="list-disc list-inside space-y-2 text-foreground/80">
                  <li>To respond to your inquiries and provide customer support</li>
                  <li>To deliver projects and services you've requested</li>
                  <li>To send project updates and important notifications</li>
                  <li>To improve our services and user experience</li>
                </ul>
              </section>

              <section className="card-elevated rounded-xl p-6">
                <h2 className="text-2xl font-bold font-display text-foreground mb-4">Data Security</h2>
                <p className="text-foreground/80 leading-relaxed">
                  We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section className="card-elevated rounded-xl p-6">
                <h2 className="text-2xl font-bold font-display text-foreground mb-4">Third-Party Services</h2>
                <p className="text-foreground/80 leading-relaxed">
                  We may use third-party services (like email providers) to facilitate our services. These third parties have access to your information only to perform specific tasks on our behalf and are obligated to protect it.
                </p>
              </section>

              <section className="card-elevated rounded-xl p-6">
                <h2 className="text-2xl font-bold font-display text-foreground mb-4">Your Rights</h2>
                <p className="text-foreground/80 leading-relaxed mb-3">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-foreground/80">
                  <li>Access the personal information we hold about you</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Opt-out of marketing communications</li>
                </ul>
              </section>

              <section className="card-elevated rounded-xl p-6">
                <h2 className="text-2xl font-bold font-display text-foreground mb-4">Contact Us</h2>
                <p className="text-foreground/80 leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at{" "}
                  <a href="mailto:hackmates.tech@gmail.com" className="text-primary hover:underline">
                    hackmates.tech@gmail.com
                  </a>
                </p>
              </section>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default PrivacyPolicy;
