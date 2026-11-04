import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireAuth } from "../../src/lib/require-auth";
import { withUserTransaction } from "../../src/lib/db";
import { bucketName, storageClient } from "../../src/lib/storage";

export default async function handler(req: any, res: any) {
  const session = await requireAuth(req, res);
  if (!session) return;
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const objectKey = String(req.query?.key ?? "");
  const userId = session.user.id;
  if (!objectKey || objectKey.length > 1024 || !objectKey.startsWith(`users/${userId}/`)) {
    return res.status(404).json({ error: "Image not found" });
  }

  try {
    const owned = await withUserTransaction(userId, async (db) => {
      const result = await db.query(
        `SELECT 1 FROM public.products WHERE image_object_key = $1
         UNION ALL
         SELECT 1 FROM public.smarttrade_profiles WHERE avatar_object_key = $1
         LIMIT 1`,
        [objectKey],
      );
      return Boolean(result.rows[0]);
    });
    if (!owned) return res.status(404).json({ error: "Image not found" });

    const url = await getSignedUrl(
      storageClient,
      new GetObjectCommand({ Bucket: bucketName, Key: objectKey }),
      { expiresIn: 300 },
    );
    return res.status(200).json({ url, expiresIn: 300 });
  } catch (error) {
    console.error("Storage download URL error", error);
    return res.status(500).json({ error: "Unable to retrieve image" });
  }
}
