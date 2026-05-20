"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Calendar, 
  Edit, 
  Trash2, 
  Loader2, 
  Link as LinkIcon, 
  AlertCircle,
  Clock,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  Tag as TagIcon
} from "lucide-react";
import { 
  type TaskType, 
  type ImpactLevel, 
  type TagCategory,
  TAG_CATEGORIES,
  TAG_CATEGORY_LABELS
} from "@/constants";
import TaskTypeBadge from "@/components/TaskTypeBadge";
import ImpactBadge from "@/components/ImpactBadge";
import TagBadge from "@/components/TagBadge";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import LogForm, { type LogFormInitialData } from "@/components/LogForm";

interface Tag {
  id: string;
  name: string;
  category: TagCategory;
}

interface WorkLog {
  id: string;
  date: string;
  title: string;
  description: string | null;
  taskType: TaskType;
  impactLevel: ImpactLevel;
  problem: string | null;
  solution: string | null;
  learning: string | null;
  links: string[];
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

function formatDate(dateStr: string) {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function LogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // Load and error states
  const [log, setLog] = useState<WorkLog | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Edit states
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({});

  // Delete states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchLog = useCallback(async () => {
    await Promise.resolve();
    setIsLoading(true);
    setError(null);
    setIsNotFound(false);
    try {
      const res = await fetch(`/api/logs/${id}`);
      if (res.status === 404) {
        setIsNotFound(true);
        return;
      }
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error?.message || "Failed to load the work log.");
      }
      setLog(json.data);
    } catch (err: unknown) {
      console.error("Error fetching log:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLog();
  }, [fetchLog]);

  const handleUpdateSubmit = async (payload: {
    date: string;
    title: string;
    description: string | null;
    taskType: TaskType;
    impactLevel: ImpactLevel;
    problem: string | null;
    solution: string | null;
    learning: string | null;
    links: string[];
    tagIds: string[];
  }) => {
    setEditError(null);
    setEditFieldErrors({});
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/logs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        if (res.status === 400 && json.error?.code === "VALIDATION_ERROR") {
          const errors: Record<string, string> = {};
          json.error.details?.forEach((detail: { field: string; message: string }) => {
            errors[detail.field] = detail.message;
          });
          setEditFieldErrors(errors);
          throw new Error("Validation failed. Please check the fields below.");
        }
        throw new Error(json.error?.message || "Failed to update work log.");
      }

      setLog(json.data);
      setIsEditing(false);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Error updating work log.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/logs/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error?.message || "Failed to delete work log.");
      }
      setShowDeleteConfirm(false);
      router.push("/logs");
    } catch (err: unknown) {
      console.error("Error deleting log:", err);
      alert(err instanceof Error ? err.message : "Failed to delete work log.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="flex justify-between items-center pb-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="space-y-2">
            <div className="h-9 w-64 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
          <div className="h-9 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        </div>
        <LoadingState rows={2} />
      </div>
    );
  }

  if (isNotFound || !log) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          title="Work log not found"
          description={`The work log with ID "${id}" could not be found or has been deleted.`}
          actionLabel="Back to Logs"
          actionHref="/logs"
          icon={AlertCircle}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorState
          title="Failed to load work log"
          description={error}
          onRetry={fetchLog}
        />
      </div>
    );
  }

  // Map log to LogFormInitialData type
  const formInitialData: LogFormInitialData = {
    date: log.date,
    title: log.title,
    description: log.description || "",
    taskType: log.taskType,
    impactLevel: log.impactLevel,
    tagIds: log.tags.map((t) => t.id),
    problem: log.problem || "",
    solution: log.solution || "",
    learning: log.learning || "",
    links: log.links,
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 dark:text-zinc-500">
        <Link href="/logs" className="hover:text-zinc-700 dark:hover:text-zinc-300">Logs</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-zinc-600 dark:text-zinc-400 truncate max-w-xs">{log.title}</span>
      </div>

      {/* Header card / block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/logs"
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-800 cursor-pointer animate-fade-in"
            title="Back to logs"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {isEditing ? "Edit Work Log" : "Work Log Details"}
            </h1>
            {!isEditing && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 flex flex-wrap items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Created {new Date(log.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>Updated {new Date(log.updatedAt).toLocaleDateString()}</span>
              </p>
            )}
          </div>
        </div>

        {!isEditing && (
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors"
            >
              <Edit className="h-3.5 w-3.5 animate-pulse-subtle" />
              Edit Log
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10 hover:bg-red-100/50 dark:hover:bg-red-950/20 text-red-700 dark:text-red-400 cursor-pointer transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Log
            </button>
          </div>
        )}
      </div>

      {editError && isEditing && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-sm text-red-800 dark:text-red-300 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <div>{editError}</div>
        </div>
      )}

      {isEditing ? (
        <div className="animate-fade-in">
          <LogForm
            initialData={formInitialData}
            onSubmit={handleUpdateSubmit}
            isSubmitting={isSubmitting}
            submitButtonLabel="Save Changes"
            onCancel={() => {
              setIsEditing(false);
              setEditError(null);
              setEditFieldErrors({});
            }}
            externalError={editError}
            externalFieldErrors={editFieldErrors}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Left Column: Title, Description, Problem/Solution/Learning */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Info Card */}
            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-5">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(log.date)}
                  </span>
                  <span className="text-zinc-300 dark:text-zinc-700">|</span>
                  <TaskTypeBadge type={log.taskType} />
                  <ImpactBadge impact={log.impactLevel} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-snug">
                  {log.title}
                </h2>
              </div>

              {log.description ? (
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                  <h4 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                    Description / Details
                  </h4>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {log.description}
                  </p>
                </div>
              ) : (
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 italic text-sm text-zinc-400">
                  No description provided.
                </div>
              )}
            </div>

            {/* Problem-Solution-Learning Section */}
            {(log.problem || log.solution || log.learning) && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                  Problems & Learnings
                </h3>

                {log.problem && (
                  <div className="bg-red-50/20 dark:bg-red-950/5 border border-red-100 dark:border-red-900/30 rounded-xl p-5 shadow-xs space-y-2">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                      <HelpCircle className="h-4 w-4" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">Problem Faced</h4>
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed pl-6">
                      {log.problem}
                    </p>
                  </div>
                )}

                {log.solution && (
                  <div className="bg-emerald-50/20 dark:bg-emerald-950/5 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-5 shadow-xs space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">Solution Applied</h4>
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed pl-6">
                      {log.solution}
                    </p>
                  </div>
                )}

                {log.learning && (
                  <div className="bg-indigo-50/20 dark:bg-indigo-950/5 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-5 shadow-xs space-y-2">
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                      <BookOpen className="h-4 w-4" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">Lessons Learned</h4>
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed pl-6">
                      {log.learning}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Tags & Reference Links */}
          <div className="space-y-6">
            {/* Tags card */}
            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
                <TagIcon className="h-4 w-4 text-indigo-500" />
                Tags & Technologies
              </h3>
              
              {log.tags.length === 0 ? (
                <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">No tags associated with this log.</p>
              ) : (
                <div className="space-y-3">
                  {TAG_CATEGORIES.map((cat) => {
                    const catTags = log.tags.filter((t) => t.category === cat);
                    if (catTags.length === 0) return null;
                    return (
                      <div key={cat} className="space-y-1.5">
                        <span className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          {TAG_CATEGORY_LABELS[cat]}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {catTags.map((tag) => (
                            <TagBadge key={tag.id} name={tag.name} category={tag.category} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reference Links card */}
            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
                <LinkIcon className="h-4 w-4 text-indigo-500" />
                Reference Links
              </h3>
              
              {log.links.length === 0 ? (
                <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">No links provided.</p>
              ) : (
                <ul className="space-y-2.5">
                  {log.links.map((link, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <LinkIcon className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline break-all font-medium leading-normal cursor-pointer"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-xl animate-scale-in">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Delete Work Log?</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              Are you sure you want to delete this work log? This action is permanent and cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer"
              >
                {isDeleting ? (
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
