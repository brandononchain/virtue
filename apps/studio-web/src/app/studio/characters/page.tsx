"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { VirtueProject, VirtueCharacter } from "@virtue/types";
import { Users, Plus, Pencil, Trash2, User } from "lucide-react";

export default function CharactersPage() {
  const [projects, setProjects] = useState<VirtueProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [characters, setCharacters] = useState<VirtueCharacter[]>([]);
  const [editing, setEditing] = useState<VirtueCharacter | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [appearance, setAppearance] = useState("");
  const [clothing, setClothing] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [ethnicity, setEthnicity] = useState("");
  const [styleTags, setStyleTags] = useState("");

  useEffect(() => {
    api.listProjects().then(setProjects).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedProject) {
      api.listCharacters(selectedProject).then(setCharacters).catch(() => {});
    }
  }, [selectedProject]);

  function resetForm() {
    setName(""); setDescription(""); setAppearance(""); setClothing("");
    setAge(""); setGender(""); setEthnicity(""); setStyleTags("");
  }

  function populateForm(c: VirtueCharacter) {
    setName(c.name); setDescription(c.description); setAppearance(c.appearance);
    setClothing(c.clothing); setAge(c.age); setGender(c.gender);
    setEthnicity(c.ethnicity ?? ""); setStyleTags(c.styleTags?.join(", ") ?? "");
  }

  async function handleCreate() {
    if (!name.trim() || !selectedProject) return;
    const char = await api.createCharacter(selectedProject, {
      name, description, appearance, clothing, age, gender,
      ethnicity: ethnicity || undefined, voiceNotes: "", visualReferenceAssets: [],
      styleTags: styleTags.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setCharacters((prev) => [...prev, char]);
    resetForm(); setShowCreate(false);
  }

  async function handleUpdate() {
    if (!editing || !selectedProject) return;
    const updated = await api.updateCharacter(selectedProject, editing.id, {
      name, description, appearance, clothing, age, gender,
      ethnicity: ethnicity || undefined,
      styleTags: styleTags.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setCharacters((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
    resetForm(); setEditing(null);
  }

  async function handleDelete(id: string) {
    if (!selectedProject) return;
    await api.deleteCharacter(selectedProject, id);
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  }

  const isFormOpen = showCreate || editing !== null;

  return (
    <div className="p-5 sm:p-8 lg:p-10 space-y-8 max-w-4xl animate-fade-in">
      <div>
        <h1 className="text-section font-semibold tracking-tight text-virtue-text">Characters</h1>
        <p className="text-meta text-virtue-text-muted mt-1">
          Define character identities for visual continuity across shots and scenes.
        </p>
      </div>

      {/* Project selector */}
      <div>
        <label className="block section-label mb-2">Project</label>
        <select
          value={selectedProject}
          onChange={(e) => { setSelectedProject(e.target.value); setEditing(null); setShowCreate(false); }}
          className="glass-input w-full max-w-md"
        >
          <option value="">Select a project...</option>
          {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
        </select>
      </div>

      {selectedProject && (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="section-label">{characters.length} Character{characters.length !== 1 ? "s" : ""}</h2>
              <button
                onClick={() => { resetForm(); setEditing(null); setShowCreate(true); }}
                className="flex items-center gap-1.5 text-[12px] text-virtue-text-muted hover:text-virtue-accent transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Character
              </button>
            </div>

            {characters.length === 0 && !isFormOpen && (
              <div className="glass-panel p-12 text-center">
                <User className="w-8 h-8 text-virtue-text-muted/30 mx-auto mb-3" strokeWidth={1} />
                <p className="text-sm text-virtue-text-muted">No characters defined yet.</p>
              </div>
            )}

            {characters.map((c) => (
              <div key={c.id} className="glass-card p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center">
                        <Users className="w-3.5 h-3.5 text-virtue-accent" strokeWidth={1.5} />
                      </div>
                      <p className="text-[14px] font-medium text-virtue-text">{c.name}</p>
                    </div>
                    <div className="flex gap-3 mt-1 flex-wrap">
                      {c.age && <span className="text-[11px] text-virtue-text-muted">{c.age}</span>}
                      {c.gender && <span className="text-[11px] text-virtue-text-muted">{c.gender}</span>}
                      {c.ethnicity && <span className="text-[11px] text-virtue-text-muted">{c.ethnicity}</span>}
                    </div>
                    {c.appearance && <p className="text-[13px] text-virtue-text-secondary mt-2">{c.appearance}</p>}
                    {c.clothing && <p className="text-[12px] text-virtue-text-muted mt-1">Wardrobe: {c.clothing}</p>}
                    {c.styleTags && c.styleTags.length > 0 && (
                      <div className="flex gap-1.5 mt-2">
                        {c.styleTags.map((tag) => (
                          <span key={tag} className="rounded-md bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] px-2 py-0.5 text-[10px] text-virtue-text-muted font-mono">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0 ml-4">
                    <button onClick={() => { setEditing(c); populateForm(c); setShowCreate(false); }} className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.04)] text-virtue-text-muted hover:text-virtue-text transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-red-500/5 text-virtue-text-muted hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isFormOpen && (
            <div className="glass-panel p-6 space-y-4">
              <h3 className="section-label">{editing ? "Edit Character" : "New Character"}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Name" value={name} onChange={setName} placeholder="Character name" />
                <FormField label="Age" value={age} onChange={setAge} placeholder="e.g. mid-40s" />
                <FormField label="Gender" value={gender} onChange={setGender} placeholder="e.g. male, female" />
                <FormField label="Ethnicity" value={ethnicity} onChange={setEthnicity} placeholder="Optional" />
              </div>
              <FormField label="Appearance" value={appearance} onChange={setAppearance} placeholder="Physical description — face, build, hair..." multiline />
              <FormField label="Wardrobe" value={clothing} onChange={setClothing} placeholder="Default clothing and accessories" multiline />
              <FormField label="Description" value={description} onChange={setDescription} placeholder="Character notes, personality, role..." multiline />
              <FormField label="Style Tags" value={styleTags} onChange={setStyleTags} placeholder="Comma-separated: noir, gritty, cyberpunk" />
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => { setShowCreate(false); setEditing(null); resetForm(); }} className="btn-secondary px-4 py-2 text-[13px]">Cancel</button>
                <button onClick={editing ? handleUpdate : handleCreate} disabled={!name.trim()} className="btn-primary px-5 py-2 text-[13px]">
                  {editing ? "Save Changes" : "Create Character"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, multiline }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean;
}) {
  return (
    <div>
      <label className="block section-label mb-1.5">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={2} className="glass-input w-full resize-none" />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="glass-input w-full" />
      )}
    </div>
  );
}
