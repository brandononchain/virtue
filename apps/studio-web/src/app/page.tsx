"use client";

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Virtue Studio v0.1 — Cinematic AI Generation
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Projects" value="—" />
        <StatCard label="Scenes" value="—" />
        <StatCard label="Renders" value="—" />
        <StatCard label="Skills Loaded" value="10" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="studio-panel p-6">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">
            Quick Actions
          </h2>
          <div className="space-y-2">
            <ActionButton label="New Project" href="/projects" />
            <ActionButton label="Browse Skills" href="/skills" />
            <ActionButton label="View Render Queue" href="/renders" />
          </div>
        </div>

        <div className="studio-panel p-6">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">
            System Status
          </h2>
          <div className="space-y-3 text-sm">
            <StatusRow label="API" status="connected" />
            <StatusRow label="Provider" status="mock" />
            <StatusRow label="Skills Engine" status="ready" />
            <StatusRow label="Render Pipeline" status="idle" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="studio-panel p-4">
      <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-zinc-100 mt-1">{value}</p>
    </div>
  );
}

function ActionButton({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="block rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
    >
      {label}
    </a>
  );
}

function StatusRow({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-400">{label}</span>
      <span className="inline-flex items-center gap-1.5 text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        {status}
      </span>
    </div>
  );
}
