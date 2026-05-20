"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  FileText, 
  Plus, 
  Link as LinkIcon, 
  Calendar 
} from "lucide-react";
import TaskTypeBadge from "@/components/TaskTypeBadge";
import ImpactBadge from "@/components/ImpactBadge";
import TagBadge from "@/components/TagBadge";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { type TaskType, type ImpactLevel, type TagCategory } from "@/constants";

interface Tag {
  id: string;
  name: string;
  category: TagCategory;
}

interface WorkLog {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string | null;
  taskType: TaskType;
  impactLevel: ImpactLevel;
  links: string[];
  tags: Tag[];
}

function formatDate(dateStr: string) {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function LogsPage() {
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    // Force async execution of state updates to prevent synchronous setState in useEffect
    await Promise.resolve();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/logs");
      if (!res.ok) {
        throw new Error(`Failed to fetch logs (Status: ${res.status})`);
      }
      const json = await res.json();
      if (json.error) {
        throw new Error(json.error.message || "An error occurred fetching logs.");
      }
      setLogs(json.data || []);
    } catch (err: unknown) {
      console.error("Error fetching logs:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred while loading work logs.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Work Logs
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
            Browse and review your daily internship work logs.
          </p>
        </div>
        <div>
          <Link
            href="/logs/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-lg shadow-md hover:shadow-indigo-200 dark:hover:shadow-none transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Work Log
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <LoadingState rows={4} />
      ) : error ? (
        <ErrorState onRetry={fetchLogs} description={error} />
      ) : logs.length === 0 ? (
        <EmptyState
          title="No Work Logs Found"
          description="You haven't recorded any daily work logs yet. Add a log to start tracking your tasks, learnings, and achievements."
          actionLabel="Add Work Log"
          actionHref="/logs/new"
          icon={FileText}
        />
      ) : (
        <div className="space-y-6">
          {/* Mobile view: Stacked Cards */}
          <div className="block md:hidden space-y-4">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 shadow-xs transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-2.5">
                  <span className="font-medium flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(log.date)}
                  </span>
                  {log.links && log.links.length > 0 && (
                    <span className="inline-flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded text-xs">
                      <LinkIcon className="h-3 w-3" />
                      {log.links.length}
                    </span>
                  )}
                </div>
                
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
                  {log.title}
                </h3>
                
                <div className="flex flex-wrap gap-2 mt-3.5">
                  <TaskTypeBadge type={log.taskType} />
                  <ImpactBadge impact={log.impactLevel} />
                </div>

                {log.tags && log.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    {log.tags.map((t) => (
                      <TagBadge key={t.id} name={t.name} category={t.category} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop view: Dense, Clean Table */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-left text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-900 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-medium">Date</th>
                    <th scope="col" className="px-6 py-4 font-medium">Title</th>
                    <th scope="col" className="px-6 py-4 font-medium">Task Type</th>
                    <th scope="col" className="px-6 py-4 font-medium">Impact</th>
                    <th scope="col" className="px-6 py-4 font-medium">Tags</th>
                    <th scope="col" className="px-6 py-4 font-medium text-center">Links</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-transparent">
                  {logs.map((log) => (
                    <tr 
                      key={log.id}
                      className="transition-colors duration-150"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-zinc-500 dark:text-zinc-400 font-medium">
                        {formatDate(log.date)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                          {log.title}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <TaskTypeBadge type={log.taskType} />
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <ImpactBadge impact={log.impactLevel} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {log.tags && log.tags.length > 0 ? (
                            log.tags.map((t) => (
                              <TagBadge key={t.id} name={t.name} category={t.category} />
                            ))
                          ) : (
                            <span className="text-xs text-zinc-400 dark:text-zinc-500 italic">No tags</span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center">
                        {log.links && log.links.length > 0 ? (
                          <span className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                            <LinkIcon className="h-3 w-3 text-zinc-400 dark:text-zinc-500" />
                            {log.links.length}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400 dark:text-zinc-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
