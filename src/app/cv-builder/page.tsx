"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  Sparkles,
  Check,
  Database,
  PlusCircle,
  FileText,
  Layers,
  Copy,
  Trash2,
  Edit,
  Save,
  X,
  Loader2,
  RefreshCw,
  FileCode
} from "lucide-react";
import TaskTypeBadge from "@/components/TaskTypeBadge";
import ImpactBadge from "@/components/ImpactBadge";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { scoreWorkLog } from "@/lib/cvGenerator";

interface Tag {
  id: string;
  name: string;
  category: "tech" | "domain" | "skill" | "tool" | string;
}

interface WorkLog {
  id: string;
  date: string;
  title: string;
  description: string | null;
  taskType: string;
  impactLevel: string;
  problem?: string | null;
  solution?: string | null;
  learning?: string | null;
  links: string[];
  tags: Tag[];
}

interface CvBullet {
  id: string;
  sourceLogIds: string[];
  content: string;
  tone: string;
  createdAt: string;
}

interface GeneratedVariant {
  targetSection: "project" | "work_experience" | "skills_evidence" | "internship_report";
  label: string;
  content: string;
}

interface ProjectEntryDraft {
  title: string;
  techStack: string[];
  links: string[];
  bullets: string[];
}

export default function CvBuilderPage() {
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [savedBullets, setSavedBullets] = useState<CvBullet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and selection states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedImpact, setSelectedImpact] = useState<string>("all");
  const [selectedTagId, setSelectedTagId] = useState<string>("all");
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
  const [tone, setTone] = useState<"concise_cv" | "detailed_cv" | "internship_report">("concise_cv");

  // Generation result states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedVariants, setGeneratedVariants] = useState<GeneratedVariant[]>([]);
  const [projectEntry, setProjectEntry] = useState<ProjectEntryDraft | null>(null);

  // Editing saved bullets states
  const [editingBulletId, setEditingBulletId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  // Copy feedback states (maps ID/Key to a temporary boolean)
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Bullet saving states
  const [savingBulletIndex, setSavingBulletIndex] = useState<number | null>(null);
  const [savedStatusMap, setSavedStatusMap] = useState<Record<string, boolean>>({});

  // Delete bullet confirmation states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [bulletToDeleteId, setBulletToDeleteId] = useState<string | null>(null);
  const [isDeletingBullet, setIsDeletingBullet] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const [logsRes, tagsRes, bulletsRes] = await Promise.all([
          fetch("/api/logs"),
          fetch("/api/tags"),
          fetch("/api/cv-bullets"),
        ]);

        if (!logsRes.ok || !tagsRes.ok || !bulletsRes.ok) {
          throw new Error("Failed to load CV Builder resources.");
        }

        const logsJson = await logsRes.json();
        const tagsJson = await tagsRes.json();
        const bulletsJson = await bulletsRes.json();

        setLogs(logsJson.data || []);
        setTags(tagsJson.data || []);
        setSavedBullets(bulletsJson.data || []);
      } catch (err: unknown) {
        console.error("Error loading CV Builder data:", err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const fetchSavedBullets = async () => {
    try {
      const res = await fetch("/api/cv-bullets");
      if (res.ok) {
        const json = await res.json();
        setSavedBullets(json.data || []);
      }
    } catch (err) {
      console.error("Failed to refresh saved bullets:", err);
    }
  };

  // Filter and score candidate logs in real-time
  const processedLogs = useMemo(() => {
    return logs
      .map((log) => {
        // Calculate the high-value suggestion score using the shared scoring utility
        const score = scoreWorkLog({
          title: log.title,
          description: log.description,
          taskType: log.taskType,
          impactLevel: log.impactLevel,
          problem: log.problem,
          solution: log.solution,
          links: log.links,
          tags: log.tags,
        });

        return { ...log, score };
      })
      .filter((log) => {
        // 1. Text search filter
        const matchesSearch =
          log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (log.description || "").toLowerCase().includes(searchQuery.toLowerCase());

        // 2. Impact Level filter
        const matchesImpact = selectedImpact === "all" || log.impactLevel === selectedImpact;

        // 3. Tag filter
        const matchesTag = selectedTagId === "all" || log.tags.some((t) => t.id === selectedTagId);

        return matchesSearch && matchesImpact && matchesTag;
      })
      // Sort by the suggestion score descending, then date descending to prioritize high-value logs
      .sort((a, b) => b.score - a.score || new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs, searchQuery, selectedImpact, selectedTagId]);

  const handleToggleSelect = (logId: string) => {
    setSelectedLogIds((prev) =>
      prev.includes(logId) ? prev.filter((id) => id !== logId) : [...prev, logId]
    );
    // Reset generation state to force regenerating
    setGeneratedVariants([]);
    setProjectEntry(null);
    setSavedStatusMap({});
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = processedLogs.map((l) => l.id);
    const allSelected = filteredIds.every((id) => selectedLogIds.includes(id));

    if (allSelected) {
      setSelectedLogIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedLogIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
    setGeneratedVariants([]);
    setProjectEntry(null);
    setSavedStatusMap({});
  };

  const handleClearSelection = () => {
    setSelectedLogIds([]);
    setGeneratedVariants([]);
    setProjectEntry(null);
    setSavedStatusMap({});
  };

  // Trigger bullet generation call to the API
  const handleGenerate = async () => {
    if (selectedLogIds.length === 0) return;
    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedVariants([]);
    setProjectEntry(null);
    setSavedStatusMap({});

    try {
      const res = await fetch("/api/cv-bullets/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logIds: selectedLogIds,
          tone: tone,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error?.message || "Failed to generate CV bullets.");
      }

      setGeneratedVariants(json.data.variants || []);
      setProjectEntry(json.data.projectEntry || null);
    } catch (err: unknown) {
      console.error("Error generating bullets:", err);
      setGenerationError(err instanceof Error ? err.message : "An unexpected error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle inline modification of a generated variant text
  const handleVariantTextChange = (index: number, text: string) => {
    setGeneratedVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, content: text } : v))
    );
  };

  // Save selected variant to database
  const handleSaveBullet = async (index: number, variant: GeneratedVariant) => {
    setSavingBulletIndex(index);
    try {
      const res = await fetch("/api/cv-bullets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceLogIds: selectedLogIds,
          content: variant.content,
          tone: tone,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error?.message || "Failed to save CV bullet.");
      }

      setSavedStatusMap((prev) => ({ ...prev, [variant.targetSection]: true }));
      await fetchSavedBullets();
    } catch (err) {
      console.error("Error saving bullet:", err);
      alert(err instanceof Error ? err.message : "Failed to save bullet.");
    } finally {
      setSavingBulletIndex(null);
    }
  };

  // Copy to clipboard with visual temporary notification
  const handleCopyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  // Start inline editing of a saved bullet
  const handleStartEditSaved = (bullet: CvBullet) => {
    setEditingBulletId(bullet.id);
    setEditingContent(bullet.content);
  };

  // Save inline edit to database
  const handleSaveSavedEdit = async (bulletId: string) => {
    if (!editingContent.trim()) return;
    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/cv-bullets/${bulletId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: editingContent.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error?.message || "Failed to update saved CV bullet.");
      }

      setEditingBulletId(null);
      await fetchSavedBullets();
    } catch (err) {
      console.error("Error updating saved bullet:", err);
      alert(err instanceof Error ? err.message : "Failed to save edits.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Trigger delete confirmation modal
  const handleDeleteBulletClick = (bulletId: string) => {
    setBulletToDeleteId(bulletId);
    setShowDeleteConfirm(true);
  };

  // Perform delete operation
  const handleDeleteBulletConfirm = async () => {
    if (!bulletToDeleteId) return;
    setIsDeletingBullet(true);
    try {
      const res = await fetch(`/api/cv-bullets/${bulletToDeleteId}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error?.message || "Failed to delete CV bullet.");
      }

      setShowDeleteConfirm(false);
      setBulletToDeleteId(null);
      await fetchSavedBullets();
    } catch (err: unknown) {
      console.error("Error deleting saved bullet:", err);
      alert(err instanceof Error ? err.message : "Failed to delete bullet.");
    } finally {
      setIsDeletingBullet(false);
    }
  };

  const mapToneLabel = (t: string) => {
    if (t === "concise_cv") return "Concise Bullet";
    if (t === "detailed_cv") return "Detailed Bullet";
    return "Internship Report Wording";
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
        <LoadingState rows={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
        <ErrorState description={error} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            CV Builder
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
            Convert daily logs into professionally-worded accomplishments for your resume.
          </p>
        </div>
      </div>

      {logs.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 mb-4">
            <Briefcase className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">No internship work logs found</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-md leading-relaxed">
            Before generating CV bullets, you need to create at least one daily work log describing your achievements and technical tasks.
          </p>
          <div className="mt-6">
            <Link
              href="/logs/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              Create Your First Work Log
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            {/* LEFT COLUMN: Candidate Log Selector Panel (Span 2) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <Database className="h-4 w-4 text-indigo-500" />
                  Candidate Logs ({processedLogs.length})
                </h3>
                {processedLogs.length > 0 && (
                  <button
                    onClick={handleSelectAllFiltered}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer"
                  >
                    {processedLogs.every((l) => selectedLogIds.includes(l.id)) ? "Deselect All" : "Select All"}
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-3">
                <div className="relative">
                  <label htmlFor="cv-search" className="sr-only">Search logs by keyword</label>
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                  <input
                    id="cv-search"
                    type="text"
                    placeholder="Search logs by keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="impact-filter" className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                      Impact Level
                    </label>
                    <select
                      id="impact-filter"
                      value={selectedImpact}
                      onChange={(e) => setSelectedImpact(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="all">All Impacts</option>
                      <option value="implemented">Implemented</option>
                      <option value="improved">Improved</option>
                      <option value="fixed">Fixed</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="assisted">Assisted</option>
                      <option value="learned">Learned</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="tag-filter" className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                      Technology Tag
                    </label>
                    <select
                      id="tag-filter"
                      value={selectedTagId}
                      onChange={(e) => setSelectedTagId(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="all">All Technologies</option>
                      {tags
                        .filter((t) => t.category === "tech" || t.category === "tool")
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Candidate Log list */}
            {processedLogs.length > 0 ? (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {processedLogs.map((log) => {
                  const isSelected = selectedLogIds.includes(log.id);
                  const isLogSuggestion = log.score >= 50;
                  return (
                    <div
                      key={log.id}
                      role="checkbox"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          e.preventDefault();
                          handleToggleSelect(log.id);
                        }
                      }}
                      onClick={() => handleToggleSelect(log.id)}
                      className={`group flex items-start gap-3 p-4 border rounded-xl transition-all shadow-xs cursor-pointer select-none relative focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                        isSelected
                          ? "bg-indigo-50/20 dark:bg-indigo-950/10 border-indigo-500/80 dark:border-indigo-500/50"
                          : "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      <div
                        className={`h-4.5 w-4.5 shrink-0 rounded border flex items-center justify-center transition-colors mt-0.5 ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-zinc-300 dark:border-zinc-700 bg-transparent group-hover:border-zinc-400 dark:group-hover:border-zinc-600"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className="font-mono text-zinc-400 dark:text-zinc-500">{log.date}</span>
                          <span className="text-zinc-200 dark:text-zinc-800">|</span>
                          <TaskTypeBadge type={log.taskType} />
                          <ImpactBadge impact={log.impactLevel} />

                          {isLogSuggestion && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/20 uppercase tracking-wide">
                              <Sparkles className="h-2.5 w-2.5 text-amber-500 animate-pulse" />
                              CV Suggestion
                            </span>
                          )}
                        </div>

                        <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-relaxed pr-1">
                          {log.title}
                        </h4>

                        {log.tags && log.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1.5">
                            {log.tags.slice(0, 3).map((t) => (
                              <span
                                key={t.id}
                                className="inline-flex px-1.5 py-0.5 text-[9px] font-medium rounded bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800/80"
                              >
                                {t.name}
                              </span>
                            ))}
                            {log.tags.length > 3 && (
                              <span className="inline-flex px-1.5 py-0.5 text-[9px] font-medium text-zinc-400 dark:text-zinc-500">
                                +{log.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <Search className="h-6 w-6 text-zinc-400 mx-auto mb-2" />
                <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">No matching logs</h4>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Adjust search or filters.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Configuration & Variants Generator (Span 3) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-5">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <Layers className="h-4 w-4 text-indigo-500" />
                  CV Generator Setup
                </h3>
              </div>

              {selectedLogIds.length > 0 ? (
                <div className="space-y-4">
                  {/* Selected count and bullet style */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                        Selected logs
                      </span>
                      <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 rounded-lg border border-zinc-200/60 dark:border-zinc-800/80">
                        {selectedLogIds.length} {selectedLogIds.length === 1 ? "log" : "logs"} chosen
                      </div>
                    </div>

                    <div>
                      <label htmlFor="tone-selector" className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                        Bullet formatting tone
                      </label>
                      <select
                        id="tone-selector"
                        value={tone}
                        onChange={(e) => setTone(e.target.value as "concise_cv" | "detailed_cv" | "internship_report")}
                        className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="concise_cv">Concise CV Bullet</option>
                        <option value="detailed_cv">Detailed CV Bullet</option>
                        <option value="internship_report">Internship Report Section</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-4">
                    <button
                      onClick={handleClearSelection}
                      className="text-xs font-semibold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer"
                    >
                      Clear Selection
                    </button>

                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="inline-flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3.5 w-3.5" />
                          Generate CV Bullets
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-zinc-50/50 dark:bg-zinc-900/30 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-center">
                  <FileText className="h-6 w-6 text-zinc-400 mb-1.5" />
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">No logs selected</span>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs leading-relaxed">
                    Choose one or more daily work logs from the left panel to configure your CV bullet generation request.
                  </p>
                </div>
              )}
            </div>

            {/* Error display */}
            {generationError && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300 flex items-start gap-2 shadow-xs">
                <X className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <div>{generationError}</div>
              </div>
            )}

            {/* Output Variants list */}
            {generatedVariants.length > 0 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    Generated CV Variants
                  </h3>
                </div>

                <div className="space-y-4">
                  {generatedVariants.map((variant, index) => {
                    const hasSaved = savedStatusMap[variant.targetSection];
                    const copyKey = `gen-${variant.targetSection}`;
                    const isCopied = copiedKey === copyKey;
                    return (
                      <div
                        key={variant.targetSection}
                        className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-3.5"
                      >
                        {/* Variant header labeling where it fits in the CV */}
                        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
                          <div className="space-y-0.5">
                            <span className="inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/20">
                              {variant.label}
                            </span>
                            <span className="block text-[10px] text-zinc-400 dark:text-zinc-500">
                              {variant.targetSection === "project" && "Terse capability bullet suitable for Projects section"}
                              {variant.targetSection === "work_experience" && "Professional statement suitable for Experience entries"}
                              {variant.targetSection === "skills_evidence" && "Capability proof suitable for Skills summary lists"}
                              {variant.targetSection === "internship_report" && "Descriptive text suitable for university/team logs"}
                            </span>
                          </div>
                        </div>

                        {/* Editable bullet textarea */}
                        <textarea
                          rows={3}
                          value={variant.content}
                          onChange={(e) => handleVariantTextChange(index, e.target.value)}
                          aria-label={`Generated ${variant.label} Bullet`}
                          className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-transparent text-zinc-850 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono leading-relaxed"
                        />

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => handleCopyToClipboard(variant.content, copyKey)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            {isCopied ? "Copied!" : "Copy Bullet"}
                          </button>

                          <button
                            onClick={() => handleSaveBullet(index, variant)}
                            disabled={savingBulletIndex !== null || hasSaved}
                            className={`inline-flex items-center gap-1 px-3.5 py-1.5 text-[10px] font-bold rounded-lg transition-all shadow-xs cursor-pointer ${
                              hasSaved
                                ? "bg-emerald-500 text-white border border-emerald-500 cursor-default"
                                : "text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
                            }`}
                          >
                            {hasSaved ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                Saved to CV
                              </>
                            ) : savingBulletIndex === index ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <PlusCircle className="h-3.5 w-3.5" />
                                Save to Bullet list
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Optional Project Entry snippet layout */}
                {projectEntry && (
                  <div className="bg-amber-500/5 dark:bg-amber-500/2 border border-amber-200 dark:border-amber-900/60 rounded-xl p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-amber-100 dark:border-amber-900/40 pb-2">
                      <div className="flex items-center gap-1.5">
                        <FileCode className="h-4 w-4 text-amber-500 shrink-0" />
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          Project Entry Draft Suggestion
                        </h4>
                      </div>
                      <button
                        onClick={() => {
                          const formatted = `### ${projectEntry.title}\n**Tech Stack:** ${projectEntry.techStack.join(", ")}\n**Links:** ${projectEntry.links.join(", ")}\n\n${projectEntry.bullets.map(b => `- ${b}`).join("\n")}`;
                          handleCopyToClipboard(formatted, "proj-entry");
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold rounded bg-white dark:bg-zinc-950 border border-amber-200 dark:border-amber-900 text-zinc-700 dark:text-zinc-300 cursor-pointer hover:bg-zinc-50"
                      >
                        <Copy className="h-3 w-3" />
                        {copiedKey === "proj-entry" ? "Copied!" : "Copy Full Entry"}
                      </button>
                    </div>

                    <div className="text-[11px] font-mono space-y-1 bg-white dark:bg-zinc-950/40 p-3 rounded-lg border border-amber-100/50 dark:border-amber-900/30 max-h-[220px] overflow-y-auto text-zinc-700 dark:text-zinc-300">
                      <div><span className="font-bold text-amber-600 dark:text-amber-500">Project Name:</span> {projectEntry.title}</div>
                      <div><span className="font-bold text-amber-600 dark:text-amber-500">Tech Stack:</span> {projectEntry.techStack.join(", ")}</div>
                      <div><span className="font-bold text-amber-600 dark:text-amber-500">Links:</span> {projectEntry.links.join(", ")}</div>
                      <div className="pt-2 font-bold text-amber-600 dark:text-amber-500">Bullet Points:</div>
                      {projectEntry.bullets.map((b, i) => (
                        <div key={i} className="pl-3 leading-relaxed">&bull; {b}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )}

      {/* BOTTOM SECTION: Saved CV Bullets list */}
      <div className="space-y-4 pt-4">
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-indigo-500" />
            Saved CV Accomplishments ({savedBullets.length})
          </h3>
        </div>

        {savedBullets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedBullets.map((bullet) => {
              const isEditingThis = editingBulletId === bullet.id;
              const copyKey = `saved-${bullet.id}`;
              const isCopied = copiedKey === copyKey;

              return (
                <div
                  key={bullet.id}
                  className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide rounded bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/20">
                        {mapToneLabel(bullet.tone)}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                        {new Date(bullet.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {isEditingThis ? (
                      <textarea
                        rows={3}
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        disabled={isSavingEdit}
                        aria-label="Edit saved bullet content"
                        className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono leading-relaxed"
                      />
                    ) : (
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap select-all">
                        &bull; {bullet.content}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                    {isEditingThis ? (
                      <>
                        <button
                          onClick={() => setEditingBulletId(null)}
                          disabled={isSavingEdit}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer disabled:opacity-50"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveSavedEdit(bullet.id)}
                          disabled={isSavingEdit}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          {isSavingEdit ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-3.5 w-3.5" />
                              Save Edit
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleCopyToClipboard(bullet.content, copyKey)}
                          className="p-1.5 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer transition-colors"
                          title="Copy to Clipboard"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => handleStartEditSaved(bullet)}
                          className="p-1.5 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer transition-colors"
                          title="Edit bullet content"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteBulletClick(bullet.id)}
                          className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors"
                          title="Delete saved bullet"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        {isCopied && (
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold ml-1 animate-pulse">
                            Copied!
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center shadow-xs">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800 mb-3">
              <PlusCircle className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">No saved achievements yet</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs leading-relaxed">
              Generate CV accomplishment options above and click &ldquo;Save to Bullet list&rdquo; to collect them here for export.
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-xl animate-scale-in">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Delete Saved Bullet?</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              Are you sure you want to delete this saved CV bullet? This action is permanent and cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setBulletToDeleteId(null);
                }}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBulletConfirm}
                disabled={isDeletingBullet}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer"
              >
                {isDeletingBullet ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Permanently"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
