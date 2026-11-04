import { S3Client } from "@aws-sdk/client-s3";

const isPreview = process.env.VERCEL_ENV === "preview";
const endpoint = isPreview
  ? process.env.SMARTTRADE_PREVIEW_STORAGE_ENDPOINT
  : process.env.AWS_ENDPOINT_URL_S3;
const region = isPreview
  ? process.env.SMARTTRADE_PREVIEW_STORAGE_REGION
  : process.env.AWS_REGION;
const accessKeyId = isPreview
  ? process.env.SMARTTRADE_PREVIEW_STORAGE_ACCESS_KEY_ID
  : process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = isPreview
  ? process.env.SMARTTRADE_PREVIEW_STORAGE_SECRET_ACCESS_KEY
  : process.env.AWS_SECRET_ACCESS_KEY;
export const bucketName = isPreview
  ? process.env.SMARTTRADE_PREVIEW_STORAGE_BUCKET
  : process.env.SMARTTRADE_STORAGE_BUCKET || process.env.NEON_STORAGE_BUCKET;

if (!endpoint || !region || !accessKeyId || !secretAccessKey || !bucketName) {
  throw new Error(isPreview
    ? "Preview storage requires its own bucket and credentials"
    : "Neon object storage environment variables are required");
}

export const storageClient = new S3Client({
  endpoint,
  region,
  forcePathStyle: true,
  credentials: { accessKeyId, secretAccessKey },
});


const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_PRIVATE_IMAGE_BYTES = 5 * 1024 * 1024;

export async function verifyPrivateImageObject(
  objectKey: string,
  expectedPrefix: string,
): Promise<boolean> {
  if (!objectKey || objectKey.length > 1024 || !objectKey.startsWith(expectedPrefix)) {
    return false;
  }

  try {
    const { HeadObjectCommand } = await import("@aws-sdk/client-s3");
    const result = await storageClient.send(new HeadObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    }));
    return Number.isSafeInteger(result.ContentLength) &&
      Number(result.ContentLength) > 0 &&
      Number(result.ContentLength) <= MAX_PRIVATE_IMAGE_BYTES &&
      typeof result.ContentType === "string" &&
      allowedImageTypes.has(result.ContentType);
  } catch {
    return false;
  }
}
