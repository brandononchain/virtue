export { createEditorTimeline, createEditorTimelineFromSceneTimeline } from "./timeline.js";
export {
  addTransition,
  removeTransition,
  setDefaultTransitions,
} from "./transitions.js";
export {
  addMusicTrack,
  addVoiceoverTrack,
  addSfxTrack,
  removeAudioTrack,
  updateAudioTrack,
} from "./audio-tracks.js";
export { buildEditorExportPlan } from "./export-plan.js";
export {
  applyPacingPreset,
  trimShot,
  reorderEditorShots,
  recalculateTimings,
} from "./pacing.js";
