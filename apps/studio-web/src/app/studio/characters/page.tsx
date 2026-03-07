"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { VirtueProject, VirtueCharacter } from "@virtue/types";

export default function CharactersPage() {
  const [projects, setProjects] = useState<VirtueProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [characters, setCharacters] = useState<VirtueCharacter[]>([]);
  const [editing, setEditing] = useState<VirtueCharacter | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Form state
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
    setName("");
    setDescription("");
    setAppearance("");
    setClothing("");
    setAge("");
    setGender("");
    setEthnicity("");
    setStyleTags("");
  }

  function populateForm(c: VirtueCharacter) {
    setName(c.name);
    setDescription(c.description);
    setAppearance(c.appearance);
    setClothing(c.clothing);
    setAge(c.age);
    setGender(c.gender);
    setEthnicity(c.ethnicity ?? "");
    setStyleTags(c.styleTags?.join(", ") ?? "");
  }

  async function handleCreate() {
    if (!name.trim() || !selectedProject) return;
    const char = await api.createCharacter(selectedProject, {
      name,
      description,
      appearance,
      clothing,
      age,
      gender,
      ethnicity: ethnicity || undefined,
      voiceNotes: "",
      visualReferenceAssets: [],
      styleTags: styleTags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setCharacters((prev) => [...prev, char]);
    resetForm();
    setShowCreate(false);
  }

  async function handleUpdate() {
    if (!editing || !selectedProject) return;
    const updated = await api.updateCharacter(selectedProject, editing.id, {
      name,
      description,
      appearance,
      clothing,
      age,
      gender,
      ethnicity: ethnicity || undefined,
      styleTags: styleTags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setCharacters((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
    resetForm();
    setEditing(null);
  }

  async function handleDelete(id: string) {
    if (!selectedProject) return;
    await api.deleteCharacter(selectedProject, id);
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  }

  const isFormOpen = showCreate || editing !== null;

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Characters
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Define character identities for visual continuity across shots and scenes.
        </p>
      </div>

      {/* Project selector */}
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
          {/* Character list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                {characters.length} Character{characters.length !== 1 ? "s" : ""}
              </h2>
              <button
                onClick={() => {
                  resetForm();
                  setEditing(null);
                  setShowCreate(true);
                }}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                + Add Character
              </button>
            </div>

            {characters.length === 0 && !isFormOpen && (
              <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-12 text-center">
                <p className="text-sm text-zinc-600">No characters defined yet.</p>
              </div>
            )}

            {characters.map((c) => (
              <div
                key={c.id}
                className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-200">{c.name}</p>
                    <div className="flex gap-3 mt-1 flex-wrap">
                      {c.age && (
                        <span className="text-[10px] text-zinc-500">{c.age}</span>
                      )}
                      {c.gender && (
                        <span className="text-[10px] text-zinc-500">{c.gender}</span>
                      )}
                      {c.ethnicity && (
                        <span className="text-[10px] text-zinc-500">{c.ethnicity}</span>
                      )}
                    </div>
                    {c.appearance && (
                      <p className="text-xs text-zinc-400 mt-2">{c.appearance}</p>
                    )}
                    {c.clothing && (
                      <p className="text-xs text-zinc-500 mt-1">Wardrobe: {c.clothing}</p>
                    )}
                    {c.styleTags && c.styleTags.length > 0 && (
                      <div className="flex gap-1.5 mt-2">
                        {c.styleTags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-400 font-mono"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0 ml-4">
                    <button
                      onClick={() => {
                        setEditing(c);
                        populateForm(c);
                        setShowCreate(false);
                      }}
                      className="text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors uppercase tracking-wider"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-[10px] text-zinc-600 hover:text-red-400 transition-colors uppercase tracking-wider"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Create / Edit form */}
          {isFormOpen && (
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-5 space-y-4">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                {editing ? "Edit Character" : "New Character"}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Name" value={name} onChange={setName} placeholder="Character name" />
                <FormField label="Age" value={age} onChange={setAge} placeholder="e.g. mid-40s" />
                <FormField label="Gender" value={gender} onChange={setGender} placeholder="e.g. male, female" />
                <FormField label="Ethnicity" value={ethnicity} onChange={setEthnicity} placeholder="Optional" />
              </div>
              <FormField label="Appearance" value={appearance} onChange={setAppearance} placeholder="Physical description — face, build, hair..." multiline />
              <FormField label="Wardrobe" value={clothing} onChange={setClothing} placeholder="Default clothing and accessories" multiline />
              <FormField label="Description" value={description} onChange={setDescription} placeholder="Character notes, personality, role..." multiline />
              <FormField label="Style Tags" value={styleTags} onChange={setStyleTags} placeholder="Comma-separated: noir, gritty, cyberpunk" />
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

function FormField({
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
          rows={2}
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
