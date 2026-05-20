import { Briefcase, AlertCircle } from "lucide-react";

export default function CvBuilderPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          CV Builder
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Turn work log items into professionally-worded CV accomplishments offline.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-900 text-zinc-400">
          <Briefcase className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-200">
          Offline CV Generator
        </h3>
        <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
          The offline template engine will map task types and impact levels to precise action verbs (e.g. implemented, optimized, debugged) and format bullet points into Concise CV, Detailed CV, and Internship Report formats.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <AlertCircle className="h-4 w-4 text-indigo-500" />
            <span>CV generation logic planned for Sprint 5.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
