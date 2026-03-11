"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { VirtueProject, VirtueEnvironment } from "@virtue/types";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Sun,
  Cloud,
  Lightbulb,
  Palette,
} from "lucide-react";

export default function EnvironmentsPage() {
  const [projects, setProjects] = useState<VirtueProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [environments, setEnvironments] = useState<VirtueEnvironment[]>([]);
  const [editing, setEditing] = useState<VirtueEnvironment | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [locationType, setLocationType] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("day");
  const [weather, setWeather] = useState("");
  const [lightingStyle, setLightingStyle] = useState("");
  const [colorPalette, setColorPalette] = useState("");

  useEffect(() => {
    api.listProjects().then(setProjects).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedProject) {
      api.listEnvironments(selectedProject).then(setEnvironments).catch(() => {});
    }
  }, [selectedProject]);

  function resetForm() {
    setName("");
    setDescription("");
    setLocationType("");
    setTimeOfDay("day");
    setWeather("");
    setLightingStyle("");
    setColorPalette("");
  }

  function populateForm(e: VirtueEnvironment) {
    setName(e.name);
    setDescription(e.description);
    setLocationType(e.locationType);
    setTimeOfDay(e.timeOfDay);
    setWeather(e.weather);
    setLightingStyle(e.lightingStyle);
    setColorPalette(e.colorPalette?.join(", ") ?? "");
  }

  async function handleCreate() {
    if (!name.trim() || !selectedProject) return;
    const env = await api.createEnvironment(selectedProject, {
      name,
      description,
      locationType,
      timeOfDay,
      weather,
      lightingStyle,
      colorPalette: colorPalette
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      visualReferenceAssets: [],
    });
    setEnvironments((prev) => [...prev, env]);
    resetForm();
    setShowCreate(false);
  }

  async function handleUpdate() {
    if (!editing || !selectedProject) return;
    const updated = await api.updateEnvironment(selectedProject, editing.id, {
      name,
      description,
      locationType,
      timeOfDay,
      weather,
      lightingStyle,
      colorPalette: colorPalette
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setEnvironments((prev) => prev.map((e) => (e.id === editing.id ? updated : e)));
    resetForm();
    setEditing(null);
  }

  async function handleDelete(id: string) {
    if (!selectedProject) return;
    await api.deleteEnvironment(selectedProject, id);
    setEnvironments((prev) => prev.filter((e) => e.id !== id));
  }

  const isFormOpen = showCreate || editing !== null;

  return (
    <div className="p-5 sm:p-8 lg:p-10 space-y-8 max-w-4xl animate-fade-in">
      <div>
        <h1 className="text-section font-semibold tracking-tight text-virtue-text">
          Environments
        </h1>
        <p className="text-sm text-virtue-text-muted mt-1">
          Define locations and settings for consistent environments across scenes.
        </p>
      </div>

      <div>
        <label className="section-label mb-1.5">
          Project
        </label>
        <select
          value={selectedProject}
          onChange={(e) => {
            setSelectedProject(e.target.value);
            setEditing(null);
            setShowCreate(false);
          }}
          className="glass-input w-full max-w-md"
        >
          <option value="">Select a project...</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {selectedProject && (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="section-label">
                {environments.length} Environment{environments.length !== 1 ? "s" : ""}
              </h2>
              <button
                onClick={() => {
                  resetForm();
                  setEditing(null);
                  setShowCreate(true);
                }}
                className="btn-secondary inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Environment
              </button>
            </div>

            {environments.length === 0 && !isFormOpen && (
              <div className="glass-panel p-12 text-center">
                <MapPin className="w-8 h-8 text-virtue-text-muted mx-auto mb-3" />
                <p className="text-sm text-virtue-text-muted">No environments defined yet.</p>
              </div>
            )}

            {environments.map((e) => (
              <div
                key={e.id}
                className="glass-card p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-virtue-text-secondary shrink-0" />
                      <p className="text-sm font-medium text-virtue-text">{e.name}</p>
                    </div>
                    <div className="flex gap-3 mt-1.5 flex-wrap ml-6">
                      {e.locationType && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-virtue-text-muted">
                          <MapPin className="w-3 h-3" />
                          {e.locationType}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[10px] text-virtue-text-muted">
                        <Sun className="w-3 h-3" />
                        {e.timeOfDay}
                      </span>
                      {e.weather && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-virtue-text-muted">
                          <Cloud className="w-3 h-3" />
                          {e.weather}
                        </span>
                      )}
                      {e.lightingStyle && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-virtue-text-muted">
                          <Lightbulb className="w-3 h-3" />
                          {e.lightingStyle}
                        </span>
                      )}
                    </div>
                    {e.description && (
                      <p className="text-xs text-virtue-text-secondary mt-2 ml-6">{e.description}</p>
                    )}
                    {e.colorPalette && e.colorPalette.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 ml-6">
                        <Palette className="w-3 h-3 text-virtue-text-muted shrink-0" />
                        {e.colorPalette.map((color) => (
                          <span
                            key={color}
                            className="rounded bg-[rgba(255,255,255,0.04)] px-2 py-0.5 text-[10px] text-virtue-text-secondary font-mono"
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0 ml-4">
                    <button
                      onClick={() => {
                        setEditing(e);
                        populateForm(e);
                        setShowCreate(false);
                      }}
                      className="text-virtue-text-muted hover:text-virtue-text transition-colors p-1"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="text-virtue-text-muted hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isFormOpen && (
            <div className="glass-panel p-5 space-y-4">
              <h3 className="section-label">
                {editing ? "Edit Environment" : "New Environment"}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Name" value={name} onChange={setName} placeholder="Environment name" />
                <Field label="Location Type" value={locationType} onChange={setLocationType} placeholder="e.g. interior, exterior, urban" />
                <Field label="Time of Day" value={timeOfDay} onChange={setTimeOfDay} placeholder="e.g. day, night, dusk" />
                <Field label="Weather" value={weather} onChange={setWeather} placeholder="e.g. rainy, clear, foggy" />
                <Field label="Lighting Style" value={lightingStyle} onChange={setLightingStyle} placeholder="e.g. neon, moonlight, harsh" />
                <Field label="Color Palette" value={colorPalette} onChange={setColorPalette} placeholder="Comma-separated: cyan, magenta, black" />
              </div>
              <Field label="Description" value={description} onChange={setDescription} placeholder="Detailed environment description..." multiline />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowCreate(false);
                    setEditing(null);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={editing ? handleUpdate : handleCreate}
                  disabled={!name.trim()}
                  className="btn-primary"
                >
                  {editing ? "Save Changes" : "Create Environment"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="section-label mb-1">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="glass-input w-full resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="glass-input w-full"
        />
      )}
    </div>
  );
}
