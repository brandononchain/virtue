"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { StudioStats } from "@/lib/api";
import type { VirtueProject, VirtueRenderJob } from "@virtue/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<StudioStats | null>(null);
  const [projects, setProjects] = useState<VirtueProject[]>([]);
  const [recentJobs, setRecentJobs] = useState<VirtueRenderJob[]>([]);

  useEffect(() => {
    api.getStats().then(setStats).catch(() => {});
    api.listProjects().then(setProjects).catch(() => {});
    api.listRenders().then((jobs) => setRecentJobs(jobs.slice(0, 5))).catch(() => {});
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Virtue Studio v0.1
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        <StatCard label="Projects" value={stats?.projects ?? 0} />
        <StatCard label="Scenes" value={stats?.scenes ?? 0} />
        <StatCard label="Shots" value={stats?.shots ?? 0} />
        <StatCard
          label="Renders"
          value={stats?.renders.total ?? 0}
          detail={
            stats
              ? `${stats.renders.completed} done, ${stats.renders.active} active`
              : undefined
          }
        />
        <StatCard label="Skills" value={stats?.skills ?? 0} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="col-span-2 studio-panel">
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/60">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Projects
            </h2>
            <Link
              href="/projects"
              className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              View all
            </Link>
          </div>
          {projects.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-zinc-600">No projects yet</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/40">
              {projects.map((project) => {
                const shotCount = project.scenes.reduce(
                  (n, s) => n + s.shots.length,
                  0
                );
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-zinc-900/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-500 text-xs font-mono">
                      {project.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">
                        {project.name}
                      </p>
                      <p className="text-xs text-zinc-600 truncate">
                        {project.description || "No description"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-zinc-500">
                        {project.scenes.length} scene{project.scenes.length !== 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-zinc-600">
                        {shotCount} shot{shotCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* System & Quick Actions */}
        <div className="space-y-4">
          <div className="studio-panel">
            <div className="px-5 py-3 border-b border-zinc-800/60">
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                System
              </h2>
            </div>
            <div className="p-4 space-y-2.5">
              <StatusRow label="API" status="connected" />
              <StatusRow label="Provider" status="mock" />
              <StatusRow label="Skills Engine" status="loaded" />
              <StatusRow
                label="Render Queue"
                status={
                  stats && stats.renders.active > 0
                    ? `${stats.renders.active} active`
                    : "idle"
                }
              />
            </div>
          </div>

          <div className="studio-panel">
            <div className="px-5 py-3 border-b border-zinc-800/60">
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Quick Actions
              </h2>
            </div>
            <div className="p-3 space-y-1">
              <QuickAction label="New Project" href="/projects" />
              <QuickAction label="Browse Skills" href="/skills" />
              <QuickAction label="Render Queue" href="/renders" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Renders */}
      {recentJobs.length > 0 && (
        <div className="studio-panel">
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/60">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Recent Renders
            </h2>
            <Link
              href="/renders"
              className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-zinc-800/40">
            {recentJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center gap-4 px-5 py-3"
              >
                <RenderStatusDot status={job.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-300 truncate">
                    {job.prompt}
                  </p>
                </div>
                <div className="w-24 shrink-0">
                  <div className="h-1 rounded-full bg-zinc-800">
                    <div
                      className={`h-1 rounded-full transition-all ${
                        job.status === "completed"
                          ? "bg-emerald-500"
                          : job.status === "failed"
                            ? "bg-red-500"
                            : "bg-blue-500"
                      }`}
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                </div>
                <span
                  className={`text-[10px] font-medium uppercase tracking-wide w-20 text-right ${statusTextColor(job.status)}`}
                >
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail?: string;
}) {
  return (
    <div className="studio-panel p-4">
      <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">
        {label}
      </p>
      <p className="text-2xl font-bold text-zinc-100 mt-1 tabular-nums">
        {value}
      </p>
      {detail && (
        <p className="text-[10px] text-zinc-600 mt-0.5">{detail}</p>
      )}
    </div>
  );
}

function StatusRow({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="flex items-center gap-1.5 text-xs text-emerald-500">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {status}
      </span>
    </div>
  );
}

function QuickAction({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center rounded-md px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-200"
    >
      {label}
    </Link>
  );
}

function RenderStatusDot({ status }: { status: string }) {
  const color =
    status === "completed"
      ? "bg-emerald-500"
      : status === "failed"
        ? "bg-red-400"
        : status === "generating" || status === "post-processing"
          ? "bg-blue-400 animate-pulse"
          : status === "preparing"
            ? "bg-amber-400 animate-pulse"
            : "bg-zinc-600";
  return <span className={`h-2 w-2 rounded-full shrink-0 ${color}`} />;
}

function statusTextColor(status: string): string {
  switch (status) {
    case "completed":
      return "text-emerald-500";
    case "failed":
      return "text-red-400";
    case "generating":
    case "post-processing":
      return "text-blue-400";
    case "preparing":
      return "text-amber-400";
    default:
      return "text-zinc-500";
  }
}
