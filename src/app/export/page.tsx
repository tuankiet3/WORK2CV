"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  Copy,
  Check,
  FileText,
  Calendar,
  Briefcase,
  Layers,
  Loader2,
  AlertCircle,
  RefreshCw,
  Sparkles
} from "lucide-react";
import TaskTypeBadge from "@/components/TaskTypeBadge";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";

interface Tag {
  id: string;
  name: string;
  category: string;
}

interface WorkLog {
  id: string;
  date: string;
  title: string;
  taskType: string;
  impactLevel: string;
  tags: Tag[];
}

interface WeeklyReview {
  id: string;
  weekStart: string;
  weekEnd: string;
  shipped: string | null;
}

interface CvBullet {
  id: string;
  content: string;
  tone: string;
  createdAt: string;
}

type ExportType = "logs" | "weekly_review" | "cv_bullets" | "full_summary";

export default function ExportPage() {
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [reviews, setReviews] = useState<WeeklyReview[]>([]);
  const [bullets, setBullets] = useState<CvBullet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Export settings
  const [exportType, setExportType] = useState<ExportType>("logs");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [generatedMarkdown, setGeneratedMarkdown] = useState<string>("");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // UI feedback states
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const [logsRes, reviewsRes, bulletsRes] = await Promise.all([
          fetch("/api/logs"),
          fetch("/api/weekly-reviews"),
          fetch("/api/cv-bullets")
        ]);

        if (!logsRes.ok || !reviewsRes.ok || !bulletsRes.ok) {
          throw new Error("Failed to load export resources.");
        }

        const logsJson = await logsRes.json();
        const reviewsJson = await reviewsRes.json();
        const bulletsJson = await bulletsRes.json();

        setLogs(logsJson.data || []);
        setReviews(reviewsJson.data || []);
        setBullets(bulletsJson.data || []);
      } catch (err: unknown) {
        console.error("Error loading Export Center data:", err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Handle changing export type
  const handleTypeChange = (type: ExportType) => {
    setExportType(type);
    setSelectedIds([]);
    setGeneratedMarkdown("");
    setExportError(null);
  };

  // Toggle checklist selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select all items of the current export type
  const handleSelectAll = () => {
    let allIds: string[] = [];
    if (exportType === "logs") {
      allIds = logs.map((l) => l.id);
    } else if (exportType === "weekly_review") {
      allIds = reviews.map((r) => r.id);
    } else if (exportType === "cv_bullets") {
      allIds = bullets.map((b) => b.id);
    }

    const allSelected = allIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allIds);
    }
  };

  // Trigger export Markdown from API
  const handleGenerateExport = async () => {
    setIsExporting(true);
    setExportError(null);
    setGeneratedMarkdown("");

    try {
      const payload: { type: string; ids?: string[] } = {
        type: exportType
      };

      if (exportType !== "full_summary" && selectedIds.length > 0) {
        payload.ids = selectedIds;
      }

      const res = await fetch("/api/export/markdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error?.message || "Failed to generate Markdown export.");
      }

      setGeneratedMarkdown(json.data.markdown || "");
    } catch (err: unknown) {
      console.error("Export generation error:", err);
      setExportError(err instanceof Error ? err.message : "Failed to compile markdown export.");
    } finally {
      setIsExporting(false);
    }
  };

  // Copy to Clipboard
  const handleCopyToClipboard = () => {
    if (!generatedMarkdown) return;
    navigator.clipboard.writeText(generatedMarkdown).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error("Failed to copy export content:", err);
      }
    );
  };

  // Download .md File
  const handleDownloadFile = () => {
    if (!generatedMarkdown) return;
    const blob = new Blob([generatedMarkdown], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    // Set descriptive filename based on type
    const timestamp = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `work2cv_${exportType}_export_${timestamp}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            Export Center
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
            Compile and download your work logs, reflections, and accomplishments as GitHub-Flavored Markdown.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* LEFT PANEL: Selection & Config (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-4">
            <div>
              <span className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                Export Type
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleTypeChange("logs")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    exportType === "logs"
                      ? "bg-indigo-50/20 border-indigo-500 dark:bg-indigo-950/10 text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "bg-transparent border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <FileText className="h-5 w-5 mb-1.5" />
                  <span className="text-[11px]">Work Logs</span>
                </button>

                <button
                  onClick={() => handleTypeChange("weekly_review")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    exportType === "weekly_review"
                      ? "bg-indigo-50/20 border-indigo-500 dark:bg-indigo-950/10 text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "bg-transparent border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <Calendar className="h-5 w-5 mb-1.5" />
                  <span className="text-[11px]">Weekly Reviews</span>
                </button>

                <button
                  onClick={() => handleTypeChange("cv_bullets")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    exportType === "cv_bullets"
                      ? "bg-indigo-50/20 border-indigo-500 dark:bg-indigo-950/10 text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "bg-transparent border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <Briefcase className="h-5 w-5 mb-1.5" />
                  <span className="text-[11px]">CV Bullets</span>
                </button>

                <button
                  onClick={() => handleTypeChange("full_summary")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    exportType === "full_summary"
                      ? "bg-indigo-50/20 border-indigo-500 dark:bg-indigo-950/10 text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "bg-transparent border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <Layers className="h-5 w-5 mb-1.5" />
                  <span className="text-[11px]">Full Summary</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Item checklist */}
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                {exportType === "logs" && `Select Logs (${selectedIds.length}/${logs.length})`}
                {exportType === "weekly_review" && `Select Weeks (${selectedIds.length}/${reviews.length})`}
                {exportType === "cv_bullets" && `Select Accomplishments (${selectedIds.length}/${bullets.length})`}
                {exportType === "full_summary" && "Summary Configuration"}
              </h3>

              {exportType !== "full_summary" && (
                <button
                  onClick={handleSelectAll}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 cursor-pointer"
                >
                  Toggle All
                </button>
              )}
            </div>

            {exportType === "logs" && (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {logs.length > 0 ? (
                  logs.map((log) => {
                    const isSelected = selectedIds.includes(log.id);
                    return (
                      <div
                        key={log.id}
                        onClick={() => handleToggleSelect(log.id)}
                        className={`flex items-start gap-2.5 p-2.5 border rounded-lg transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-50/10 border-indigo-500/50 dark:bg-indigo-950/5"
                            : "bg-transparent border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                        }`}
                      >
                        <div
                          className={`h-4 w-4 shrink-0 rounded border flex items-center justify-center mt-0.5 ${
                            isSelected
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "border-zinc-300 dark:border-zinc-700"
                          }`}
                        >
                          {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-400">
                            <span>{new Date(log.date).toLocaleDateString()}</span>
                            <span>&bull;</span>
                            <TaskTypeBadge type={log.taskType} />
                          </div>
                          <h4 className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate mt-1">
                            {log.title}
                          </h4>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-zinc-400 dark:text-zinc-500 text-xs">
                    No work logs found to export.
                  </div>
                )}
              </div>
            )}

            {exportType === "weekly_review" && (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {reviews.length > 0 ? (
                  reviews.map((review) => {
                    const isSelected = selectedIds.includes(review.id);
                    return (
                      <div
                        key={review.id}
                        onClick={() => handleToggleSelect(review.id)}
                        className={`flex items-start gap-2.5 p-2.5 border rounded-lg transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-50/10 border-indigo-500/50 dark:bg-indigo-950/5"
                            : "bg-transparent border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                        }`}
                      >
                        <div
                          className={`h-4 w-4 shrink-0 rounded border flex items-center justify-center mt-0.5 ${
                            isSelected
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "border-zinc-300 dark:border-zinc-700"
                          }`}
                        >
                          {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                            {review.weekStart} to {review.weekEnd}
                          </span>
                          <h4 className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate mt-1">
                            {review.shipped || "No review content prefilled"}
                          </h4>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-zinc-400 dark:text-zinc-500 text-xs">
                    No weekly reviews logged yet.
                  </div>
                )}
              </div>
            )}

            {exportType === "cv_bullets" && (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {bullets.length > 0 ? (
                  bullets.map((bullet) => {
                    const isSelected = selectedIds.includes(bullet.id);
                    return (
                      <div
                        key={bullet.id}
                        onClick={() => handleToggleSelect(bullet.id)}
                        className={`flex items-start gap-2.5 p-2.5 border rounded-lg transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-50/10 border-indigo-500/50 dark:bg-indigo-950/5"
                            : "bg-transparent border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                        }`}
                      >
                        <div
                          className={`h-4 w-4 shrink-0 rounded border flex items-center justify-center mt-0.5 ${
                            isSelected
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "border-zinc-300 dark:border-zinc-700"
                          }`}
                        >
                          {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                            {mapToneLabel(bullet.tone)}
                          </span>
                          <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 line-clamp-2 mt-1">
                            {bullet.content}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-zinc-400 dark:text-zinc-500 text-xs">
                    No saved accomplishments found.
                  </div>
                )}
              </div>
            )}

            {exportType === "full_summary" && (
              <div className="text-xs text-zinc-500 dark:text-zinc-400 p-2 leading-relaxed space-y-2.5">
                <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 font-semibold">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Comprehensive Export</span>
                </div>
                <p>
                  Exporting the full summary will bundle all logged achievements, reflection milestones, metadata summaries, and resume-ready bullets into a single, cohesive internship markdown document.
                </p>
                <div className="bg-zinc-50 dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200/50 dark:border-zinc-800/60 font-mono text-[10px] text-zinc-600 dark:text-zinc-400">
                  Includes: {logs.length} logs, {reviews.length} reviews, and {bullets.length} CV bullets.
                </div>
              </div>
            )}

            {/* Export Trigger */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
              <span className="text-[10px] text-zinc-400">
                {exportType !== "full_summary" && (
                  <>
                    {selectedIds.length === 0
                      ? "Exports all items"
                      : `Selected ${selectedIds.length} ${selectedIds.length === 1 ? "item" : "items"}`}
                  </>
                )}
              </span>

              <button
                onClick={handleGenerateExport}
                disabled={isExporting || (exportType === "logs" && logs.length === 0) || (exportType === "weekly_review" && reviews.length === 0) || (exportType === "cv_bullets" && bullets.length === 0)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Compiling...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    Generate Markdown
                  </>
                )}
              </button>
            </div>

            {exportError && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-[11px] text-red-800 dark:text-red-300 flex items-start gap-1.5 mt-2">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <span>{exportError}</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Markdown Preview Window (Span 3) */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <Download className="h-4 w-4 text-indigo-500" />
                  Markdown Export Preview
                </h3>
              </div>

              {generatedMarkdown && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyToClipboard}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy Code
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadFile}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 text-[10px] font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer shadow-xs transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download File
                  </button>
                </div>
              )}
            </div>

            {generatedMarkdown ? (
              <textarea
                readOnly
                rows={22}
                value={generatedMarkdown}
                className="w-full text-xs px-3.5 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-950/20 text-zinc-800 dark:text-zinc-100 focus:outline-none font-mono leading-relaxed select-all"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-20 bg-zinc-50/50 dark:bg-zinc-900/30 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-center">
                <FileText className="h-10 w-10 text-zinc-400 mb-3" />
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">
                  Ready to export
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm leading-relaxed">
                  Configure your items or export targets on the left, then click &ldquo;Generate Markdown&rdquo; to preview the styled output in this box.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
