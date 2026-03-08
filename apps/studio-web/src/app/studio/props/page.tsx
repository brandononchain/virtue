"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { VirtueProject, VirtueProp } from "@virtue/types";

export default function PropsPage() {
  const [projects, setProjects] = useState<VirtueProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [props, setProps] = useState<VirtueProp[]>([]);
  const [editing, setEditing] = useState<VirtueProp | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [material, setMaterial] = useState("");
  const [condition, setCondition] = useState("");
  const [usageNotes, setUsageNotes] = useState("");

  useEffect(() => {
    api.listProjects().then(setProjects).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedProject) {
      api.listProps(selectedProject).then(setProps).catch(() => {});
    }
  }, [selectedProject]);

  function resetForm() {
    setName("");
    setDescription("");
    setMaterial("");
    setCondition("");
    setUsageNotes("");
  }

  function populateForm(p: VirtueProp) {
    setName(p.name);
    setDescription(p.description);
    setMaterial(p.material);
    setCondition(p.condition);
    setUsageNotes(p.usageNotes);
  }

  async function handleCreate() {
    if (!name.trim() || !selectedProject) return;
    const prop = await api.createProp(selectedProject, {
      name,
      description,
      material,
      condition,
      usageNotes,
      visualReferenceAssets: [],
    });
    setProps((prev) => [...prev, prop]);
    resetForm();
    setShowCreate(false);
  }

  async function handleUpdate() {
    if (!editing || !selectedProject) return;
    const updated = await api.updateProp(selectedProject, editing.id, {
      name,
      description,
      material,
      condition,
      usageNotes,
    });
    setProps((prev) => prev.map((p) => (p.id === editing.id ? updated : p)));
    resetForm();
    setEditing(null);
  }

  async function handleDelete(id: string) {
    if (!selectedProject) return;
    await api.deleteProp(selectedProject, id);
    setProps((prev) => prev.filter((p) => p.id !== id));
  }

  const isFormOpen = showCreate || editing !== null;

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Props</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Define props for consistent visual appearance across shots.
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
                {props.length} Prop{props.length !== 1 ? "s" : ""}
              </h2>
              <button
                onClick={() => {
                  resetForm();
                  setEditing(null);
                  setShowCreate(true);
                }}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                + Add Prop
              </button>
            </div>

            {props.length === 0 && !isFormOpen && (
              <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-12 text-center">
                <p className="text-sm text-zinc-600">No props defined yet.</p>
              </div>
            )}

            {props.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-200">{p.name}</p>
                    <div className="flex gap-3 mt-1 flex-wrap">
                      {p.material && (
                        <span className="text-[10px] text-zinc-500">{p.material}</span>
                      )}
                      {p.condition && (
                        <span className="text-[10px] text-zinc-500">{p.condition}</span>
                      )}
                    </div>
                    {p.description && (
                      <p className="text-xs text-zinc-400 mt-2">{p.description}</p>
                    )}
                    {p.usageNotes && (
                      <p className="text-xs text-zinc-500 mt-1">Usage: {p.usageNotes}</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0 ml-4">
                    <button
                      onClick={() => {
                        setEditing(p);
                        populateForm(p);
                        setShowCreate(false);
                      }}
                      className="text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors uppercase tracking-wider"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
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
                {editing ? "Edit Prop" : "New Prop"}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Name" value={name} onChange={setName} placeholder="Prop name" />
                <Field label="Material" value={material} onChange={setMaterial} placeholder="e.g. steel, leather, glass" />
                <Field label="Condition" value={condition} onChange={setCondition} placeholder="e.g. worn, pristine, damaged" />
                <Field label="Usage Notes" value={usageNotes} onChange={setUsageNotes} placeholder="How and when it appears" />
              </div>
              <Field label="Description" value={description} onChange={setDescription} placeholder="Detailed description..." multiline />
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
                  {editing ? "Save Changes" : "Create Prop"}
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
