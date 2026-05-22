import React from "react";
import { LucideIcon, TrendingUp } from "lucide-react";

interface SummaryCardProps {
  name: string;
  value: string | number;
  change: string;
  icon: LucideIcon;
  colorClass: string;
  loading?: boolean;
}

export default function SummaryCard({
  name,
  value,
  change,
  icon: Icon,
  colorClass,
  loading = false,
}: SummaryCardProps) {
  if (loading) {
    return (
      <div
        className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm animate-pulse"
        data-testid="summary-card-skeleton"
      >
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-9 w-9 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-7 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
      </div>
    );
  }

  // Determine if it is an empty state representation (like N/A or 0 with fallback warnings)
  const isEmptyValue = value === "N/A" || value === "0" || value === 0;

  return (
    <div
      className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
      data-testid={`summary-card-${name.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 truncate">
            {name}
          </span>
          <div className={`p-2 rounded ${colorClass} transition-transform duration-300 group-hover:scale-115 shrink-0`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-4">
          <span
            className={`text-2xl font-bold tracking-tight block truncate ${
              isEmptyValue ? "text-zinc-400 dark:text-zinc-600" : "text-zinc-900 dark:text-zinc-50"
            }`}
            title={String(value)}
          >
            {value}
          </span>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
        <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 min-w-0">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
          <span className="truncate" title={change}>
            {change}
          </span>
        </p>
      </div>
    </div>
  );
}
