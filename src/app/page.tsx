import Link from "next/link";
import {
  Plus,
  ArrowUpRight,
  FileText,
  Calendar,
  Code,
  CheckCircle2,
  AlertCircle,
  Copy,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

// Mock data for high-fidelity preview
const stats = [
  { name: "Total Work Logs", value: "12", change: "+4 this week", icon: FileText, color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30" },
  { name: "Logs This Week", value: "4", change: "100% of weekly goal", icon: Calendar, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30" },
  { name: "Top Tech", value: "Next.js", change: "Used in 8 logs", icon: Code, color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30" },
  { name: "Saved CV Bullets", value: "3", change: "Ready to export", icon: CheckCircle2, color: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30" },
];

const highlights = [
  {
    id: 1,
    title: "Scaffolded Work2CV App Foundation",
    date: "2026-05-20",
    type: "Feature",
    impact: "Implemented",
    desc: "Set up Next.js App Router, Tailwind CSS, TypeScript, and the App shell layouts.",
    tags: ["Next.js", "Tailwind CSS", "TypeScript"],
  },
  {
    id: 2,
    title: "Optimized Docker build stage size",
    date: "2026-05-18",
    type: "Refactor",
    impact: "Improved",
    desc: "Reduced Docker image size by 45% using multi-stage builds and alpine base image.",
    tags: ["Docker", "DevOps"],
  },
  {
    id: 3,
    title: "Resolved memory leak in event listener registration",
    date: "2026-05-15",
    type: "Bugfix",
    impact: "Fixed",
    desc: "Identified and cleaned up trailing window event listeners in page hooks.",
    tags: ["React", "JavaScript"],
  },
];

const topTags = [
  { name: "Next.js", count: 8, category: "Tech", color: "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200" },
  { name: "Tailwind CSS", count: 6, category: "Tool", color: "bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400" },
  { name: "TypeScript", count: 5, category: "Tech", color: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400" },
  { name: "React", count: 5, category: "Tech", color: "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-400" },
  { name: "Docker", count: 3, category: "Tool", color: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400" },
];

const taskTypes = [
  { name: "Feature Development", percentage: 45, count: 6, color: "bg-indigo-600" },
  { name: "Bug Fixing & Support", percentage: 25, count: 3, color: "bg-amber-500" },
  { name: "Refactoring & Cleanup", percentage: 15, count: 2, color: "bg-emerald-500" },
  { name: "Meetings & Research", percentage: 15, count: 1, color: "bg-blue-500" },
];

const cvBullets = [
  {
    id: 1,
    content: "Designed and scaffolded a local-first internship dashboard using Next.js App Router and Tailwind CSS, establishing a clean foundation for daily task tracking.",
    tone: "Concise CV",
  },
  {
    id: 2,
    content: "Identified and resolved a critical React hook memory leak, preventing unnecessary re-renders and improving client-side responsiveness during navigation.",
    tone: "Detailed CV",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Welcome back! Here is a summary of your internship contributions and learning progress.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/logs/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Add Work Log
          </Link>
        </div>
      </div>

      {/* Database Setup Alert (Placeholder status) */}
      <div className="flex items-start gap-3.5 p-4 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/10">
        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300">
            Initial Scaffolding Complete
          </h3>
          <p className="text-xs text-blue-700/80 dark:text-blue-400/80 mt-1">
            This dashboard is currently rendering structured preview placeholders. The database schemas, Prisma migrations, and seed scripts will be implemented in subsequent sprints to power these widgets dynamically.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  {stat.name}
                </span>
                <div className={`p-2 rounded-lg ${stat.color} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {stat.value}
                </span>
                <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  {stat.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Core Panels Grid */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Left Columns - Logs & Tasks (Span 2) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Highlights Widget */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-150 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  Recent Highlights
                </h2>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                  High-impact logs that highlight engineering contribution and learning.
                </p>
              </div>
              <Link
                href="/logs"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                View all logs
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {highlights.map((log) => (
                <div key={log.id} className="p-6 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all duration-200 group">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                        {log.date}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {log.type}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                        {log.impact}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-2 flex items-center gap-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {log.title}
                    <ChevronRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                    {log.desc}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {log.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-zinc-50 border border-zinc-200/60 dark:bg-zinc-900 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Task Type Distribution Widget */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm p-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Work Distribution
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                Breakdown of task types recorded in your internship log.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 mt-6">
              {/* Stacked Progress Bar representation */}
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 p-1">
                  {taskTypes.map((type) => (
                    <div
                      key={type.name}
                      style={{ width: `${type.percentage}%` }}
                      className={`h-full first:rounded-l-full last:rounded-r-full ${type.color} transition-all duration-300`}
                      title={`${type.name}: ${type.percentage}%`}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {taskTypes.map((type) => (
                    <div key={type.name} className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${type.color}`}></span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        {type.name} ({type.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistics Breakdown */}
              <div className="space-y-3 border-t sm:border-t-0 sm:border-l border-zinc-100 dark:border-zinc-800 pt-4 sm:pt-0 sm:pl-6">
                {taskTypes.map((type) => (
                  <div key={type.name} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">{type.name}</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-850 px-2 py-0.5 rounded">
                      {type.count} {type.count === 1 ? "log" : "logs"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Tech stack & CV Bullets */}
        <div className="space-y-8">
          {/* Top Technologies Widget */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm p-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Top Technologies
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                Most referenced tech stacks in your daily log items.
              </p>
            </div>
            <div className="space-y-3.5 mt-5">
              {topTags.map((tag, idx) => (
                <div key={tag.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 w-4">
                      #{idx + 1}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${tag.color}`}>
                      {tag.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tag.count} logs
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Saved CV Bullets Widget */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  Featured CV Bullets
                </h2>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                  Saved bullets generated from work logs.
                </p>
              </div>
              <Link
                href="/cv-builder"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                Build Bullets
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {cvBullets.map((bullet) => (
                <div key={bullet.id} className="p-5 hover:bg-zinc-50/30 dark:hover:bg-zinc-900/10 group transition-all">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide rounded bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/20">
                      {bullet.tone}
                    </span>
                    <button
                      className="p-1 rounded text-zinc-400 hover:text-indigo-600 dark:text-zinc-500 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-zinc-650 dark:text-zinc-300 mt-2.5 leading-relaxed font-mono select-all">
                    &bull; {bullet.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
