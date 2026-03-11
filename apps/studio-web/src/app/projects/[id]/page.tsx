"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BottomSheet } from "@/components/bottom-sheet";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Plus,
  X,
  MessageSquare,
  CheckCircle2,
  Clock,
  Film,
  Camera,
  Aperture,
  Sun,
  Clapperboard,
  Layers,
  Users,
  MapPin,
  Sparkles,
  Send,
  Play,
  BarChart3,
  Route,
  Eye,
  Star,
  GitCompare,
  AlertCircle,
  Loader2,
  Box,
  Paintbrush,
} from "lucide-react";
import type {
  VirtueProject,
  VirtueShot,
  VirtueScene,
  VirtueRenderJob,
  VirtueRoutingDecision,
  VirtueComment,
  VirtueApproval,
  VirtueAlternateTake,
  VirtueWorkflowStatus,
} from "@virtue/types";

interface ProviderInfo {
  name: string;
  displayName: string;
  available: boolean;
}

const ROUTING_MODES = [
  { value: "balanced", label: "Balanced", desc: "Optimize across quality, speed, and cost" },
  { value: "auto_quality", label: "Quality", desc: "Maximize output quality" },
  { value: "auto_speed", label: "Speed", desc: "Fastest turnaround" },
  { value: "auto_cost", label: "Cost", desc: "Minimize generation cost" },
  { value: "manual", label: "Manual", desc: "Choose provider yourself" },
] as const;

const APPROVAL_STATES = [
  { value: "pending", label: "Pending", color: "text-virtue-text-muted bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]" },
  { value: "needs_changes", label: "Changes", color: "text-amber-400 bg-amber-950/30 border-amber-800/40" },
  { value: "approved", label: "Approved", color: "text-emerald-400 bg-emerald-950/30 border-emerald-800/40" },
  { value: "rejected", label: "Rejected", color: "text-red-400 bg-red-950/30 border-red-800/40" },
] as const;

const WORKFLOW_STAGES = [
  "concept", "planning", "previz", "rendering", "review", "approved", "final_exported", "archived",
] as const;

