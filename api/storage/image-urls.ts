import type { IncomingMessage, ServerResponse } from "node:http";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type Request = IncomingMessage & { body?: any };
type Response = ServerResponse & { status: (code: number) => Response; json: (value: unknown) => void };

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === "string") headers.set(key, value);
      else if (Array.isArray(value)) headers.set(key, value.join(", "));
    }

    const [{ auth }, storage] = await Promise.all([
      import("../../server/auth.js"),
      import("../../server/storage.js"),
    ]);
    const session = await auth.api.getSession({ headers });
    if (!session?.user?.id) return res.status(401).json({ error: "Authentication required" });

    const keys = req.body?.keys;
    if (!Array.isArray(keys) || keys.length > 100 || keys.some((key) =>
      typeof key !== "string" ||
      !key.startsWith(`users/${session.user.id}/`) ||
      key.includes("..")
    )) {
      return res.status(400).json({ error: "Invalid image keys" });
    }

    const entries = await Promise.all([...new Set(keys)].map(async (key: string) => {
      const url = await getSignedUrl(
        storage.storageClient,
        new GetObjectCommand({ Bucket: storage.storageBucket, Key: key }),
        { expiresIn: 300 },
      );
      return [key, url] as const;
    }));

    return res.status(200).json(Object.fromEntries(entries));
  } catch (error) {
    console.error("Storage bulk download URL error:", error);
    return res.status(500).json({ error: "Unable to create image URLs" });
  }
}
