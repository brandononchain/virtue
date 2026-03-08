"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type {
  VirtueProject,
  VirtueSceneAnalysis,
  VirtueShotSuggestion,
  VirtuePromptImprovement,
  VirtueHighlight,
  VirtueTrailerPlan,
} from "@virtue/types";

interface PacingAnalysis {
  sceneId: string;
  currentAvgDuration: number;
  targetAvgDuration: number;
  overallPacingScore: number;
  adjustments: { shotId: string; currentDuration: number; suggestedDuration: number; reason: string }[];
  reorderSuggestion: string | null;
}

type ActiveTab = "analysis" | "shots" | "pacing" | "highlights" | "trailer";

export default function AutonomousPage() {
  const [projects, setProjects] = useState<VirtueProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<VirtueProject | null>(null);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("analysis");

  // Results
  const [analysis, setAnalysis] = useState<VirtueSceneAnalysis | null>(null);
  const [shotSuggestions, setShotSuggestions] = useState<VirtueShotSuggestion[]>([]);
  const [pacing, setPacing] = useState<PacingAnalysis | null>(null);
  const [highlights, setHighlights] = useState<VirtueHighlight[]>([]);
  const [trailer, setTrailer] = useState<VirtueTrailerPlan | null>(null);
  const [promptImprovement, setPromptImprovement] = useState<VirtuePromptImprovement | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.listProjects().then(setProjects).catch(() => {});
  }, []);

  const selectedScene = selectedProject?.scenes.find((s) => s.id === selectedSceneId);

  async function runAnalysis() {
    if (!selectedProject || !selectedSceneId) return;
    setLoading(true);
    try {
      const result = await api.analyzeScene(selectedProject.id, selectedSceneId);
      setAnalysis(result);
      setActiveTab("analysis");
    } catch {} finally {
      setLoading(false);
    }
  }

  async function runShotSuggestions() {
    if (!selectedProject || !selectedSceneId) return;
    setLoading(true);
    try {
      const result = await api.suggestShots(selectedProject.id, selectedSceneId);
      setShotSuggestions(result);
      setActiveTab("shots");
    } catch {} finally {
      setLoading(false);
    }
  }

  async function runPacingOptimization() {
    if (!selectedProject || !selectedSceneId) return;
    setLoading(true);
    try {
      const result = await api.optimizePacing(selectedProject.id, selectedSceneId);
      setPacing(result);
      setActiveTab("pacing");
    } catch {} finally {
      setLoading(false);
    }
  }

  async function runHighlightExtraction() {
    if (!selectedProject || !selectedSceneId) return;
    setLoading(true);
    try {
      const result = await api.extractHighlights(selectedProject.id, selectedSceneId);
      setHighlights(result);
      setActiveTab("highlights");
    } catch {} finally {
      setLoading(false);
    }
  }

  async function runTrailerGeneration() {
    if (!selectedProject) return;
    setLoading(true);
    try {
      const result = await api.generateTrailer(selectedProject.id);
      setTrailer(result);
      setActiveTab("trailer");
    } catch {} finally {
      setLoading(false);
    }
  }

  async function runPromptImprovement(shotId: string) {
    if (!selectedProject || !selectedSceneId) return;
    try {
      const result = await api.improvePrompt(selectedProject.id, selectedSceneId, shotId);
      setPromptImprovement(result);
    } catch {}
  }

  function handleSelectProject(id: string) {
    const proj = projects.find((p) => p.id === id);
    setSelectedProject(proj || null);
    setSelectedSceneId(null);
    setAnalysis(null);
    setShotSuggestions([]);
    setPacing(null);
    setHighlights([]);
    setTrailer(null);
    setPromptImprovement(null);
  }

  const TABS: { key: ActiveTab; label: string }[] = [
    { key: "analysis", label: "Scene Analysis" },
    { key: "shots", label: "Shot Suggestions" },
    { key: "pacing", label: "Pacing" },
    { key: "highlights", label: "Highlights" },
    { key: "trailer", label: "Trailer" },
  ];

  return (
    <div className="p-8 space-y-6 overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-100">
          Autonomous Production Engine
        </h1>
        <p className="text-xs text-zinc-600 mt-1">
          AI-assisted scene analysis, shot suggestions, pacing optimization, and trailer generation.
        </p>
      </div>

      {/* Project & Scene Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">
            Project
          </label>
          <select
            value={selectedProject?.id || ""}
            onChange={(e) => handleSelectProject(e.target.value)}
            className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-zinc-600 focus:outline-none"
          >
            <option value="">Select a project...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">
            Scene
          </label>
          <select
            value={selectedSceneId || ""}
            onChange={(e) => {
              setSelectedSceneId(e.target.value || null);
              setAnalysis(null);
              setShotSuggestions([]);
              setPacing(null);
              setHighlights([]);
              setPromptImprovement(null);
            }}
            disabled={!selectedProject}
            className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-zinc-600 focus:outline-none disabled:opacity-40"
          >
            <option value="">Select a scene...</option>
            {selectedProject?.scenes.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      {selectedProject && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={runAnalysis}
            disabled={!selectedSceneId || loading}
            className="rounded-md bg-zinc-800 border border-zinc-700/50 px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 transition-colors"
          >
            Analyze Scene
          </button>
          <button
            onClick={runShotSuggestions}
            disabled={!selectedSceneId || loading}
            className="rounded-md bg-zinc-800 border border-zinc-700/50 px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 transition-colors"
          >
            Suggest Shots
          </button>
          <button
            onClick={runPacingOptimization}
            disabled={!selectedSceneId || loading}
            className="rounded-md bg-zinc-800 border border-zinc-700/50 px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 transition-colors"
          >
            Optimize Pacing
          </button>
          <button
            onClick={runHighlightExtraction}
            disabled={!selectedSceneId || loading}
            className="rounded-md bg-zinc-800 border border-zinc-700/50 px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 transition-colors"
          >
            Extract Highlights
          </button>
          <button
            onClick={runTrailerGeneration}
            disabled={loading}
            className="rounded-md bg-purple-900/40 border border-purple-700/50 px-4 py-2 text-xs text-purple-300 hover:bg-purple-900/60 disabled:opacity-40 transition-colors"
          >
            Generate Trailer
          </button>
        </div>
      )}

      {loading && (
        <div className="studio-panel p-6 text-center">
          <p className="text-xs text-zinc-500 animate-pulse">Analyzing...</p>
        </div>
      )}

      {/* Tab Navigation */}
      {!loading && (analysis || shotSuggestions.length > 0 || pacing || highlights.length > 0 || trailer) && (
        <div className="flex gap-1 border-b border-zinc-800/60">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-[10px] uppercase tracking-wider font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-zinc-300 text-zinc-200"
                  : "border-transparent text-zinc-600 hover:text-zinc-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Tab Content ────────────────────────────────── */}

      {/* Scene Analysis */}
      {!loading && activeTab === "analysis" && analysis && (
        <div className="space-y-4">
          {/* Metrics Grid */}
          <div className="grid grid-cols-4 gap-3">
            <MetricCard label="Total Duration" value={`${analysis.totalDuration}s`} />
            <MetricCard label="Shot Count" value={String(analysis.shotCount)} />
            <MetricCard label="Avg Shot Duration" value={`${analysis.avgShotDuration}s`} />
            <MetricCard label="Camera Variety" value={`${Math.round(analysis.cameraVariety * 100)}%`} />
          </div>

          {/* Score Bars */}
          <div className="studio-panel p-4 space-y-3">
            <ScoreBar label="Pacing" value={analysis.pacingScore} />
            <ScoreBar label="Visual Diversity" value={analysis.visualDiversity} />
            <ScoreBar label="Continuity Coverage" value={analysis.continuityCoverage} />
          </div>

          {/* Shot Type Distribution */}
          <div className="studio-panel p-4">
            <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-2">
              Shot Type Distribution
            </label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(analysis.shotTypeDistribution).map(([type, count]) => (
                <span
                  key={type}
                  className="rounded bg-zinc-800 px-2.5 py-1 text-[10px] text-zinc-400 font-mono"
                >
                  {type}: {count}
                </span>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          {analysis.suggestions.length > 0 && (
            <div className="space-y-2">
              <label className="block text-[10px] text-zinc-600 uppercase tracking-wider">
                Suggestions ({analysis.suggestions.length})
              </label>
              {analysis.suggestions.map((sug) => (
                <SuggestionCard
                  key={sug.id}
                  title={sug.title}
                  description={sug.description}
                  priority={sug.priority}
                  type={sug.type}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Shot Suggestions */}
      {!loading && activeTab === "shots" && shotSuggestions.length > 0 && (
        <div className="space-y-3">
          {shotSuggestions.map((sug) => (
            <div key={sug.id} className="studio-panel p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className={`rounded px-1.5 py-0.5 text-[8px] uppercase font-medium ${
                  sug.priority === "high" ? "bg-red-950/40 text-red-400"
                  : sug.priority === "medium" ? "bg-amber-950/40 text-amber-400"
                  : "bg-zinc-800 text-zinc-500"
                }`}>
                  {sug.priority}
                </span>
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-500 font-mono uppercase">
                  {sug.shotType}
                </span>
                <span className="text-xs text-zinc-300 font-medium flex-1">
                  {sug.description}
                </span>
                <span className="text-[10px] text-zinc-600">{sug.durationSec}s</span>
              </div>
              <p className="text-[10px] text-zinc-500 italic">{sug.reason}</p>
              <div className="bg-zinc-900/60 rounded p-2.5 border border-zinc-800/40">
                <label className="block text-[9px] text-zinc-600 uppercase mb-1">Suggested Prompt</label>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
                  {sug.promptSuggestion}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                <span>Camera: {sug.cameraMove}</span>
                {sug.recommendedProvider && <span>Provider: {sug.recommendedProvider}</span>}
              </div>
            </div>
          ))}
          {shotSuggestions.length === 0 && (
            <div className="studio-panel p-8 text-center">
              <p className="text-xs text-zinc-600">No additional shots suggested — scene looks well-composed.</p>
            </div>
          )}
        </div>
      )}

      {/* Pacing */}
      {!loading && activeTab === "pacing" && pacing && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <MetricCard label="Current Avg" value={`${pacing.currentAvgDuration}s`} />
            <MetricCard label="Target Avg" value={`${pacing.targetAvgDuration}s`} />
            <MetricCard label="Pacing Score" value={`${Math.round(pacing.overallPacingScore * 100)}%`} />
          </div>

          {pacing.reorderSuggestion && (
            <div className="studio-panel p-4 border-l-2 border-cyan-600">
              <p className="text-xs text-cyan-400 leading-relaxed">{pacing.reorderSuggestion}</p>
            </div>
          )}

          {pacing.adjustments.length > 0 && (
            <div className="space-y-2">
              <label className="block text-[10px] text-zinc-600 uppercase tracking-wider">
                Duration Adjustments ({pacing.adjustments.length})
              </label>
              {pacing.adjustments.map((adj, i) => (
                <div key={i} className="studio-panel p-3 flex items-center gap-3">
                  <span className="text-xs text-zinc-400 font-mono w-24 shrink-0 truncate">
                    {adj.shotId.slice(0, 12)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-red-400 font-mono">{adj.currentDuration}s</span>
                    <span className="text-[10px] text-zinc-600">&rarr;</span>
                    <span className="text-xs text-emerald-400 font-mono">{Math.round(adj.suggestedDuration * 10) / 10}s</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 flex-1">{adj.reason}</span>
                </div>
              ))}
            </div>
          )}

          {pacing.adjustments.length === 0 && !pacing.reorderSuggestion && (
            <div className="studio-panel p-8 text-center">
              <p className="text-xs text-zinc-600">Pacing looks good — no adjustments needed.</p>
            </div>
          )}
        </div>
      )}

      {/* Highlights */}
      {!loading && activeTab === "highlights" && highlights.length > 0 && (
        <div className="space-y-2">
          {highlights.map((hl) => (
            <div key={hl.id} className="studio-panel p-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-amber-600/30 to-orange-600/30 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-amber-400 tabular-nums">
                  {Math.round(hl.score * 100)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-300 truncate">{hl.reason}</p>
                <div className="flex gap-1.5 mt-0.5">
                  {hl.tags.map((tag) => (
                    <span key={tag} className="rounded bg-zinc-800 px-1.5 py-0.5 text-[8px] text-zinc-500 uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-[10px] text-zinc-600 shrink-0">{hl.durationSec}s</span>
            </div>
          ))}
        </div>
      )}

      {/* Trailer */}
      {!loading && activeTab === "trailer" && trailer && (
        <div className="space-y-4">
          <div className="studio-panel p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-200">{trailer.title}</h3>
              <span className="rounded bg-purple-900/40 px-2 py-0.5 text-[9px] text-purple-400 font-mono uppercase">
                {trailer.pacingPreset}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <MetricCard label="Total Duration" value={`${trailer.totalDuration}s`} />
              <MetricCard label="Clips" value={String(trailer.highlights.length)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] text-zinc-600 uppercase tracking-wider">
              Trailer Sequence
            </label>
            {trailer.highlights.map((hl, i) => (
              <div key={hl.id} className="studio-panel p-3 flex items-center gap-3">
                <span className="text-[10px] text-zinc-700 font-mono w-6 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="h-6 w-6 rounded bg-purple-900/30 flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold text-purple-400 tabular-nums">
                    {Math.round(hl.score * 100)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-zinc-300 truncate">{hl.reason}</p>
                  <div className="flex gap-1 mt-0.5">
                    {hl.tags.map((tag) => (
                      <span key={tag} className="rounded bg-zinc-800 px-1 py-0.5 text-[7px] text-zinc-500 uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-zinc-600 shrink-0">{hl.durationSec}s</span>
              </div>
            ))}
          </div>

          {trailer.highlights.length === 0 && (
            <div className="studio-panel p-8 text-center">
              <p className="text-xs text-zinc-600">
                Not enough highlight-worthy content to build a trailer. Add more scenes and shots first.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Prompt Improvement Modal */}
      {promptImprovement && (
        <div className="studio-panel p-4 space-y-3 border-l-2 border-cyan-600">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-zinc-600 uppercase tracking-wider">
              Prompt Improvement
            </label>
            <button
              onClick={() => setPromptImprovement(null)}
              className="text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors"
            >
              Dismiss
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900/60 rounded p-2.5 border border-zinc-800/40">
              <label className="block text-[9px] text-zinc-600 uppercase mb-1">Original</label>
              <p className="text-[10px] text-zinc-500 leading-relaxed">{promptImprovement.originalPrompt}</p>
            </div>
            <div className="bg-cyan-950/10 rounded p-2.5 border border-cyan-900/30">
              <label className="block text-[9px] text-cyan-600 uppercase mb-1">Improved</label>
              <p className="text-[10px] text-cyan-400/80 leading-relaxed">{promptImprovement.improvedPrompt}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {promptImprovement.changes.map((change, i) => (
              <span key={i} className="rounded bg-zinc-800 px-2 py-0.5 text-[9px] text-zinc-400">
                {change}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedProject && (
        <div className="studio-panel p-12 text-center">
          <p className="text-sm text-zinc-600">Select a project and scene to begin autonomous analysis.</p>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="studio-panel p-3">
      <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold text-zinc-100 mt-0.5 tabular-nums">{value}</p>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500";
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-zinc-500">{label}</span>
        <span className="text-[10px] text-zinc-400 tabular-nums font-mono">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-800">
        <div className={`h-1.5 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SuggestionCard({
  title,
  description,
  priority,
  type,
}: {
  title: string;
  description: string;
  priority: string;
  type: string;
}) {
  return (
    <div className="studio-panel p-3 flex items-start gap-3">
      <span className={`rounded px-1.5 py-0.5 text-[8px] uppercase font-medium shrink-0 mt-0.5 ${
        priority === "high" ? "bg-red-950/40 text-red-400"
        : priority === "medium" ? "bg-amber-950/40 text-amber-400"
        : "bg-zinc-800 text-zinc-500"
      }`}>
        {priority}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-zinc-300 font-medium">{title}</p>
        <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <span className="rounded bg-zinc-800/60 px-1.5 py-0.5 text-[8px] text-zinc-600 font-mono uppercase shrink-0">
        {type.replace("_", " ")}
      </span>
    </div>
  );
}
