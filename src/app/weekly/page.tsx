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
  Compass,
  Edit,
  Loader2,
  Save,
  X,
  Sparkles
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
  problem?: string | null;
  solution?: string | null;
  learning?: string | null;
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
    return new Date();
  });

  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [shipped, setShipped] = useState<string>("");
  const [blockers, setBlockers] = useState<string>("");
  const [learned, setLearned] = useState<string>("");
  const [collaboration, setCollaboration] = useState<string>("");
  const [nextFocus, setNextFocus] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Compute boundaries for the selected week
  const { monday, sunday } = getWeekBounds(currentDate);
  const weekStartStr = toDateString(monday);
  const weekEndStr = toDateString(sunday);

  const fetchWeekData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      // 1. Fetch logs in the date range
      const logsRes = await fetch(`/api/logs?from=${weekStartStr}&to=${weekEndStr}`);
      if (!logsRes.ok) {
        throw new Error(`Failed to fetch weekly logs (Status: ${logsRes.status})`);
      }
      const logsJson = await logsRes.json();
      if (logsJson.error) {
        throw new Error(logsJson.error.message);
      }

      // 2. Fetch weekly reviews to check for match
      const reviewsRes = await fetch(`/api/weekly-reviews`);
      if (!reviewsRes.ok) {
        throw new Error(`Failed to fetch weekly reviews (Status: ${reviewsRes.status})`);
      }
      const reviewsJson = await reviewsRes.json();
      if (reviewsJson.error) {
        throw new Error(reviewsJson.error.message);
      }

      // Filter matched review
      const matched = (reviewsJson.data || []).find(
        (rev: WeeklyReview) => rev.weekStart === weekStartStr && rev.weekEnd === weekEndStr
      );

      setLogs(logsJson.data || []);
      setReview(matched || null);

      // Populate form
      if (matched) {
        setShipped(matched.shipped || "");
        setBlockers(matched.blockers || "");
        setLearned(matched.learned || "");
        setCollaboration(matched.collaboration || "");
        setNextFocus(matched.nextFocus || "");
        setIsEditing(false);
      } else {
        setShipped("");
        setBlockers("");
        setLearned("");
        setCollaboration("");
        setNextFocus("");
        setIsEditing(true);
      }
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
      setCurrentDate(new Date(Date.UTC(year, month - 1, day)));
    }
  };

  const handlePrefill = () => {
    const hasUnsavedChanges = shipped.trim() || blockers.trim() || learned.trim() || collaboration.trim();
    if (hasUnsavedChanges) {
      const confirm = window.confirm("Are you sure you want to prefill reflection fields from logs? This will overwrite your current unsaved edits.");
      if (!confirm) return;
    }

    // 1. Accomplishments (Shipped)
    const shippedLogs = logs.filter((log) =>
      ["feature", "bugfix", "testing", "refactor", "documentation"].includes(log.taskType)
    );
    const shippedText = shippedLogs.map((log) => `• ${log.title}`).join("\n");

    // 2. Blockers
    const blockerLogs = logs.filter((log) => log.problem && log.problem.trim() !== "");
    const blockersText = blockerLogs.map((log) => `• ${log.title}: ${log.problem}`).join("\n");

    // 3. Lessons Learned
    const learnedLogs = logs.filter((log) => log.learning && log.learning.trim() !== "");
    const learnedText = learnedLogs.map((log) => `• ${log.title}: ${log.learning}`).join("\n");

    // 4. Collaboration
    const collabLogs = logs.filter((log) =>
      ["meeting", "code_review"].includes(log.taskType) || log.impactLevel === "assisted"
    );
    const collabText = collabLogs.map((log) => `• ${log.title}`).join("\n");

    setShipped(shippedText);
    setBlockers(blockersText);
    setLearned(learnedText);
    setCollaboration(collabText);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const payload = {
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
      shipped: shipped.trim() || null,
      blockers: blockers.trim() || null,
      learned: learned.trim() || null,
      collaboration: collaboration.trim() || null,
      nextFocus: nextFocus.trim() || null,
    };

    try {
      let url = "/api/weekly-reviews";
      let method = "POST";

      if (review && review.id) {
        url = `/api/weekly-reviews/${review.id}`;
        method = "PATCH";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error?.message || "Failed to save weekly reflection.");
      }

      setSaveSuccess(true);
      setReview(json.data);
      setIsEditing(false);
    } catch (err: unknown) {
      console.error("Error saving reflection:", err);
      setSaveError(err instanceof Error ? err.message : "An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
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

          {/* Column 1: Logs this week (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-850 pb-2">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-500" />
                Logs this week ({logs.length})
              </h3>
            </div>

            {logs.length > 0 ? (
              <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
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

          {/* Column 2: Weekly Review Status & Form (Span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-850 pb-2">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-500" />
                Reflection summary
              </h3>
            </div>

            {saveSuccess && (
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-3 shadow-xs">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                <div>Weekly reflection saved successfully!</div>
              </div>
            )}

            {saveError && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-sm text-red-800 dark:text-red-300 flex items-start gap-3 shadow-xs">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                <div>{saveError}</div>
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSave} className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    {review ? "Edit Weekly Reflection" : "New Weekly Reflection"}
                  </h4>
                  {logs.length > 0 && (
                    <button
                      type="button"
                      onClick={handlePrefill}
                      disabled={isSaving}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 border border-indigo-200 dark:border-indigo-900 rounded-lg hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 cursor-pointer transition-all disabled:opacity-50"
                      title="Prefill fields from logs of this week"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Prefill from Logs
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {/* Accomplishments (Shipped) */}
                  <div>
                    <label htmlFor="shipped" className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      Accomplishments / Shipped
                    </label>
                    <textarea
                      id="shipped"
                      rows={3}
                      placeholder="List key tasks, PRs, features, or fixes completed this week..."
                      value={shipped}
                      onChange={(e) => setShipped(e.target.value)}
                      disabled={isSaving}
                      className="w-full text-sm px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                    />
                  </div>

                  {/* Blockers */}
                  <div>
                    <label htmlFor="blockers" className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      Blockers & Difficulties
                    </label>
                    <textarea
                      id="blockers"
                      rows={2}
                      placeholder="Explain any blockers, architectural issues, or technical challenges faced..."
                      value={blockers}
                      onChange={(e) => setBlockers(e.target.value)}
                      disabled={isSaving}
                      className="w-full text-sm px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                    />
                  </div>

                  {/* Learned */}
                  <div>
                    <label htmlFor="learned" className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      Technical Lessons Learned
                    </label>
                    <textarea
                      id="learned"
                      rows={2}
                      placeholder="Write down any new frameworks, optimizations, or coding styles discovered..."
                      value={learned}
                      onChange={(e) => setLearned(e.target.value)}
                      disabled={isSaving}
                      className="w-full text-sm px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                    />
                  </div>

                  {/* Collaboration */}
                  <div>
                    <label htmlFor="collaboration" className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      Mentor & Team Collaboration Notes
                    </label>
                    <textarea
                      id="collaboration"
                      rows={2}
                      placeholder="Record pair-programming details, reviews, or key takeaways from team meetings..."
                      value={collaboration}
                      onChange={(e) => setCollaboration(e.target.value)}
                      disabled={isSaving}
                      className="w-full text-sm px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                    />
                  </div>

                  {/* Next Focus */}
                  <div>
                    <label htmlFor="nextFocus" className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      Focus / Goals for Next Week
                    </label>
                    <textarea
                      id="nextFocus"
                      rows={2}
                      placeholder="Outline key priorities, tasks, or learnings planned for next week..."
                      value={nextFocus}
                      onChange={(e) => setNextFocus(e.target.value)}
                      disabled={isSaving}
                      className="w-full text-sm px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                  {review && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setSaveError(null);
                      }}
                      disabled={isSaving}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-50 cursor-pointer transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                      Cancel
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm disabled:opacity-50 cursor-pointer transition-all"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Saving Reflection...
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5" />
                        Save Reflection
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <span className="inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/20">
                    Reflection Saved
                  </span>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Edit Reflection
                  </button>
                </div>

                <div className="space-y-4">
                  {review?.shipped && (
                    <div className="space-y-1">
                      <h4 className="font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        Accomplishments
                      </h4>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed pl-5.5 whitespace-pre-wrap">{review.shipped}</p>
                    </div>
                  )}

                  {review?.blockers && (
                    <div className="space-y-1">
                      <h4 className="font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                        Blockers & Challenges
                      </h4>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed pl-5.5 whitespace-pre-wrap">{review.blockers}</p>
                    </div>
                  )}

                  {review?.learned && (
                    <div className="space-y-1">
                      <h4 className="font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                        <BookOpen className="h-4 w-4 text-indigo-500 shrink-0" />
                        Technical Lessons
                      </h4>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed pl-5.5 whitespace-pre-wrap">{review.learned}</p>
                    </div>
                  )}

                  {review?.collaboration && (
                    <div className="space-y-1">
                      <h4 className="font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                        <Users className="h-4 w-4 text-fuchsia-500 shrink-0" />
                        Mentor & Team Collaboration
                      </h4>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed pl-5.5 whitespace-pre-wrap">{review.collaboration}</p>
                    </div>
                  )}

                  {review?.nextFocus && (
                    <div className="space-y-1">
                      <h4 className="font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                        <Compass className="h-4 w-4 text-sky-500 shrink-0" />
                        Next Week Focus
                      </h4>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed pl-5.5 whitespace-pre-wrap">{review.nextFocus}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
