import * as FileSystem from "expo-file-system/legacy";
import { apiFetch } from "../auth/api";

type UploadTarget = "avatar" | "product";
const supported = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function uploadPrivateImage(
  uri: string,
  contentType: string,
  target: UploadTarget,
  productId?: string,
): Promise<string> {
  if (!supported.has(contentType)) throw new Error("Only JPEG, PNG and WebP images are supported");
  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (!fileInfo.exists || !("size" in fileInfo) || typeof fileInfo.size !== "number") {
    throw new Error("Unable to determine image size");
  }
  if (fileInfo.size <= 0 || fileInfo.size > 5 * 1024 * 1024) {
    throw new Error("Image must be 5 MB or smaller");
  }
  if (target === "product" && !productId) throw new Error("Product ID is required");

  const response = await apiFetch("/api/storage/upload-url", {
    method: "POST",
    body: JSON.stringify({ contentType, target, productId, sizeBytes: fileInfo.size }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.uploadUrl || !payload?.objectKey) {
    throw new Error(payload?.error || "Could not prepare image upload");
  }

  const uploaded = await FileSystem.uploadAsync(payload.uploadUrl, uri, {
    httpMethod: "PUT",
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: { "Content-Type": contentType },
  });
  if (uploaded.status < 200 || uploaded.status >= 300) {
    throw new Error("Image upload failed");
  }
  return payload.objectKey as string;
}
