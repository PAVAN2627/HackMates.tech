import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  LogOut,
  BarChart3,
  FileText,
  Users2,
  MessageSquare,
  Send,
  Star,
  BookOpen,
  ClipboardCheck,
  BadgeCheck,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  section?: string;
}

interface DashboardSidebarProps {
  role: "Admin" | "Mentor" | "Intern";
  userName: string;
  onLogout: () => void | Promise<void>;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const adminNavItems: NavItem[] = [
     { id: "overview", label: "Dashboard", icon: Home, path: "/admin" },
     { id: "users", label: "Users", icon: Users2, path: "/admin/users" },
     { id: "feedback", label: "Feedback", icon: Star, path: "/admin/feedback" },
     { id: "doubts", label: "Doubts", icon: MessageSquare, path: "/admin/doubts" },
     { id: "notes", label: "Notes", icon: BookOpen, path: "/admin/notes" },
     { id: "submissions", label: "Submissions", icon: Send, path: "/admin/submissions" },
  { id: "attendance", label: "Attendance", icon: ClipboardCheck, path: "/admin/attendance" },
   ];

const mentorNavItems: NavItem[] = [
  { id: "overview", label: "Overview", icon: Home, section: "overview" },
  { id: "doubts", label: "Doubts", icon: MessageSquare, section: "doubts" },
  { id: "submissions", label: "Submissions", icon: Send, section: "submissions" },
  { id: "feedback", label: "Feedback", icon: Star, section: "feedback" },
  { id: "notes", label: "Daily Notes", icon: BookOpen, section: "notes" },
  { id: "attendance", label: "Attendance", icon: ClipboardCheck, section: "attendance" },
];

const internNavItems: NavItem[] = [
  { id: "overview", label: "Overview", icon: Home, section: "overview" },
  { id: "performance", label: "Performance", icon: BarChart3, section: "performance" },
  { id: "fees", label: "Fees", icon: FileText, section: "fees" },
  { id: "doubts", label: "Doubts", icon: MessageSquare, section: "doubts" },
  { id: "submissions", label: "Submissions", icon: Send, section: "submissions" },
  { id: "feedback", label: "Feedback", icon: Star, section: "feedback" },
  { id: "notes", label: "Notes", icon: BookOpen, section: "notes" },
  { id: "attendance", label: "Attendance", icon: ClipboardCheck, section: "attendance" },
];

export default function DashboardSidebar({
  role,
  userName,
  onLogout,
  activeSection,
  onSectionChange,
}: DashboardSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const navItems =
    role === "Admin" ? adminNavItems : role === "Mentor" ? mentorNavItems : internNavItems;

  const roleColor = {
    Admin: "bg-red-500/10 text-red-600",
    Mentor: "bg-blue-500/10 text-blue-600",
    Intern: "bg-green-500/10 text-green-600",
  };

  const handleNavClick = (item: NavItem) => {
    if (item.path) {
      navigate(item.path);
    } else {
      onSectionChange(item.section || item.id);
    }
    setIsOpen(false);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await onLogout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [isOpen]);

  return (
    <>
      <div className="hidden lg:block w-64 shrink-0" />

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-slate-950/90 border-white/15 text-white hover:bg-slate-900 shadow-lg"
        >
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isMobile ? (isOpen ? 0 : -300) : 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="fixed left-0 top-0 h-screen w-64 bg-slate-950 border-r border-white/10 z-40 lg:fixed lg:left-0 lg:top-0 lg:translate-x-0 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/hackmatesroundlogo.png"
                alt="HackMates"
                className="w-9 h-9 rounded-full object-cover shrink-0"
              />
              <div className="min-w-0">
                <h2 className="font-bold text-white leading-tight">Hack<span className="text-primary">Mates</span></h2>
                <p className="text-xs text-white/50 leading-tight">Platform</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="lg:hidden shrink-0 text-white/80 hover:text-white hover:bg-white/10"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-white/10">
          <div className="space-y-2">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium ${roleColor[role]}`}>
              <div className="w-2 h-2 rounded-full bg-current" />
              {role}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeSection === (item.section || item.id)
                  ? "bg-primary/20 text-primary"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/10">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-2 border-red-400/40 bg-red-500/10 text-red-200 hover:bg-red-500/20 hover:text-red-100"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
