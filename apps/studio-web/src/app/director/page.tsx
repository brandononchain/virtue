"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { DirectorOutput, DirectorScenePlan, DirectorShotPlan } from "@virtue/types";

const EXAMPLE_SCREENPLAY = `INT. ABANDONED OBSERVATORY - NIGHT

The dome is open to the sky. Moonlight floods across a cracked telescope. ELENA, 30s, stands at the edge of the observation platform, looking up.

ELENA
(whispered)
It's still broadcasting. After all these years.

She adjusts a frequency dial. Static fills the room, then resolves into a rhythmic pulse.

ELENA
(stunned)
That's not random. That's a signal.

The pulse intensifies. The lights in the observatory flicker. Elena steps back.

EXT. OBSERVATORY HILLTOP - NIGHT

Elena bursts through the doors onto the windswept hillside. Below, the city lights flicker in sync with the pulse. She looks up — a faint geometric pattern appears in the clouds, growing brighter.

ELENA
(into radio)
Control, this is Reyes at Station Nine. We have contact.`;

const EXAMPLE_CONCEPT = `A lone astronaut discovers a flooded cathedral on a dead planet. Bioluminescent creatures drift through the submerged nave. The astronaut's helmet light reveals frescoes on the ceiling that depict the exact mission they are on. As they swim deeper, they find a sealed door with their own name carved into it — in handwriting they recognize as their own.`;

type DirectorTab = "input" | "output";

