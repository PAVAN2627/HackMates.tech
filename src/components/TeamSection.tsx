import { motion } from "framer-motion";
import { Linkedin, Globe, Code2, Star, Award, Instagram } from "lucide-react";
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
    name: "Rahul Sharma",
    role: "Founder & Team Lead",
    bio: "Full-stack developer with a passion for building products that solve real problems. Founded HackMates to empower student innovators.",
    skills: ["React", "Node.js", "AWS", "TypeScript", "Python"],
    photo: teamMember1,
    isFounder: true,
    contributions: "15+ projects led",
    hackathons: 12,
    portfolio: "#",
    linkedin: "#",
    instagram: "#",
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
          className="max-w-3xl mx-auto mb-12"
        >
          <div
            className="card-elevated rounded-2xl overflow-hidden hover:border-glow transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedMember(founder)}
          >
            <div className="flex flex-col md:flex-row">
              <div className="relative md:w-1/3">
                <img src={founder.photo} alt={founder.name} className="w-full h-64 md:h-full object-cover" />
                <div className="absolute top-3 left-3">
                  <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-accent/90 text-accent-foreground flex items-center gap-1">
                    <Star className="w-3 h-3" /> Founder
                  </span>
                </div>
              </div>
              <div className="p-6 md:w-2/3 flex flex-col justify-center">
                <h3 className="font-display text-2xl font-bold text-foreground mb-1">{founder.name}</h3>
                <p className="font-mono text-sm text-primary mb-3">{founder.role}</p>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{founder.bio}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {founder.skills.map((skill) => (
                    <span key={skill} className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Code2 className="w-3.5 h-3.5" /> {founder.contributions}</span>
                  <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> {founder.hackathons} hackathons</span>
                </div>
                <div className="flex gap-3 mt-4">
                  {founder.portfolio && <a href={founder.portfolio} className="text-muted-foreground hover:text-primary transition-colors" aria-label="Portfolio"><Globe className="w-5 h-5" /></a>}
                  {founder.linkedin && <a href={founder.linkedin} className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn"><Linkedin className="w-5 h-5" /></a>}
                  {founder.instagram && <a href={founder.instagram} className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram"><Instagram className="w-5 h-5" /></a>}
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
            className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 25 }}
              className="card-elevated rounded-2xl max-w-lg w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-56">
                <img src={selectedMember.photo} alt={selectedMember.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                <button
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-card/80 flex items-center justify-center text-foreground hover:bg-card transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 -mt-12 relative z-10">
                {selectedMember.isFounder && (
                  <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-accent/20 text-accent inline-flex items-center gap-1 mb-2">
                    <Star className="w-3 h-3" /> Founder
                  </span>
                )}
                <h3 className="font-display text-2xl font-bold text-foreground">{selectedMember.name}</h3>
                <p className="font-mono text-sm text-primary mb-3">{selectedMember.role}</p>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{selectedMember.bio}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {selectedMember.skills.map((skill) => (
                    <span key={skill} className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4 pb-4 border-b border-border">
                  <span className="flex items-center gap-1"><Code2 className="w-3.5 h-3.5" /> {selectedMember.contributions}</span>
                  <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> {selectedMember.hackathons} hackathons</span>
                </div>
                <div className="flex gap-4">
                  {selectedMember.portfolio && (
                    <a href={selectedMember.portfolio} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Globe className="w-4 h-4" /> Portfolio
                    </a>
                  )}
                  {selectedMember.linkedin && (
                    <a href={selectedMember.linkedin} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Linkedin className="w-4 h-4" /> LinkedIn
                    </a>
                  )}
                  {selectedMember.instagram && (
                    <a href={selectedMember.instagram} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
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
