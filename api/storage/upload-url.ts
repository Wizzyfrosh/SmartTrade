import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireAuth } from "../../src/lib/require-auth";
import { withUserTransaction } from "../../src/lib/db";
import { bucketName, storageClient } from "../../src/lib/storage";

const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export default async function handler(req: any, res: any) {
  const session = await requireAuth(req, res);
  if (!session) return;
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const contentType = String(req.body?.contentType ?? "");
  const target = String(req.body?.target ?? "");
  const productId = typeof req.body?.productId === "string" ? req.body.productId : null;
  const extension = allowedTypes[contentType];
  if (!extension) return res.status(400).json({ error: "Only JPEG, PNG and WebP images are supported" });
  if (target !== "avatar" && target !== "product") return res.status(400).json({ error: "Invalid upload target" });
  if (target === "product" && !productId) return res.status(400).json({ error: "Product ID is required" });

  try {
    const userId = session.user.id;
    if (target === "product") {
      const owned = await withUserTransaction(userId, async (db) => {
        const result = await db.query("SELECT id FROM public.products WHERE id = $1", [productId]);
        return Boolean(result.rows[0]);
      });
      if (!owned) return res.status(404).json({ error: "Product not found" });
    }

    const objectKey = target === "avatar"
      ? `users/${userId}/avatar/${randomUUID()}.${extension}`
      : `users/${userId}/products/${productId}/${randomUUID()}.${extension}`;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(storageClient, command, { expiresIn: 300 });
    return res.status(200).json({ uploadUrl, objectKey, expiresIn: 300, contentType });
  } catch (error) {
    console.error("Storage upload URL error", error);
    return res.status(500).json({ error: "Unable to prepare image upload" });
  }
}
