import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

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
    if (!Number.isSafeInteger(result.ContentLength) ||
        Number(result.ContentLength) <= 0 ||
        Number(result.ContentLength) > MAX_PRIVATE_IMAGE_BYTES ||
        typeof result.ContentType !== "string" ||
        !allowedImageTypes.has(result.ContentType)) return false;

    // Content-Type metadata is supplied by the uploader; verify the actual file signature too.
    const sample = await storageClient.send(new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Range: "bytes=0-11",
    }));
    if (!sample.Body) return false;
    const bytes = await sample.Body.transformToByteArray();
    const isJpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const isPng = bytes.length >= 8 &&
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
      bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
    const isWebp = bytes.length >= 12 &&
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
    return (result.ContentType === "image/jpeg" && isJpeg) ||
      (result.ContentType === "image/png" && isPng) ||
      (result.ContentType === "image/webp" && isWebp);
  } catch {
    return false;
  }
}
