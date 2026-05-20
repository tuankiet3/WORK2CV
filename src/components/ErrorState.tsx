import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({
  title = "Something went wrong",
  description = "We encountered an error loading your data. Please check your connection and try again.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/10 p-8 text-center flex flex-col items-center justify-center ${className}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-rose-900 dark:text-rose-200">
        {title}
      </h3>
      <p className="mt-1.5 text-xs text-rose-700 dark:text-rose-400 max-w-sm">
        {description}
      </p>
      {onRetry && (
        <div className="mt-6">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-700 dark:text-rose-300 hover:text-white bg-rose-100 hover:bg-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900 rounded-lg shadow-xs border border-rose-200 dark:border-rose-800 transition-all duration-200 cursor-pointer active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Request
          </button>
        </div>
      )}
    </div>
  );
}
