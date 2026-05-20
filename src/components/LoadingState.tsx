import React from "react";

interface LoadingStateProps {
  rows?: number;
  className?: string;
}

export default function LoadingState({ rows = 3, className = "" }: LoadingStateProps) {
  return (
    <div className={`space-y-4 animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div 
          key={i} 
          className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
          <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="flex items-center gap-2 pt-2">
            <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-5 w-14 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
