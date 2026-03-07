import { mkdirSync, existsSync, unlinkSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createId } from "@virtue/validation";
import type { AssetStorage, AssetMetadata } from "./storage.js";

export class LocalAssetStorage implements AssetStorage {
  private basePath: string;
  private pathMap = new Map<string, string>();

  constructor(basePath: string) {
    this.basePath = basePath;
    if (!existsSync(basePath)) {
      mkdirSync(basePath, { recursive: true });
    }
  }

  async saveFromUrl(url: string, metadata: AssetMetadata): Promise<{ assetId: string; localPath: string }> {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to download asset: ${res.status} ${res.statusText}`);
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const ext = this.guessExtension(res.headers.get("content-type") || metadata.mimeType || "video/mp4");
    const filename = `${metadata.jobId}-${metadata.shotId}${ext}`;
    return this.saveBuffer(buffer, filename, metadata);
  }

  async saveBuffer(buffer: Buffer, filename: string, _metadata: AssetMetadata): Promise<{ assetId: string; localPath: string }> {
    const assetId = createId();
    const localPath = join(this.basePath, `${assetId}-${filename}`);
    await writeFile(localPath, buffer);
    this.pathMap.set(assetId, localPath);
    return { assetId, localPath };
  }

  getAssetPath(assetId: string): string | undefined {
    return this.pathMap.get(assetId);
  }

  async remove(assetId: string): Promise<void> {
    const path = this.pathMap.get(assetId);
    if (path && existsSync(path)) {
      unlinkSync(path);
    }
    this.pathMap.delete(assetId);
  }

  private guessExtension(mimeType: string): string {
    if (mimeType.includes("mp4")) return ".mp4";
    if (mimeType.includes("webm")) return ".webm";
    if (mimeType.includes("mov") || mimeType.includes("quicktime")) return ".mov";
    return ".mp4";
  }
}
