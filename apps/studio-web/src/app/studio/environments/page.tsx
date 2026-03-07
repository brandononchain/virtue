"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { VirtueProject, VirtueEnvironment } from "@virtue/types";

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
    <div className="p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Environments
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Define locations and settings for consistent environments across scenes.
        </p>
      </div>

      <div>
        <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">
          Project
        </label>
        <select
          value={selectedProject}
          onChange={(e) => {
            setSelectedProject(e.target.value);
            setEditing(null);
            setShowCreate(false);
          }}
          className="rounded-md border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-200 focus:border-zinc-600 focus:outline-none w-full max-w-md"
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
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                {environments.length} Environment{environments.length !== 1 ? "s" : ""}
              </h2>
              <button
                onClick={() => {
                  resetForm();
                  setEditing(null);
                  setShowCreate(true);
                }}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                + Add Environment
              </button>
            </div>

            {environments.length === 0 && !isFormOpen && (
              <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-12 text-center">
                <p className="text-sm text-zinc-600">No environments defined yet.</p>
              </div>
            )}

            {environments.map((e) => (
              <div
                key={e.id}
                className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-200">{e.name}</p>
                    <div className="flex gap-3 mt-1 flex-wrap">
                      {e.locationType && (
                        <span className="text-[10px] text-zinc-500">{e.locationType}</span>
                      )}
                      <span className="text-[10px] text-zinc-500">{e.timeOfDay}</span>
                      {e.weather && (
                        <span className="text-[10px] text-zinc-500">{e.weather}</span>
                      )}
                      {e.lightingStyle && (
                        <span className="text-[10px] text-zinc-500">{e.lightingStyle}</span>
                      )}
                    </div>
                    {e.description && (
                      <p className="text-xs text-zinc-400 mt-2">{e.description}</p>
                    )}
                    {e.colorPalette && e.colorPalette.length > 0 && (
                      <div className="flex gap-1.5 mt-2">
                        {e.colorPalette.map((color) => (
                          <span
                            key={color}
                            className="rounded bg-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-400 font-mono"
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
                      className="text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors uppercase tracking-wider"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="text-[10px] text-zinc-600 hover:text-red-400 transition-colors uppercase tracking-wider"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isFormOpen && (
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-5 space-y-4">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
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
                  className="text-sm text-zinc-500 hover:text-zinc-300 px-3 py-1"
                >
                  Cancel
                </button>
                <button
                  onClick={editing ? handleUpdate : handleCreate}
                  disabled={!name.trim()}
                  className="rounded-md bg-zinc-100 px-4 py-1.5 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-40 transition-colors"
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
  const cls =
    "w-full rounded-md border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none";
  return (
    <div>
      <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`${cls} resize-none`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}
