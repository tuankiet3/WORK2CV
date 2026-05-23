import React, { Suspense } from "react";
import Link from "next/link";
import {
  Plus,
  ArrowUpRight,
  FileText,
  Calendar,
  Code,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import TaskTypeBadge from "@/components/TaskTypeBadge";
import ImpactBadge from "@/components/ImpactBadge";
import TagBadge from "@/components/TagBadge";
import ErrorState from "@/components/ErrorState";
import CopyButton from "@/components/CopyButton";
import SummaryCard from "@/components/SummaryCard";
import {
  type TagCategory,
  type TaskType,
  type CvTone,
  type ImpactLevel,
  TASK_TYPE_LABELS,
  CV_TONE_LABELS,
  IMPACT_LEVEL_LABELS,
} from "@/constants";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// UTC Date helper to calculate Monday 00:00:00 to Sunday 23:59:59.999 bounds
function getCurrentWeekBoundsUTC() {
  const now = new Date();
  const day = now.getUTCDay();
  // Monday is 1, Sunday is 0. If Sunday, go back 6 days. Otherwise go back (day - 1) days.
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const startOfWeek = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + diffToMonday,
    0, 0, 0, 0
  ));

  const endOfWeek = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + diffToMonday + 6,
    23, 59, 59, 999
  ));

  return { startOfWeek, endOfWeek };
}

