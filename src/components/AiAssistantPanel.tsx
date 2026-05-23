"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  Loader2, 
  ArrowRight, 
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Link as LinkIcon,
  Tag as TagIcon,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from "lucide-react";
import { TASK_TYPE_LABELS, IMPACT_LEVEL_LABELS, type TaskType, type ImpactLevel } from "@/constants";

export interface AiAssistantDraft {
  title: string;
  description: string;
  taskType: TaskType;
  impactLevel: ImpactLevel;
  problem: string | null;
  solution: string | null;
  learning: string | null;
  links: string[];
  matchedTagNames: string[];
  suggestedNewTags: Array<{ name: string; category: "tech" | "domain" | "skill" | "tool" }>;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  isDraftReady?: boolean;
  followUpQuestion?: string | null;
  draft?: AiAssistantDraft | null;
}

interface AiAssistantPanelProps {
  onApplyDraft: (draft: NonNullable<Message["draft"]>) => void;
}

export default function AiAssistantPanel({ onApplyDraft }: AiAssistantPanelProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [userMessage, setUserMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isServiceUnavailable, setIsServiceUnavailable] = useState<boolean>(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the chat list
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = userMessage.trim();
    if (!trimmedMessage || isLoading) return;

    setError(null);
    setIsLoading(true);

    const newUserMessage: Message = {
      role: "user",
      content: trimmedMessage,
    };

    // Update history locally
    const updatedHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedHistory);
    setUserMessage("");

    try {
      const res = await fetch("/api/ai/new-log-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: trimmedMessage,
          chatHistory: chatHistory.map(msg => ({ role: msg.role, content: msg.content })),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 503) {
          setIsServiceUnavailable(true);
          throw new Error(json.error?.message || "AI service is currently unavailable.");
        }
        throw new Error(json.error?.message || "Something went wrong. Please try again.");
      }

      const aiData = json.data;
      const aiMessage: Message = {
        role: "assistant",
        content: aiData.followUpQuestion || "I have prepared a draft based on your work logs details.",
        isDraftReady: aiData.isDraftReady,
        followUpQuestion: aiData.followUpQuestion,
        draft: aiData.draft,
      };

      setChatHistory(prev => [...prev, aiMessage]);
    } catch (err: unknown) {
      console.error("AI Assistant chat error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      // Rollback last message to let user edit/retry
      setChatHistory(chatHistory);
      setUserMessage(trimmedMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setChatHistory([]);
    setUserMessage("");
    setError(null);
  };

  if (isServiceUnavailable) {
    return (
      <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-zinc-500">
          <Sparkles className="h-4 w-4" />
          <h3 className="text-sm font-semibold">AI Assistant Offline</h3>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          The AI Chat Assistant is currently disabled because the required environment variables (OPENROUTER_API_KEY) are not configured. You can still create and log your work using the manual form.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden transition-all duration-300">
      {/* Panel Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/10 cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-2.5 text-zinc-900 dark:text-zinc-100">
          <div className="p-1 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>
          <span className="text-sm font-bold tracking-tight">AI Assisted Log Creator</span>
        </div>
        <div className="flex items-center gap-3">
          {chatHistory.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Reset Chat"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
          {isOpen ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
        </div>
      </button>

      {/* Panel Body */}
      {isOpen && (
        <div className="p-4 space-y-4">
          {/* Chat Messages */}
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
            {chatHistory.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <div className="inline-flex p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                  Describe what you worked on in natural language (e.g., &quot;I optimized database queries and created some tags on my log form&quot;). I will draft the log details for you!
                </p>
              </div>
            ) : (
              chatHistory.map((msg, idx) => (
                <div key={idx} className={`space-y-2 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                  <div 
                    className={`inline-block px-3 py-2 text-xs rounded-xl max-w-[90%] leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-indigo-600 text-white rounded-br-none" 
                        : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* AI Draft preview container */}
                  {msg.role === "assistant" && msg.draft && (
                    <div className="mt-3 p-4 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3 shadow-xs max-w-[95%] text-left">
                      <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
                        <Sparkles className="h-3.5 w-3.5" />
                        AI Suggested Draft
                      </div>
                      
                      <div className="space-y-2.5 text-xs">
                        <div>
                          <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Suggested Title</span>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{msg.draft.title}</span>
                        </div>

                        {msg.draft.description && (
                          <div>
                            <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Details</span>
                            <span className="text-zinc-600 dark:text-zinc-400 block line-clamp-3">{msg.draft.description}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Task Type</span>
                            <span className="inline-flex mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                              {TASK_TYPE_LABELS[msg.draft.taskType as keyof typeof TASK_TYPE_LABELS] || msg.draft.taskType}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Impact</span>
                            <span className="inline-flex mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                              {IMPACT_LEVEL_LABELS[msg.draft.impactLevel as keyof typeof IMPACT_LEVEL_LABELS] || msg.draft.impactLevel}
                            </span>
                          </div>
                        </div>

                        {/* Matched tags */}
                        {msg.draft.matchedTagNames && msg.draft.matchedTagNames.length > 0 && (
                          <div>
                            <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <TagIcon className="h-3 w-3" />
                              Matched Tags
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {msg.draft.matchedTagNames.map((tag, tIdx) => (
                                <span key={tIdx} className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 rounded text-[9px] font-semibold">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Suggested new tags */}
                        {msg.draft.suggestedNewTags && msg.draft.suggestedNewTags.length > 0 && (
                          <div>
                            <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <HelpCircle className="h-3 w-3" />
                              Suggested Tags (Create manually if desired)
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {msg.draft.suggestedNewTags.map((tag, tIdx) => (
                                <span key={tIdx} className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 rounded text-[9px] font-semibold">
                                  {tag.name} ({tag.category})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Detected links */}
                        {msg.draft.links && msg.draft.links.length > 0 && (
                          <div>
                            <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <LinkIcon className="h-3 w-3" />
                              Detected Links
                            </span>
                            <ul className="space-y-0.5">
                              {msg.draft.links.map((link, lIdx) => (
                                <li key={lIdx} className="truncate">
                                  <a href={link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-500 dark:text-indigo-400 hover:underline">
                                    {link}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {msg.isDraftReady && (
                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex justify-end">
                          <button
                            type="button"
                            onClick={() => onApplyDraft(msg.draft!)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors cursor-pointer"
                          >
                            Apply Draft to Form
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-zinc-400 italic">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                AI is thinking...
              </div>
            )}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300 flex items-start gap-2 max-w-[90%]">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form Input */}
          <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <textarea
              placeholder={
                chatHistory.length > 0 
                  ? "Answer follow-up questions or add more details..." 
                  : "Describe today's work..."
              }
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              className="flex-grow text-xs px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 min-h-[38px] max-h-[120px] resize-y"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !userMessage.trim()}
              className="px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded flex items-center justify-center cursor-pointer transition-colors"
              title="Send Message"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
