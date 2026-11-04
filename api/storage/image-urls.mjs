import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "../../server/auth.mjs";
import { storageBucket, storageClient } from "../../server/storage.mjs";

function headersFromRequest(req) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers || {})) {
    if (typeof value === "string") headers.set(key, value);
    else if (Array.isArray(value)) headers.set(key, value.join(", "));
  }
  return headers;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const session = await auth.api.getSession({ headers: headersFromRequest(req) });
    if (!session?.user?.id) return res.status(401).json({ error: "Authentication required" });

    const keys = req.body?.keys;
    if (!Array.isArray(keys) || keys.length > 100 || keys.some((key) =>
      typeof key !== "string" ||
      !key.startsWith(`users/${session.user.id}/`) ||
      key.includes("..")
    )) {
      return res.status(400).json({ error: "Invalid image keys" });
    }

    const entries = await Promise.all([...new Set(keys)].map(async (key) => {
      const url = await getSignedUrl(
        storageClient,
        new GetObjectCommand({ Bucket: storageBucket, Key: key }),
        { expiresIn: 300 },
      );
      return [key, url];
    }));

    return res.status(200).json(Object.fromEntries(entries));
  } catch (error) {
    console.error("Storage bulk download URL error:", error);
    return res.status(500).json({ error: "Unable to create image URLs" });
  }
}