export default function DirectorPage() {
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [mode, setMode] = useState<"screenplay" | "concept">("concept");
  const [projectName, setProjectName] = useState("");
  const [plan, setPlan] = useState<DirectorOutput | null>(null);
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [expandedScene, setExpandedScene] = useState<number | null>(null);
  const [mobileTab, setMobileTab] = useState<DirectorTab>("input");

  async function handleGenerate() {
    if (!inputText.trim()) return;
    setGenerating(true);
    setError("");
    setPlan(null);
    try {
      const result = await api.generatePlan(inputText, mode, projectName || undefined);
      setPlan(result);
      setExpandedScene(0);
      setMobileTab("output");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Planning failed");
    } finally {
      setGenerating(false);
    }
  }

  async function handleCreateProject() {
    if (!plan) return;
    setCreating(true);
    try {
      const project = await api.createProjectFromPlan(plan.id);
      router.push(`/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
      setCreating(false);
    }
  }

  function loadExample(type: "screenplay" | "concept") {
    setMode(type);
    setInputText(type === "screenplay" ? EXAMPLE_SCREENPLAY : EXAMPLE_CONCEPT);
    setProjectName("");
    setPlan(null);
    setMobileTab("input");
  }

  const inputPanel = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 sm:px-5 py-4 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <h1 className="text-[15px] sm:text-sm font-semibold text-zinc-200">Director</h1>
          <span className="rounded bg-zinc-800 px-2 py-0.5 text-[9px] text-zinc-500 font-mono uppercase hidden sm:inline">
            Script-to-Shot
          </span>
        </div>
        <p className="text-[12px] sm:text-[11px] text-zinc-600 mt-1">
          Paste a screenplay or concept to generate a cinematic shot plan.
        </p>
      </div>

      {/* Mode selector */}
      <div className="px-4 sm:px-5 py-3 border-b border-zinc-800/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] text-zinc-600 uppercase tracking-wider mr-1 shrink-0">Mode</span>
        <button
          onClick={() => setMode("screenplay")}
          className={`rounded px-3 py-1.5 sm:py-1 text-[12px] sm:text-[11px] font-medium transition-colors shrink-0 touch-manipulation ${
            mode === "screenplay" ? "bg-zinc-700 text-zinc-200" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Screenplay
        </button>
        <button
          onClick={() => setMode("concept")}
          className={`rounded px-3 py-1.5 sm:py-1 text-[12px] sm:text-[11px] font-medium transition-colors shrink-0 touch-manipulation ${
            mode === "concept" ? "bg-zinc-700 text-zinc-200" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Concept
        </button>
        <div className="flex-1" />
        <button onClick={() => loadExample("screenplay")} className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors shrink-0 touch-manipulation min-h-[36px]">
          Example Script
        </button>
        <button onClick={() => loadExample("concept")} className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors shrink-0 touch-manipulation min-h-[36px]">
          Example Concept
        </button>
      </div>

      {/* Project name */}
      <div className="px-4 sm:px-5 py-3 border-b border-zinc-800/40">
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project name (auto-generated if blank)"
          className="w-full rounded border border-zinc-800 bg-zinc-900/60 px-3 py-2.5 sm:py-1.5 text-[14px] sm:text-xs text-zinc-300 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
        />
      </div>

      {/* Text input */}
      <div className="flex-1 p-4 sm:p-5 min-h-0">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            mode === "screenplay"
              ? "INT. LOCATION - TIME\n\nPaste your screenplay here..."
              : "Describe your story, scene, or visual concept..."
          }
          className="w-full h-full rounded-md border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-[14px] sm:text-[13px] text-zinc-300 placeholder-zinc-700 focus:border-zinc-600 focus:outline-none resize-none font-mono leading-relaxed"
        />
      </div>

      {/* Generate button */}
      <div className="px-4 sm:px-5 py-4 border-t border-zinc-800/60 space-y-2">
        {error && <p className="text-[13px] sm:text-xs text-red-400">{error}</p>}
        <button
          onClick={handleGenerate}
          disabled={!inputText.trim() || generating}
          className="w-full rounded-md bg-zinc-100 py-3 sm:py-2.5 text-[15px] sm:text-sm font-medium text-zinc-900 transition-colors hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] touch-manipulation"
        >
          {generating ? "Generating Plan..." : "Generate Plan"}
        </button>
      </div>
    </div>
  );

  const outputPanel = (
    <div className="flex-1 overflow-y-auto">
      {!plan && !generating && (
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center max-w-sm">
            <div className="w-12 h-12 rounded-lg bg-zinc-800/60 mx-auto flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-zinc-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-2.625 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
              </svg>
            </div>
            <p className="text-[14px] sm:text-sm text-zinc-500">Paste a screenplay or concept to begin.</p>
            <p className="text-[12px] sm:text-[11px] text-zinc-700 mt-1">
              The Director Engine will generate scenes, shots, camera plans, and render-ready prompts.
            </p>
          </div>
        </div>
      )}

      {generating && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="h-8 w-8 rounded-full border-2 border-zinc-700 border-t-zinc-300 animate-spin mx-auto mb-3" />
            <p className="text-[14px] sm:text-sm text-zinc-400">Analyzing script...</p>
          </div>
        </div>
      )}

      {plan && (
        <div className="flex flex-col h-full">
          <div className="px-4 sm:px-6 py-4 border-b border-zinc-800/60 bg-[#080808] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-[14px] sm:text-sm font-semibold text-zinc-200 truncate">{plan.projectName}</h2>
              <p className="text-[11px] text-zinc-600 mt-0.5">
                {plan.scenes.length} scene{plan.scenes.length !== 1 ? "s" : ""} · {plan.totalShots} shots · {plan.estimatedDuration}s
              </p>
            </div>
            <button
              onClick={handleCreateProject}
              disabled={creating}
              className="rounded-md bg-emerald-600 px-4 py-2.5 sm:py-2 text-[14px] sm:text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-40 shrink-0 active:scale-[0.98] touch-manipulation"
            >
              {creating ? "Creating..." : "Create Project"}
            </button>
          </div>

          {plan.synopsis && (
            <div className="px-4 sm:px-6 py-3 border-b border-zinc-800/40 bg-[#0a0a0a]">
              <p className="text-[12px] sm:text-[11px] text-zinc-500 leading-relaxed">{plan.synopsis}</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-2">
            {plan.scenes.map((scene, i) => (
              <SceneCard key={i} scene={scene} expanded={expandedScene === i} onToggle={() => setExpandedScene(expandedScene === i ? null : i)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Mobile tab switcher */}
      <div className="flex border-b border-zinc-800/60 lg:hidden bg-[#080808]">
        <button
          onClick={() => setMobileTab("input")}
          className={`flex-1 py-3 text-[12px] uppercase tracking-wider font-medium transition-colors touch-manipulation ${
            mobileTab === "input" ? "text-zinc-100 border-b-2 border-zinc-100" : "text-zinc-600"
          }`}
        >
          Script Input
        </button>
        <button
          onClick={() => setMobileTab("output")}
          className={`flex-1 py-3 text-[12px] uppercase tracking-wider font-medium transition-colors touch-manipulation ${
            mobileTab === "output" ? "text-zinc-100 border-b-2 border-zinc-100" : "text-zinc-600"
          }`}
        >
          Shot Plan {plan ? `(${plan.totalShots})` : ""}
        </button>
      </div>

      {/* Left panel — Input (desktop always, mobile conditional) */}
      <div className={`lg:w-[480px] lg:shrink-0 lg:border-r border-zinc-800/60 bg-[#080808] flex flex-col ${
        mobileTab !== "input" ? "hidden lg:flex" : "flex-1 lg:flex-initial"
      }`}>
        {inputPanel}
      </div>

      {/* Right panel — Output (desktop always, mobile conditional) */}
      <div className={`flex-1 ${mobileTab !== "output" ? "hidden lg:flex lg:flex-col" : "flex flex-col"}`}>
        {outputPanel}
      </div>
    </div>
  );
}

function SceneCard({ scene, expanded, onToggle }: { scene: DirectorScenePlan; expanded: boolean; onToggle: () => void }) {
  return (
    <div className="studio-panel">
      <button
        onClick={onToggle}
        className="w-full text-left flex items-center gap-3 px-4 py-3.5 sm:py-3 hover:bg-zinc-900/30 transition-colors touch-manipulation"
      >
        <span className="text-xs text-zinc-600 font-mono w-6 shrink-0">{String(scene.sceneNumber).padStart(2, "0")}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] sm:text-sm font-medium text-zinc-200 truncate">{scene.title}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[11px] sm:text-[10px] text-zinc-600">{scene.location}</span>
            <span className="text-[11px] sm:text-[10px] text-zinc-700">{scene.timeOfDay}</span>
            {scene.mood && <span className="text-[11px] sm:text-[10px] text-zinc-700 hidden sm:inline">{scene.mood}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-zinc-600 tabular-nums">{scene.shots.length} shot{scene.shots.length !== 1 ? "s" : ""}</span>
          <svg viewBox="0 0 16 16" fill="currentColor" className={`w-3 h-3 text-zinc-600 transition-transform ${expanded ? "rotate-180" : ""}`}>
            <path d="M4 6l4 4 4-4" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-zinc-800/40">
          {scene.description && (
            <div className="px-4 py-2 bg-zinc-900/20">
              <p className="text-[12px] sm:text-[11px] text-zinc-500 leading-relaxed">{scene.description}</p>
            </div>
          )}

          {scene.characters.length > 0 && (
            <div className="px-4 py-2 border-t border-zinc-800/20 flex items-center gap-2 flex-wrap">
              <span className="text-[9px] text-zinc-600 uppercase tracking-wider">Characters</span>
              {scene.characters.map((char) => (
                <span key={char} className="rounded bg-zinc-800/60 px-1.5 py-0.5 text-[10px] text-zinc-400">{char}</span>
              ))}
            </div>
          )}

          <div className="divide-y divide-zinc-800/30">
            {scene.shots.map((shot, j) => (
              <ShotCard key={j} shot={shot} index={j} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ShotCard({ shot, index }: { shot: DirectorShotPlan; index: number }) {
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <div className="px-4 py-3.5 sm:py-3 hover:bg-zinc-900/20 transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-[10px] text-zinc-700 font-mono w-5 shrink-0 pt-0.5 tabular-nums">{String(index + 1).padStart(2, "0")}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[8px] text-zinc-500 font-mono uppercase shrink-0">{shot.shotType}</span>
            <span className="text-[13px] sm:text-xs text-zinc-300 truncate">{shot.shotTitle}</span>
          </div>
          <p className="text-[12px] sm:text-[11px] text-zinc-500 leading-relaxed mb-2">{shot.description}</p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
            <MetaTag label="Lens" value={shot.lens} />
            <MetaTag label="Camera" value={shot.cameraMove} />
            <MetaTag label="Duration" value={`${shot.estimatedDuration}s`} />
            <MetaTag label="Lighting" value={shot.lightingIntent} />
          </div>

          <p className="text-[11px] sm:text-[10px] text-zinc-600 italic mb-1.5">{shot.visualIntent}</p>

          {shot.attachedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {shot.attachedSkills.map((skill) => (
                <span key={skill} className="rounded bg-emerald-900/30 border border-emerald-800/30 px-1.5 py-0.5 text-[9px] text-emerald-400 font-mono">
                  {skill.replace("skill-", "")}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="text-[11px] sm:text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors uppercase tracking-wider touch-manipulation min-h-[36px] flex items-center"
          >
            {showPrompt ? "Hide Prompt" : "Show Prompt"}
          </button>

          {showPrompt && (
            <div className="mt-2 rounded border border-zinc-800/60 bg-[#0a0a0a] px-3 py-2">
              <p className="text-[12px] sm:text-[11px] text-zinc-400 font-mono leading-relaxed break-words">{shot.promptSeed}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaTag({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-[11px] sm:text-[10px]">
      <span className="text-zinc-700">{label}: </span>
      <span className="text-zinc-400 font-mono">{value}</span>
    </span>
  );
}
