import { Calendar, AlertCircle } from "lucide-react";

export default function WeeklyPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Weekly Review
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Summarize logs by week, identify blockers, and prepare reflection submissions.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-900 text-zinc-450">
          <Calendar className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-200">
          Weekly Review System
        </h3>
        <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
          The weekly summary compiler will allow you to select a week range, auto-prefill highlights from your daily logs, edit accomplishments, and track team collaboration notes.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-150 dark:border-zinc-800">
            <AlertCircle className="h-4 w-4 text-indigo-500" />
            <span>Weekly reflection features planned for Sprint 4.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
