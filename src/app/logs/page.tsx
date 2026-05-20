import Link from "next/link";
import { FileText, Plus, AlertCircle } from "lucide-react";

export default function LogsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Work Logs
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Browse, filter, and search through your daily internship work logs.
          </p>
        </div>
        <div>
          <Link
            href="/logs/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Work Log
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-900 text-zinc-450">
          <FileText className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-200">
          No Work Logs Available
        </h3>
        <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
          Database synchronization is currently being set up. Soon, you will be able to search and filter your logs by date range, task type, impact level, and technology tags.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-150 dark:border-zinc-800">
            <AlertCircle className="h-4 w-4 text-indigo-500" />
            <span>Database schema will be initialized in Sprint 1.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
