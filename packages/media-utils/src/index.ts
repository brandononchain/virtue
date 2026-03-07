export { composeVideos, buildConcatFile, buildFfmpegArgs } from "./compose.js";
export { MockComposer } from "./mock-composer.js";
export { MockExporter } from "./mock-exporter.js";
export {
  mixAudioTracks,
  composeSceneVideoWithAudio,
  buildAudioMixFilter,
} from "./audio.js";
export {
  applyTransitionFilters,
  buildTransitionFilterGraph,
} from "./transitions.js";
export type { ComposeResult, ComposeOptions } from "./compose.js";
export type { AudioTrackInput, MixResult } from "./audio.js";
export type { TransitionSegment, TransitionComposeResult } from "./transitions.js";
