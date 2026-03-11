"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Globe,
  Users,
  MapPin,
  Box,
  Clock,
  Sparkles,
  Loader2,
  Pencil,
} from "lucide-react";
import type {
  VirtueProject,
  VirtueWorldState,
  VirtueCharacterState,
  VirtueEnvironmentState,
  VirtuePropState,
  VirtueStoryEvent,
} from "@virtue/types";

type ActiveTab = "characters" | "environments" | "props" | "events" | "graph";

export default function WorldPage() {
  const [projects, setProjects] = useState<VirtueProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<VirtueProject | null>(null);
  const [world, setWorld] = useState<VirtueWorldState | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("characters");
  const [loading, setLoading] = useState(false);

  // Editing state
  const [editingChar, setEditingChar] = useState<string | null>(null);
  const [editEmotion, setEditEmotion] = useState("");
  const [editCondition, setEditCondition] = useState("");
  const [editLocation, setEditLocation] = useState("");

  // Simulation
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    api.listProjects().then(setProjects).catch(() => {});
  }, []);

  async function handleSelectProject(id: string) {
    const proj = projects.find((p) => p.id === id);
    setSelectedProject(proj || null);
    setWorld(null);
    setSelectedSceneId(null);
    if (proj) {
      setLoading(true);
      try {
        const w = await api.getWorldState(proj.id);
        setWorld(w);
      } catch {
        setWorld(null);
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleInitialize() {
    if (!selectedProject) return;
    setLoading(true);
    try {
      const w = await api.initializeWorld(selectedProject.id);
      setWorld(w);
    } catch {} finally {
      setLoading(false);
    }
  }

  async function handleSimulateScene() {
    if (!selectedProject || !selectedSceneId) return;
    setSimulating(true);
    try {
      const w = await api.simulateScene(selectedProject.id, selectedSceneId);
      setWorld(w);
    } catch {} finally {
      setSimulating(false);
    }
  }

  async function handleUpdateCharacter(characterId: string) {
    if (!selectedProject) return;
    const updates: Record<string, unknown> = { characterId };
    if (editEmotion) updates.emotionalState = editEmotion;
    if (editCondition) updates.physicalCondition = editCondition;
    if (editLocation) updates.location = editLocation;

    try {
      const w = await api.updateWorldState(selectedProject.id, {
        characters: [updates as any],
      });
      setWorld(w);
      setEditingChar(null);
      setEditEmotion("");
      setEditCondition("");
      setEditLocation("");
    } catch {}
  }

  const charName = (id: string) =>
    selectedProject?.characters?.find((c) => c.id === id)?.name || id;
  const envName = (id: string) =>
    selectedProject?.environments?.find((e) => e.id === id)?.name || id;
  const propName = (id: string) =>
    selectedProject?.props?.find((p) => p.id === id)?.name || id;

  const TABS: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { key: "characters", label: "Characters", icon: <Users className="w-3 h-3" /> },
    { key: "environments", label: "Environments", icon: <MapPin className="w-3 h-3" /> },
    { key: "props", label: "Props", icon: <Box className="w-3 h-3" /> },
    { key: "events", label: "Story Events", icon: <Clock className="w-3 h-3" /> },
    { key: "graph", label: "World Graph", icon: <Globe className="w-3 h-3" /> },
  ];

  return (
    <div className="p-5 sm:p-8 lg:p-10 space-y-8 overflow-y-auto animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-virtue-accent" />
          <h1 className="text-xl font-bold tracking-tight text-virtue-text">
            World State
          </h1>
        </div>
        <p className="text-xs text-virtue-text-muted mt-1">
          Persistent narrative world — characters, environments, and props evolve across scenes.
        </p>
      </div>

      {/* Project Selection */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="section-label">
            Project
          </label>
          <select
            value={selectedProject?.id || ""}
            onChange={(e) => handleSelectProject(e.target.value)}
            className="glass-input w-full px-3 py-2 text-sm"
          >
            <option value="">Select a project...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="section-label">
            Simulate Scene
          </label>
          <div className="flex gap-2">
            <select
              value={selectedSceneId || ""}
              onChange={(e) => setSelectedSceneId(e.target.value || null)}
              disabled={!selectedProject}
              className="glass-input flex-1 px-3 py-2 text-sm disabled:opacity-40"
            >
              <option value="">Select scene...</option>
              {selectedProject?.scenes.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
            <button
              onClick={handleSimulateScene}
              disabled={!selectedSceneId || simulating}
              className="rounded-md bg-purple-900/40 border border-purple-700/50 px-3 py-2 text-xs text-purple-300 hover:bg-purple-900/60 disabled:opacity-40 transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              {simulating ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  Simulate
                </>
              )}
            </button>
          </div>
        </div>
        <div className="flex items-end">
          <button
            onClick={handleInitialize}
            disabled={!selectedProject || loading}
            className="btn-secondary flex items-center gap-1.5"
          >
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Globe className="w-3 h-3" />
            )}
            {world ? "Re-initialize World" : "Initialize World"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="glass-panel p-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 text-virtue-text-muted animate-spin" />
            <p className="text-xs text-virtue-text-muted animate-pulse">Loading world state...</p>
          </div>
        </div>
      )}

      {/* World Stats */}
      {world && !loading && (
        <div className="grid grid-cols-5 gap-3">
          <StatCard label="Characters" value={world.characters.length} icon={<Users className="w-3.5 h-3.5 text-blue-400" />} />
          <StatCard label="Environments" value={world.environments.length} icon={<MapPin className="w-3.5 h-3.5 text-emerald-400" />} />
          <StatCard label="Props" value={world.props.length} icon={<Box className="w-3.5 h-3.5 text-amber-400" />} />
          <StatCard label="Events" value={world.storyEvents.length} icon={<Clock className="w-3.5 h-3.5 text-purple-400" />} />
          <StatCard label="Timeline" value={world.timelinePosition} icon={<Sparkles className="w-3.5 h-3.5 text-virtue-accent" />} />
        </div>
      )}

      {/* Active Conditions */}
      {world && world.activeConditions.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {world.activeConditions.map((cond, i) => (
            <span key={i} className="rounded bg-amber-950/30 border border-amber-800/40 px-2.5 py-1 text-[10px] text-amber-400">
              {cond}
            </span>
          ))}
        </div>
      )}

      {/* Tabs */}
      {world && !loading && (
        <div className="glass-panel p-1 flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-[10px] uppercase tracking-wider font-medium rounded-md transition-colors ${
                activeTab === tab.key
                  ? "bg-virtue-accent/20 text-virtue-accent"
                  : "text-virtue-text-muted hover:text-virtue-text-secondary"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Characters */}
      {world && activeTab === "characters" && (
        <div className="space-y-2">
          {world.characters.length === 0 ? (
            <Empty text="No characters in world state." />
          ) : (
            world.characters.map((cs) => (
              <div key={cs.characterId} className="glass-panel p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-full bg-blue-900/30 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-blue-400">
                      {charName(cs.characterId).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-virtue-text font-medium">{charName(cs.characterId)}</p>
                    <p className="text-[10px] text-virtue-text-muted font-mono">{cs.characterId}</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingChar(editingChar === cs.characterId ? null : cs.characterId);
                      setEditEmotion(cs.emotionalState);
                      setEditCondition(cs.physicalCondition);
                      setEditLocation(cs.location);
                    }}
                    className="flex items-center gap-1 text-[10px] text-virtue-text-muted hover:text-virtue-text-secondary transition-colors uppercase"
                  >
                    <Pencil className="w-3 h-3" />
                    {editingChar === cs.characterId ? "Cancel" : "Edit"}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <StateField label="Location" value={cs.location} />
                  <StateField label="Emotion" value={cs.emotionalState} highlight={cs.emotionalState !== "neutral"} />
                  <StateField label="Condition" value={cs.physicalCondition} highlight={cs.physicalCondition !== "normal"} warn />
                  <StateField label="Possessions" value={cs.possessions.length > 0 ? cs.possessions.join(", ") : "none"} />
                </div>
                {Object.keys(cs.relationships).length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {Object.entries(cs.relationships).map(([id, rel]) => (
                      <span key={id} className="rounded bg-[rgba(255,255,255,0.04)] px-2 py-0.5 text-[9px] text-virtue-text-secondary">
                        {charName(id)}: {rel}
                      </span>
                    ))}
                  </div>
                )}

                {/* Edit Form */}
                {editingChar === cs.characterId && (
                  <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)] grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[9px] text-virtue-text-muted uppercase mb-1">Emotion</label>
                      <input type="text" value={editEmotion} onChange={(e) => setEditEmotion(e.target.value)}
                        className="glass-input w-full px-2 py-1 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[9px] text-virtue-text-muted uppercase mb-1">Condition</label>
                      <input type="text" value={editCondition} onChange={(e) => setEditCondition(e.target.value)}
                        className="glass-input w-full px-2 py-1 text-xs" />
                    </div>
                    <div>
                      <label className="block text-[9px] text-virtue-text-muted uppercase mb-1">Location</label>
                      <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)}
                        className="glass-input w-full px-2 py-1 text-xs" />
                    </div>
                    <div className="col-span-3 flex justify-end">
                      <button onClick={() => handleUpdateCharacter(cs.characterId)}
                        className="btn-primary">
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Environments */}
      {world && activeTab === "environments" && (
        <div className="space-y-2">
          {world.environments.length === 0 ? (
            <Empty text="No environments in world state." />
          ) : (
            world.environments.map((es) => (
              <div key={es.environmentId} className="glass-panel p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded bg-emerald-900/30 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-emerald-400">
                      {envName(es.environmentId).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-virtue-text font-medium">{envName(es.environmentId)}</p>
                    <p className="text-[10px] text-virtue-text-muted font-mono">{es.environmentId}</p>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  <StateField label="Time" value={es.timeOfDay} />
                  <StateField label="Weather" value={es.weather} highlight={es.weather !== "clear"} />
                  <StateField label="Damage" value={es.damageState} highlight={es.damageState !== "intact"} warn />
                  <StateField label="Lighting" value={es.lightingState} />
                  <StateField label="Occupants" value={
                    es.occupancy.length > 0
                      ? es.occupancy.map((id) => charName(id)).join(", ")
                      : "empty"
                  } />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Props */}
      {world && activeTab === "props" && (
        <div className="space-y-2">
          {world.props.length === 0 ? (
            <Empty text="No props in world state." />
          ) : (
            world.props.map((ps) => (
              <div key={ps.propId} className="glass-panel p-3 flex items-center gap-3">
                <div className="h-7 w-7 rounded bg-amber-900/30 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-amber-400">
                    {propName(ps.propId).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-virtue-text font-medium">{propName(ps.propId)}</p>
                  <p className="text-[10px] text-virtue-text-muted font-mono">{ps.propId}</p>
                </div>
                <StateField label="Location" value={ps.location} inline />
                <StateField label="Owner" value={ps.owner ? charName(ps.owner) : "none"} inline />
                <StateField label="Condition" value={ps.condition} highlight={ps.condition !== "intact"} warn inline />
                <span className={`rounded px-1.5 py-0.5 text-[8px] uppercase font-medium ${
                  ps.visibility === "visible" ? "bg-emerald-950/30 text-emerald-500"
                  : ps.visibility === "hidden" ? "bg-[rgba(255,255,255,0.04)] text-virtue-text-muted"
                  : "bg-red-950/30 text-red-400"
                }`}>
                  {ps.visibility}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Story Events */}
      {world && activeTab === "events" && (
        <div className="space-y-2">
          {world.storyEvents.length === 0 ? (
            <Empty text="No story events recorded yet. Simulate a scene to generate events." />
          ) : (
            world.storyEvents.map((evt, i) => (
              <div key={evt.id} className="glass-panel p-3 flex items-start gap-3">
                <span className="text-[10px] text-virtue-text-muted font-mono w-6 shrink-0 pt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-virtue-text-secondary">{evt.description}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {evt.affectedCharacters.map((id) => (
                      <span key={id} className="rounded bg-blue-950/30 px-1.5 py-0.5 text-[8px] text-blue-400">{charName(id)}</span>
                    ))}
                    {evt.affectedEnvironments.map((id) => (
                      <span key={id} className="rounded bg-emerald-950/30 px-1.5 py-0.5 text-[8px] text-emerald-400">{envName(id)}</span>
                    ))}
                    {evt.affectedProps.map((id) => (
                      <span key={id} className="rounded bg-amber-950/30 px-1.5 py-0.5 text-[8px] text-amber-400">{propName(id)}</span>
                    ))}
                  </div>
                </div>
                <span className="text-[9px] text-virtue-text-muted shrink-0">
                  {new Date(evt.timestamp).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* World Graph */}
      {world && activeTab === "graph" && (
        <div className="glass-panel p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="space-y-6 w-full max-w-3xl">
              {/* Characters row */}
              <div>
                <label className="section-label mb-2">Characters</label>
                <div className="flex gap-3 flex-wrap">
                  {world.characters.map((cs) => (
                    <div key={cs.characterId} className="rounded-lg bg-blue-950/20 border border-blue-900/30 px-3 py-2 min-w-[120px]">
                      <p className="text-xs text-blue-300 font-medium">{charName(cs.characterId)}</p>
                      <p className="text-[9px] text-blue-500/60 mt-0.5">
                        {cs.emotionalState} / {cs.physicalCondition}
                      </p>
                      {cs.location !== "unknown" && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[8px] text-virtue-text-muted">at</span>
                          <span className="text-[9px] text-emerald-500">{cs.location}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Connection lines placeholder */}
              {world.characters.length > 0 && world.environments.length > 0 && (
                <div className="flex justify-center">
                  <div className="h-8 w-px bg-[rgba(255,255,255,0.06)]" />
                </div>
              )}

              {/* Environments row */}
              <div>
                <label className="section-label mb-2">Environments</label>
                <div className="flex gap-3 flex-wrap">
                  {world.environments.map((es) => (
                    <div key={es.environmentId} className="rounded-lg bg-emerald-950/20 border border-emerald-900/30 px-3 py-2 min-w-[120px]">
                      <p className="text-xs text-emerald-300 font-medium">{envName(es.environmentId)}</p>
                      <p className="text-[9px] text-emerald-500/60 mt-0.5">
                        {es.timeOfDay} / {es.weather}
                      </p>
                      {es.damageState !== "intact" && (
                        <span className="inline-block mt-1 rounded bg-red-950/30 px-1 py-0.5 text-[8px] text-red-400">
                          {es.damageState}
                        </span>
                      )}
                      {es.occupancy.length > 0 && (
                        <p className="text-[8px] text-virtue-text-muted mt-1">
                          {es.occupancy.map((id) => charName(id)).join(", ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Props row */}
              {world.props.length > 0 && (
                <>
                  {world.environments.length > 0 && (
                    <div className="flex justify-center">
                      <div className="h-8 w-px bg-[rgba(255,255,255,0.06)]" />
                    </div>
                  )}
                  <div>
                    <label className="section-label mb-2">Props</label>
                    <div className="flex gap-3 flex-wrap">
                      {world.props.map((ps) => (
                        <div key={ps.propId} className={`rounded-lg border px-3 py-2 min-w-[100px] ${
                          ps.visibility === "destroyed" ? "bg-red-950/10 border-red-900/20"
                          : ps.visibility === "hidden" ? "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.04)] opacity-50"
                          : "bg-amber-950/20 border-amber-900/30"
                        }`}>
                          <p className="text-xs text-amber-300 font-medium">{propName(ps.propId)}</p>
                          <p className="text-[9px] text-amber-500/60 mt-0.5">
                            {ps.condition} / {ps.visibility}
                          </p>
                          {ps.owner && (
                            <p className="text-[8px] text-virtue-text-muted mt-1">
                              held by {charName(ps.owner)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Timeline */}
              <div className="border-t border-[rgba(255,255,255,0.06)] pt-4 mt-4">
                <label className="section-label mb-2">
                  Timeline ({world.storyEvents.length} events, position {world.timelinePosition})
                </label>
                <div className="flex gap-1">
                  {world.storyEvents.slice(-20).map((evt, i) => (
                    <div
                      key={evt.id}
                      className="h-3 flex-1 rounded-sm bg-purple-800/40 hover:bg-purple-700/60 transition-colors"
                      title={evt.description}
                    />
                  ))}
                  {world.storyEvents.length === 0 && (
                    <p className="text-[10px] text-virtue-text-muted italic">No events yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedProject && !loading && (
        <div className="glass-panel p-12 text-center">
          <Globe className="w-8 h-8 text-virtue-text-muted mx-auto mb-3" />
          <p className="text-sm text-virtue-text-muted">Select a project to view its world state.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  return (
    <div className="glass-panel p-3">
      <div className="flex items-center gap-1.5">
        {icon}
        <p className="text-[10px] text-virtue-text-muted uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-lg font-bold text-virtue-text mt-0.5 tabular-nums">{value}</p>
    </div>
  );
}

function StateField({
  label,
  value,
  highlight,
  warn,
  inline,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  warn?: boolean;
  inline?: boolean;
}) {
  if (inline) {
    return (
      <div className="shrink-0">
        <p className="text-[8px] text-virtue-text-muted uppercase">{label}</p>
        <p className={`text-[10px] font-mono ${
          highlight ? (warn ? "text-red-400" : "text-cyan-400") : "text-virtue-text-secondary"
        }`}>{value}</p>
      </div>
    );
  }
  return (
    <div>
      <p className="text-[9px] text-virtue-text-muted uppercase mb-0.5">{label}</p>
      <p className={`text-xs font-mono ${
        highlight ? (warn ? "text-red-400" : "text-cyan-400") : "text-virtue-text-secondary"
      }`}>{value}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="glass-panel p-8 text-center">
      <p className="text-xs text-virtue-text-muted">{text}</p>
    </div>
  );
}
