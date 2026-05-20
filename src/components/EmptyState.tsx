import React from "react";
import Link from "next/link";
import { FolderOpen, Plus } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export default function EmptyState({
  title = "No data found",
  description = "Get started by creating your first entry.",
  actionLabel,
  actionHref,
  icon: Icon = FolderOpen,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-12 text-center flex flex-col items-center justify-center ${className}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-200">
        {title}
      </h3>
      <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
        {description}
      </p>
      {actionLabel && actionHref && (
        <div className="mt-6">
          <Link
            href={actionHref}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="h-4 w-4" />
            {actionLabel}
          </Link>
        </div>
      )}
    </div>
  );
}
