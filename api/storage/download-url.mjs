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

function headersFromRequest(req) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers || {})) {
    if (typeof value === "string") headers.set(key, value);
    else if (Array.isArray(value)) headers.set(key, value.join(", "));
  }
  return headers;
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const session = await auth.api.getSession({ headers: headersFromRequest(req) });
    if (!session?.user?.id) return res.status(401).json({ error: "Authentication required" });

    const url = new URL(req.url || "/", "https://smarttrade-inventotryapp.vercel.app");
    const key = url.searchParams.get("key") || "";
    if (!key.startsWith(`users/${session.user.id}/`) || key.includes("..")) {
      return res.status(403).json({ error: "You cannot access this file" });
    }

    const signedUrl = await getSignedUrl(
      storageClient,
      new GetObjectCommand({ Bucket: storageBucket, Key: key }),
      { expiresIn: 300 },
    );
    return res.status(200).json({ url: signedUrl });
  } catch (error) {
    console.error("Storage download URL error:", error);
    return res.status(500).json({ error: "Unable to create download URL" });
  }
}
