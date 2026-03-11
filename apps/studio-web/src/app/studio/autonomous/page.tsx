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
import {
  Sparkles,
  Brain,
  BarChart3,
  Lightbulb,
  Film,
  Camera,
  Zap,
  Loader2,
  Play,
} from "lucide-react";

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

  const TABS: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { key: "analysis", label: "Scene Analysis", icon: <Brain className="h-3 w-3" /> },
    { key: "shots", label: "Shot Suggestions", icon: <Camera className="h-3 w-3" /> },
    { key: "pacing", label: "Pacing", icon: <BarChart3 className="h-3 w-3" /> },
    { key: "highlights", label: "Highlights", icon: <Zap className="h-3 w-3" /> },
    { key: "trailer", label: "Trailer", icon: <Film className="h-3 w-3" /> },
  ];

  return (
    <div className="p-5 sm:p-8 lg:p-10 space-y-8 overflow-y-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]">
          <Sparkles className="h-5 w-5 text-virtue-accent" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-virtue-text">
            Autonomous Production Engine
          </h1>
          <p className="text-xs text-virtue-text-muted mt-1">
            AI-assisted scene analysis, shot suggestions, pacing optimization, and trailer generation.
          </p>
        </div>
      </div>

      {/* Project & Scene Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="section-label mb-1.5 block">
            Project
          </label>
          <select
            value={selectedProject?.id || ""}
            onChange={(e) => handleSelectProject(e.target.value)}
            className="glass-input w-full"
          >
            <option value="">Select a project...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="section-label mb-1.5 block">
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
            className="glass-input w-full disabled:opacity-40"
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
            className="btn-secondary flex items-center gap-1.5"
          >
            <Brain className="h-3.5 w-3.5" />
            Analyze Scene
          </button>
          <button
            onClick={runShotSuggestions}
            disabled={!selectedSceneId || loading}
            className="btn-secondary flex items-center gap-1.5"
          >
            <Camera className="h-3.5 w-3.5" />
            Suggest Shots
          </button>
          <button
            onClick={runPacingOptimization}
            disabled={!selectedSceneId || loading}
            className="btn-secondary flex items-center gap-1.5"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Optimize Pacing
          </button>
          <button
            onClick={runHighlightExtraction}
            disabled={!selectedSceneId || loading}
            className="btn-secondary flex items-center gap-1.5"
          >
            <Zap className="h-3.5 w-3.5" />
            Extract Highlights
          </button>
          <button
            onClick={runTrailerGeneration}
            disabled={loading}
            className="rounded-md bg-purple-900/20 border border-purple-500/20 px-4 py-2 text-xs text-purple-300 hover:bg-purple-900/30 hover:border-purple-500/30 disabled:opacity-40 transition-all backdrop-blur-sm flex items-center gap-1.5"
          >
            <Play className="h-3.5 w-3.5" />
            Generate Trailer
          </button>
        </div>
      )}

      {loading && (
        <div className="glass-panel p-6 text-center flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 text-virtue-accent animate-spin" />
          <p className="text-xs text-virtue-text-muted animate-pulse">Analyzing...</p>
        </div>
      )}

      {/* Tab Navigation */}
      {!loading && (analysis || shotSuggestions.length > 0 || pacing || highlights.length > 0 || trailer) && (
        <div className="glass-panel p-1 flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-[10px] uppercase tracking-wider font-medium rounded-md transition-all ${
                activeTab === tab.key
                  ? "bg-virtue-accent/10 text-virtue-accent border border-virtue-accent/20"
                  : "text-virtue-text-muted hover:text-virtue-text-secondary border border-transparent"
              }`}
            >
              {tab.icon}
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
          <div className="glass-panel p-4 space-y-3">
            <ScoreBar label="Pacing" value={analysis.pacingScore} />
            <ScoreBar label="Visual Diversity" value={analysis.visualDiversity} />
            <ScoreBar label="Continuity Coverage" value={analysis.continuityCoverage} />
          </div>

          {/* Shot Type Distribution */}
          <div className="glass-panel p-4">
            <label className="section-label mb-2 block">
              Shot Type Distribution
            </label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(analysis.shotTypeDistribution).map(([type, count]) => (
                <span
                  key={type}
                  className="rounded bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] px-2.5 py-1 text-[10px] text-virtue-text-secondary font-mono"
                >
                  {type}: {count}
                </span>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          {analysis.suggestions.length > 0 && (
            <div className="space-y-2">
              <label className="section-label block">
                <Lightbulb className="h-3 w-3 inline mr-1" />
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
            <div key={sug.id} className="glass-panel p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className={`rounded px-1.5 py-0.5 text-[8px] uppercase font-medium ${
                  sug.priority === "high" ? "bg-red-950/40 text-red-400"
                  : sug.priority === "medium" ? "bg-amber-950/40 text-amber-400"
                  : "bg-[rgba(255,255,255,0.04)] text-virtue-text-muted"
                }`}>
                  {sug.priority}
                </span>
                <span className="rounded bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] px-1.5 py-0.5 text-[9px] text-virtue-text-muted font-mono uppercase">
                  {sug.shotType}
                </span>
                <span className="text-xs text-virtue-text-secondary font-medium flex-1">
                  {sug.description}
                </span>
                <span className="text-[10px] text-virtue-text-muted">{sug.durationSec}s</span>
              </div>
              <p className="text-[10px] text-virtue-text-muted italic">{sug.reason}</p>
              <div className="glass-card rounded p-2.5">
                <label className="section-label mb-1 block">Suggested Prompt</label>
                <p className="text-[11px] text-virtue-text-secondary leading-relaxed font-mono">
                  {sug.promptSuggestion}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-virtue-text-muted">
                <span>Camera: {sug.cameraMove}</span>
                {sug.recommendedProvider && <span>Provider: {sug.recommendedProvider}</span>}
              </div>
            </div>
          ))}
          {shotSuggestions.length === 0 && (
            <div className="glass-panel p-8 text-center">
              <p className="text-xs text-virtue-text-muted">No additional shots suggested — scene looks well-composed.</p>
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
            <div className="glass-panel p-4 border-l-2 border-cyan-600">
              <p className="text-xs text-cyan-400 leading-relaxed">{pacing.reorderSuggestion}</p>
            </div>
          )}

          {pacing.adjustments.length > 0 && (
            <div className="space-y-2">
              <label className="section-label block">
                Duration Adjustments ({pacing.adjustments.length})
              </label>
              {pacing.adjustments.map((adj, i) => (
                <div key={i} className="glass-panel p-3 flex items-center gap-3">
                  <span className="text-xs text-virtue-text-secondary font-mono w-24 shrink-0 truncate">
                    {adj.shotId.slice(0, 12)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-red-400 font-mono">{adj.currentDuration}s</span>
                    <span className="text-[10px] text-virtue-text-muted">&rarr;</span>
                    <span className="text-xs text-emerald-400 font-mono">{Math.round(adj.suggestedDuration * 10) / 10}s</span>
                  </div>
                  <span className="text-[10px] text-virtue-text-muted flex-1">{adj.reason}</span>
                </div>
              ))}
            </div>
          )}

          {pacing.adjustments.length === 0 && !pacing.reorderSuggestion && (
            <div className="glass-panel p-8 text-center">
              <p className="text-xs text-virtue-text-muted">Pacing looks good — no adjustments needed.</p>
            </div>
          )}
        </div>
      )}

      {/* Highlights */}
      {!loading && activeTab === "highlights" && highlights.length > 0 && (
        <div className="space-y-2">
          {highlights.map((hl) => (
            <div key={hl.id} className="glass-panel p-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-amber-600/30 to-orange-600/30 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-amber-400 tabular-nums">
                  {Math.round(hl.score * 100)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-virtue-text-secondary truncate">{hl.reason}</p>
                <div className="flex gap-1.5 mt-0.5">
                  {hl.tags.map((tag) => (
                    <span key={tag} className="rounded bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] px-1.5 py-0.5 text-[8px] text-virtue-text-muted uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-[10px] text-virtue-text-muted shrink-0">{hl.durationSec}s</span>
            </div>
          ))}
        </div>
      )}

      {/* Trailer */}
      {!loading && activeTab === "trailer" && trailer && (
        <div className="space-y-4">
          <div className="glass-panel p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-virtue-text">{trailer.title}</h3>
              <span className="rounded bg-purple-900/20 border border-purple-500/20 px-2 py-0.5 text-[9px] text-purple-400 font-mono uppercase">
                {trailer.pacingPreset}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <MetricCard label="Total Duration" value={`${trailer.totalDuration}s`} />
              <MetricCard label="Clips" value={String(trailer.highlights.length)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="section-label block">
              Trailer Sequence
            </label>
            {trailer.highlights.map((hl, i) => (
              <div key={hl.id} className="glass-panel p-3 flex items-center gap-3">
                <span className="text-[10px] text-virtue-text-muted font-mono w-6 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="h-6 w-6 rounded bg-purple-900/20 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold text-purple-400 tabular-nums">
                    {Math.round(hl.score * 100)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-virtue-text-secondary truncate">{hl.reason}</p>
                  <div className="flex gap-1 mt-0.5">
                    {hl.tags.map((tag) => (
                      <span key={tag} className="rounded bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] px-1 py-0.5 text-[7px] text-virtue-text-muted uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-virtue-text-muted shrink-0">{hl.durationSec}s</span>
              </div>
            ))}
          </div>

          {trailer.highlights.length === 0 && (
            <div className="glass-panel p-8 text-center">
              <p className="text-xs text-virtue-text-muted">
                Not enough highlight-worthy content to build a trailer. Add more scenes and shots first.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Prompt Improvement Modal */}
      {promptImprovement && (
        <div className="glass-panel p-4 space-y-3 border-l-2 border-cyan-600">
          <div className="flex items-center justify-between">
            <label className="section-label">
              Prompt Improvement
            </label>
            <button
              onClick={() => setPromptImprovement(null)}
              className="text-[10px] text-virtue-text-muted hover:text-virtue-text-secondary transition-colors"
            >
              Dismiss
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card rounded p-2.5">
              <label className="section-label mb-1 block">Original</label>
              <p className="text-[10px] text-virtue-text-muted leading-relaxed">{promptImprovement.originalPrompt}</p>
            </div>
            <div className="bg-cyan-950/10 rounded p-2.5 border border-cyan-900/30">
              <label className="block text-[9px] text-cyan-600 uppercase mb-1">Improved</label>
              <p className="text-[10px] text-cyan-400/80 leading-relaxed">{promptImprovement.improvedPrompt}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {promptImprovement.changes.map((change, i) => (
              <span key={i} className="rounded bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] px-2 py-0.5 text-[9px] text-virtue-text-secondary">
                {change}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedProject && (
        <div className="glass-panel p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]">
              <Film className="h-6 w-6 text-virtue-text-muted" />
            </div>
          </div>
          <p className="text-sm text-virtue-text-muted">Select a project and scene to begin autonomous analysis.</p>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel p-3">
      <p className="text-[10px] text-virtue-text-muted uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold text-virtue-text mt-0.5 tabular-nums">{value}</p>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500";
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-virtue-text-muted">{label}</span>
        <span className="text-[10px] text-virtue-text-secondary tabular-nums font-mono">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.04)]">
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
    <div className="glass-card p-3 flex items-start gap-3">
      <span className={`rounded px-1.5 py-0.5 text-[8px] uppercase font-medium shrink-0 mt-0.5 ${
        priority === "high" ? "bg-red-950/40 text-red-400"
        : priority === "medium" ? "bg-amber-950/40 text-amber-400"
        : "bg-[rgba(255,255,255,0.04)] text-virtue-text-muted"
      }`}>
        {priority}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-virtue-text-secondary font-medium">{title}</p>
        <p className="text-[10px] text-virtue-text-muted mt-0.5 leading-relaxed">{description}</p>
      </div>
      <span className="rounded bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] px-1.5 py-0.5 text-[8px] text-virtue-text-muted font-mono uppercase shrink-0">
        {type.replace("_", " ")}
      </span>
    </div>
  );
}
