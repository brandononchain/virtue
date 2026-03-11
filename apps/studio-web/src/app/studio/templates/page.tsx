"use client";

import { useEffect, useState } from "react";
import { api, type TemplateListItem, type AgentListItem, type AgentRunResult } from "@/lib/api";
import { BottomSheet } from "@/components/bottom-sheet";
import {
  Search,
  LayoutTemplate,
  Bot,
  Clock,
  Film,
  Camera,
  Tag,
  Sparkles,
  Play,
  Loader2,
  ChevronRight,
  Clapperboard,
  Sun,
  MapPin,
  Move3D,
  Lightbulb,
  Zap,
  Layers,
} from "lucide-react";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "film", label: "Film" },
  { value: "commercial", label: "Commercial" },
  { value: "gaming", label: "Gaming" },
  { value: "social", label: "Social" },
  { value: "environment", label: "Environment" },
  { value: "characters", label: "Characters" },
  { value: "corporate", label: "Corporate" },
];

const DIFFICULTIES = [
  { value: "", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const difficultyColor: Record<string, string> = {
  beginner: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  intermediate: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  advanced: "bg-red-500/10 text-red-400 border border-red-500/20",
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [agents, setAgents] = useState<AgentListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Detail
  const [selected, setSelected] = useState<TemplateListItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Agent panel
  const [selectedAgent, setSelectedAgent] = useState<AgentListItem | null>(null);
  const [agentOpen, setAgentOpen] = useState(false);
  const [agentResult, setAgentResult] = useState<AgentRunResult | null>(null);
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentProjectName, setAgentProjectName] = useState("");
  const [agentCustomPrompt, setAgentCustomPrompt] = useState("");

  // Tab: templates vs agents
  const [tab, setTab] = useState<"templates" | "agents">("templates");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch templates
  useEffect(() => {
    setLoading(true);
    api
      .listTemplates({
        category: category || undefined,
        difficulty: difficulty || undefined,
        q: debouncedSearch || undefined,
      })
      .then((res) => {
        setTemplates(res.templates);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, difficulty, debouncedSearch]);

  // Fetch agents once
  useEffect(() => {
    api
      .listAgents()
      .then((res) => setAgents(res.agents))
      .catch(() => {});
  }, []);

  function openDetail(t: TemplateListItem) {
    setSelected(t);
    setDetailOpen(true);
  }

  function openAgent(a: AgentListItem) {
    setSelectedAgent(a);
    setAgentResult(null);
    setAgentProjectName("");
    setAgentCustomPrompt("");
    setAgentOpen(true);
  }

  async function handleRunAgent() {
    if (!selectedAgent) return;
    setAgentRunning(true);
    try {
      const result = await api.runAgent({
        agentId: selectedAgent.id,
        projectName: agentProjectName || undefined,
        customPrompt: agentCustomPrompt || undefined,
      });
      setAgentResult(result);
    } catch {
      // silently handle
    } finally {
      setAgentRunning(false);
    }
  }

  const totalShots = selected
    ? selected.scenes.reduce((sum, s) => sum + s.shots.length, 0)
    : 0;

  return (
    <div className="flex h-full flex-col lg:flex-row animate-fade-in">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-8 lg:p-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-virtue-accent/10">
              <Clapperboard className="w-5 h-5 text-virtue-accent" />
            </div>
            <div>
              <h1 className="text-[22px] sm:text-2xl font-bold text-virtue-text">
                Template Library
              </h1>
              <p className="text-sm text-virtue-text-secondary mt-0.5">
                Browse cinematic templates and AI director agents
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 glass-panel p-1 w-fit">
          <button
            onClick={() => setTab("templates")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "templates"
                ? "bg-[rgba(255,255,255,0.08)] text-virtue-text shadow-sm"
                : "text-virtue-text-muted hover:text-virtue-text-secondary"
            }`}
          >
            <LayoutTemplate className="w-4 h-4" />
            Templates ({total})
          </button>
          <button
            onClick={() => setTab("agents")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "agents"
                ? "bg-[rgba(255,255,255,0.08)] text-virtue-text shadow-sm"
                : "text-virtue-text-muted hover:text-virtue-text-secondary"
            }`}
          >
            <Bot className="w-4 h-4" />
            AI Directors ({agents.length})
          </button>
        </div>

        {tab === "templates" ? (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-virtue-text-muted pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search templates..."
                  className="glass-input w-full pl-10 pr-3 py-2.5 sm:py-2 text-[14px] sm:text-sm"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="glass-input px-3 py-2.5 sm:py-2 text-[14px] sm:text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="glass-input px-3 py-2.5 sm:py-2 text-[14px] sm:text-sm"
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Template grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-6 h-6 text-virtue-accent animate-spin" />
                <span className="text-virtue-text-muted text-sm">Loading templates...</span>
              </div>
            ) : templates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Film className="w-8 h-8 text-virtue-text-muted" />
                <span className="text-virtue-text-muted text-sm">No templates found.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => openDetail(t)}
                    className="glass-card group text-left p-4 relative overflow-hidden touch-manipulation"
                  >
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-virtue-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-semibold text-virtue-text leading-tight">
                          {t.name}
                        </h3>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ml-2 whitespace-nowrap ${
                            difficultyColor[t.difficulty] || ""
                          }`}
                        >
                          {t.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-virtue-text-secondary line-clamp-2 mb-3">
                        {t.description}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-virtue-text-muted">
                        <span className="inline-flex items-center gap-1 bg-[rgba(255,255,255,0.04)] rounded px-1.5 py-0.5">
                          <Tag className="w-3 h-3" />
                          {t.category}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {t.estimatedDuration}s
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Camera className="w-3 h-3" />
                          {t.scenes.reduce((n, s) => n + s.shots.length, 0)} shots
                        </span>
                      </div>
                      {t.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {t.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] text-virtue-text-muted bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded px-1.5 py-0.5"
                            >
                              {tag}
                            </span>
                          ))}
                          {t.tags.length > 4 && (
                            <span className="text-[10px] text-virtue-text-muted">
                              +{t.tags.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Reveal arrow on hover */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ChevronRight className="w-4 h-4 text-virtue-accent" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Agents tab */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {agents.map((a) => (
              <button
                key={a.id}
                onClick={() => openAgent(a)}
                className="glass-card group text-left p-4 relative overflow-hidden touch-manipulation"
              >
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-virtue-accent-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-md bg-virtue-accent-secondary/10">
                      <Bot className="w-3.5 h-3.5 text-virtue-accent-secondary" />
                    </div>
                    <h3 className="text-sm font-semibold text-virtue-text">
                      {a.name}
                    </h3>
                  </div>
                  <p className="text-xs text-virtue-text-secondary line-clamp-2 mb-3">
                    {a.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {a.capabilities.slice(0, 4).map((cap) => (
                      <span
                        key={cap}
                        className="text-[10px] text-virtue-accent-secondary bg-virtue-accent-secondary/10 border border-virtue-accent-secondary/20 rounded px-1.5 py-0.5"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-virtue-text-muted mt-2.5">
                    <Layers className="w-3 h-3" />
                    {a.defaultTemplateIds.length} default templates
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop detail panel */}
      {selected && (
        <div className="hidden lg:block w-[400px] border-l border-[rgba(255,255,255,0.06)] overflow-y-auto p-5 bg-[rgba(255,255,255,0.01)]">
          <TemplateDetail template={selected} totalShots={totalShots} />
        </div>
      )}

      {/* Mobile template detail */}
      <BottomSheet
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected?.name}
      >
        {selected && (
          <div className="px-4 pb-6">
            <TemplateDetail template={selected} totalShots={totalShots} />
          </div>
        )}
      </BottomSheet>

      {/* Agent detail / run panel */}
      <BottomSheet
        open={agentOpen}
        onClose={() => setAgentOpen(false)}
        title={selectedAgent?.name}
      >
        {selectedAgent && (
          <div className="px-4 pb-6 space-y-4">
            <p className="text-sm text-virtue-text-secondary">
              {selectedAgent.description}
            </p>

            <div>
              <p className="section-label mb-1">Style</p>
              <p className="text-xs text-virtue-text-secondary">{selectedAgent.style}</p>
            </div>

            <div>
              <p className="section-label mb-1.5">Capabilities</p>
              <div className="flex flex-wrap gap-1">
                {selectedAgent.capabilities.map((c) => (
                  <span
                    key={c}
                    className="text-[10px] text-virtue-accent-secondary bg-virtue-accent-secondary/10 border border-virtue-accent-secondary/20 rounded px-1.5 py-0.5"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <hr className="border-[rgba(255,255,255,0.06)]" />

            <div className="space-y-3">
              <p className="section-label">Run Agent</p>
              <input
                type="text"
                value={agentProjectName}
                onChange={(e) => setAgentProjectName(e.target.value)}
                placeholder="Project name (optional)"
                className="glass-input w-full px-3 py-2.5 text-[14px]"
              />
              <textarea
                value={agentCustomPrompt}
                onChange={(e) => setAgentCustomPrompt(e.target.value)}
                placeholder="Custom direction (optional)"
                rows={3}
                className="glass-input w-full px-3 py-2.5 text-[14px] resize-none"
              />
              <button
                onClick={handleRunAgent}
                disabled={agentRunning}
                className="btn-primary w-full justify-center gap-2"
              >
                {agentRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Plan
                  </>
                )}
              </button>
            </div>

            {agentResult && (
              <div className="space-y-3 pt-2">
                <hr className="border-[rgba(255,255,255,0.06)]" />
                <p className="section-label">Result</p>
                <div className="glass-panel p-3 space-y-2">
                  <p className="text-sm font-medium text-virtue-text">
                    {agentResult.projectName}
                  </p>
                  <div className="flex gap-3 text-[11px] text-virtue-text-secondary">
                    <span className="inline-flex items-center gap-1">
                      <Film className="w-3 h-3" />
                      {agentResult.scenes.length} scenes
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      {agentResult.totalShots} shots
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {agentResult.estimatedDuration}s
                    </span>
                  </div>
                  <p className="text-xs text-virtue-text-muted mt-2">
                    {agentResult.agentNotes}
                  </p>
                  {agentResult.scenes.map((scene, i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-2.5 mt-2"
                    >
                      <p className="text-xs font-medium text-virtue-text-secondary">
                        {scene.title}
                      </p>
                      <p className="text-[11px] text-virtue-text-muted mt-0.5">
                        {scene.shots.length} shots &middot;{" "}
                        {scene.location} &middot; {scene.timeOfDay}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

function TemplateDetail({
  template,
  totalShots,
}: {
  template: TemplateListItem;
  totalShots: number;
}) {
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              difficultyColor[template.difficulty] || ""
            }`}
          >
            {template.difficulty}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-virtue-text-muted bg-[rgba(255,255,255,0.04)] rounded px-1.5 py-0.5">
            <Tag className="w-3 h-3" />
            {template.category}
          </span>
        </div>
        <h2 className="text-lg font-bold text-virtue-text mt-2">{template.name}</h2>
        <p className="text-sm text-virtue-text-secondary mt-1">{template.description}</p>
      </div>

      <div className="flex gap-4 text-sm">
        <div className="glass-panel px-3 py-2 text-center flex-1">
          <p className="text-virtue-text-muted text-[11px] flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" />
            Duration
          </p>
          <p className="text-virtue-text font-medium">{template.estimatedDuration}s</p>
        </div>
        <div className="glass-panel px-3 py-2 text-center flex-1">
          <p className="text-virtue-text-muted text-[11px] flex items-center justify-center gap-1">
            <Film className="w-3 h-3" />
            Scenes
          </p>
          <p className="text-virtue-text font-medium">{template.scenes.length}</p>
        </div>
        <div className="glass-panel px-3 py-2 text-center flex-1">
          <p className="text-virtue-text-muted text-[11px] flex items-center justify-center gap-1">
            <Camera className="w-3 h-3" />
            Shots
          </p>
          <p className="text-virtue-text font-medium">{totalShots}</p>
        </div>
      </div>

      {template.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-virtue-text-secondary bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded px-1.5 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {template.recommendedSkills.length > 0 && (
        <div>
          <p className="section-label mb-1.5">Recommended Skills</p>
          <div className="flex flex-wrap gap-1">
            {template.recommendedSkills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 text-[10px] text-virtue-accent bg-virtue-accent/10 border border-virtue-accent/20 rounded px-1.5 py-0.5"
              >
                <Zap className="w-2.5 h-2.5" />
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <hr className="border-[rgba(255,255,255,0.06)]" />

      {/* Shot list */}
      <div>
        <p className="section-label mb-3">Shot Breakdown</p>
        {template.scenes.map((scene, si) => (
          <div key={si} className="mb-4">
            <p className="text-xs font-medium text-virtue-text-secondary mb-1.5 flex items-center gap-1.5">
              <Play className="w-3 h-3 text-virtue-accent" />
              {scene.title}
              <span className="text-virtue-text-muted font-normal flex items-center gap-1">
                &middot;
                <MapPin className="w-3 h-3" />
                {scene.location}
                &middot;
                <Sun className="w-3 h-3" />
                {scene.timeOfDay}
              </span>
            </p>
            <div className="space-y-2">
              {scene.shots.map((shot, shi) => (
                <div
                  key={shi}
                  className="glass-panel p-3"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-medium bg-[rgba(255,255,255,0.06)] text-virtue-text-secondary rounded px-1.5 py-0.5">
                      {shot.shotType}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-virtue-text-muted">
                      <Clock className="w-2.5 h-2.5" />
                      {shot.durationSec}s
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-virtue-text-muted">
                      <Camera className="w-2.5 h-2.5" />
                      {shot.lens}
                    </span>
                  </div>
                  <p className="text-xs text-virtue-text-secondary">{shot.description}</p>
                  <p className="text-[11px] text-virtue-text-muted mt-1 line-clamp-2">
                    {shot.prompt}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-virtue-text-muted">
                    <span className="inline-flex items-center gap-0.5">
                      <Move3D className="w-2.5 h-2.5" />
                      {shot.cameraMove}
                    </span>
                    <span>&middot;</span>
                    <span className="inline-flex items-center gap-0.5">
                      <Lightbulb className="w-2.5 h-2.5" />
                      {shot.lighting}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
