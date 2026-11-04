import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type Request = IncomingMessage & { body?: any };
type Response = ServerResponse & { status: (code: number) => Response; json: (value: unknown) => void };

const extensions: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
};

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === "string") headers.set(key, value);
      else if (Array.isArray(value)) headers.set(key, value.join(", "));
    }
    const [{ auth }, storage] = await Promise.all([
      import("../../server/auth"),
      import("../../server/storage"),
    ]);
    const session = await auth.api.getSession({ headers });
    if (!session?.user?.id) return res.status(401).json({ error: "Authentication required" });

    const contentType = String(req.body?.contentType || "");
    const size = Number(req.body?.size || 0);
    const purpose = req.body?.purpose === "avatar" ? "avatar" : "product";
    if (!extensions[contentType]) return res.status(400).json({ error: "Unsupported image format" });
    if (!Number.isFinite(size) || size <= 0 || size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: "Image must be smaller than 5 MB" });
    }

    await storage.ensureStorageCors();
    const key = `users/${session.user.id}/${purpose}/${randomUUID()}.${extensions[contentType]}`;
    const command = new PutObjectCommand({ Bucket: storage.storageBucket, Key: key, ContentType: contentType });
    const uploadUrl = await getSignedUrl(storage.storageClient, command, {
      expiresIn: 300,
      signableHeaders: new Set(["content-type"]),
    });
    return res.status(200).json({ uploadUrl, key, contentType });
  } catch (error) {
    console.error("Storage upload URL error:", error);
    return res.status(500).json({ error: "Unable to create upload URL" });
  }
}
