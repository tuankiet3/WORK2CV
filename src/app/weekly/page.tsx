"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  FileText,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Users,
  Compass
} from "lucide-react";
import TaskTypeBadge from "@/components/TaskTypeBadge";
import ImpactBadge from "@/components/ImpactBadge";
import TagBadge from "@/components/TagBadge";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";

interface Tag {
  id: string;
  name: string;
  category: "tech" | "domain" | "skill" | "tool";
}

interface WorkLog {
  id: string;
  date: string;
  title: string;
  taskType: string;
  impactLevel: string;
  description: string | null;
  tags: Tag[];
}

interface WeeklyReview {
  id: string;
  weekStart: string;
  weekEnd: string;
  shipped: string | null;
  blockers: string | null;
  learned: string | null;
  collaboration: string | null;
  nextFocus: string | null;
}

// Snaps to Monday and Sunday of the week containing the given date in UTC
function getWeekBounds(date: Date) {
  const day = date.getUTCDay();
  // Monday is 1, Sunday is 0. If Sunday, go back 6 days. Otherwise go back (day - 1) days.
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + diffToMonday,
    0, 0, 0, 0
  ));

  const sunday = new Date(Date.UTC(
    monday.getUTCFullYear(),
    monday.getUTCMonth(),
    monday.getUTCDate() + 6,
    23, 59, 59, 999
  ));

  return { monday, sunday };
}

function toDateString(d: Date) {
  return d.toISOString().split("T")[0];
}

function formatHumanDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function WeeklyPage() {
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // Default to current week based on UTC date
    return new Date();
  });

  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Compute boundaries for the selected week
  const { monday, sunday } = getWeekBounds(currentDate);
  const weekStartStr = toDateString(monday);
  const weekEndStr = toDateString(sunday);

  const fetchWeekData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch logs in the date range
      const logsRes = await fetch(`/api/logs?from=${weekStartStr}&to=${weekEndStr}`);
      if (!logsRes.ok) {
        throw new Error(`Failed to fetch weekly logs (Status: ${logsRes.status})`);
      }
      const logsJson = await logsRes.ok ? await logsRes.json() : { data: [] };
      if (logsJson.error) {
        throw new Error(logsJson.error.message);
      }

      // 2. Fetch weekly reviews to check for match
      const reviewsRes = await fetch(`/api/weekly-reviews`);
      if (!reviewsRes.ok) {
        throw new Error(`Failed to fetch weekly reviews (Status: ${reviewsRes.status})`);
      }
      const reviewsJson = await reviewsRes.ok ? await reviewsRes.json() : { data: [] };
      if (reviewsJson.error) {
        throw new Error(reviewsJson.error.message);
      }

      // Filter matched review
      const matched = (reviewsJson.data || []).find(
        (rev: WeeklyReview) => rev.weekStart === weekStartStr && rev.weekEnd === weekEndStr
      );

      setLogs(logsJson.data || []);
      setReview(matched || null);
    } catch (err: unknown) {
      console.error("Error loading weekly data:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred while loading weekly data.");
    } finally {
      setIsLoading(false);
    }
  }, [weekStartStr, weekEndStr]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchWeekData();
  }, [fetchWeekData]);

  const handlePrevWeek = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setUTCDate(next.getUTCDate() - 7);
      return next;
    });
  };

  const handleNextWeek = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setUTCDate(next.getUTCDate() + 7);
      return next;
    });
  };

  const handleJumpToToday = () => {
    setCurrentDate(new Date());
  };

  const handleCustomDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [year, month, day] = e.target.value.split("-").map(Number);
      // Construct date as UTC to prevent timezone offsets shifting snapping
      setCurrentDate(new Date(Date.UTC(year, month - 1, day)));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Title block */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Weekly Review
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
            Group logs by week, check reflection status, and compile summaries.
          </p>
        </div>
      </div>

      {/* Week Selection Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevWeek}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer transition-colors"
            title="Previous Week"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono select-none">
              {formatHumanDate(weekStartStr)}
            </span>
            <span className="text-zinc-300 dark:text-zinc-700 select-none">—</span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono select-none">
              {formatHumanDate(weekEndStr)}
            </span>
          </div>

          <button
            onClick={handleNextWeek}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer transition-colors"
            title="Next Week"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Custom Date Input Snapper */}
          <div className="relative">
            <input
              type="date"
              value={toDateString(currentDate)}
              onChange={handleCustomDateSelect}
              className="text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              title="Jump to week containing date"
            />
          </div>

          <button
            onClick={handleJumpToToday}
            className="text-xs font-semibold px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors"
          >
            Current Week
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingState rows={3} />
      ) : error ? (
        <ErrorState onRetry={fetchWeekData} description={error} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Column 1: Logs this week (Span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-850 pb-2">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-500" />
                Logs this week ({logs.length})
              </h3>
            </div>

            {logs.length > 0 ? (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="group flex flex-col justify-between p-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-xs"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="font-medium text-zinc-400 dark:text-zinc-500 font-mono">
                          {log.date}
                        </span>
                        <span className="text-zinc-200 dark:text-zinc-800">|</span>
                        <TaskTypeBadge type={log.taskType} />
                        <ImpactBadge impact={log.impactLevel} />
                      </div>

                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                        <Link
                          href={`/logs/${log.id}`}
                          className="hover:underline flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                        >
                          {log.title}
                          <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </h4>

                      {log.description && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {log.description}
                        </p>
                      )}
                    </div>

                    {log.tags && log.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80">
                        {log.tags.map((t) => (
                          <TagBadge key={t.id} name={t.name} category={t.category} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-center">
                <FileText className="h-8 w-8 text-zinc-400 mb-2" />
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">No logs for this week</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs">
                  You haven&apos;t added any daily logs within this week range yet.
                </p>
                <Link
                  href="/logs/new"
                  className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-all cursor-pointer"
                >
                  Create Daily Log
                </Link>
              </div>
            )}
          </div>

          {/* Column 2: Weekly Review Status (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-850 pb-2">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-500" />
                Review Status
              </h3>
            </div>

            {review ? (
              <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/20">
                    Review Saved
                  </span>
                </div>

                <div className="space-y-3.5 text-xs border-t border-zinc-100 dark:border-zinc-800 pt-3.5">
                  {review.shipped && (
                    <div className="space-y-1">
                      <h4 className="font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        Accomplishments
                      </h4>
                      <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap">{review.shipped}</p>
                    </div>
                  )}

                  {review.blockers && (
                    <div className="space-y-1">
                      <h4 className="font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                        Blockers / Issues
                      </h4>
                      <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap">{review.blockers}</p>
                    </div>
                  )}

                  {review.learned && (
                    <div className="space-y-1">
                      <h4 className="font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        Technical Takeaways
                      </h4>
                      <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap">{review.learned}</p>
                    </div>
                  )}

                  {review.collaboration && (
                    <div className="space-y-1">
                      <h4 className="font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-fuchsia-500 shrink-0" />
                        Mentoring & Collaboration
                      </h4>
                      <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap">{review.collaboration}</p>
                    </div>
                  )}

                  {review.nextFocus && (
                    <div className="space-y-1">
                      <h4 className="font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                        <Compass className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                        Next Week Goals
                      </h4>
                      <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap">{review.nextFocus}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800 rounded-xl text-center">
                <AlertCircle className="h-8 w-8 text-zinc-400 mb-2" />
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">Reflection Pending</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs">
                  No reflection review has been submitted for this week yet.
                </p>
                <div className="mt-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 px-3.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-md">
                  Reflection Form Coming in SB-027
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