async function DashboardContent() {
  let totalLogs = 0;
  let logsThisWeek = 0;
  let savedCvBullets = 0;
  let topTechTag: { name: string; _count: { workLogs: number } } | null = null;
  let highlights: Array<{
    id: string;
    title: string;
    date: string;
    type: string;
    impact: string;
    desc: string;
    tags: Array<{ name: string; category: TagCategory }>;
  }> = [];
  let topTags: Array<{ name: string; count: number; category: TagCategory }> = [];
  let taskTypes: Array<{ name: string; type: TaskType; percentage: number; count: number; color: string }> = [];
  let impactTypes: Array<{ name: string; percentage: number; count: number; color: string }> = [];
  let cvBullets: Array<{ id: string; content: string; tone: string }> = [];
  let hasError = false;

  try {
    const { startOfWeek, endOfWeek } = getCurrentWeekBoundsUTC();

    // Query DB data concurrently
    const [
      dbTotalLogs,
      dbLogsThisWeek,
      dbSavedCvBullets,
      dbTopTechTag,
      dbHighlights,
      dbTopTags,
      dbTaskTypeCounts,
      dbImpactLevelCounts,
      dbCvBullets
    ] = await Promise.all([
      prisma.workLog.count(),
      prisma.workLog.count({
        where: {
          date: {
            gte: startOfWeek,
            lte: endOfWeek,
          },
        },
      }),
      prisma.cvBullet.count(),
      prisma.tag.findFirst({
        where: { category: "tech" },
        select: {
          name: true,
          _count: {
            select: { workLogs: true },
          },
        },
        orderBy: {
          workLogs: {
            _count: "desc",
          },
        },
      }),
      prisma.workLog.findMany({
        where: {
          impactLevel: {
            in: ["implemented", "reviewed", "fixed", "improved"],
          },
        },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: [
          { date: "desc" },
          { createdAt: "desc" },
        ],
        take: 5,
      }),
      prisma.tag.findMany({
        select: {
          name: true,
          category: true,
          _count: {
            select: { workLogs: true },
          },
        },
        where: {
          category: "tech",
          workLogs: {
            some: {},
          },
        },
        orderBy: {
          workLogs: {
            _count: "desc",
          },
        },
        take: 5,
      }),
      prisma.workLog.groupBy({
        by: ["taskType"],
        _count: {
          _all: true,
        },
      }),
      prisma.workLog.groupBy({
        by: ["impactLevel"],
        _count: {
          _all: true,
        },
      }),
      prisma.cvBullet.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 3,
      }),
    ]);

    totalLogs = dbTotalLogs;
    logsThisWeek = dbLogsThisWeek;
    savedCvBullets = dbSavedCvBullets;
    topTechTag = dbTopTechTag;

    highlights = dbHighlights.map((log) => ({
      id: log.id,
      title: log.title,
      date: log.date.toISOString().split("T")[0],
      type: log.taskType,
      impact: log.impactLevel,
      desc: log.description || "",
      tags: log.tags.map((t) => ({
        name: t.tag.name,
        category: t.tag.category as TagCategory,
      })),
    }));

    topTags = dbTopTags.map((tag) => ({
      name: tag.name,
      count: tag._count.workLogs,
      category: tag.category as TagCategory,
    }));

    taskTypes = dbTaskTypeCounts
      .map((item) => {
        const percentage = dbTotalLogs > 0
          ? Math.round((item._count._all / dbTotalLogs) * 100)
          : 0;

        const label = TASK_TYPE_LABELS[item.taskType as TaskType] || item.taskType;

        const colorMap: Record<string, string> = {
          feature: "bg-indigo-600",
          bugfix: "bg-rose-500",
          refactor: "bg-teal-500",
          testing: "bg-emerald-500",
          onboarding: "bg-blue-500",
          code_review: "bg-fuchsia-500",
          documentation: "bg-sky-500",
          meeting: "bg-amber-500",
          research: "bg-orange-500",
          support: "bg-zinc-500",
        };
        const color = colorMap[item.taskType] || "bg-zinc-400";

        return {
          name: label,
          type: item.taskType as TaskType,
          percentage,
          count: item._count._all,
          color,
        };
      })
      .sort((a, b) => b.count - a.count);

    const impactLevelColors: Record<string, string> = {
      implemented: "bg-emerald-600",
      reviewed: "bg-violet-600",
      fixed: "bg-rose-500",
      improved: "bg-amber-500",
      assisted: "bg-zinc-500",
      learned: "bg-slate-500",
    };

    impactTypes = dbImpactLevelCounts
      .map((item) => {
        const percentage = dbTotalLogs > 0
          ? Math.round((item._count._all / dbTotalLogs) * 100)
          : 0;

        const label = IMPACT_LEVEL_LABELS[item.impactLevel as ImpactLevel] || item.impactLevel;
        const color = impactLevelColors[item.impactLevel] || "bg-zinc-400";

        return {
          name: label,
          percentage,
          count: item._count._all,
          color,
        };
      })
      .sort((a, b) => b.count - a.count);

    cvBullets = dbCvBullets.map((bullet) => ({
      id: bullet.id,
      content: bullet.content,
      tone: CV_TONE_LABELS[bullet.tone as CvTone] || bullet.tone,
    }));

  } catch (error) {
    console.error("Failed to fetch dashboard metrics:", error);
    hasError = true;
  }

  if (hasError) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
        </div>
        <ErrorState
          title="Database Query Error"
          description="Failed to load your internship metrics. Please make sure the database is migrated and reachable."
        />
      </div>
    );
  }

  // Construct stats grid metadata
  const weeklyGoal = 5;
  const weeklyProgressPercent = Math.round(Math.min(100, (logsThisWeek / weeklyGoal) * 100));

  const stats = [
    {
      name: "Total Work Logs",
      value: totalLogs.toString(),
      change: `+${logsThisWeek} this week`,
      icon: FileText,
      color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30",
    },
    {
      name: "Logs This Week",
      value: logsThisWeek.toString(),
      change: `${weeklyProgressPercent}% of weekly goal`,
      icon: Calendar,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      name: "Top Tech",
      value: topTechTag && topTechTag._count.workLogs > 0 ? topTechTag.name : "N/A",
      change: topTechTag && topTechTag._count.workLogs > 0 ? `Used in ${topTechTag._count.workLogs} logs` : "No tech tags yet",
      icon: Code,
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30",
    },
    {
      name: "Saved CV Bullets",
      value: savedCvBullets.toString(),
      change: savedCvBullets > 0 ? "Ready to export" : "No bullets generated",
      icon: CheckCircle2,
      color: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30",
    },
  ];

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
            href="/logs?problemSolutionOnly=true"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg shadow-xs transition-all duration-200"
          >
            <BookOpen className="h-4 w-4 text-indigo-500" />
            Problem-Solution Notes
          </Link>
          <Link
            href="/logs/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Add Work Log
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <SummaryCard
            key={stat.name}
            name={stat.name}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            colorClass={stat.color}
          />
        ))}
      </div>

      {/* Core Panels Grid */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Left Columns - Logs & Tasks (Span 2) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Recent Highlights Widget */}
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
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

            {highlights.length > 0 ? (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {highlights.map((log) => (
                  <div key={log.id} className="p-6 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all duration-200 group">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                          {log.date}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                        <TaskTypeBadge type={log.type} />
                        <ImpactBadge impact={log.impact} />
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-2 transition-colors">
                      <Link href={`/logs/${log.id}`} className="hover:underline inline-flex items-center gap-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {log.title}
                        <ChevronRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </Link>
                    </h3>
                    {log.desc && (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                        {log.desc}
                      </p>
                    )}
                    {log.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {log.tags.map((tag) => (
                          <TagBadge
                            key={tag.name}
                            name={tag.name}
                            category={tag.category}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800 mb-3">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">No highlights yet</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs">
                  {"Create a work log with 'Implemented', 'Reviewed', 'Fixed', or 'Improved' impact to see it featured here."}
                </p>
                <Link
                  href="/logs/new"
                  className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create Log
                </Link>
              </div>
            )}
          </div>

          {/* Work & Impact Distribution Widget */}
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm p-6 space-y-6 min-h-[380px] flex flex-col">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Work & Impact Distribution
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                Breakdown of task types and impact levels recorded in your internship log.
              </p>
            </div>

            {totalLogs > 0 ? (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                {/* Task Type Distribution */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
                    Task Types
                  </h3>
                  <div className="grid gap-6 sm:grid-cols-2">
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
                      <div className="flex flex-wrap gap-x-3 gap-y-2">
                        {taskTypes.map((type) => (
                          <div key={type.name} className="flex items-center gap-1.5">
                            <TaskTypeBadge type={type.type} />
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                              ({type.percentage}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 border-t sm:border-t-0 sm:border-l border-zinc-100 dark:border-zinc-800 pt-4 sm:pt-0 sm:pl-6">
                      {taskTypes.map((type) => (
                        <div key={type.name} className="flex items-center justify-between text-xs">
                          <TaskTypeBadge type={type.type} />
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                            {type.count} {type.count === 1 ? "log" : "logs"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Impact Level Distribution */}
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
                    Impact Levels
                  </h3>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="flex flex-col justify-center space-y-4">
                      <div className="flex h-5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 p-1">
                        {impactTypes.map((type) => (
                          <div
                            key={type.name}
                            style={{ width: `${type.percentage}%` }}
                            className={`h-full first:rounded-l-full last:rounded-r-full ${type.color} transition-all duration-300`}
                            title={`${type.name}: ${type.percentage}%`}
                          />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {impactTypes.map((type) => (
                          <div key={type.name} className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${type.color}`}></span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                              {type.name} ({type.percentage}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 border-t sm:border-t-0 sm:border-l border-zinc-100 dark:border-zinc-800 pt-4 sm:pt-0 sm:pl-6">
                      {impactTypes.map((type) => (
                        <div key={type.name} className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500 dark:text-zinc-400 font-medium">{type.name}</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                            {type.count} {type.count === 1 ? "log" : "logs"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800 mb-3">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">No distribution data</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs">
                  Log your tasks and impact levels to see your work distribution.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Tech stack & CV Bullets */}
        <div className="space-y-8">

          {/* Top Technologies Widget */}
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm p-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Top Technologies
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                Most referenced tech stacks in your daily log items.
              </p>
            </div>

            {topTags.length > 0 ? (
              <div className="space-y-4 mt-5">
                {topTags.map((tag, idx) => {
                  const maxCount = topTags[0]?.count || 1;
                  const barPercent = Math.round((tag.count / maxCount) * 100);

                  return (
                    <div key={tag.name} className="space-y-1.5 group">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 w-4 shrink-0">
                            #{idx + 1}
                          </span>
                          <TagBadge
                            name={tag.name}
                            category={tag.category}
                            className="truncate max-w-[120px] sm:max-w-[150px]"
                          />
                        </div>
                        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0">
                          {tag.count} {tag.count === 1 ? "log" : "logs"}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${barPercent}%` }}
                          className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500 group-hover:bg-indigo-500 dark:group-hover:bg-indigo-400"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800 mb-3">
                  <Code className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">No technologies tagged</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs">
                  Add tags like React, TypeScript, or Next.js to your work logs.
                </p>
              </div>
            )}
          </div>

          {/* Saved CV Bullets Widget */}
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm overflow-hidden">
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

            {cvBullets.length > 0 ? (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {cvBullets.map((bullet) => (
                  <div key={bullet.id} className="p-5 hover:bg-zinc-50/30 dark:hover:bg-zinc-900/10 group transition-all">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide rounded bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/20">
                        {bullet.tone}
                      </span>
                      <CopyButton text={bullet.content} />
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-2.5 leading-relaxed font-mono select-all">
                      &bull; {bullet.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border border-zinc-100 dark:border-zinc-800 mb-3">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">No saved CV bullets</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs">
                  Convert your logs into resume bullet points in the CV Builder.
                </p>
                <Link
                  href="/cv-builder"
                  className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
                >
                  Go to CV Builder
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  const skeletonStats = [
    { name: "Total Work Logs", icon: FileText, color: "bg-zinc-100 dark:bg-zinc-900" },
    { name: "Logs This Week", icon: Calendar, color: "bg-zinc-100 dark:bg-zinc-900" },
    { name: "Top Tech", icon: Code, color: "bg-zinc-100 dark:bg-zinc-900" },
    { name: "Saved CV Bullets", icon: CheckCircle2, color: "bg-zinc-100 dark:bg-zinc-900" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-pulse">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-4 w-96 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
        <div className="h-10 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {skeletonStats.map((stat) => (
          <SummaryCard
            key={stat.name}
            name={stat.name}
            value=""
            change=""
            icon={stat.icon}
            colorClass={stat.color}
            loading={true}
          />
        ))}
      </div>

      {/* Core Panels Grid Skeleton */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Left Columns - Logs & Tasks (Span 2) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Highlights Widget Skeleton */}
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-6 animate-pulse">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div className="space-y-2">
                <div className="h-5 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-3.5 w-64 bg-zinc-200 dark:bg-zinc-800 rounded" />
              </div>
              <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3 pt-2">
                  <div className="flex gap-2">
                    <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  </div>
                  <div className="h-5 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="flex gap-1.5 pt-1">
                    <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Work Distribution Skeleton */}
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-6 animate-pulse min-h-[380px] flex flex-col">
            <div className="space-y-2">
              <div className="h-5 w-52 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-3.5 w-72 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
            <div className="space-y-4">
              <div className="h-6 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full" />
              <div className="flex flex-wrap gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Tech Stack & CV Bullets */}
        <div className="space-y-8">
          {/* Top Technologies Skeleton */}
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-6 animate-pulse">
            <div className="space-y-2">
              <div className="h-5 w-36 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-3.5 w-60 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  </div>
                  <div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* CV Bullets Skeleton */}
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-6 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-5 w-44 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-3.5 w-52 bg-zinc-200 dark:bg-zinc-800 rounded" />
              </div>
              <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                  <div className="flex justify-between">
                    <div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-4 w-8 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  </div>
                  <div className="h-3.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="h-3.5 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
