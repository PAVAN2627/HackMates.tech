import { motion } from "framer-motion";
import { Trophy, Lightbulb, Users, Code, Rocket, GraduationCap } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 particles-bg opacity-30 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="font-mono text-sm text-primary mb-3">about.init()</p>
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">
            Who <span className="gradient-text">We Are</span>
          </h2>
        </motion.div>

        {/* Main About Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 mb-8">
              <img 
                src="/hackmatesroundlogo.png" 
                alt="HackMates Logo" 
                className="w-28 h-20 rounded-full shadow-lg object-cover"
              />
              <div>
                <h3 className="text-2xl font-bold font-display">
                  Hack<span className="text-primary">Mates</span>
                </h3>
                <p className="text-sm text-muted-foreground font-mono">Student Innovation Team</p>
              </div>
            </div>

            <p className="text-lg text-foreground leading-relaxed">
              HackMates is a passionate team of student developers who live and breathe hackathons. 
              We don't just participate—we <span className="text-primary font-semibold">play, learn, win, and build</span> innovative solutions 
              that make a difference.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              Born from the competitive spirit of hackathons, we've evolved into a platform that empowers 
              students with pre-built projects, custom development solutions, and mentorship to help them 
              succeed in their academic and professional journey.
            </p>

            <div className="flex flex-wrap gap-3 pt-4">
              {["Hackathons", "Innovation", "Learning", "Building"].map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-mono border border-primary/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { icon: Trophy, title: "Compete", desc: "Win hackathons together" },
              { icon: Lightbulb, title: "Innovate", desc: "Build new solutions" },
              { icon: Users, title: "Collaborate", desc: "Team-based learning" },
              { icon: Code, title: "Develop", desc: "Real-world projects" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-elevated rounded-xl p-6 hover:scale-105 transition-transform"
              >
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h4 className="font-display font-semibold text-foreground mb-2">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* What We Offer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold font-display text-center mb-12">
            What We <span className="gradient-text">Offer</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Rocket,
                title: "Pre-Built Projects",
                desc: "Ready-to-use projects for students at affordable rates. Perfect for learning, submissions, or quick deployment.",
                features: ["Fully documented", "Source code included", "Student-friendly pricing"],
              },
              {
                icon: Code,
                title: "Custom Development",
                desc: "Need something unique? We build custom solutions tailored to your specific requirements and vision.",
                features: ["Tailored solutions", "Modern tech stack", "Ongoing support"],
              },
              {
                icon: GraduationCap,
                title: "Mentorship & Guidance",
                desc: "Learn from experienced hackathon winners. Get guidance on projects, hackathons, and career growth.",
                features: ["1-on-1 mentoring", "Hackathon prep", "Career guidance"],
              },
            ].map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="card-elevated rounded-xl p-8 hover:shadow-2xl transition-all group"
              >
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <service.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h4 className="text-xl font-bold font-display text-foreground mb-3">{service.title}</h4>
                <p className="text-muted-foreground mb-6 leading-relaxed">{service.desc}</p>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-block card-elevated rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold font-display mb-4">
              Ready to <span className="gradient-text">Build Together?</span>
            </h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Whether you need a project, want custom development, or seek mentorship—we're here to help you succeed.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="#projects"
                className="gradient-primary text-primary-foreground font-mono text-sm px-8 py-3.5 rounded-lg hover:opacity-90 transition-all border-glow hover-scale"
              >
                Browse Projects →
              </a>
              <a
                href="#contact"
                className="border border-primary/50 text-primary font-mono text-sm px-8 py-3.5 rounded-lg hover:bg-primary/10 transition-all hover-scale"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
