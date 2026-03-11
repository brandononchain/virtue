"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { VirtueProject, VirtueProp } from "@virtue/types";
import { Box, Plus, Pencil, Trash2, Wrench } from "lucide-react";

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
    <div className="p-5 sm:p-8 lg:p-10 space-y-8 max-w-4xl animate-fade-in">
      <div>
        <h1 className="text-section font-semibold tracking-tight text-virtue-text">Props</h1>
        <p className="text-sm text-virtue-text-muted mt-1">
          Define props for consistent visual appearance across shots.
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
                {props.length} Prop{props.length !== 1 ? "s" : ""}
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
                Add Prop
              </button>
            </div>

            {props.length === 0 && !isFormOpen && (
              <div className="glass-panel p-12 text-center">
                <Box className="w-8 h-8 text-virtue-text-muted mx-auto mb-3" />
                <p className="text-sm text-virtue-text-muted">No props defined yet.</p>
              </div>
            )}

            {props.map((p) => (
              <div
                key={p.id}
                className="glass-card p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Box className="w-4 h-4 text-virtue-text-secondary shrink-0" />
                      <p className="text-sm font-medium text-virtue-text">{p.name}</p>
                    </div>
                    <div className="flex gap-3 mt-1.5 flex-wrap ml-6">
                      {p.material && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-virtue-text-muted">
                          <Wrench className="w-3 h-3" />
                          {p.material}
                        </span>
                      )}
                      {p.condition && (
                        <span className="text-[10px] text-virtue-text-muted">{p.condition}</span>
                      )}
                    </div>
                    {p.description && (
                      <p className="text-xs text-virtue-text-secondary mt-2 ml-6">{p.description}</p>
                    )}
                    {p.usageNotes && (
                      <p className="text-xs text-virtue-text-muted mt-1 ml-6">Usage: {p.usageNotes}</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0 ml-4">
                    <button
                      onClick={() => {
                        setEditing(p);
                        populateForm(p);
                        setShowCreate(false);
                      }}
                      className="text-virtue-text-muted hover:text-virtue-text transition-colors p-1"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
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
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={editing ? handleUpdate : handleCreate}
                  disabled={!name.trim()}
                  className="btn-primary"
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
