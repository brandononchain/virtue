"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { VirtueSkill } from "@virtue/types";

export default function SkillsPage() {
  const [skills, setSkills] = useState<VirtueSkill[]>([]);
  const [selected, setSelected] = useState<VirtueSkill | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.listSkills().then((loaded) => {
      setSkills(loaded);
      if (loaded.length > 0) setSelected(loaded[0]);
    }).catch(() => {});
  }, []);

  const filtered = search.trim()
    ? skills.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.purpose.toLowerCase().includes(search.toLowerCase())
      )
    : skills;

  return (
    <div className="flex h-full">
      {/* Skill list panel */}
      <div className="w-80 border-r border-zinc-800/60 flex flex-col bg-[#080808]">
        <div className="p-4 border-b border-zinc-800/60 space-y-3">
          <div>
            <h1 className="text-lg font-bold text-zinc-100">Skills</h1>
            <p className="text-[10px] text-zinc-600 mt-0.5">
              {skills.length} loaded from /Skills
            </p>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills..."
            className="w-full rounded-md border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {filtered.map((skill) => (
            <button
              key={skill.id}
              onClick={() => setSelected(skill)}
              className={`w-full text-left rounded-md px-3 py-2.5 transition-colors ${
                selected?.id === skill.id
                  ? "bg-zinc-800/60 text-zinc-100"
                  : "text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200"
              }`}
            >
              <span className="text-sm font-medium block">{skill.name}</span>
              <p className="text-[11px] text-zinc-600 mt-0.5 line-clamp-1">
                {skill.purpose}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <div className="flex-1 overflow-y-auto p-8">
        {selected ? (
          <div className="max-w-2xl space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-zinc-100">
                  {selected.name}
                </h2>
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-[9px] text-zinc-500 font-mono">
                  {selected.slug}
                </span>
              </div>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                {selected.purpose}
              </p>
            </div>

            {/* Responsibilities */}
            {selected.responsibilities.length > 0 && (
              <SkillSection title="Responsibilities">
                <ul className="space-y-1.5">
                  {selected.responsibilities.map((r, i) => (
                    <li
                      key={i}
                      className="text-sm text-zinc-400 flex items-start gap-2"
                    >
                      <span className="text-zinc-700 mt-0.5 shrink-0">
                        &bull;
                      </span>
                      {r}
                    </li>
                  ))}
                </ul>
              </SkillSection>
            )}

            {/* Inputs */}
            {selected.inputs.length > 0 && (
              <SkillSection title="Inputs">
                <div className="flex flex-wrap gap-2">
                  {selected.inputs.map((input, i) => (
                    <span
                      key={i}
                      className="rounded border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-300"
                    >
                      {input}
                    </span>
                  ))}
                </div>
              </SkillSection>
            )}

            {/* Outputs */}
            {selected.outputs.length > 0 && (
              <SkillSection title="Outputs">
                <div className="flex flex-wrap gap-2">
                  {selected.outputs.map((output, i) => (
                    <span
                      key={i}
                      className="rounded border border-emerald-900/30 bg-emerald-950/20 px-2.5 py-1 text-xs text-emerald-400/80"
                    >
                      {output}
                    </span>
                  ))}
                </div>
              </SkillSection>
            )}

            {/* Examples */}
            {selected.examples.length > 0 && (
              <SkillSection title="Example">
                <pre className="rounded-md bg-zinc-900/80 border border-zinc-800/60 p-4 text-xs text-zinc-400 whitespace-pre-wrap font-mono leading-relaxed">
                  {selected.examples[0]}
                </pre>
              </SkillSection>
            )}

            {/* Raw source toggle */}
            {selected.raw && <RawSource raw={selected.raw} />}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-zinc-600 text-sm">Select a skill to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SkillSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="studio-panel p-4">
      <h3 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function RawSource({ raw }: { raw: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="text-[10px] text-zinc-600 hover:text-zinc-400 uppercase tracking-wider transition-colors"
      >
        {open ? "Hide" : "Show"} raw markdown
      </button>
      {open && (
        <pre className="mt-2 rounded-md bg-zinc-900/80 border border-zinc-800/60 p-4 text-[11px] text-zinc-500 whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
          {raw}
        </pre>
      )}
    </div>
  );
}
