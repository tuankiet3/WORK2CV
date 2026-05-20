"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  FileText, 
  Plus, 
  Link as LinkIcon, 
  Calendar,
  Search,
  X
} from "lucide-react";
import TaskTypeBadge from "@/components/TaskTypeBadge";
import ImpactBadge from "@/components/ImpactBadge";
import TagBadge from "@/components/TagBadge";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { 
  type TaskType, 
  type ImpactLevel, 
  type TagCategory,
  TASK_TYPES,
  IMPACT_LEVELS,
  TASK_TYPE_LABELS,
  IMPACT_LEVEL_LABELS,
  TAG_CATEGORIES,
  TAG_CATEGORY_LABELS
} from "@/constants";

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
  problem?: string | null;
  solution?: string | null;
  learning?: string | null;
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

  // Hydration status
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTagId, setSelectedTagId] = useState<string>("");
  const [selectedTagCategory, setSelectedTagCategory] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [selectedTaskTypes, setSelectedTaskTypes] = useState<TaskType[]>([]);
  const [selectedImpactLevels, setSelectedImpactLevels] = useState<ImpactLevel[]>([]);
  const [problemSolutionOnly, setProblemSolutionOnly] = useState<boolean>(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  // Derived state: Date error
  const dateError = dateFrom && dateTo && dateFrom > dateTo
    ? "From Date must be before or equal to To Date"
    : null;

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

  // Parse URL search parameters on mount
  useEffect(() => {
    const initFromUrl = async () => {
      await Promise.resolve();
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q") || "";
      const tagId = params.get("tagId") || "";
      const tagCategory = params.get("tagCategory") || "";
      const from = params.get("from") || "";
      const to = params.get("to") || "";
      const tTypes = params.get("taskTypes") ? params.get("taskTypes")!.split(",") : [];
      const iLevels = params.get("impactLevels") ? params.get("impactLevels")!.split(",") : [];
      const psOnly = params.get("problemSolutionOnly") === "true";

      setSearchQuery(q);
      setSelectedTagId(tagId);
      setSelectedTagCategory(tagCategory);
      setDateFrom(from);
      setDateTo(to);
      setSelectedTaskTypes(tTypes as TaskType[]);
      setSelectedImpactLevels(iLevels as ImpactLevel[]);
      setProblemSolutionOnly(psOnly);
      setIsInitialized(true);
    };

    initFromUrl();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();

    // Fetch tags
    const fetchTags = async () => {
      try {
        const res = await fetch("/api/tags");
        if (res.ok) {
          const json = await res.json();
          setAvailableTags(json.data || []);
        }
      } catch (err) {
        console.error("Error fetching tags:", err);
      }
    };
    fetchTags();
  }, [fetchLogs]);

  // Synchronize state changes to URL query parameters
  useEffect(() => {
    if (!isInitialized) return; // Guard so that default states don't overwrite deep links on first render!

    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedTagId) params.set("tagId", selectedTagId);
    if (selectedTagCategory) params.set("tagCategory", selectedTagCategory);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    if (selectedTaskTypes.length > 0) params.set("taskTypes", selectedTaskTypes.join(","));
    if (selectedImpactLevels.length > 0) params.set("impactLevels", selectedImpactLevels.join(","));
    if (problemSolutionOnly) params.set("problemSolutionOnly", "true");

    const newSearch = params.toString();
    const currentSearch = window.location.search.replace(/^\?/, "");
    if (newSearch !== currentSearch) {
      const newUrl = `${window.location.pathname}${newSearch ? "?" + newSearch : ""}`;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, "", newUrl);
    }
  }, [isInitialized, searchQuery, selectedTagId, selectedTagCategory, dateFrom, dateTo, selectedTaskTypes, selectedImpactLevels, problemSolutionOnly]);

  const handleTaskTypeToggle = (type: TaskType) => {
    setSelectedTaskTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleImpactLevelToggle = (level: ImpactLevel) => {
    setSelectedImpactLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const handleTagCategoryChange = (category: string) => {
    setSelectedTagCategory(category);
    // If a specific tag was selected but does not belong to the newly selected category, clear it.
    if (category && selectedTagId) {
      const currentTag = availableTags.find((t) => t.id === selectedTagId);
      if (currentTag && currentTag.category !== category) {
        setSelectedTagId("");
      }
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTagId("");
    setSelectedTagCategory("");
    setDateFrom("");
    setDateTo("");
    setSelectedTaskTypes([]);
    setSelectedImpactLevels([]);
    setProblemSolutionOnly(false);
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedTagId !== "" ||
    selectedTagCategory !== "" ||
    dateFrom !== "" ||
    dateTo !== "" ||
    selectedTaskTypes.length > 0 ||
    selectedImpactLevels.length > 0 ||
    problemSolutionOnly;

  // Sync available tag list based on selected category
  const displayedTags = selectedTagCategory
    ? availableTags.filter((t) => t.category === selectedTagCategory)
    : availableTags;

  // Filter logs client-side
  const filteredLogs = logs.filter((log) => {
    // 1. Text search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = log.title.toLowerCase().includes(q);
      const matchDesc = log.description ? log.description.toLowerCase().includes(q) : false;
      const matchProblem = log.problem ? log.problem.toLowerCase().includes(q) : false;
      const matchSolution = log.solution ? log.solution.toLowerCase().includes(q) : false;
      const matchLearning = log.learning ? log.learning.toLowerCase().includes(q) : false;
      if (!matchTitle && !matchDesc && !matchProblem && !matchSolution && !matchLearning) {
        return false;
      }
    }

    // 2. Tag filter
    if (selectedTagId) {
      const hasTag = log.tags.some((t) => t.id === selectedTagId);
      if (!hasTag) return false;
    }

    // 2b. Tag category filter
    if (selectedTagCategory) {
      const hasCategory = log.tags.some((t) => t.category === selectedTagCategory);
      if (!hasCategory) return false;
    }

    // 3. Date range filter
    if (dateFrom && dateTo && dateFrom > dateTo) {
      return false; // Invalid range yields no match
    }
    if (dateFrom && log.date < dateFrom) return false;
    if (dateTo && log.date > dateTo) return false;

    // 4. Task type filter
    if (selectedTaskTypes.length > 0 && !selectedTaskTypes.includes(log.taskType)) {
      return false;
    }

    // 5. Impact level filter
    if (selectedImpactLevels.length > 0 && !selectedImpactLevels.includes(log.impactLevel)) {
      return false;
    }

    // 6. Problem-Solution only filter
    if (problemSolutionOnly) {
      const hasProblem = log.problem !== null && log.problem !== undefined && log.problem.trim() !== "";
      const hasSolution = log.solution !== null && log.solution !== undefined && log.solution.trim() !== "";
      if (!hasProblem || !hasSolution) return false;
    }

    return true;
  });

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

      {/* Filter Panel */}
      <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4 shadow-sm">
        {/* Row 1: Search, Tag Category, Tag, Date range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label htmlFor="search" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Search Logs
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                placeholder="Search title, details, learnings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm pl-9 pr-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-md bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-zinc-400" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="category-filter" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Tag Category
            </label>
            <select
              id="category-filter"
              value={selectedTagCategory}
              onChange={(e) => handleTagCategoryChange(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Categories</option>
              {TAG_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {TAG_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tag-filter" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Filter by Tag
            </label>
            <select
              id="tag-filter"
              value={selectedTagId}
              onChange={(e) => setSelectedTagId(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Tags</option>
              {displayedTags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name} ({tag.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date-from" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              From Date
            </label>
            <input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-md bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="date-to" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              To Date
            </label>
            <input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-md bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Row 2: Multi-select Checkboxes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
          <div>
            <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Task Types
            </span>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {TASK_TYPES.map((type) => {
                const isChecked = selectedTaskTypes.includes(type);
                return (
                  <label key={type} className="inline-flex items-center text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleTaskTypeToggle(type)}
                      className="h-3.5 w-3.5 rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 mr-2"
                    />
                    {TASK_TYPE_LABELS[type]}
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Impact Levels
            </span>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {IMPACT_LEVELS.map((level) => {
                const isChecked = selectedImpactLevels.includes(level);
                return (
                  <label key={level} className="inline-flex items-center text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleImpactLevelToggle(level)}
                      className="h-3.5 w-3.5 rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 mr-2"
                    />
                    {IMPACT_LEVEL_LABELS[level]}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 3: Action Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <div>
            {dateError ? (
              <span className="text-xs text-red-500 dark:text-red-400 font-medium">
                ⚠️ {dateError}
              </span>
            ) : (
              <label className="inline-flex items-center text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={problemSolutionOnly}
                  onChange={() => setProblemSolutionOnly(!problemSolutionOnly)}
                  className="h-3.5 w-3.5 rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 mr-2"
                />
                Problem-Solution Notes Only
              </label>
            )}
          </div>
          <div className="flex items-center gap-3 justify-end">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                Clear Filters
              </button>
            )}
          </div>
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
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 mb-4">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            No Matching Work Logs
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-6">
            We couldn&apos;t find any work logs matching your selected filters. Try adjusting your search query, dates, or tags.
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Mobile view: Stacked Cards */}
          <div className="block md:hidden space-y-4">
            {filteredLogs.map((log) => (
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
                  {filteredLogs.map((log) => (
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
