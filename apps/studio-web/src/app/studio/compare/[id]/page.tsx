"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  GitCompare,
  ArrowLeft,
  Trophy,
  Play,
  Loader2,
} from "lucide-react";
import type { VirtueRenderJob, VirtueCompareSession } from "@virtue/types";

export default function CompareViewPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const [session, setSession] = useState<VirtueCompareSession | null>(null);
  const [renders, setRenders] = useState<VirtueRenderJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id === "new") {
      // Create new compare session from query params
      const renderIds = searchParams.get("renders")?.split(",").filter(Boolean);
      if (renderIds && renderIds.length >= 2) {
        api
          .createCompareSession({ renderIds })
          .then((s) => {
            setSession(s);
            return Promise.all(renderIds.map((rid) => api.getRender(rid).catch(() => null)));
          })
          .then((results) => {
            setRenders(results.filter(Boolean) as VirtueRenderJob[]);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } else {
      // Load existing session
      api
        .getCompareSession(id)
        .then((s) => {
          setSession(s);
          return Promise.all(s.renderIds.map((rid) => api.getRender(rid).catch(() => null)));
        })
        .then((results) => {
          setRenders(results.filter(Boolean) as VirtueRenderJob[]);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id]);

  async function handleSelectWinner(renderId: string) {
    if (!session) return;
    const updated = await api.selectCompareWinner(session.id, renderId);
    setSession(updated);
  }

  if (loading) {
    return (
      <div className="p-5 sm:p-8 lg:p-10 space-y-8 overflow-y-auto animate-fade-in">
        <div className="flex items-center justify-center gap-2 py-12">
          <Loader2 className="w-4 h-4 text-virtue-text-muted animate-spin" />
          <p className="text-virtue-text-muted text-sm">Loading compare session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-5 sm:p-8 lg:p-10 space-y-8 overflow-y-auto animate-fade-in">
        <div className="glass-panel p-8 text-center">
          <GitCompare className="w-8 h-8 text-virtue-text-muted mx-auto mb-3" />
          <p className="text-virtue-text-muted text-sm">
            Compare session not found. Provide at least 2 render IDs.
          </p>
          <Link href="/renders" className="inline-flex items-center gap-1.5 text-xs text-virtue-accent hover:text-virtue-accent/80 mt-3 transition-colors">
            <ArrowLeft className="w-3 h-3" />
            Back to Renders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-8 lg:p-10 space-y-8 overflow-y-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/renders"
            className="inline-flex items-center gap-1.5 text-xs text-virtue-text-muted hover:text-virtue-text-secondary transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Renders
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <GitCompare className="w-5 h-5 text-virtue-accent" />
            <h1 className="text-xl font-bold tracking-tight text-virtue-text">
              Compare Renders
            </h1>
          </div>
          <p className="text-xs text-virtue-text-muted mt-0.5 font-mono">
            {session.id}
          </p>
        </div>
        {session.winnerId && (
          <div className="rounded bg-emerald-950/30 border border-emerald-800/40 px-3 py-1.5 flex items-center gap-1.5">
            <Trophy className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] text-emerald-500 uppercase tracking-wider font-medium">
              Winner Selected
            </span>
          </div>
        )}
      </div>

      {/* Side-by-side renders */}
      <div className={`grid gap-4 ${renders.length === 2 ? "grid-cols-2" : renders.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {renders.map((render) => {
          const isWinner = session.winnerId === render.id;
          return (
            <div
              key={render.id}
              className={`glass-panel overflow-hidden transition-all ${
                isWinner
                  ? "ring-2 ring-emerald-500/50"
                  : session.winnerId
                    ? "opacity-60"
                    : ""
              }`}
            >
              {/* Video */}
              <div className="aspect-video video-surface relative">
                {render.output?.url ? (
                  <video
                    src={render.output.url}
                    controls
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <Play className="w-5 h-5 text-virtue-text-muted" />
                      <span className={`text-xs uppercase ${
                        render.status === "completed" ? "text-virtue-text-muted" : "text-virtue-text-muted"
                      }`}>
                        {render.status}
                      </span>
                    </div>
                  </div>
                )}
                {isWinner && (
                  <div className="absolute top-2 right-2 rounded bg-emerald-600 px-2 py-0.5 text-[9px] text-white font-medium uppercase tracking-wider flex items-center gap-1">
                    <Trophy className="w-2.5 h-2.5" />
                    Winner
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-[rgba(255,255,255,0.04)] px-2 py-0.5 text-[10px] text-virtue-text-secondary font-mono uppercase">
                    {render.provider}
                  </span>
                  <span className={`text-[10px] uppercase font-medium ${
                    render.status === "completed" ? "text-emerald-500" : "text-virtue-text-muted"
                  }`}>
                    {render.status}
                  </span>
                </div>

                {/* Prompt */}
                <div>
                  <label className="section-label">
                    Prompt
                  </label>
                  <p className="text-[11px] text-virtue-text-secondary leading-relaxed line-clamp-4 mt-1">
                    {render.prompt}
                  </p>
                </div>

                {/* Render ID */}
                <div>
                  <label className="section-label">
                    Render ID
                  </label>
                  <p className="text-[10px] text-virtue-text-muted font-mono mt-1">{render.id}</p>
                </div>

                {/* Select as winner */}
                <button
                  onClick={() => handleSelectWinner(render.id)}
                  disabled={isWinner}
                  className={`w-full rounded-md py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    isWinner
                      ? "bg-emerald-900/30 text-emerald-400 border border-emerald-800/40 cursor-default"
                      : "btn-primary"
                  }`}
                >
                  {isWinner ? (
                    <>
                      <Trophy className="w-3 h-3" />
                      Selected
                    </>
                  ) : (
                    <>
                      <Trophy className="w-3 h-3" />
                      Select as Winner
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
