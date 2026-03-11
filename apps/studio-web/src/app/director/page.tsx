"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { DirectorOutput, DirectorScenePlan, DirectorShotPlan } from "@virtue/types";
import {
  Clapperboard,
  Film,
  Lightbulb,
  ChevronDown,
  Sparkles,
  Loader2,
  Camera,
  Clock,
  Sun,
  Focus,
  Eye,
  Code2,
  FolderPlus,
  FileText,
  BookOpen,
  Users,
  MapPin,
  Sunset,
  Palette,
} from "lucide-react";

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
      <div className="px-5 sm:px-6 py-5 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[rgba(76,125,255,0.1)] flex items-center justify-center">
            <Clapperboard className="w-4 h-4 text-virtue-accent" />
          </div>
          <div>
            <h1 className="text-[15px] sm:text-sm font-semibold text-virtue-text">Director</h1>
            <span className="text-[10px] text-virtue-text-muted font-mono uppercase tracking-wider">
              Script-to-Shot
            </span>
          </div>
        </div>
        <p className="text-[12px] sm:text-[11px] text-virtue-text-secondary mt-2.5 leading-relaxed">
          Paste a screenplay or concept to generate a cinematic shot plan.
        </p>
      </div>

      {/* Mode selector */}
      <div className="px-5 sm:px-6 py-3.5 border-b border-[rgba(255,255,255,0.06)] flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="section-label mr-1 shrink-0">Mode</span>
        <button
          onClick={() => setMode("screenplay")}
          className={`rounded-lg px-3.5 py-1.5 sm:py-1.5 text-[12px] sm:text-[11px] font-medium transition-all shrink-0 touch-manipulation flex items-center gap-1.5 ${
            mode === "screenplay"
              ? "bg-[rgba(76,125,255,0.12)] text-virtue-accent border border-[rgba(76,125,255,0.2)]"
              : "text-virtue-text-muted hover:text-virtue-text-secondary border border-transparent"
          }`}
        >
          <FileText className="w-3 h-3" />
          Screenplay
        </button>
        <button
          onClick={() => setMode("concept")}
          className={`rounded-lg px-3.5 py-1.5 sm:py-1.5 text-[12px] sm:text-[11px] font-medium transition-all shrink-0 touch-manipulation flex items-center gap-1.5 ${
            mode === "concept"
              ? "bg-[rgba(76,125,255,0.12)] text-virtue-accent border border-[rgba(76,125,255,0.2)]"
              : "text-virtue-text-muted hover:text-virtue-text-secondary border border-transparent"
          }`}
        >
          <Lightbulb className="w-3 h-3" />
          Concept
        </button>
        <div className="flex-1" />
        <button onClick={() => loadExample("screenplay")} className="text-[10px] text-virtue-text-muted hover:text-virtue-accent transition-colors shrink-0 touch-manipulation min-h-[36px] flex items-center gap-1">
          <BookOpen className="w-3 h-3" />
          Example Script
        </button>
        <button onClick={() => loadExample("concept")} className="text-[10px] text-virtue-text-muted hover:text-virtue-accent transition-colors shrink-0 touch-manipulation min-h-[36px] flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Example Concept
        </button>
      </div>

      {/* Project name */}
      <div className="px-5 sm:px-6 py-3.5 border-b border-[rgba(255,255,255,0.06)]">
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project name (auto-generated if blank)"
          className="glass-input w-full"
        />
      </div>

      {/* Text input */}
      <div className="flex-1 p-5 sm:p-6 min-h-0">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            mode === "screenplay"
              ? "INT. LOCATION - TIME\n\nPaste your screenplay here..."
              : "Describe your story, scene, or visual concept..."
          }
          className="glass-input w-full h-full resize-none font-mono leading-relaxed"
        />
      </div>

      {/* Generate button */}
      <div className="px-5 sm:px-6 py-4 border-t border-[rgba(255,255,255,0.06)] space-y-2">
        {error && <p className="text-[13px] sm:text-xs text-red-400">{error}</p>}
        <button
          onClick={handleGenerate}
          disabled={!inputText.trim() || generating}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Plan...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Plan
            </>
          )}
        </button>
      </div>
    </div>
  );

  const outputPanel = (
    <div className="flex-1 overflow-y-auto">
      {!plan && !generating && (
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 rounded-xl bg-[rgba(76,125,255,0.08)] border border-[rgba(76,125,255,0.12)] mx-auto flex items-center justify-center mb-4">
              <Film className="w-7 h-7 text-virtue-accent/60" />
            </div>
            <p className="text-[14px] sm:text-sm text-virtue-text-secondary">Paste a screenplay or concept to begin.</p>
            <p className="text-[12px] sm:text-[11px] text-virtue-text-muted mt-1.5 leading-relaxed">
              The Director Engine will generate scenes, shots, camera plans, and render-ready prompts.
            </p>
          </div>
        </div>
      )}

      {generating && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-[rgba(76,125,255,0.08)] border border-[rgba(76,125,255,0.12)] mx-auto flex items-center justify-center mb-4">
              <Loader2 className="w-6 h-6 text-virtue-accent animate-spin" />
            </div>
            <p className="text-[14px] sm:text-sm text-virtue-text-secondary">Analyzing script...</p>
            <p className="text-[11px] text-virtue-text-muted mt-1">Breaking down scenes and composing shots</p>
          </div>
        </div>
      )}

      {plan && (
        <div className="flex flex-col h-full">
          <div className="px-5 sm:px-6 py-4 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-[14px] sm:text-sm font-semibold text-virtue-text truncate">{plan.projectName}</h2>
              <p className="text-[11px] text-virtue-text-muted mt-0.5 flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <Film className="w-3 h-3" />
                  {plan.scenes.length} scene{plan.scenes.length !== 1 ? "s" : ""}
                </span>
                <span className="text-virtue-text-muted/40">·</span>
                <span className="flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  {plan.totalShots} shots
                </span>
                <span className="text-virtue-text-muted/40">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {plan.estimatedDuration}s
                </span>
              </p>
            </div>
            <button
              onClick={handleCreateProject}
              disabled={creating}
              className="btn-primary flex items-center gap-2 shrink-0"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FolderPlus className="w-4 h-4" />
                  Create Project
                </>
              )}
            </button>
          </div>

          {plan.synopsis && (
            <div className="px-5 sm:px-6 py-3 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)]">
              <p className="text-[12px] sm:text-[11px] text-virtue-text-secondary leading-relaxed italic">{plan.synopsis}</p>
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
    <div className="flex h-full flex-col lg:flex-row animate-fade-in">
      {/* Mobile tab switcher */}
      <div className="flex border-b border-[rgba(255,255,255,0.06)] lg:hidden bg-[rgba(255,255,255,0.02)]">
        <button
          onClick={() => setMobileTab("input")}
          className={`flex-1 py-3.5 text-[12px] uppercase tracking-wider font-medium transition-colors touch-manipulation flex items-center justify-center gap-1.5 ${
            mobileTab === "input"
              ? "text-virtue-accent border-b-2 border-virtue-accent"
              : "text-virtue-text-muted"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Script Input
        </button>
        <button
          onClick={() => setMobileTab("output")}
          className={`flex-1 py-3.5 text-[12px] uppercase tracking-wider font-medium transition-colors touch-manipulation flex items-center justify-center gap-1.5 ${
            mobileTab === "output"
              ? "text-virtue-accent border-b-2 border-virtue-accent"
              : "text-virtue-text-muted"
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          Shot Plan {plan ? `(${plan.totalShots})` : ""}
        </button>
      </div>

      {/* Left panel -- Input (desktop always, mobile conditional) */}
      <div className={`lg:w-[480px] lg:shrink-0 lg:border-r border-[rgba(255,255,255,0.06)] glass-panel flex flex-col ${
        mobileTab !== "input" ? "hidden lg:flex" : "flex-1 lg:flex-initial"
      }`}>
        {inputPanel}
      </div>

      {/* Right panel -- Output (desktop always, mobile conditional) */}
      <div className={`flex-1 bg-[rgba(255,255,255,0.01)] ${mobileTab !== "output" ? "hidden lg:flex lg:flex-col" : "flex flex-col"}`}>
        {outputPanel}
      </div>
    </div>
  );
}

function SceneCard({ scene, expanded, onToggle }: { scene: DirectorScenePlan; expanded: boolean; onToggle: () => void }) {
  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left flex items-center gap-3 px-4 py-3.5 sm:py-3 hover:bg-[rgba(255,255,255,0.02)] transition-colors touch-manipulation"
      >
        <span className="text-xs text-virtue-accent font-mono w-6 shrink-0 tabular-nums">{String(scene.sceneNumber).padStart(2, "0")}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] sm:text-sm font-medium text-virtue-text truncate">{scene.title}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[11px] sm:text-[10px] text-virtue-text-secondary flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" />
              {scene.location}
            </span>
            <span className="text-[11px] sm:text-[10px] text-virtue-text-muted flex items-center gap-1">
              <Sunset className="w-2.5 h-2.5" />
              {scene.timeOfDay}
            </span>
            {scene.mood && (
              <span className="text-[11px] sm:text-[10px] text-virtue-text-muted hidden sm:flex items-center gap-1">
                <Palette className="w-2.5 h-2.5" />
                {scene.mood}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-virtue-text-muted tabular-nums">{scene.shots.length} shot{scene.shots.length !== 1 ? "s" : ""}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-virtue-text-muted transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[rgba(255,255,255,0.06)]">
          {scene.description && (
            <div className="px-4 py-2.5 bg-[rgba(255,255,255,0.02)]">
              <p className="text-[12px] sm:text-[11px] text-virtue-text-secondary leading-relaxed">{scene.description}</p>
            </div>
          )}

          {scene.characters.length > 0 && (
            <div className="px-4 py-2.5 border-t border-[rgba(255,255,255,0.04)] flex items-center gap-2 flex-wrap">
              <span className="section-label flex items-center gap-1">
                <Users className="w-2.5 h-2.5" />
                Characters
              </span>
              {scene.characters.map((char) => (
                <span key={char} className="rounded-md bg-[rgba(139,124,255,0.1)] border border-[rgba(139,124,255,0.15)] px-2 py-0.5 text-[10px] text-virtue-accent-secondary">
                  {char}
                </span>
              ))}
            </div>
          )}

          <div className="divide-y divide-[rgba(255,255,255,0.04)]">
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
    <div className="px-4 py-3.5 sm:py-3 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-[10px] text-virtue-accent/60 font-mono w-5 shrink-0 pt-0.5 tabular-nums">{String(index + 1).padStart(2, "0")}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="rounded-md bg-[rgba(76,125,255,0.1)] border border-[rgba(76,125,255,0.15)] px-1.5 py-0.5 text-[8px] text-virtue-accent font-mono uppercase shrink-0">
              {shot.shotType}
            </span>
            <span className="text-[13px] sm:text-xs text-virtue-text truncate">{shot.shotTitle}</span>
          </div>
          <p className="text-[12px] sm:text-[11px] text-virtue-text-secondary leading-relaxed mb-2">{shot.description}</p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
            <MetaTag icon={<Focus className="w-2.5 h-2.5" />} label="Lens" value={shot.lens} />
            <MetaTag icon={<Camera className="w-2.5 h-2.5" />} label="Camera" value={shot.cameraMove} />
            <MetaTag icon={<Clock className="w-2.5 h-2.5" />} label="Duration" value={`${shot.estimatedDuration}s`} />
            <MetaTag icon={<Sun className="w-2.5 h-2.5" />} label="Lighting" value={shot.lightingIntent} />
          </div>

          <p className="text-[11px] sm:text-[10px] text-virtue-text-muted italic mb-1.5 flex items-start gap-1.5">
            <Eye className="w-3 h-3 shrink-0 mt-0.5" />
            {shot.visualIntent}
          </p>

          {shot.attachedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {shot.attachedSkills.map((skill) => (
                <span key={skill} className="rounded-md bg-[rgba(139,124,255,0.1)] border border-[rgba(139,124,255,0.15)] px-1.5 py-0.5 text-[9px] text-virtue-accent-secondary font-mono">
                  {skill.replace("skill-", "")}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="text-[11px] sm:text-[10px] text-virtue-text-muted hover:text-virtue-accent transition-colors uppercase tracking-wider touch-manipulation min-h-[36px] flex items-center gap-1.5"
          >
            <Code2 className="w-3 h-3" />
            {showPrompt ? "Hide Prompt" : "Show Prompt"}
          </button>

          {showPrompt && (
            <div className="mt-2 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5">
              <p className="text-[12px] sm:text-[11px] text-virtue-text-secondary font-mono leading-relaxed break-words">{shot.promptSeed}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaTag({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <span className="text-[11px] sm:text-[10px] flex items-center gap-1">
      <span className="text-virtue-text-muted">{icon}</span>
      <span className="text-virtue-text-muted">{label}: </span>
      <span className="text-virtue-text-secondary font-mono">{value}</span>
    </span>
  );
}
