"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { VirtueProject, VirtueShot, VirtueScene, VirtueRenderJob } from "@virtue/types";

interface ProviderInfo {
  name: string;
  displayName: string;
  available: boolean;
}

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

  // Scene creation
  const [showAddScene, setShowAddScene] = useState(false);
  const [sceneTitle, setSceneTitle] = useState("");
  const [sceneLocation, setSceneLocation] = useState("");
  const [sceneMood, setSceneMood] = useState("");

  // Shot creation
  const [addingShotToScene, setAddingShotToScene] = useState<string | null>(
    null
  );
  const [shotDesc, setShotDesc] = useState("");
  const [shotPrompt, setShotPrompt] = useState("");
  const [shotType, setShotType] = useState("wide");
  const [shotDuration, setShotDuration] = useState("4");
  const [shotCamera, setShotCamera] = useState("static");
  const [shotLens, setShotLens] = useState("50mm");
  const [shotLighting, setShotLighting] = useState("natural");

  useEffect(() => {
    if (id) api.getProject(id).then(setProject).catch(() => {});
    api.listProviders().then(setProviders).catch(() => {});
  }, [id]);

  // When selecting a shot, populate the prompt field
  useEffect(() => {
    if (selectedShot) {
      setRenderPrompt(selectedShot.shot.prompt || selectedShot.shot.description);
      setRenderStatus(null);
    }
  }, [selectedShot?.shot.id]);

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
      const job = await api.submitRender(
        project.id,
        sceneId,
        shotId,
        renderProvider || undefined,
        renderPrompt || undefined,
      );
      setRenderStatus(job);
      // Start polling if not terminal
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

  if (!project) {
    return (
      <div className="p-8">
        <p className="text-zinc-500 text-sm">Loading project...</p>
      </div>
    );
  }

  const totalShots = project.scenes.reduce((n, s) => n + s.shots.length, 0);

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Link
              href="/projects"
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              Projects
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100 mt-1">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-sm text-zinc-500 mt-1 max-w-xl">
                {project.description}
              </p>
            )}
          </div>
          <span className="rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-500 font-mono uppercase">
            {project.provider}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <MiniStat label="Scenes" value={project.scenes.length} />
          <MiniStat label="Shots" value={totalShots} />
          <MiniStat label="Characters" value={project.characters.length} />
        </div>

        {/* Scenes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Scenes
            </h2>
            <button
              onClick={() => setShowAddScene(!showAddScene)}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              + Add Scene
            </button>
          </div>

          {/* Add Scene Form */}
          {showAddScene && (
            <div className="studio-panel p-4 space-y-3">
              <input
                type="text"
                value={sceneTitle}
                onChange={(e) => setSceneTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddScene()}
                placeholder="Scene title..."
                className="w-full rounded-md border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
                autoFocus
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={sceneLocation}
                  onChange={(e) => setSceneLocation(e.target.value)}
                  placeholder="Location..."
                  className="rounded-md border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
                />
                <input
                  type="text"
                  value={sceneMood}
                  onChange={(e) => setSceneMood(e.target.value)}
                  placeholder="Mood..."
                  className="rounded-md border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddScene(false)}
                  className="text-sm text-zinc-500 hover:text-zinc-300 px-3 py-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddScene}
                  disabled={!sceneTitle.trim()}
                  className="rounded-md bg-zinc-100 px-4 py-1.5 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-40 transition-colors"
                >
                  Add Scene
                </button>
              </div>
            </div>
          )}

          {/* Scene List */}
          {project.scenes.length === 0 ? (
            <div className="studio-panel p-12 text-center">
              <p className="text-sm text-zinc-600">No scenes yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {project.scenes.map((scene, i) => (
                <div key={scene.id} className="studio-panel">
                  {/* Scene header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/40">
                    <span className="text-xs text-zinc-600 font-mono w-6">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-200">
                        {scene.title}
                      </p>
                      <div className="flex gap-3 mt-0.5">
                        {scene.location && (
                          <span className="text-[10px] text-zinc-600">
                            {scene.location}
                          </span>
                        )}
                        {scene.mood && (
                          <span className="text-[10px] text-zinc-600">
                            {scene.mood}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/projects/${project.id}/scenes/${scene.id}/timeline`}
                      className="text-[10px] text-zinc-600 hover:text-emerald-400 transition-colors uppercase tracking-wider"
                    >
                      Timeline
                    </Link>
                    <button
                      onClick={() =>
                        setAddingShotToScene(
                          addingShotToScene === scene.id ? null : scene.id
                        )
                      }
                      className="text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors uppercase tracking-wider"
                    >
                      + Shot
                    </button>
                  </div>

                  {/* Add Shot Form */}
                  {addingShotToScene === scene.id && (
                    <div className="px-4 py-3 border-b border-zinc-800/40 space-y-3 bg-zinc-900/30">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-zinc-600 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={shotDesc}
                            onChange={(e) => setShotDesc(e.target.value)}
                            placeholder="What happens in this shot..."
                            className="w-full rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
                            autoFocus
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-600 mb-1">
                            Prompt
                          </label>
                          <input
                            type="text"
                            value={shotPrompt}
                            onChange={(e) => setShotPrompt(e.target.value)}
                            placeholder="Detailed generation prompt..."
                            className="w-full rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        <div>
                          <label className="block text-[10px] text-zinc-600 mb-1">
                            Shot Type
                          </label>
                          <select
                            value={shotType}
                            onChange={(e) => setShotType(e.target.value)}
                            className="w-full rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-300 focus:outline-none"
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
                          <label className="block text-[10px] text-zinc-600 mb-1">
                            Duration
                          </label>
                          <input
                            type="text"
                            value={shotDuration}
                            onChange={(e) => setShotDuration(e.target.value)}
                            className="w-full rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-300 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-600 mb-1">
                            Camera
                          </label>
                          <input
                            type="text"
                            value={shotCamera}
                            onChange={(e) => setShotCamera(e.target.value)}
                            className="w-full rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-300 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-600 mb-1">
                            Lens
                          </label>
                          <input
                            type="text"
                            value={shotLens}
                            onChange={(e) => setShotLens(e.target.value)}
                            className="w-full rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-300 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-600 mb-1">
                            Lighting
                          </label>
                          <input
                            type="text"
                            value={shotLighting}
                            onChange={(e) => setShotLighting(e.target.value)}
                            className="w-full rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-300 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setAddingShotToScene(null)}
                          className="text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleAddShot(scene.id)}
                          disabled={!shotDesc.trim()}
                          className="rounded bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-900 hover:bg-white disabled:opacity-40 transition-colors"
                        >
                          Add Shot
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Shots */}
                  {scene.shots.length > 0 && (
                    <div className="divide-y divide-zinc-800/30">
                      {scene.shots.map((shot, j) => {
                        const isSelected = selectedShot?.shot.id === shot.id;
                        return (
                          <button
                            key={shot.id}
                            onClick={() =>
                              setSelectedShot(
                                isSelected ? null : { scene, shot }
                              )
                            }
                            className={`w-full text-left flex items-center gap-3 px-4 py-2.5 transition-colors ${
                              isSelected
                                ? "bg-zinc-800/50"
                                : "hover:bg-zinc-900/50"
                            }`}
                          >
                            <span className="text-[10px] text-zinc-700 font-mono w-6 shrink-0">
                              {String(i + 1)}.{j + 1}
                            </span>
                            <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[9px] text-zinc-500 font-mono uppercase shrink-0">
                              {shot.shotType}
                            </span>
                            <span className="text-xs text-zinc-400 truncate flex-1">
                              {shot.description}
                            </span>
                            <span className="text-[10px] text-zinc-600 shrink-0">
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

      {/* Shot Detail Panel */}
      {selectedShot && (
        <div className="w-96 border-l border-zinc-800/60 bg-[#080808] overflow-y-auto shrink-0">
          <div className="px-5 py-4 border-b border-zinc-800/60 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Shot Detail
            </h2>
            <button
              onClick={() => setSelectedShot(null)}
              className="text-zinc-600 hover:text-zinc-300 text-xs transition-colors"
            >
              Close
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Render Result Video */}
            {renderStatus?.output?.url && renderStatus.status === "completed" && (
              <div>
                <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">
                  Render Result
                </label>
                <div className="rounded-lg overflow-hidden border border-zinc-800/60 bg-black">
                  <video
                    src={renderStatus.output.url}
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full aspect-video"
                  />
                </div>
              </div>
            )}

            {/* Render Status */}
            {renderStatus && (
              <div>
                <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">
                  Render Status
                </label>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${
                    renderStatus.status === "completed" ? "bg-emerald-500"
                    : renderStatus.status === "failed" ? "bg-red-400"
                    : "bg-blue-400 animate-pulse"
                  }`} />
                  <span className={`text-xs font-medium uppercase ${
                    renderStatus.status === "completed" ? "text-emerald-400"
                    : renderStatus.status === "failed" ? "text-red-400"
                    : "text-blue-400"
                  }`}>
                    {renderStatus.status}
                  </span>
                  <span className="text-xs text-zinc-600 ml-auto tabular-nums">
                    {renderStatus.progress}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-800">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      renderStatus.status === "completed" ? "bg-emerald-500"
                      : renderStatus.status === "failed" ? "bg-red-500"
                      : "bg-blue-500"
                    }`}
                    style={{ width: `${renderStatus.progress}%` }}
                  />
                </div>
                {renderStatus.error && (
                  <p className="text-xs text-red-400 mt-1.5">{renderStatus.error}</p>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {selectedShot.shot.description}
              </p>
            </div>

            {/* Editable Prompt */}
            <div>
              <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">
                Generation Prompt
              </label>
              <textarea
                value={renderPrompt}
                onChange={(e) => setRenderPrompt(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-300 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none resize-none leading-relaxed"
                placeholder="Enter generation prompt..."
              />
            </div>

            {/* Provider Picker */}
            <div>
              <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">
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
                        ? "border-zinc-500 bg-zinc-800 text-zinc-200"
                        : p.available
                          ? "border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                          : "border-zinc-800/50 text-zinc-700 cursor-not-allowed"
                    }`}
                  >
                    {p.displayName}
                    {!p.available && (
                      <span className="block text-[9px] text-zinc-700 mt-0.5">No API key</span>
                    )}
                  </button>
                ))}
                {providers.length === 0 && (
                  <span className="text-xs text-zinc-600">Loading providers...</span>
                )}
              </div>
            </div>

            {/* Parameters Grid */}
            <div className="grid grid-cols-2 gap-3">
              <ParamField
                label="Shot Type"
                value={selectedShot.shot.shotType}
              />
              <ParamField
                label="Duration"
                value={`${selectedShot.shot.durationSec}s`}
              />
              <ParamField
                label="Camera"
                value={selectedShot.shot.cameraMove}
              />
              <ParamField label="Lens" value={selectedShot.shot.lens} />
              <ParamField
                label="Lighting"
                value={selectedShot.shot.lighting}
                span2
              />
            </div>

            {/* Scene Context */}
            <div>
              <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">
                Scene
              </label>
              <div className="bg-zinc-900/60 rounded-md p-3 border border-zinc-800/40 space-y-1">
                <p className="text-xs text-zinc-300 font-medium">
                  {selectedShot.scene.title}
                </p>
                {selectedShot.scene.location && (
                  <p className="text-[10px] text-zinc-500">
                    {selectedShot.scene.location}
                  </p>
                )}
              </div>
            </div>

            {/* Attached Skills */}
            {selectedShot.shot.skills.length > 0 && (
              <div>
                <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">
                  Attached Skills
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedShot.shot.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded bg-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-400 font-mono"
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
                handleSubmitRender(
                  selectedShot.scene.id,
                  selectedShot.shot.id
                )
              }
              disabled={submitting || !renderPrompt.trim()}
              className="w-full rounded-md bg-zinc-100 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-white disabled:opacity-40"
            >
              {submitting ? "Submitting..." : `Render with ${renderProvider}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="studio-panel p-3">
      <p className="text-[10px] text-zinc-600 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-xl font-bold text-zinc-100 mt-0.5 tabular-nums">
        {value}
      </p>
    </div>
  );
}

function ParamField({
  label,
  value,
  span2,
}: {
  label: string;
  value: string;
  span2?: boolean;
}) {
  return (
    <div className={span2 ? "col-span-2" : ""}>
      <p className="text-[10px] text-zinc-600 mb-0.5">{label}</p>
      <p className="text-xs text-zinc-300 font-mono">{value}</p>
    </div>
  );
}
