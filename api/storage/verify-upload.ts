import { requireAuth } from "../../src/lib/require-auth";
import { withUserTransaction } from "../../src/lib/db";
import { verifyPrivateImageObject } from "../../src/lib/storage";

export default async function handler(req: any, res: any) {
  const session = await requireAuth(req, res);
  if (!session) return;
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const target = req.body?.target;
  const objectKey = typeof req.body?.objectKey === "string" ? req.body.objectKey : "";
  const productId = typeof req.body?.productId === "string" ? req.body.productId : "";
  const userId = session.user.id;

  if (target !== "avatar" && target !== "product") {
    return res.status(400).json({ error: "Invalid upload target" });
  }
  const prefix = target === "avatar"
    ? `users/${userId}/avatar/`
    : `users/${userId}/products/${productId}/`;
  if (target === "product" && !productId) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  try {
    if (target === "product") {
      const owned = await withUserTransaction(userId, async (db) => {
        const result = await db.query("SELECT id FROM public.products WHERE id = $1", [productId]);
        return Boolean(result.rows[0]);
      });
      if (!owned) return res.status(404).json({ error: "Product not found" });
    }

    const valid = await verifyPrivateImageObject(objectKey, prefix);
    if (!valid) return res.status(400).json({ error: "Uploaded image is missing, invalid or exceeds 5 MB" });
    return res.status(200).json({ verified: true });
  } catch (error) {
    console.error("Storage upload verification error", error);
    return res.status(500).json({ error: "Unable to verify image upload" });
  }
}
