export interface AssetMetadata {
  projectId: string;
  jobId: string;
  shotId: string;
  provider: string;
  mimeType?: string;
  originalUrl?: string;
}

export interface AssetStorage {
  /** Save a video from a remote URL. Downloads and stores locally. Returns local asset ID. */
  saveFromUrl(url: string, metadata: AssetMetadata): Promise<{ assetId: string; localPath: string }>;

  /** Save raw buffer data as an asset. */
  saveBuffer(buffer: Buffer, filename: string, metadata: AssetMetadata): Promise<{ assetId: string; localPath: string }>;

  /** Get the servable URL/path for an asset by its ID. */
  getAssetPath(assetId: string): string | undefined;

  /** Remove an asset from storage. */
  remove(assetId: string): Promise<void>;
}
