import React from "react";
import { 
  type TaskType, 
  TASK_TYPE_LABELS 
} from "@/constants";
import { 
  Award, 
  Sparkles, 
  Bug, 
  CheckSquare, 
  RefreshCw, 
  Eye, 
  FileText, 
  Users, 
  Search, 
  LifeBuoy,
  HelpCircle
} from "lucide-react";

interface TaskTypeBadgeProps {
  type: TaskType;
  className?: string;
}

const config: Record<TaskType, { icon: React.ComponentType<{ className?: string }>; classes: string }> = {
  onboarding: {
    icon: Award,
    classes: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  },
  feature: {
    icon: Sparkles,
    classes: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800",
  },
  bugfix: {
    icon: Bug,
    classes: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
  },
  testing: {
    icon: CheckSquare,
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  },
  refactor: {
    icon: RefreshCw,
    classes: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
  },
  code_review: {
    icon: Eye,
    classes: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-950/40 dark:text-fuchsia-300 dark:border-fuchsia-800",
  },
  documentation: {
    icon: FileText,
    classes: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
  },
  meeting: {
    icon: Users,
    classes: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  },
  research: {
    icon: Search,
    classes: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800",
  },
  support: {
    icon: LifeBuoy,
    classes: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
  },
};

export default function TaskTypeBadge({ type, className = "" }: TaskTypeBadgeProps) {
  const badgeConfig = config[type] || {
    icon: HelpCircle,
    classes: "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800",
  };
  const Icon = badgeConfig.icon;
  const label = TASK_TYPE_LABELS[type] || type;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors ${badgeConfig.classes} ${className}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>{label}</span>
    </span>
  );
}
