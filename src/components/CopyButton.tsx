"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export default function CopyButton({ text, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 dark:text-zinc-500 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 cursor-pointer ${className}`}
      title={copied ? "Copied!" : "Copy to clipboard"}
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
