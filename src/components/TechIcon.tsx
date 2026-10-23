import React from "react";
import { 
  Code2, 
  Terminal, 
  Cpu, 
  Layers, 
  Database, 
  Sparkles, 
  Flame, 
  GitBranch, 
  Boxes, 
  Server, 
  Workflow, 
  Globe, 
  Cloud, 
  ShieldCheck, 
  FileCode,
  Zap,
  Activity
} from "lucide-react";

interface TechIconProps {
  name: string;
  className?: string;
}

export const getTechColor = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes("react")) return "text-cyan-400";
  if (lower.includes("next")) return "text-white";
  if (lower.includes("type") || lower.includes("ts")) return "text-blue-400";
  if (lower.includes("python")) return "text-amber-400";
  if (lower.includes("node")) return "text-emerald-400";
  if (lower.includes("dock") || lower.includes("kube")) return "text-sky-400";
  if (lower.includes("aws") || lower.includes("cloud")) return "text-orange-400";
  if (lower.includes("fire")) return "text-amber-500";
  if (lower.includes("supa")) return "text-emerald-400";
  if (lower.includes("sql") || lower.includes("mongo") || lower.includes("data")) return "text-indigo-400";
  if (lower.includes("ai") || lower.includes("tensor") || lower.includes("torch") || lower.includes("gemini") || lower.includes("spacy")) return "text-teal-400";
  if (lower.includes("php")) return "text-violet-400";
  if (lower.includes("tail") || lower.includes("css")) return "text-cyan-300";
  if (lower.includes("boot")) return "text-purple-400";
  if (lower.includes("git")) return "text-rose-400";
  return "text-teal-400";
};

export const TechIcon: React.FC<TechIconProps> = ({ name, className = "w-3.5 h-3.5" }) => {
  const lower = name.toLowerCase();

  if (lower.includes("react")) return <Code2 className={`${className} text-cyan-400`} />;
  if (lower.includes("next")) return <Workflow className={`${className} text-white`} />;
  if (lower.includes("type") || lower.includes("ts") || lower.includes("java")) return <Terminal className={`${className} text-blue-400`} />;
  if (lower.includes("python")) return <Cpu className={`${className} text-amber-400`} />;
  if (lower.includes("node") || lower.includes("express")) return <Server className={`${className} text-emerald-400`} />;
  if (lower.includes("dock") || lower.includes("kube")) return <Boxes className={`${className} text-sky-400`} />;
  if (lower.includes("aws") || lower.includes("cloud")) return <Cloud className={`${className} text-orange-400`} />;
  if (lower.includes("fire")) return <Flame className={`${className} text-amber-500`} />;
  if (lower.includes("supa")) return <Zap className={`${className} text-emerald-400`} />;
  if (lower.includes("sql") || lower.includes("mongo") || lower.includes("data")) return <Database className={`${className} text-indigo-400`} />;
  if (lower.includes("ai") || lower.includes("tensor") || lower.includes("torch") || lower.includes("gemini") || lower.includes("spacy") || lower.includes("learn")) {
    return <Sparkles className={`${className} text-teal-400`} />;
  }
  if (lower.includes("php")) return <Globe className={`${className} text-violet-400`} />;
  if (lower.includes("tail") || lower.includes("css") || lower.includes("boot") || lower.includes("html")) return <Layers className={`${className} text-cyan-300`} />;
  if (lower.includes("git") || lower.includes("ci/cd")) return <GitBranch className={`${className} text-rose-400`} />;
  if (lower.includes("api") || lower.includes("jwt") || lower.includes("auth")) return <ShieldCheck className={`${className} text-teal-300`} />;

  return <Activity className={`${className} text-teal-400`} />;
};

export const TechBadge: React.FC<{ name: string; size?: "sm" | "md" }> = ({ name, size = "sm" }) => {
  const isSm = size === "sm";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] border border-white/10 hover:border-teal-400/40 hover:bg-white/[0.08] transition-colors font-mono cursor-default ${
        isSm ? "text-[11px] px-2.5 py-1 text-slate-200" : "text-xs px-3 py-1.5 text-white"
      }`}
    >
      <TechIcon name={name} className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span>{name}</span>
    </span>
  );
};

export default TechIcon;
