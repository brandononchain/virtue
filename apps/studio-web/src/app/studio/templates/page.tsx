"use client";

import { useEffect, useState } from "react";
import { api, type TemplateListItem, type AgentListItem, type AgentRunResult } from "@/lib/api";
import { BottomSheet } from "@/components/bottom-sheet";

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
  beginner: "bg-green-500/20 text-green-400",
  intermediate: "bg-yellow-500/20 text-yellow-400",
  advanced: "bg-red-500/20 text-red-400",
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
    <div className="flex h-full flex-col lg:flex-row">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[22px] sm:text-2xl font-bold text-white">
            Template Library
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Browse cinematic templates and AI director agents
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-zinc-900 rounded-lg p-1 w-fit">
          <button
            onClick={() => setTab("templates")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === "templates"
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-zinc-300"
            }`}
          >
            Templates ({total})
          </button>
          <button
            onClick={() => setTab("agents")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === "agents"
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-zinc-300"
            }`}
          >
            AI Directors ({agents.length})
          </button>
        </div>

        {tab === "templates" ? (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates..."
                className="flex-1 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2.5 sm:py-2 text-[14px] sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
              />
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2.5 sm:py-2 text-[14px] sm:text-sm text-white focus:outline-none focus:border-zinc-600"
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
                  className="rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2.5 sm:py-2 text-[14px] sm:text-sm text-white focus:outline-none focus:border-zinc-600"
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
              <div className="text-zinc-500 text-sm py-12 text-center">
                Loading templates...
              </div>
            ) : templates.length === 0 ? (
              <div className="text-zinc-500 text-sm py-12 text-center">
                No templates found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => openDetail(t)}
                    className="text-left rounded-xl bg-zinc-900/80 border border-zinc-800 p-4 hover:border-zinc-600 transition-colors active:scale-[0.98] touch-manipulation"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-semibold text-white leading-tight">
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
                    <p className="text-xs text-zinc-400 line-clamp-2 mb-3">
                      {t.description}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                      <span className="bg-zinc-800 rounded px-1.5 py-0.5">
                        {t.category}
                      </span>
                      <span>{t.estimatedDuration}s</span>
                      <span>
                        {t.scenes.reduce((n, s) => n + s.shots.length, 0)} shots
                      </span>
                    </div>
                    {t.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {t.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] text-zinc-500 bg-zinc-800/50 rounded px-1.5 py-0.5"
                          >
                            {tag}
                          </span>
                        ))}
                        {t.tags.length > 4 && (
                          <span className="text-[10px] text-zinc-600">
                            +{t.tags.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Agents tab */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {agents.map((a) => (
              <button
                key={a.id}
                onClick={() => openAgent(a)}
                className="text-left rounded-xl bg-zinc-900/80 border border-zinc-800 p-4 hover:border-zinc-600 transition-colors active:scale-[0.98] touch-manipulation"
              >
                <h3 className="text-sm font-semibold text-white mb-1">
                  {a.name}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2 mb-3">
                  {a.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {a.capabilities.slice(0, 4).map((cap) => (
                    <span
                      key={cap}
                      className="text-[10px] text-violet-400 bg-violet-500/10 rounded px-1.5 py-0.5"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
                <div className="text-[11px] text-zinc-500 mt-2">
                  {a.defaultTemplateIds.length} default templates
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop detail panel */}
      {selected && (
        <div className="hidden lg:block w-[400px] border-l border-zinc-800 overflow-y-auto p-5">
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

      {/* Agent detail / run panel (bottom sheet on all screens for simplicity) */}
      <BottomSheet
        open={agentOpen}
        onClose={() => setAgentOpen(false)}
        title={selectedAgent?.name}
      >
        {selectedAgent && (
          <div className="px-4 pb-6 space-y-4">
            <p className="text-sm text-zinc-400">
              {selectedAgent.description}
            </p>

            <div>
              <p className="text-[11px] uppercase tracking-wider text-zinc-500 mb-1">
                Style
              </p>
              <p className="text-xs text-zinc-300">{selectedAgent.style}</p>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wider text-zinc-500 mb-1">
                Capabilities
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedAgent.capabilities.map((c) => (
                  <span
                    key={c}
                    className="text-[10px] text-violet-400 bg-violet-500/10 rounded px-1.5 py-0.5"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <hr className="border-zinc-800" />

            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-wider text-zinc-500">
                Run Agent
              </p>
              <input
                type="text"
                value={agentProjectName}
                onChange={(e) => setAgentProjectName(e.target.value)}
                placeholder="Project name (optional)"
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-[14px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
              />
              <textarea
                value={agentCustomPrompt}
                onChange={(e) => setAgentCustomPrompt(e.target.value)}
                placeholder="Custom direction (optional)"
                rows={3}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-[14px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 resize-none"
              />
              <button
                onClick={handleRunAgent}
                disabled={agentRunning}
                className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium transition-colors touch-manipulation active:scale-[0.98]"
              >
                {agentRunning ? "Running..." : "Generate Plan"}
              </button>
            </div>

            {agentResult && (
              <div className="space-y-3 pt-2">
                <hr className="border-zinc-800" />
                <p className="text-[11px] uppercase tracking-wider text-zinc-500">
                  Result
                </p>
                <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3 space-y-2">
                  <p className="text-sm font-medium text-white">
                    {agentResult.projectName}
                  </p>
                  <div className="flex gap-3 text-[11px] text-zinc-400">
                    <span>{agentResult.scenes.length} scenes</span>
                    <span>{agentResult.totalShots} shots</span>
                    <span>{agentResult.estimatedDuration}s</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">
                    {agentResult.agentNotes}
                  </p>
                  {agentResult.scenes.map((scene, i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-zinc-800/50 p-2 mt-2"
                    >
                      <p className="text-xs font-medium text-zinc-300">
                        {scene.title}
                      </p>
                      <p className="text-[11px] text-zinc-500">
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
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              difficultyColor[template.difficulty] || ""
            }`}
          >
            {template.difficulty}
          </span>
          <span className="text-[11px] text-zinc-500 bg-zinc-800 rounded px-1.5 py-0.5">
            {template.category}
          </span>
        </div>
        <h2 className="text-lg font-bold text-white mt-2">{template.name}</h2>
        <p className="text-sm text-zinc-400 mt-1">{template.description}</p>
      </div>

      <div className="flex gap-4 text-sm">
        <div>
          <p className="text-zinc-500 text-[11px]">Duration</p>
          <p className="text-white font-medium">{template.estimatedDuration}s</p>
        </div>
        <div>
          <p className="text-zinc-500 text-[11px]">Scenes</p>
          <p className="text-white font-medium">{template.scenes.length}</p>
        </div>
        <div>
          <p className="text-zinc-500 text-[11px]">Shots</p>
          <p className="text-white font-medium">{totalShots}</p>
        </div>
      </div>

      {template.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-zinc-400 bg-zinc-800 rounded px-1.5 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {template.recommendedSkills.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-wider text-zinc-500 mb-1">
            Recommended Skills
          </p>
          <div className="flex flex-wrap gap-1">
            {template.recommendedSkills.map((s) => (
              <span
                key={s}
                className="text-[10px] text-blue-400 bg-blue-500/10 rounded px-1.5 py-0.5"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <hr className="border-zinc-800" />

      {/* Shot list */}
      <div>
        <p className="text-[11px] uppercase tracking-wider text-zinc-500 mb-2">
          Shot Breakdown
        </p>
        {template.scenes.map((scene, si) => (
          <div key={si} className="mb-3">
            <p className="text-xs font-medium text-zinc-300 mb-1">
              {scene.title}{" "}
              <span className="text-zinc-500 font-normal">
                &middot; {scene.location} &middot; {scene.timeOfDay}
              </span>
            </p>
            <div className="space-y-1.5">
              {scene.shots.map((shot, shi) => (
                <div
                  key={shi}
                  className="rounded-lg bg-zinc-900/60 border border-zinc-800/50 p-2.5"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-medium bg-zinc-800 text-zinc-300 rounded px-1.5 py-0.5">
                      {shot.shotType}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {shot.durationSec}s
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {shot.lens}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">{shot.description}</p>
                  <p className="text-[11px] text-zinc-600 mt-1 line-clamp-2">
                    {shot.prompt}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500">
                    <span>{shot.cameraMove}</span>
                    <span>&middot;</span>
                    <span>{shot.lighting}</span>
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
