import { create } from "zustand";
import type { VirtueProject, VirtueSkill, VirtueRenderJob } from "@virtue/types";

interface StudioState {
  projects: VirtueProject[];
  currentProject: VirtueProject | null;
  skills: VirtueSkill[];
  renderJobs: VirtueRenderJob[];
  sidebarOpen: boolean;

  setProjects: (projects: VirtueProject[]) => void;
  setCurrentProject: (project: VirtueProject | null) => void;
  setSkills: (skills: VirtueSkill[]) => void;
  setRenderJobs: (jobs: VirtueRenderJob[]) => void;
  toggleSidebar: () => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  projects: [],
  currentProject: null,
  skills: [],
  renderJobs: [],
  sidebarOpen: true,

  setProjects: (projects) => set({ projects }),
  setCurrentProject: (currentProject) => set({ currentProject }),
  setSkills: (skills) => set({ skills }),
  setRenderJobs: (renderJobs) => set({ renderJobs }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
