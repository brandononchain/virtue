"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { VirtueSkill } from "@virtue/types";

export default function SkillsPage() {
  const [skills, setSkills] = useState<VirtueSkill[]>([]);
  const [selected, setSelected] = useState<VirtueSkill | null>(null);

  useEffect(() => {
    api.listSkills().then(setSkills).catch(() => {});
  }, []);

  return (
    <div className="flex h-full">
      <div className="w-80 border-r border-zinc-800 overflow-y-auto">
        <div className="p-4 border-b border-zinc-800">
          <h1 className="text-lg font-bold text-zinc-100">Skills</h1>
          <p className="text-xs text-zinc-500 mt-1">
            {skills.length} skills loaded
          </p>
        </div>
        <div className="p-2 space-y-1">
          {skills.map((skill) => (
            <button
              key={skill.id}
              onClick={() => setSelected(skill)}
              className={`w-full text-left rounded-md px-3 py-2.5 text-sm transition-colors ${
                selected?.id === skill.id
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              }`}
            >
              <span className="font-medium">{skill.name}</span>
              <p className="text-xs text-zinc-600 mt-0.5 line-clamp-1">
                {skill.purpose}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {selected ? (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-zinc-100">
                {selected.name}
              </h2>
              <p className="text-sm text-zinc-400 mt-2">{selected.purpose}</p>
            </div>

            {selected.responsibilities.length > 0 && (
              <Section title="Responsibilities">
                <ul className="space-y-1">
                  {selected.responsibilities.map((r, i) => (
                    <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                      <span className="text-zinc-600 mt-0.5">-</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {selected.inputs.length > 0 && (
              <Section title="Inputs">
                <div className="flex flex-wrap gap-2">
                  {selected.inputs.map((input, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-300"
                    >
                      {input}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {selected.outputs.length > 0 && (
              <Section title="Outputs">
                <div className="flex flex-wrap gap-2">
                  {selected.outputs.map((output, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-300"
                    >
                      {output}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {selected.examples.length > 0 && (
              <Section title="Example">
                <pre className="rounded-md bg-zinc-900 border border-zinc-800 p-4 text-xs text-zinc-400 whitespace-pre-wrap font-mono">
                  {selected.examples[0]}
                </pre>
              </Section>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-zinc-600">Select a skill to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="studio-panel p-4">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}
