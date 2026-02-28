import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img
          src="/contactbackgrond.png"
          alt="Terms of Service Background"
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
              <p className="font-mono text-sm text-primary mb-3">legal.terms</p>
              <h1 className="text-4xl md:text-5xl font-bold font-display text-primary mb-4">
                Terms of Service
              </h1>
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="prose prose-lg max-w-none space-y-6">
              <section className="card-elevated rounded-xl p-6">
                <h2 className="text-2xl font-bold font-display text-foreground mb-4">Acceptance of Terms</h2>
                <p className="text-foreground/80 leading-relaxed">
                  By accessing and using HackMates services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section className="card-elevated rounded-xl p-6">
                <h2 className="text-2xl font-bold font-display text-foreground mb-4">Services Provided</h2>
                <p className="text-foreground/80 leading-relaxed mb-3">
                  HackMates provides:
                </p>
                <ul className="list-disc list-inside space-y-2 text-foreground/80">
                  <li>Pre-built academic projects with source code and documentation</li>
                  <li>Custom project development services</li>
                  <li>Technical mentorship and guidance</li>
                  <li>Project setup and implementation support</li>
                </ul>
              </section>

              <section className="card-elevated rounded-xl p-6">
                <h2 className="text-2xl font-bold font-display text-foreground mb-4">Project Delivery</h2>
                <ul className="list-disc list-inside space-y-2 text-foreground/80">
                  <li>Projects are delivered with complete source code and documentation</li>
                  <li>Delivery timelines are communicated upfront and may vary based on project complexity</li>
                  <li>We provide setup assistance and code walkthrough after delivery</li>
                  <li>Minor modifications and bug fixes are included in the initial delivery</li>
                </ul>
              </section>

              <section className="card-elevated rounded-xl p-6">
                <h2 className="text-2xl font-bold font-display text-foreground mb-4">Payment Terms</h2>
                <ul className="list-disc list-inside space-y-2 text-foreground/80">
                  <li>Payment terms are agreed upon before project commencement</li>
                  <li>Refunds are considered on a case-by-case basis</li>
                  <li>Pricing is communicated clearly before any commitment</li>
                </ul>
              </section>

              <section className="card-elevated rounded-xl p-6">
                <h2 className="text-2xl font-bold font-display text-foreground mb-4">Intellectual Property</h2>
                <p className="text-foreground/80 leading-relaxed">
                  Upon full payment, you receive the source code and rights to use the project for academic purposes. However, you may not resell or redistribute the project as your own product.
                </p>
              </section>

              <section className="card-elevated rounded-xl p-6">
                <h2 className="text-2xl font-bold font-display text-foreground mb-4">Academic Integrity</h2>
                <p className="text-foreground/80 leading-relaxed">
                  Our projects are meant to be learning tools and references. You are responsible for ensuring compliance with your institution's academic integrity policies. We encourage understanding and learning from the code rather than direct submission.
                </p>
              </section>

              <section className="card-elevated rounded-xl p-6">
                <h2 className="text-2xl font-bold font-display text-foreground mb-4">Limitation of Liability</h2>
                <p className="text-foreground/80 leading-relaxed">
                  HackMates is not liable for any indirect, incidental, or consequential damages arising from the use of our services. Our liability is limited to the amount paid for the specific service.
                </p>
              </section>

              <section className="card-elevated rounded-xl p-6">
                <h2 className="text-2xl font-bold font-display text-foreground mb-4">Contact</h2>
                <p className="text-foreground/80 leading-relaxed">
                  For questions about these Terms of Service, contact us at{" "}
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

export default TermsOfService;
