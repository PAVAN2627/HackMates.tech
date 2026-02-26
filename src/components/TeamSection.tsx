import { motion } from "framer-motion";
import { Linkedin, Globe, Code2, Star, Award, Instagram, X } from "lucide-react";
import { useState } from "react";
import teamMember1 from "@/assets/team-member-1.jpg";
import teamMember2 from "@/assets/team-member-2.jpg";
import teamMember3 from "@/assets/team-member-3.jpg";
import teamMember4 from "@/assets/team-member-4.jpg";
import teamMember5 from "@/assets/team-member-5.jpg";
import teamMember6 from "@/assets/team-member-6.jpg";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  skills: string[];
  photo: string;
  isFounder: boolean;
  contributions: string;
  hackathons: number;
  linkedin?: string;
  portfolio?: string;
  instagram?: string;
}

const team: TeamMember[] = [
  {
    name: "Pavan Mali",
    role: "Founder & Team Lead",
    bio: "Full-Stack & DevOps Engineer passionate about building scalable, production-ready applications. Experienced in designing REST APIs, deploying cloud-native systems, and implementing CI/CD pipelines. Strong focus on performance, automation, and real-world problem solving.",
    skills: ["React", "Node.js", "TypeScript", "Python", "AWS", "Docker", "MySQL", "CI/CD"],
    photo: "/Pavan/ProffesionalPhoto.jpeg",
    isFounder: true,
    contributions: "15+ Projects Built & Deployed",
    hackathons: 12,
    portfolio: "https://pavanmaliportfolio.vercel.app/",
    linkedin: "https://www.linkedin.com/in/pavan-mali-1808b6273/",
    instagram: "https://www.instagram.com/its_me_pavanmali",
  },
  {
    name: "Priya Patel",
    role: "AI/ML Developer",
    bio: "Specializes in computer vision and NLP. Built multiple AI solutions that won hackathon awards.",
    skills: ["Python", "TensorFlow", "OpenCV", "PyTorch", "NLP"],
    photo: teamMember2,
    isFounder: false,
    contributions: "8+ AI models",
    hackathons: 9,
    portfolio: "#",
    linkedin: "#",
    instagram: "#",
  },
  {
    name: "Arjun Mehta",
    role: "Backend Architect",
    bio: "Database wizard who designs scalable systems. Loves optimizing performance and building robust APIs.",
    skills: ["Django", "PostgreSQL", "Docker", "Redis", "GraphQL"],
    photo: teamMember3,
    isFounder: false,
    contributions: "10+ APIs built",
    hackathons: 8,
    portfolio: "#",
    linkedin: "#",
    instagram: "#",
  },
  {
    name: "Sneha Reddy",
    role: "UI/UX Designer & Frontend",
    bio: "Creates intuitive, beautiful interfaces. Bridges the gap between design thinking and development.",
    skills: ["Figma", "React", "Tailwind", "Framer Motion", "UX Research"],
    photo: teamMember4,
    isFounder: false,
    contributions: "12+ designs shipped",
    hackathons: 7,
    portfolio: "#",
    linkedin: "#",
    instagram: "#",
  },
  {
    name: "Vikram Singh",
    role: "Cloud & DevOps Engineer",
    bio: "Infrastructure specialist who ensures our projects scale smoothly. CI/CD pipeline enthusiast.",
    skills: ["AWS", "Kubernetes", "Terraform", "CI/CD", "Linux"],
    photo: teamMember5,
    isFounder: false,
    contributions: "6+ infra setups",
    hackathons: 6,
    portfolio: "#",
    linkedin: "#",
    instagram: "#",
  },
  {
    name: "Ananya Joshi",
    role: "Data Scientist",
    bio: "Turns raw data into actionable insights. Passionate about statistical modeling and visualization.",
    skills: ["Python", "Pandas", "SQL", "Tableau", "scikit-learn"],
    photo: teamMember6,
    isFounder: false,
    contributions: "5+ data pipelines",
    hackathons: 5,
    portfolio: "#",
    linkedin: "#",
    instagram: "#",
  },
];

