"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { StudioStats } from "@/lib/api";
import type { VirtueProject, VirtueRenderJob } from "@virtue/types";
import { RenderProgressCard } from "@/components/render-progress-card";
import {
  FolderOpen,
  Zap,
  Play,
  Clapperboard,
  ArrowRight,
  Activity,
  Film,
  Camera,
  Layers,
} from "lucide-react";

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
    <div className="p-5 sm:p-8 lg:p-10 space-y-8 lg:space-y-10 max-w-[1400px] animate-fade-in">
      {/* Hero header */}
      <div>
        <h1 className="text-section sm:text-[36px] font-semibold tracking-tight text-virtue-text">
          Dashboard
        </h1>
        <p className="text-meta text-virtue-text-muted mt-1">
          Production overview
        </p>
      </div>

      {/* System Status — mobile */}
      <div className="glass-panel lg:hidden">
        <div className="px-5 py-3.5 border-b border-[rgba(255,255,255,0.06)]">
          <h2 className="section-label">System</h2>
        </div>
        <div className="p-5 space-y-3">
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

      {/* Quick Actions — mobile */}
      <div className="grid grid-cols-2 gap-3 lg:hidden">
        <Link href="/projects" className="glass-card flex flex-col items-center justify-center p-5 min-h-[88px] touch-manipulation">
          <FolderOpen className="w-5 h-5 text-virtue-accent mb-2" strokeWidth={1.5} />
          <span className="text-[13px] font-medium text-virtue-text">New Project</span>
        </Link>
        <Link href="/skills" className="glass-card flex flex-col items-center justify-center p-5 min-h-[88px] touch-manipulation">
          <Zap className="w-5 h-5 text-virtue-accent-secondary mb-2" strokeWidth={1.5} />
          <span className="text-[13px] font-medium text-virtue-text">Browse Skills</span>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
        <StatCard icon={FolderOpen} label="Projects" value={stats?.projects ?? 0} />
        <StatCard icon={Layers} label="Scenes" value={stats?.scenes ?? 0} />
        <StatCard icon={Camera} label="Shots" value={stats?.shots ?? 0} />
        <StatCard
          icon={Film}
          label="Renders"
          value={stats?.renders.total ?? 0}
          detail={stats ? `${stats.renders.completed} done` : undefined}
          accent
        />
        <StatCard icon={Zap} label="Skills" value={stats?.skills ?? 0} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2 glass-panel">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[rgba(255,255,255,0.06)]">
            <h2 className="section-label">Recent Projects</h2>
            <Link
              href="/projects"
              className="flex items-center gap-1 text-[11px] text-virtue-text-muted hover:text-virtue-accent transition-colors min-h-[44px]"
            >
              View all
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {projects.length === 0 ? (
            <div className="p-10 text-center">
              <Film className="w-8 h-8 text-virtue-text-muted/30 mx-auto mb-3" strokeWidth={1} />
              <p className="text-sm text-virtue-text-muted">No projects yet</p>
              <p className="text-[12px] text-virtue-text-muted/50 mt-1">Create your first cinematic project</p>
            </div>
          ) : (
            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
              {projects.map((project) => {
                const shotCount = project.scenes.reduce((n, s) => n + s.shots.length, 0);
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors touch-manipulation group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-virtue-accent text-sm font-mono shrink-0 group-hover:border-virtue-accent/20 transition-colors">
                      {project.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-virtue-text truncate">
                        {project.name}
                      </p>
                      <p className="text-[12px] text-virtue-text-muted truncate">
                        {project.description || "No description"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] text-virtue-text-secondary tabular-nums">
                        {project.scenes.length} scene{project.scenes.length !== 1 ? "s" : ""}
                      </p>
                      <p className="text-[11px] text-virtue-text-muted tabular-nums">
                        {shotCount} shot{shotCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-virtue-text-muted/30 group-hover:text-virtue-accent/50 transition-colors shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar panels — desktop */}
        <div className="hidden lg:flex flex-col gap-5">
          <div className="glass-panel">
            <div className="px-5 py-3.5 border-b border-[rgba(255,255,255,0.06)]">
              <h2 className="section-label">System</h2>
            </div>
            <div className="p-5 space-y-3">
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

          <div className="glass-panel">
            <div className="px-5 py-3.5 border-b border-[rgba(255,255,255,0.06)]">
              <h2 className="section-label">Quick Actions</h2>
            </div>
            <div className="p-3 space-y-0.5">
              <QuickAction label="New Project" href="/projects" icon={FolderOpen} />
              <QuickAction label="Director" href="/director" icon={Clapperboard} />
              <QuickAction label="Render Queue" href="/renders" icon={Play} />
              <QuickAction label="Browse Skills" href="/skills" icon={Zap} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Renders */}
      {recentJobs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-label">Render Queue</h2>
            <Link
              href="/renders"
              className="flex items-center gap-1 text-[11px] text-virtue-text-muted hover:text-virtue-accent transition-colors min-h-[44px]"
            >
              View all
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentJobs.map((job) => (
              <RenderProgressCard key={job.id} job={job} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  detail?: string;
  accent?: boolean;
}) {
  return (
    <div className="glass-panel p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-3.5 h-3.5 ${accent ? "text-virtue-accent" : "text-virtue-text-muted/50"}`} strokeWidth={1.5} />
        <p className="text-[10px] text-virtue-text-muted uppercase tracking-wider font-semibold">
          {label}
        </p>
      </div>
      <p className="text-[28px] font-semibold text-virtue-text tabular-nums tracking-tight">
        {value}
      </p>
      {detail && (
        <p className="text-[11px] text-virtue-text-muted mt-1">{detail}</p>
      )}
    </div>
  );
}

function StatusRow({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between text-sm min-h-[32px]">
      <span className="text-virtue-text-secondary text-[13px]">{label}</span>
      <span className="flex items-center gap-2 text-[12px] text-emerald-400">
        <Activity className="w-3 h-3" />
        {status}
      </span>
    </div>
  );
}

function QuickAction({ label, href, icon: Icon }: { label: string; href: string; icon: React.ElementType }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-virtue-text-secondary transition-all hover:bg-[rgba(255,255,255,0.03)] hover:text-virtue-text min-h-[44px] group"
    >
      <Icon className="w-4 h-4 opacity-40 group-hover:opacity-70 transition-opacity" strokeWidth={1.5} />
      {label}
    </Link>
  );
}
