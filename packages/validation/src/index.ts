import { z } from "zod";
import {
  VirtueProjectSchema,
  VirtueSceneSchema,
  VirtueShotSchema,
  VirtueRenderJobSchema,
} from "@virtue/types";

export function validateProject(data: unknown) {
  return VirtueProjectSchema.safeParse(data);
}

export function validateScene(data: unknown) {
  return VirtueSceneSchema.safeParse(data);
}

export function validateShot(data: unknown) {
  return VirtueShotSchema.safeParse(data);
}

export function validateRenderJob(data: unknown) {
  return VirtueRenderJobSchema.safeParse(data);
}

export function createId(): string {
  return crypto.randomUUID();
}

export function nowISO(): string {
  return new Date().toISOString();
}
