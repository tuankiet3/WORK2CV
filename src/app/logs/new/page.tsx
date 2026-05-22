"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import LogForm from "@/components/LogForm";

export default function NewLogPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

      {formError && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-sm text-red-800 dark:text-red-300 flex items-start gap-3 animate-fade-in">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <div>{formError}</div>
        </div>
      )}

      <LogForm
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
