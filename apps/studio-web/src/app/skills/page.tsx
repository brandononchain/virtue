"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { VirtueSkill } from "@virtue/types";
import {
  Zap,
  Search,
  CheckCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  Code2,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

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
    <div className="animate-fade-in flex h-full">
      {/* Skill list panel */}
      <div className="glass-panel w-80 border-r border-[rgba(255,255,255,0.06)] flex flex-col">
        <div className="p-4 border-b border-[rgba(255,255,255,0.06)] space-y-3">
          <div>
            <h1 className="text-lg font-bold text-virtue-text">Skills</h1>
            <p className="text-[10px] text-virtue-text-muted mt-0.5">
              {skills.length} loaded from /Skills
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-virtue-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skills..."
              className="glass-input w-full pl-8 pr-3 py-1.5 text-xs"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {filtered.map((skill) => (
            <button
              key={skill.id}
              onClick={() => setSelected(skill)}
              className={`w-full text-left rounded-md px-3 py-2.5 transition-colors flex items-start gap-2.5 ${
                selected?.id === skill.id
                  ? "bg-[rgba(255,255,255,0.06)] text-virtue-text"
                  : "text-virtue-text-secondary hover:bg-[rgba(255,255,255,0.03)] hover:text-virtue-text"
              }`}
            >
              <Zap className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                selected?.id === skill.id
                  ? "text-virtue-accent"
                  : "text-virtue-text-muted"
              }`} />
              <div className="min-w-0">
                <span className="text-sm font-medium block">{skill.name}</span>
                <p className="text-[11px] text-virtue-text-muted mt-0.5 line-clamp-1">
                  {skill.purpose}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-8 lg:p-10">
        {selected ? (
          <div className="max-w-2xl space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-virtue-accent" />
                <h2 className="text-xl font-bold text-virtue-text">
                  {selected.name}
                </h2>
                <span className="rounded bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] px-2 py-0.5 text-[9px] text-virtue-text-muted font-mono">
                  {selected.slug}
                </span>
              </div>
              <p className="text-sm text-virtue-text-secondary mt-2 leading-relaxed">
                {selected.purpose}
              </p>
            </div>

            {/* Responsibilities */}
            {selected.responsibilities.length > 0 && (
              <SkillSection title="Responsibilities" icon={<CheckCircle className="w-3 h-3" />}>
                <ul className="space-y-1.5">
                  {selected.responsibilities.map((r, i) => (
                    <li
                      key={i}
                      className="text-sm text-virtue-text-secondary flex items-start gap-2"
                    >
                      <span className="text-virtue-text-muted mt-0.5 shrink-0">
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
              <SkillSection title="Inputs" icon={<ArrowDownCircle className="w-3 h-3" />}>
                <div className="flex flex-wrap gap-2">
                  {selected.inputs.map((input, i) => (
                    <span
                      key={i}
                      className="rounded border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-2.5 py-1 text-xs text-virtue-text-secondary"
                    >
                      {input}
                    </span>
                  ))}
                </div>
              </SkillSection>
            )}

            {/* Outputs */}
            {selected.outputs.length > 0 && (
              <SkillSection title="Outputs" icon={<ArrowUpCircle className="w-3 h-3" />}>
                <div className="flex flex-wrap gap-2">
                  {selected.outputs.map((output, i) => (
                    <span
                      key={i}
                      className="rounded border border-[rgba(76,125,255,0.15)] bg-[rgba(76,125,255,0.06)] px-2.5 py-1 text-xs text-virtue-accent"
                    >
                      {output}
                    </span>
                  ))}
                </div>
              </SkillSection>
            )}

            {/* Examples */}
            {selected.examples.length > 0 && (
              <SkillSection title="Example" icon={<Code2 className="w-3 h-3" />}>
                <pre className="rounded-md bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] p-4 text-xs text-virtue-text-secondary whitespace-pre-wrap font-mono leading-relaxed">
                  {selected.examples[0]}
                </pre>
              </SkillSection>
            )}

            {/* Raw source toggle */}
            {selected.raw && <RawSource raw={selected.raw} />}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-virtue-text-muted text-sm">Select a skill to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SkillSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card p-4">
      <h3 className="section-label flex items-center gap-1.5 mb-3">
        {icon}
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
        className="text-[10px] text-virtue-text-muted hover:text-virtue-text-secondary uppercase tracking-wider transition-colors flex items-center gap-1.5"
      >
        <FileText className="w-3 h-3" />
        {open ? "Hide" : "Show"} raw markdown
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {open && (
        <pre className="mt-2 rounded-md bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] p-4 text-[11px] text-virtue-text-muted whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
          {raw}
        </pre>
      )}
    </div>
  );
}