const STAGE_COLORS: Record<string, string> = {
  concept: "bg-[rgba(255,255,255,0.08)]",
  planning: "bg-blue-700",
  previz: "bg-purple-700",
  rendering: "bg-amber-600",
  review: "bg-cyan-600",
  approved: "bg-emerald-600",
  final_exported: "bg-green-500",
  archived: "bg-[rgba(255,255,255,0.08)]",
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<VirtueProject | null>(null);
  const [selectedShot, setSelectedShot] = useState<{
    scene: VirtueScene;
    shot: VirtueShot;
  } | null>(null);

  // Provider state
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [renderProvider, setRenderProvider] = useState("mock");
  const [renderPrompt, setRenderPrompt] = useState("");
  const [renderStatus, setRenderStatus] = useState<VirtueRenderJob | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Routing state
  const [routingMode, setRoutingMode] = useState("balanced");
  const [routingDecision, setRoutingDecision] = useState<VirtueRoutingDecision | null>(null);
  const [loadingRouting, setLoadingRouting] = useState(false);

  // Review state
  const [comments, setComments] = useState<VirtueComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [shotApproval, setShotApproval] = useState<VirtueApproval | null>(null);
  const [takes, setTakes] = useState<VirtueAlternateTake[]>([]);
  const [projectWorkflow, setProjectWorkflow] = useState<VirtueWorkflowStatus | null>(null);
  const [showComments, setShowComments] = useState(false);

  // Scene creation
  const [showAddScene, setShowAddScene] = useState(false);
  const [sceneTitle, setSceneTitle] = useState("");
  const [sceneLocation, setSceneLocation] = useState("");
  const [sceneMood, setSceneMood] = useState("");

  // Shot creation
  const [addingShotToScene, setAddingShotToScene] = useState<string | null>(null);
  const [shotDesc, setShotDesc] = useState("");
  const [shotPrompt, setShotPrompt] = useState("");
  const [shotType, setShotType] = useState("wide");
  const [shotDuration, setShotDuration] = useState("4");
  const [shotCamera, setShotCamera] = useState("static");
  const [shotLens, setShotLens] = useState("50mm");
  const [shotLighting, setShotLighting] = useState("natural");

  useEffect(() => {
    if (id) {
      api.getProject(id).then(setProject).catch(() => {});
      api.getWorkflowStage("project", id).then(setProjectWorkflow).catch(() => {});
    }
    api.listProviders().then(setProviders).catch(() => {});
  }, [id]);

  // Enriched prompt state
  const [enrichedPrompt, setEnrichedPrompt] = useState<string>("");
  const [continuityFragment, setContinuityFragment] = useState<string>("");

  // When selecting a shot, fetch enriched prompt, routing, comments, approval, takes
  useEffect(() => {
    if (selectedShot && project) {
      setRenderStatus(null);
      setRoutingDecision(null);

      api
        .getEnrichedPrompt(project.id, selectedShot.scene.id, selectedShot.shot.id)
        .then((result) => {
          setRenderPrompt(result.enrichedPrompt);
          setEnrichedPrompt(result.enrichedPrompt);
          setContinuityFragment(result.continuityFragment);
        })
        .catch(() => {
          setRenderPrompt(selectedShot.shot.prompt || selectedShot.shot.description);
          setEnrichedPrompt("");
          setContinuityFragment("");
        });

      fetchRoutingRecommendation(selectedShot.scene.id, selectedShot.shot.id);

      // Fetch review data
      api.listComments("shot", selectedShot.shot.id).then(setComments).catch(() => setComments([]));
      api.getApproval("shot", selectedShot.shot.id).then(setShotApproval).catch(() => setShotApproval(null));
      api.listTakes(selectedShot.shot.id).then(setTakes).catch(() => setTakes([]));
    }
  }, [selectedShot?.shot.id]);

  // Re-fetch routing when mode changes
  useEffect(() => {
    if (selectedShot && project && routingMode !== "manual") {
      fetchRoutingRecommendation(selectedShot.scene.id, selectedShot.shot.id);
    }
  }, [routingMode]);

  async function fetchRoutingRecommendation(sceneId: string, shotId: string) {
    if (!project || routingMode === "manual") return;
    setLoadingRouting(true);
    try {
      const decision = await api.recommendProvider({
        projectId: project.id,
        sceneId,
        shotId,
        policy: routingMode,
      });
      setRoutingDecision(decision);
      setRenderProvider(decision.selectedProvider);
    } catch {
      setRoutingDecision(null);
    } finally {
      setLoadingRouting(false);
    }
  }

  async function handleAddScene() {
    if (!sceneTitle.trim() || !project) return;
    const updated = await api.addScene(project.id, {
      title: sceneTitle,
      location: sceneLocation || undefined,
      mood: sceneMood || undefined,
    });
    setProject(updated);
    setSceneTitle("");
    setSceneLocation("");
    setSceneMood("");
    setShowAddScene(false);
  }

  async function handleAddShot(sceneId: string) {
    if (!shotDesc.trim() || !project) return;
    const updated = await api.addShot(project.id, sceneId, {
      shotType,
      description: shotDesc,
      prompt: shotPrompt || undefined,
      durationSec: parseFloat(shotDuration) || 4,
      cameraMove: shotCamera,
      lens: shotLens,
      lighting: shotLighting,
    });
    setProject(updated);
    setShotDesc("");
    setShotPrompt("");
    setShotType("wide");
    setShotDuration("4");
    setShotCamera("static");
    setShotLens("50mm");
    setShotLighting("natural");
    setAddingShotToScene(null);
  }

  async function handleSubmitRender(sceneId: string, shotId: string) {
    if (!project) return;
    setSubmitting(true);
    try {
      const isManual = routingMode === "manual";
      const job = await api.submitRender(
        project.id,
        sceneId,
        shotId,
        isManual ? renderProvider : undefined,
        renderPrompt || undefined,
        isManual ? undefined : routingMode,
      );
      setRenderStatus(job);

      // Auto-create alternate take
      api.createTake(shotId, {
        renderJobId: job.id,
        provider: job.provider,
        promptVersion: renderPrompt,
        label: `Take ${takes.length + 1}`,
      }).then((take) => setTakes((prev) => [...prev, take])).catch(() => {});

      if (job.status !== "completed" && job.status !== "failed") {
        pollRenderJob(job.id);
      }
    } catch (err) {
      setRenderStatus({
        id: "error",
        projectId: project.id,
        shotId,
        provider: renderProvider as any,
        status: "failed",
        progress: 0,
        prompt: renderPrompt,
        skills: [],
        error: err instanceof Error ? err.message : "Failed to submit",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setSubmitting(false);
    }
  }

  function pollRenderJob(jobId: string) {
    const interval = setInterval(async () => {
      try {
        const job = await api.getRender(jobId);
        setRenderStatus(job);
        if (job.status === "completed" || job.status === "failed") {
          clearInterval(interval);
        }
      } catch {
        clearInterval(interval);
      }
    }, 5000);
  }

  async function handleAddComment() {
    if (!newComment.trim() || !selectedShot) return;
    const comment = await api.addComment({
      targetType: "shot",
      targetId: selectedShot.shot.id,
      body: newComment,
      authorName: "Director",
    });
    setComments((prev) => [...prev, comment]);
    setNewComment("");
  }

  async function handleResolveComment(commentId: string) {
    const updated = await api.resolveComment(commentId);
    setComments((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  async function handleSetApproval(state: string) {
    if (!selectedShot) return;
    const approval = await api.setApproval({
      targetType: "shot",
      targetId: selectedShot.shot.id,
      state,
      reviewerName: "Director",
    });
    setShotApproval(approval);
  }

  async function handleSelectTake(takeId: string) {
    if (!selectedShot) return;
    const updated = await api.selectTake(selectedShot.shot.id, takeId);
    setTakes((prev) => prev.map((t) =>
      t.id === updated.id ? updated : t.shotId === updated.shotId && t.status === "selected" ? { ...t, status: "active" as const } : t
    ));
  }

  async function handleAdvanceWorkflow() {
    if (!project) return;
    const status = await api.advanceWorkflow({ targetType: "project", targetId: project.id });
    setProjectWorkflow(status);
  }

  if (!project) {
    return (
      <div className="p-5 sm:p-8 lg:p-10 animate-fade-in">
        <div className="flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-virtue-accent animate-spin" />
          <p className="text-virtue-text-muted text-sm">Loading project...</p>
        </div>
      </div>
    );
  }

  const totalShots = project.scenes.reduce((n, s) => n + s.shots.length, 0);
  const currentStageIdx = projectWorkflow
    ? WORKFLOW_STAGES.indexOf(projectWorkflow.stage as any)
    : 0;

  return (
    <div className="flex h-full flex-col lg:flex-row animate-fade-in">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-8 lg:p-10 space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href="/projects"
              className="text-xs text-virtue-text-muted hover:text-virtue-accent transition-colors min-h-[44px] sm:min-h-0 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3 h-3" />
              Projects
            </Link>
            <h1 className="text-[22px] sm:text-2xl font-bold tracking-tight text-virtue-text mt-1">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-[13px] sm:text-sm text-virtue-text-secondary mt-1 max-w-xl">
                {project.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleAdvanceWorkflow}
              className={`rounded px-2.5 py-1.5 sm:py-1 text-[10px] font-mono uppercase tracking-wider text-white/80 hover:text-white transition-colors touch-manipulation ${STAGE_COLORS[projectWorkflow?.stage || "concept"]}`}
              title="Click to advance workflow stage"
            >
              {projectWorkflow?.stage || "concept"}
            </button>
            <span className="rounded bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] px-2 py-1 text-[10px] text-virtue-text-muted font-mono uppercase hidden sm:inline">
              {project.provider}
            </span>
          </div>
        </div>

        {/* Workflow Progress Bar */}
        <div className="flex gap-0.5 rounded-lg overflow-hidden">
          {WORKFLOW_STAGES.map((stage, i) => (
            <div
              key={stage}
              className={`h-1.5 flex-1 transition-colors ${
                i <= currentStageIdx ? STAGE_COLORS[stage] : "bg-[rgba(255,255,255,0.06)]"
              }`}
              title={stage}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <MiniStat label="Scenes" value={project.scenes.length} icon={<Clapperboard className="w-3.5 h-3.5" />} />
          <MiniStat label="Shots" value={totalShots} icon={<Film className="w-3.5 h-3.5" />} />
          <MiniStat label="Characters" value={project.characters?.length ?? 0} icon={<Users className="w-3.5 h-3.5" />} />
          <MiniStat label="Environments" value={project.environments?.length ?? 0} icon={<MapPin className="w-3.5 h-3.5" />} />
          <MiniStat label="Props" value={project.props?.length ?? 0} icon={<Box className="w-3.5 h-3.5" />} />
        </div>

        {/* Scenes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-label">
              Scenes
            </h2>
            <button
              onClick={() => setShowAddScene(!showAddScene)}
              className="text-xs text-virtue-text-muted hover:text-virtue-accent transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add Scene
            </button>
          </div>

          {/* Add Scene Form */}
          {showAddScene && (
            <div className="glass-panel p-4 space-y-3">
              <input
                type="text"
                value={sceneTitle}
                onChange={(e) => setSceneTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddScene()}
                placeholder="Scene title..."
                className="glass-input w-full"
                autoFocus
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={sceneLocation}
                  onChange={(e) => setSceneLocation(e.target.value)}
                  placeholder="Location..."
                  className="glass-input"
                />
                <input
                  type="text"
                  value={sceneMood}
                  onChange={(e) => setSceneMood(e.target.value)}
                  placeholder="Mood..."
                  className="glass-input"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddScene(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddScene}
                  disabled={!sceneTitle.trim()}
                  className="btn-primary"
                >
                  Add Scene
                </button>
              </div>
            </div>
          )}

          {/* Scene List */}
          {project.scenes.length === 0 ? (
            <div className="glass-panel p-12 text-center">
              <Clapperboard className="w-8 h-8 text-virtue-text-muted mx-auto mb-3 opacity-40" />
              <p className="text-sm text-virtue-text-muted">No scenes yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {project.scenes.map((scene, i) => (
                <div key={scene.id} className="glass-panel overflow-hidden">
                  {/* Scene header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
                    <span className="text-xs text-virtue-text-muted font-mono w-6">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-virtue-text">
                        {scene.title}
                      </p>
                      <div className="flex gap-3 mt-0.5 flex-wrap">
                        {scene.location && (
                          <span className="text-[10px] text-virtue-text-muted flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            {scene.location}
                          </span>
                        )}
                        {scene.mood && (
                          <span className="text-[10px] text-virtue-text-muted flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            {scene.mood}
                          </span>
                        )}
                        {scene.context?.environmentId && (
                          <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                            <Layers className="w-2.5 h-2.5" />
                            env: {project.environments?.find(e => e.id === scene.context?.environmentId)?.name ?? "?"}
                          </span>
                        )}
                        {(scene.context?.activeCharacterIds?.length ?? 0) > 0 && (
                          <span className="text-[10px] text-blue-600 flex items-center gap-0.5">
                            <Users className="w-2.5 h-2.5" />
                            {scene.context!.activeCharacterIds.length} char{scene.context!.activeCharacterIds.length !== 1 ? "s" : ""}
                          </span>
                        )}
                        {(scene.context?.activePropIds?.length ?? 0) > 0 && (
                          <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                            <Box className="w-2.5 h-2.5" />
                            {scene.context!.activePropIds.length} prop{scene.context!.activePropIds.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/projects/${project.id}/scenes/${scene.id}/editor`}
                      className="text-[10px] text-virtue-text-muted hover:text-purple-400 transition-colors uppercase tracking-wider flex items-center gap-1"
                    >
                      <Paintbrush className="w-3 h-3" />
                      Editor
                    </Link>
                    <Link
                      href={`/projects/${project.id}/scenes/${scene.id}/timeline`}
                      className="text-[10px] text-virtue-text-muted hover:text-emerald-400 transition-colors uppercase tracking-wider flex items-center gap-1"
                    >
                      <BarChart3 className="w-3 h-3" />
                      Timeline
                    </Link>
                    <button
                      onClick={() =>
                        setAddingShotToScene(
                          addingShotToScene === scene.id ? null : scene.id
                        )
                      }
                      className="text-[10px] text-virtue-text-muted hover:text-virtue-accent transition-colors uppercase tracking-wider flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Shot
                    </button>
                  </div>

                  {/* Add Shot Form */}
                  {addingShotToScene === scene.id && (
                    <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)] space-y-3 bg-[rgba(255,255,255,0.02)]">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-virtue-text-muted mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={shotDesc}
                            onChange={(e) => setShotDesc(e.target.value)}
                            placeholder="What happens in this shot..."
                            className="glass-input w-full text-xs"
                            autoFocus
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-virtue-text-muted mb-1">
                            Prompt
                          </label>
                          <input
                            type="text"
                            value={shotPrompt}
                            onChange={(e) => setShotPrompt(e.target.value)}
                            placeholder="Detailed generation prompt..."
                            className="glass-input w-full text-xs"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        <div>
                          <label className="block text-[10px] text-virtue-text-muted mb-1">Shot Type</label>
                          <select
                            value={shotType}
                            onChange={(e) => setShotType(e.target.value)}
                            className="glass-input w-full text-xs"
                          >
                            <option value="wide">Wide</option>
                            <option value="medium">Medium</option>
                            <option value="close">Close</option>
                            <option value="extreme-close">Extreme Close</option>
                            <option value="establishing">Establishing</option>
                            <option value="over-shoulder">Over Shoulder</option>
                            <option value="pov">POV</option>
                            <option value="aerial">Aerial</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-virtue-text-muted mb-1">Duration</label>
                          <input type="text" value={shotDuration} onChange={(e) => setShotDuration(e.target.value)} className="glass-input w-full text-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-virtue-text-muted mb-1">Camera</label>
                          <input type="text" value={shotCamera} onChange={(e) => setShotCamera(e.target.value)} className="glass-input w-full text-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-virtue-text-muted mb-1">Lens</label>
                          <input type="text" value={shotLens} onChange={(e) => setShotLens(e.target.value)} className="glass-input w-full text-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-virtue-text-muted mb-1">Lighting</label>
                          <input type="text" value={shotLighting} onChange={(e) => setShotLighting(e.target.value)} className="glass-input w-full text-xs" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setAddingShotToScene(null)} className="btn-secondary">Cancel</button>
                        <button onClick={() => handleAddShot(scene.id)} disabled={!shotDesc.trim()} className="btn-primary">Add Shot</button>
                      </div>
                    </div>
                  )}

                  {/* Shots */}
                  {scene.shots.length > 0 && (
                    <div className="divide-y divide-[rgba(255,255,255,0.04)]">
                      {scene.shots.map((shot, j) => {
                        const isSelected = selectedShot?.shot.id === shot.id;
                        return (
                          <button
                            key={shot.id}
                            onClick={() =>
                              setSelectedShot(isSelected ? null : { scene, shot })
                            }
                            className={`glass-card w-full text-left flex items-center gap-3 px-4 py-3.5 sm:py-2.5 transition-all touch-manipulation rounded-none border-0 ${
                              isSelected
                                ? "bg-virtue-accent/10 border-l-2 !border-l-virtue-accent"
                                : "hover:bg-[rgba(255,255,255,0.03)] active:bg-[rgba(255,255,255,0.05)]"
                            }`}
                          >
                            <span className="text-[10px] text-virtue-text-muted font-mono w-6 shrink-0">
                              {String(i + 1)}.{j + 1}
                            </span>
                            <span className="rounded bg-[rgba(255,255,255,0.06)] px-1.5 py-0.5 text-[9px] text-virtue-text-secondary font-mono uppercase shrink-0">
                              {shot.shotType}
                            </span>
                            <span className="text-xs text-virtue-text-secondary truncate flex-1">
                              {shot.description}
                            </span>
                            <span className="text-[10px] text-virtue-text-muted shrink-0 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {shot.durationSec}s
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Shot Detail Panel -- desktop */}
      {selectedShot && (
        <div className="hidden lg:block w-96 glass-panel border-l border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.4)] overflow-y-auto shrink-0 rounded-none">
          <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
            <h2 className="section-label !mb-0">
              Shot Detail
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowComments(!showComments)}
                className={`text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1 ${
                  showComments ? "text-virtue-accent" : "text-virtue-text-muted hover:text-virtue-text-secondary"
                }`}
              >
                <MessageSquare className="w-3 h-3" />
                Comments{comments.length > 0 ? ` (${comments.length})` : ""}
              </button>
              <button
                onClick={() => setSelectedShot(null)}
                className="text-virtue-text-muted hover:text-virtue-text-secondary text-xs transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Approval Badge */}
            <div>
              <label className="block text-[10px] text-virtue-text-muted uppercase tracking-wider mb-1.5">
                <CheckCircle2 className="w-3 h-3 inline mr-1 -mt-0.5" />
                Approval Status
              </label>
              <div className="flex gap-1">
                {APPROVAL_STATES.map((as) => (
                  <button
                    key={as.value}
                    onClick={() => handleSetApproval(as.value)}
                    className={`flex-1 rounded-md py-1.5 text-[9px] uppercase tracking-wider font-medium border transition-all ${
                      (shotApproval?.state || "pending") === as.value
                        ? as.color
                        : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] text-virtue-text-muted hover:border-[rgba(255,255,255,0.12)]"
                    }`}
                  >
                    {as.label}
                  </button>
                ))}
              </div>
              {shotApproval?.notes && (
                <p className="text-[10px] text-virtue-text-secondary mt-1 italic">{shotApproval.notes}</p>
              )}
            </div>

            {/* Render Result Video */}
            {renderStatus?.output?.url && renderStatus.status === "completed" && (
              <div>
                <label className="block text-[10px] text-virtue-text-muted uppercase tracking-wider mb-1.5">
                  <Play className="w-3 h-3 inline mr-1 -mt-0.5" />
                  Render Result
                </label>
                <div className="rounded-lg overflow-hidden border border-[rgba(255,255,255,0.06)] bg-black">
                  <video
                    src={renderStatus.output.url}
                    controls autoPlay loop muted playsInline
                    className="w-full aspect-video"
                  />
                </div>
              </div>
            )}

            {/* Render Status */}
            {renderStatus && (
              <div>
                <label className="block text-[10px] text-virtue-text-muted uppercase tracking-wider mb-1.5">
                  Render Status
                </label>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${
                    renderStatus.status === "completed" ? "bg-emerald-500"
                    : renderStatus.status === "failed" ? "bg-red-400"
                    : "bg-virtue-accent animate-pulse"
                  }`} />
                  <span className={`text-xs font-medium uppercase ${
                    renderStatus.status === "completed" ? "text-emerald-400"
                    : renderStatus.status === "failed" ? "text-red-400"
                    : "text-virtue-accent"
                  }`}>
                    {renderStatus.status}
                  </span>
                  <span className="text-xs text-virtue-text-muted ml-auto tabular-nums">
                    {renderStatus.progress}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)]">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      renderStatus.status === "completed" ? "bg-emerald-500"
                      : renderStatus.status === "failed" ? "bg-red-500"
                      : "bg-virtue-accent"
                    }`}
                    style={{ width: `${renderStatus.progress}%` }}
                  />
                </div>
                {renderStatus.error && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {renderStatus.error}
                  </p>
                )}
              </div>
            )}

            {/* Alternate Takes */}
            {takes.length > 0 && (
              <div>
                <label className="block text-[10px] text-virtue-text-muted uppercase tracking-wider mb-1.5">
                  <Film className="w-3 h-3 inline mr-1 -mt-0.5" />
                  Takes ({takes.length})
                </label>
                <div className="space-y-1">
                  {takes.filter((t) => t.status !== "archived").map((take) => (
                    <button
                      key={take.id}
                      onClick={() => handleSelectTake(take.id)}
                      className={`w-full flex items-center gap-2 rounded px-2.5 py-1.5 text-left transition-all border ${
                        take.status === "selected"
                          ? "bg-emerald-950/20 border-emerald-900/30"
                          : take.status === "favorite"
                            ? "bg-amber-950/20 border-amber-900/30"
                            : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                        take.status === "selected" ? "bg-emerald-400"
                        : take.status === "favorite" ? "bg-amber-400"
                        : "bg-virtue-text-muted"
                      }`} />
                      <span className="text-[10px] text-virtue-text-secondary flex-1">
                        {take.label || take.id.slice(0, 12)}
                      </span>
                      <span className="text-[9px] text-virtue-text-muted font-mono uppercase">
                        {take.provider}
                      </span>
                      {take.status === "selected" && (
                        <span className="text-[8px] text-emerald-500 uppercase flex items-center gap-0.5">
                          <Eye className="w-2.5 h-2.5" />
                          active
                        </span>
                      )}
                      {take.status === "favorite" && (
                        <span className="text-[8px] text-amber-500 uppercase flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5" />
                          fav
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {takes.length >= 2 && (
                  <Link
                    href={`/studio/compare/new?renders=${takes.map((t) => t.renderJobId).join(",")}`}
                    className="block mt-2 text-center text-[10px] text-virtue-accent hover:text-virtue-accent/80 uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                  >
                    <GitCompare className="w-3 h-3" />
                    Compare Takes
                  </Link>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-[10px] text-virtue-text-muted uppercase tracking-wider mb-1.5">
                Description
              </label>
              <p className="text-sm text-virtue-text-secondary leading-relaxed">
                {selectedShot.shot.description}
              </p>
            </div>

            {/* Editable Prompt */}
            <div>
              <label className="block text-[10px] text-virtue-text-muted uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3 h-3 inline mr-1 -mt-0.5" />
                Generation Prompt
              </label>
              <textarea
                value={renderPrompt}
                onChange={(e) => setRenderPrompt(e.target.value)}
                rows={4}
                className="glass-input w-full resize-none leading-relaxed"
                placeholder="Enter generation prompt..."
              />
            </div>

            {/* Continuity Context */}
            {continuityFragment && (
              <div>
                <label className="block text-[10px] text-virtue-text-muted uppercase tracking-wider mb-1.5">
                  Continuity Context
                </label>
                <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-md p-3">
                  <p className="text-[11px] text-emerald-400/80 leading-relaxed font-mono">
                    {continuityFragment}
                  </p>
                </div>
              </div>
            )}

            {/* Routing Intelligence */}
            <div>
              <label className="block text-[10px] text-virtue-text-muted uppercase tracking-wider mb-1.5">
                <Route className="w-3 h-3 inline mr-1 -mt-0.5" />
                Routing Mode
              </label>
              <div className="grid grid-cols-5 gap-1">
                {ROUTING_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => setRoutingMode(mode.value)}
                    className={`rounded-md py-1.5 text-[9px] uppercase tracking-wider font-medium border transition-all ${
                      routingMode === mode.value
                        ? "bg-virtue-accent/20 border-virtue-accent/40 text-virtue-accent"
                        : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] text-virtue-text-muted hover:border-[rgba(255,255,255,0.12)] hover:text-virtue-text-secondary"
                    }`}
                    title={mode.desc}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Routing Recommendation */}
            {routingMode !== "manual" && (
              <div>
                <label className="block text-[10px] text-virtue-text-muted uppercase tracking-wider mb-1.5">
                  Provider Recommendation
                </label>
                {loadingRouting ? (
                  <div className="bg-[rgba(255,255,255,0.02)] rounded-md p-3 border border-[rgba(255,255,255,0.06)]">
                    <p className="text-[10px] text-virtue-text-muted animate-pulse flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Analyzing shot requirements...
                    </p>
                  </div>
                ) : routingDecision ? (
                  <div className="space-y-2">
                    <div className="bg-virtue-accent/10 border border-virtue-accent/20 rounded-md p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="h-2 w-2 rounded-full bg-virtue-accent shrink-0" />
                        <span className="text-xs font-semibold text-virtue-accent">
                          {routingDecision.scores.find(s => s.provider === routingDecision.selectedProvider)?.displayName || routingDecision.selectedProvider}
                        </span>
                        <span className="ml-auto rounded bg-virtue-accent/20 px-1.5 py-0.5 text-[8px] text-virtue-accent font-mono uppercase">
                          Recommended
                        </span>
                      </div>
                      <p className="text-[10px] text-virtue-accent/70 leading-relaxed">
                        {routingDecision.rationale}
                      </p>
                    </div>

                    <div className="space-y-1">
                      {routingDecision.scores.map((score) => (
                        <button
                          key={score.provider}
                          onClick={() => {
                            setRenderProvider(score.provider);
                            setRoutingMode("manual");
                          }}
                          disabled={!score.available}
                          className={`w-full flex items-center gap-2 rounded px-2.5 py-1.5 text-left transition-all border ${
                            score.provider === routingDecision.selectedProvider
                              ? "bg-virtue-accent/10 border-virtue-accent/20"
                              : score.available
                                ? "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]"
                                : "bg-[rgba(255,255,255,0.01)] border-[rgba(255,255,255,0.03)] opacity-50"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                            score.provider === routingDecision.selectedProvider ? "bg-virtue-accent"
                            : score.available ? "bg-virtue-text-muted" : "bg-[rgba(255,255,255,0.08)]"
                          }`} />
                          <span className="text-[10px] text-virtue-text-secondary flex-1">
                            {score.displayName}
                          </span>
                          <span className="text-[9px] text-virtue-text-muted font-mono tabular-nums">
                            {(score.totalScore * 100).toFixed(0)}
                          </span>
                          {!score.available && (
                            <span className="text-[8px] text-virtue-text-muted">unavailable</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Manual Provider Picker (only in manual mode) */}
            {routingMode === "manual" && (
              <div>
                <label className="block text-[10px] text-virtue-text-muted uppercase tracking-wider mb-1.5">
                  Provider
                </label>
                <div className="flex gap-2">
                  {providers.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => setRenderProvider(p.name)}
                      disabled={!p.available}
                      className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors border ${
                        renderProvider === p.name
                          ? "border-virtue-accent/50 bg-virtue-accent/10 text-virtue-text"
                          : p.available
                            ? "border-[rgba(255,255,255,0.06)] text-virtue-text-muted hover:text-virtue-text-secondary hover:border-[rgba(255,255,255,0.12)]"
                            : "border-[rgba(255,255,255,0.03)] text-virtue-text-muted cursor-not-allowed"
                      }`}
                    >
                      {p.displayName}
                      {!p.available && (
                        <span className="block text-[9px] text-virtue-text-muted mt-0.5">No API key</span>
                      )}
                    </button>
                  ))}
                  {providers.length === 0 && (
                    <span className="text-xs text-virtue-text-muted flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Loading providers...
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Parameters Grid */}
            <div className="grid grid-cols-2 gap-3">
              <ParamField label="Shot Type" value={selectedShot.shot.shotType} icon={<Camera className="w-3 h-3" />} />
              <ParamField label="Duration" value={`${selectedShot.shot.durationSec}s`} icon={<Clock className="w-3 h-3" />} />
              <ParamField label="Camera" value={selectedShot.shot.cameraMove} icon={<Film className="w-3 h-3" />} />
              <ParamField label="Lens" value={selectedShot.shot.lens} icon={<Aperture className="w-3 h-3" />} />
              <ParamField label="Lighting" value={selectedShot.shot.lighting} icon={<Sun className="w-3 h-3" />} span2 />
            </div>

            {/* Scene Context */}
            <div>
              <label className="block text-[10px] text-virtue-text-muted uppercase tracking-wider mb-1.5">
                <Clapperboard className="w-3 h-3 inline mr-1 -mt-0.5" />
                Scene
              </label>
              <div className="bg-[rgba(255,255,255,0.02)] rounded-md p-3 border border-[rgba(255,255,255,0.06)] space-y-1">
                <p className="text-xs text-virtue-text-secondary font-medium">
                  {selectedShot.scene.title}
                </p>
                {selectedShot.scene.location && (
                  <p className="text-[10px] text-virtue-text-muted flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" />
                    {selectedShot.scene.location}
                  </p>
                )}
              </div>
            </div>

            {/* Attached Skills */}
            {selectedShot.shot.skills.length > 0 && (
              <div>
                <label className="block text-[10px] text-virtue-text-muted uppercase tracking-wider mb-1.5">
                  Attached Skills
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedShot.shot.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded bg-[rgba(255,255,255,0.06)] px-2 py-0.5 text-[10px] text-virtue-text-secondary font-mono"
                    >
                      {skill.replace("skill-", "")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Render */}
            <button
              onClick={() =>
                handleSubmitRender(selectedShot.scene.id, selectedShot.shot.id)
              }
              disabled={submitting || !renderPrompt.trim()}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  {routingMode === "manual"
                    ? `Render with ${renderProvider}`
                    : `Render (${routingMode.replace("auto_", "").replace("_", " ")})`}
                </>
              )}
            </button>

            {/* Comments Panel */}
            {showComments && (
              <div>
                <label className="block text-[10px] text-virtue-text-muted uppercase tracking-wider mb-1.5">
                  <MessageSquare className="w-3 h-3 inline mr-1 -mt-0.5" />
                  Comments
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {comments.length === 0 ? (
                    <p className="text-[10px] text-virtue-text-muted italic">No comments yet.</p>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className={`rounded-md p-2.5 border ${
                          comment.resolvedAt
                            ? "bg-[rgba(255,255,255,0.01)] border-[rgba(255,255,255,0.03)] opacity-60"
                            : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)]"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] text-virtue-text-secondary font-medium">
                            {comment.authorName}
                          </span>
                          <span className="text-[9px] text-virtue-text-muted">
                            {new Date(comment.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                          </span>
                          {comment.resolvedAt ? (
                            <span className="ml-auto text-[8px] text-emerald-600 uppercase flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Resolved
                            </span>
                          ) : (
                            <button
                              onClick={() => handleResolveComment(comment.id)}
                              className="ml-auto text-[8px] text-virtue-text-muted hover:text-emerald-400 uppercase transition-colors"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-virtue-text-secondary leading-relaxed">
                          {comment.body}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                    placeholder="Add a comment..."
                    className="glass-input flex-1 text-xs"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="btn-secondary flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    Post
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile shot detail bottom sheet */}
      <div className="lg:hidden">
        <BottomSheet
          open={!!selectedShot}
          onClose={() => setSelectedShot(null)}
          title={selectedShot ? `Shot: ${selectedShot.shot.description?.slice(0, 40) || selectedShot.shot.shotType}` : "Shot Detail"}
        >
          {selectedShot && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-virtue-text-muted uppercase tracking-wider mb-1">Shot Type</label>
                <span className="rounded bg-[rgba(255,255,255,0.06)] px-2 py-1 text-[11px] text-virtue-text-secondary font-mono uppercase">
                  {selectedShot.shot.shotType}
                </span>
              </div>
              <div>
                <label className="block text-[10px] text-virtue-text-muted uppercase tracking-wider mb-1">Prompt</label>
                <p className="text-[13px] text-virtue-text-secondary bg-[rgba(255,255,255,0.02)] rounded-md p-3 border border-[rgba(255,255,255,0.06)]">
                  {renderPrompt}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="glass-panel p-2.5">
                  <p className="text-[9px] text-virtue-text-muted uppercase flex items-center gap-0.5">
                    <Camera className="w-2.5 h-2.5" />
                    Camera
                  </p>
                  <p className="text-[12px] text-virtue-text-secondary font-mono">{selectedShot.shot.cameraMove}</p>
                </div>
                <div className="glass-panel p-2.5">
                  <p className="text-[9px] text-virtue-text-muted uppercase flex items-center gap-0.5">
                    <Aperture className="w-2.5 h-2.5" />
                    Lens
                  </p>
                  <p className="text-[12px] text-virtue-text-secondary font-mono">{selectedShot.shot.lens}</p>
                </div>
                <div className="glass-panel p-2.5">
                  <p className="text-[9px] text-virtue-text-muted uppercase flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    Duration
                  </p>
                  <p className="text-[12px] text-virtue-text-secondary font-mono">{selectedShot.shot.durationSec}s</p>
                </div>
              </div>
              <button
                onClick={() => handleSubmitRender(selectedShot.scene.id, selectedShot.shot.id)}
                disabled={submitting}
                className="btn-primary w-full py-3 text-[15px] active:scale-[0.98] touch-manipulation flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Submit Render
                  </>
                )}
              </button>
              {renderStatus && (
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${renderStatus.status === "completed" ? "bg-emerald-500" : renderStatus.status === "failed" ? "bg-red-400" : "bg-virtue-accent animate-pulse"}`} />
                  <span className="text-[13px] text-virtue-text-secondary uppercase">{renderStatus.status}</span>
                  <span className="text-[12px] text-virtue-text-muted ml-auto">{renderStatus.progress}%</span>
                </div>
              )}
            </div>
          )}
        </BottomSheet>
      </div>
    </div>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="glass-panel p-3">
      <div className="flex items-center gap-1.5">
        <span className="text-virtue-text-muted">{icon}</span>
        <p className="text-[10px] text-virtue-text-muted uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className="text-xl font-bold text-virtue-text mt-0.5 tabular-nums">
        {value}
      </p>
    </div>
  );
}

function ParamField({
  label,
  value,
  icon,
  span2,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  span2?: boolean;
}) {
  return (
    <div className={span2 ? "col-span-2" : ""}>
      <p className="text-[10px] text-virtue-text-muted mb-0.5 flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="text-xs text-virtue-text-secondary font-mono">{value}</p>
    </div>
  );
}
