import React from "react";
import { type TagCategory } from "@/constants";

interface TagBadgeProps {
  name: string;
  category?: TagCategory;
  className?: string;
  onClick?: () => void;
}

const colors: Record<TagCategory, string> = {
  tech: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50",
  domain: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
  skill: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/50",
  tool: "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
};

export default function TagBadge({ 
  name, 
  category, 
  className = "", 
  onClick 
}: TagBadgeProps) {
  const colorClasses = (category && colors[category]) 
    ? colors[category] 
    : "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800";

  const interactiveClasses = onClick 
    ? "cursor-pointer hover:opacity-85 transition-opacity" 
    : "";

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${colorClasses} ${interactiveClasses} ${className}`}
    >
      {name}
    </span>
  );
}
