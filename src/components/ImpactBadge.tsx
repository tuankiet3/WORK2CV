import React from "react";
import { 
  type ImpactLevel, 
  IMPACT_LEVEL_LABELS 
} from "@/constants";
import { 
  GraduationCap, 
  Handshake, 
  CheckCircle2, 
  Search, 
  Wrench, 
  TrendingUp,
  HelpCircle
} from "lucide-react";

interface ImpactBadgeProps {
  impact: ImpactLevel;
  className?: string;
}

const config: Record<ImpactLevel, { icon: React.ComponentType<{ className?: string }>; classes: string }> = {
  learned: {
    icon: GraduationCap,
    classes: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800",
  },
  assisted: {
    icon: Handshake,
    classes: "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-900/40 dark:text-zinc-300 dark:border-zinc-800",
  },
  implemented: {
    icon: CheckCircle2,
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  },
  reviewed: {
    icon: Search,
    classes: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800",
  },
  fixed: {
    icon: Wrench,
    classes: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
  },
  improved: {
    icon: TrendingUp,
    classes: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  },
};

export default function ImpactBadge({ impact, className = "" }: ImpactBadgeProps) {
  const badgeConfig = config[impact] || {
    icon: HelpCircle,
    classes: "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800",
  };
  const Icon = badgeConfig.icon;
  const label = IMPACT_LEVEL_LABELS[impact] || impact;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors ${badgeConfig.classes} ${className}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>{label}</span>
    </span>
  );
}
