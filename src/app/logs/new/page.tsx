"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import LogForm, { type LogFormInitialData } from "@/components/LogForm";
import AiAssistantPanel, { type AiAssistantDraft } from "@/components/AiAssistantPanel";

export default function NewLogPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // AI draft hydration states
  const [formKey, setFormKey] = useState<number>(0);
  const [draftData, setDraftData] = useState<LogFormInitialData | undefined>(undefined);
  const [availableTags, setAvailableTags] = useState<Array<{ id: string; name: string; category: string }>>([]);

  // Fetch available tags in parent page to resolve AI matched tag names to database IDs
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch("/api/tags");
        if (res.ok) {
          const json = await res.json();
          setAvailableTags(json.data || []);
        }
      } catch (err) {
        console.error("Error fetching tags in NewLogPage:", err);
      }
    };
    fetchTags();
  }, []);

  const handleApplyDraft = (draft: AiAssistantDraft) => {
    // Map tag names to existing database tag IDs
    const matchedTagIds: string[] = [];
    if (draft.matchedTagNames && Array.isArray(draft.matchedTagNames)) {
      draft.matchedTagNames.forEach((name: string) => {
        const found = availableTags.find(t => t.name.toLowerCase() === name.toLowerCase());
        if (found) {
          matchedTagIds.push(found.id);
        }
      });
    }

    const initial: LogFormInitialData = {
      date: new Date().toISOString().split("T")[0],
      title: draft.title || "",
      description: draft.description || "",
      taskType: draft.taskType || "feature",
      impactLevel: draft.impactLevel || "implemented",
      tagIds: matchedTagIds,
      problem: draft.problem || "",
      solution: draft.solution || "",
      learning: draft.learning || "",
      links: draft.links && draft.links.length > 0 ? draft.links : [""],
    };

    setDraftData(initial);
    // Remount LogForm to re-initialize form state with the new draft values
    setFormKey(prev => prev + 1);
  };

  const handleSubmit = async (payload: {
    date: string;
    title: string;
    description: string | null;
    taskType: string;
    impactLevel: string;
    problem: string | null;
    solution: string | null;
    learning: string | null;
    links: string[];
    tagIds: string[];
  }) => {
    setFormError(null);
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/logs", {
        method: "POST",
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
          setFieldErrors(errors);
          throw new Error("Validation failed. Please check the fields below.");
        }
        throw new Error(json.error?.message || "An unexpected error occurred while saving the work log.");
      }

      router.push("/logs");
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Error saving work log.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <Link
          href="/logs"
          className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-800 cursor-pointer"
          title="Back to logs"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Create Work Log
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Record a daily task entry with description, impact level, and tech tags.
          </p>
        </div>
      </div>

      {/* AI Assistant panel */}
      <AiAssistantPanel onApplyDraft={handleApplyDraft} />

      {formError && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-sm text-red-800 dark:text-red-300 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <div>{formError}</div>
        </div>
      )}

      <LogForm
        key={formKey}
        initialData={draftData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitButtonLabel="Save Work Log"
        onCancel={() => router.push("/logs")}
        externalError={formError}
        externalFieldErrors={fieldErrors}
      />
    </div>
  );
}
