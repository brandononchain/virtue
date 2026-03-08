"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
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
      <div className="p-8">
        <p className="text-zinc-500 text-sm">Loading compare session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-8">
        <p className="text-zinc-500 text-sm">
          Compare session not found. Provide at least 2 render IDs.
        </p>
        <Link href="/renders" className="text-xs text-cyan-500 hover:text-cyan-400 mt-2 inline-block">
          Back to Renders
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/renders"
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Renders
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100 mt-1">
            Compare Renders
          </h1>
          <p className="text-xs text-zinc-600 mt-0.5 font-mono">
            {session.id}
          </p>
        </div>
        {session.winnerId && (
          <div className="rounded bg-emerald-950/30 border border-emerald-800/40 px-3 py-1.5">
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
              className={`studio-panel overflow-hidden transition-all ${
                isWinner
                  ? "ring-2 ring-emerald-500/50"
                  : session.winnerId
                    ? "opacity-60"
                    : ""
              }`}
            >
              {/* Video */}
              <div className="aspect-video bg-black relative">
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
                    <span className={`text-xs uppercase ${
                      render.status === "completed" ? "text-zinc-600" : "text-zinc-700"
                    }`}>
                      {render.status}
                    </span>
                  </div>
                )}
                {isWinner && (
                  <div className="absolute top-2 right-2 rounded bg-emerald-600 px-2 py-0.5 text-[9px] text-white font-medium uppercase tracking-wider">
                    Winner
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 font-mono uppercase">
                    {render.provider}
                  </span>
                  <span className={`text-[10px] uppercase font-medium ${
                    render.status === "completed" ? "text-emerald-500" : "text-zinc-600"
                  }`}>
                    {render.status}
                  </span>
                </div>

                {/* Prompt */}
                <div>
                  <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1">
                    Prompt
                  </label>
                  <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-4">
                    {render.prompt}
                  </p>
                </div>

                {/* Render ID */}
                <div>
                  <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1">
                    Render ID
                  </label>
                  <p className="text-[10px] text-zinc-500 font-mono">{render.id}</p>
                </div>

                {/* Select as winner */}
                <button
                  onClick={() => handleSelectWinner(render.id)}
                  disabled={isWinner}
                  className={`w-full rounded-md py-2 text-xs font-medium transition-colors ${
                    isWinner
                      ? "bg-emerald-900/30 text-emerald-400 border border-emerald-800/40 cursor-default"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/40"
                  }`}
                >
                  {isWinner ? "Selected" : "Select as Winner"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
