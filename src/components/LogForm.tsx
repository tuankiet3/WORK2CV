"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Loader2, 
  Tag as TagIcon, 
  Link as LinkIcon, 
  Check
} from "lucide-react";
import { 
  type TaskType, 
  type ImpactLevel, 
  type TagCategory,
  TASK_TYPES,
  IMPACT_LEVELS,
  TAG_CATEGORIES,
  TASK_TYPE_LABELS,
  IMPACT_LEVEL_LABELS,
  TAG_CATEGORY_LABELS
} from "@/constants";
import TagBadge from "@/components/TagBadge";

interface Tag {
  id: string;
  name: string;
  category: TagCategory;
}

export interface LogFormInitialData {
  date: string;
  title: string;
  description: string;
  taskType: TaskType;
  impactLevel: ImpactLevel;
  tagIds: string[];
  problem: string;
  solution: string;
  learning: string;
  links: string[];
}

interface LogFormProps {
  initialData?: LogFormInitialData;
  onSubmit: (data: {
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
  }) => Promise<void>;
  isSubmitting: boolean;
  submitButtonLabel: string;
  onCancel: () => void;
  externalError?: string | null;
  externalFieldErrors?: Record<string, string>;
}

export default function LogForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitButtonLabel,
  onCancel,
  externalFieldErrors = {}
}: LogFormProps) {
  // Form field states initialized with initialData or defaults
  const [date, setDate] = useState<string>(() => {
    return initialData?.date || new Date().toISOString().split("T")[0];
  });
  const [title, setTitle] = useState<string>(() => initialData?.title || "");
  const [description, setDescription] = useState<string>(() => initialData?.description || "");
  const [taskType, setTaskType] = useState<TaskType>(() => initialData?.taskType || "feature");
  const [impactLevel, setImpactLevel] = useState<ImpactLevel>(() => initialData?.impactLevel || "implemented");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(() => initialData?.tagIds || []);
  const [problem, setProblem] = useState<string>(() => initialData?.problem || "");
  const [solution, setSolution] = useState<string>(() => initialData?.solution || "");
  const [learning, setLearning] = useState<string>(() => initialData?.learning || "");
  const [links, setLinks] = useState<string[]>(() => {
    if (initialData?.links && initialData.links.length > 0) {
      return initialData.links;
    }
    return [""];
  });

  // Tags list and loading
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isFetchingTags, setIsFetchingTags] = useState<boolean>(true);

  // Client-side validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Inline tag creation states
  const [newTagName, setNewTagName] = useState<string>("");
  const [newTagCategory, setNewTagCategory] = useState<TagCategory>("tech");
  const [isCreatingTag, setIsCreatingTag] = useState<boolean>(false);
  const [tagCreationError, setTagCreationError] = useState<string | null>(null);

  // Sync external validation errors when they arrive
  useEffect(() => {
    let active = true;
    if (externalFieldErrors && Object.keys(externalFieldErrors).length > 0) {
      Promise.resolve().then(() => {
        if (active) {
          setFieldErrors(externalFieldErrors);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [externalFieldErrors]);

  // Fetch available tags on mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch("/api/tags");
        if (res.ok) {
          const json = await res.json();
          setAvailableTags(json.data || []);
        }
      } catch (err) {
        console.error("Error fetching tags:", err);
      } finally {
        setIsFetchingTags(false);
      }
    };
    fetchTags();
  }, []);

  const handleLinkChange = (index: number, value: string) => {
    const updated = [...links];
    updated[index] = value;
    setLinks(updated);
  };

  const handleAddLink = () => {
    setLinks([...links, ""]);
  };

  const handleRemoveLink = (index: number) => {
    const updated = links.filter((_, i) => i !== index);
    setLinks(updated.length === 0 ? [""] : updated);
  };

  const toggleTagSelection = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleCreateTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTagCreationError(null);
    const trimmedName = newTagName.trim();

    if (!trimmedName) {
      setTagCreationError("Tag name is required");
      return;
    }
    if (trimmedName.length > 50) {
      setTagCreationError("Tag name must be 50 characters or less");
      return;
    }

    setIsCreatingTag(true);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, category: newTagCategory }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to create tag");
      }

      const createdTag: Tag = json.data;
      setAvailableTags((prev) => {
        if (prev.some((t) => t.id === createdTag.id)) return prev;
        return [...prev, createdTag];
      });
      setSelectedTagIds((prev) => [...prev, createdTag.id]);
      setNewTagName("");
    } catch (err: unknown) {
      setTagCreationError(err instanceof Error ? err.message : "Error creating tag");
    } finally {
      setIsCreatingTag(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = "Title is required";
    }
    if (!date) {
      errors.date = "Date is required";
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errors.date = "Invalid date format (must be YYYY-MM-DD)";
    }

    // Validate link URLs if filled
    links.forEach((link, idx) => {
      const trimmed = link.trim();
      if (trimmed) {
        try {
          new URL(trimmed);
        } catch {
          errors[`links.${idx}`] = "Invalid URL format (e.g. https://github.com)";
        }
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    const payload = {
      date,
      title: title.trim(),
      description: description.trim() || null,
      taskType,
      impactLevel,
      problem: problem.trim() || null,
      solution: solution.trim() || null,
      learning: learning.trim() || null,
      links: links.map((l) => l.trim()).filter(Boolean),
      tagIds: selectedTagIds,
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Column */}
      <div className="lg:col-span-2 space-y-6 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
        
        {/* Row: Date & Title */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="date" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full text-sm pl-9 pr-3 py-2 border rounded-md bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                  fieldErrors.date ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"
                }`}
                required
              />
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
            </div>
            {fieldErrors.date && (
              <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.date}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="title" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Title / Short Summary <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Implement login flow using OAuth2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full text-sm px-3 py-2 border rounded-md bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                fieldErrors.title ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"
              }`}
              required
            />
            {fieldErrors.title && (
              <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.title}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
            Task Details / Description
          </label>
          <textarea
            id="description"
            rows={4}
            placeholder="Provide a detailed description of what you worked on today..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-sm px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-md bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {fieldErrors.description && (
            <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.description}</p>
          )}
        </div>

        {/* Grid: Task Type & Impact Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="taskType" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Task Type <span className="text-red-500">*</span>
            </label>
            <select
              id="taskType"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as TaskType)}
              className="w-full text-sm px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {TASK_TYPES.map((type) => (
                <option key={type} value={type}>
                  {TASK_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="impactLevel" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Impact Level <span className="text-red-500">*</span>
            </label>
            <select
              id="impactLevel"
              value={impactLevel}
              onChange={(e) => setImpactLevel(e.target.value as ImpactLevel)}
              className="w-full text-sm px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {IMPACT_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {IMPACT_LEVEL_LABELS[level]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Links Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Reference Links
            </label>
            <button
              type="button"
              onClick={handleAddLink}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Link
            </button>
          </div>
          
          <div className="space-y-2">
            {links.map((link, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <div className="relative flex-grow">
                  <input
                    type="url"
                    placeholder="https://github.com/pull/123"
                    value={link}
                    onChange={(e) => handleLinkChange(idx, e.target.value)}
                    className={`w-full text-sm pl-9 pr-3 py-2 border rounded-md bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                      fieldErrors[`links.${idx}`] ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"
                    }`}
                  />
                  <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                </div>
                {links.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(idx)}
                    className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-400 hover:text-red-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                    title="Remove link"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {/* Show any link specific errors */}
          {Object.keys(fieldErrors).map((key) => {
            if (key.startsWith("links.")) {
              return (
                <p key={key} className="text-xs text-red-500 font-medium">
                  Line {parseInt(key.split(".")[1], 10) + 1}: {fieldErrors[key]}
                </p>
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* Sidebar Column: Tags, Problem, Solution, Learning */}
      <div className="space-y-6">
        {/* Tags Box */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <TagIcon className="h-4 w-4 text-indigo-500" />
            Tags & Technologies
          </h3>

          {/* Selected Tags list */}
          <div>
            <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Selected Tags
            </span>
            {selectedTagIds.length === 0 ? (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">No tags selected. Click tags below to select them.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {availableTags
                  .filter((t) => selectedTagIds.includes(t.id))
                  .map((tag) => (
                    <TagBadge
                      key={tag.id}
                      name={tag.name}
                      category={tag.category}
                      onClick={() => toggleTagSelection(tag.id)}
                      className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 hover:border-red-200 select-none"
                    />
                  ))}
              </div>
            )}
          </div>

          {/* Available Tags list, grouped by category */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3">
            <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Available Tags
            </span>
            
            {isFetchingTags ? (
              <div className="flex items-center gap-2 text-xs text-zinc-400 italic">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading tags...
              </div>
            ) : availableTags.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">No tags found. Add one below!</p>
            ) : (
              TAG_CATEGORIES.map((cat) => {
                const catTags = availableTags.filter((t) => t.category === cat);
                if (catTags.length === 0) return null;
                return (
                  <div key={cat} className="space-y-1">
                    <span className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      {TAG_CATEGORY_LABELS[cat]}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {catTags.map((tag) => {
                        const isSelected = selectedTagIds.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTagSelection(tag.id)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium transition-all select-none cursor-pointer ${
                              isSelected
                                ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300"
                                : "bg-zinc-50/60 border-zinc-200 text-zinc-600 dark:bg-zinc-900/60 dark:border-zinc-800 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                            {tag.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Inline tag creation */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
            <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Create New Tag
            </span>
            
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Tag name (e.g. NextJS)"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              
              <div className="flex gap-2">
                <select
                  value={newTagCategory}
                  onChange={(e) => setNewTagCategory(e.target.value as TagCategory)}
                  className="flex-grow text-xs px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 focus:outline-none"
                >
                  {TAG_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {TAG_CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleCreateTagSubmit}
                  disabled={isCreatingTag}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer"
                >
                  {isCreatingTag ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Create"
                  )}
                </button>
              </div>

              {tagCreationError && (
                <p className="text-[11px] text-red-500 font-medium">⚠️ {tagCreationError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Problem, Solution & Learnings */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Problems & Learnings (Optional)
          </h3>

          <div>
            <label htmlFor="problem" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Problem Faced
            </label>
            <textarea
              id="problem"
              rows={2}
              placeholder="What blockages, errors, or bugs did you encounter?"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="solution" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Solution Applied
            </label>
            <textarea
              id="solution"
              rows={2}
              placeholder="How did you resolve it? (Algorithms, configurations...)"
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="learning" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Learning / Takeaway
            </label>
            <textarea
              id="learning"
              rows={2}
              placeholder="Key lessons, skills, or techniques learned today..."
              value={learning}
              onChange={(e) => setLearning(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="col-span-1 lg:col-span-3 flex justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-lg shadow-sm hover:shadow-indigo-100 dark:hover:shadow-none disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            submitButtonLabel
          )}
        </button>
      </div>
    </form>
  );
}