const TeamSection = () => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const founder = team.find((m) => m.isFounder)!;
  const others = team.filter((m) => !m.isFounder);

  return (
    <section id="team" className="py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="font-mono text-sm text-primary mb-3">team.members</p>
          <h2 className="text-4xl md:text-5xl font-bold font-display">
            Meet the <span className="gradient-text">Builders</span>
          </h2>
        </motion.div>

        {/* Founder - Featured Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-12"
        >
          <div
            className="card-elevated rounded-2xl overflow-hidden hover:border-glow transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedMember(founder)}
          >
            <div className="flex flex-col md:flex-row">
              <div className="relative md:w-2/5 flex items-center justify-center bg-muted/20">
                <img src={founder.photo} alt={founder.name} className="w-full h-80 md:h-auto md:max-h-[500px] object-contain" />
                <div className="absolute top-3 left-3">
                  <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-accent/90 text-accent-foreground flex items-center gap-1">
                    <Star className="w-3 h-3" /> Founder
                  </span>
                </div>
              </div>
              <div className="p-8 md:w-3/5 flex flex-col justify-center">
                <h3 className="font-display text-3xl font-bold text-foreground mb-2">{founder.name}</h3>
                <p className="font-mono text-sm text-primary mb-4">{founder.role}</p>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{founder.bio}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {founder.skills.map((skill) => (
                    <span key={skill} className="font-mono text-[11px] px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5"><Code2 className="w-4 h-4" /> {founder.contributions}</span>
                  <span className="flex items-center gap-1.5"><Award className="w-4 h-4" /> {founder.hackathons} hackathons</span>
                </div>
                <div className="flex gap-4 mt-2">
                  {founder.portfolio && <a href={founder.portfolio} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Portfolio"><Globe className="w-6 h-6" /></a>}
                  {founder.linkedin && <a href={founder.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn"><Linkedin className="w-6 h-6" /></a>}
                  {founder.instagram && <a href={founder.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram"><Instagram className="w-6 h-6" /></a>}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Other Members */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {others.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              onClick={() => setSelectedMember(member)}
              className="card-elevated rounded-xl overflow-hidden cursor-pointer hover:border-glow transition-all duration-300"
            >
              <div className="relative h-48">
                <img src={member.photo} alt={member.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              </div>
              <div className="p-5 -mt-8 relative z-10">
                <h3 className="font-display font-semibold text-foreground">{member.name}</h3>
                <p className="font-mono text-xs text-accent mb-3">{member.role}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {member.skills.slice(0, 3).map((skill) => (
                    <span key={skill} className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {skill}
                    </span>
                  ))}
                  {member.skills.length > 3 && (
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      +{member.skills.length - 3}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-mono text-[10px]">{member.contributions}</span>
                  <div className="flex gap-2">
                    {member.portfolio && <Globe className="w-3.5 h-3.5 hover:text-primary transition-colors" />}
                    {member.linkedin && <Linkedin className="w-3.5 h-3.5 hover:text-primary transition-colors" />}
                    {member.instagram && <Instagram className="w-3.5 h-3.5 hover:text-primary transition-colors" />}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Member Detail Modal */}
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-card/90 backdrop-blur-md rounded-3xl max-w-xl w-full overflow-hidden border border-border/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-80 flex items-center justify-center bg-muted/20">
                <img src={selectedMember.photo} alt={selectedMember.name} className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card/80" />
                <button
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/40 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                {selectedMember.isFounder && (
                  <div className="absolute top-6 left-6">
                    <span className="font-mono text-xs px-3 py-1.5 rounded-full bg-accent text-accent-foreground inline-flex items-center gap-1.5 shadow-lg">
                      <Star className="w-3.5 h-3.5" /> Founder
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6 -mt-12 relative z-10">
                <h3 className="font-display text-3xl font-bold text-foreground mb-1">{selectedMember.name}</h3>
                <p className="text-primary text-base mb-4">{selectedMember.role}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{selectedMember.bio}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedMember.skills.map((skill) => (
                    <span key={skill} className="font-mono text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4 pb-4 border-b border-border/50">
                  <span className="flex items-center gap-2"><Code2 className="w-4 h-4" /> {selectedMember.contributions}</span>
                  <span className="flex items-center gap-2"><Award className="w-4 h-4" /> {selectedMember.hackathons} hackathons</span>
                </div>
                <div className="flex gap-6">
                  {selectedMember.portfolio && (
                    <a href={selectedMember.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Globe className="w-4 h-4" /> Portfolio
                    </a>
                  )}
                  {selectedMember.linkedin && (
                    <a href={selectedMember.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Linkedin className="w-4 h-4" /> LinkedIn
                    </a>
                  )}
                  {selectedMember.instagram && (
                    <a href={selectedMember.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Instagram className="w-4 h-4" /> Instagram
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default TeamSection;
