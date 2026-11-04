import { S3Client } from "@aws-sdk/client-s3";

const isPreview = process.env.VERCEL_ENV === "preview";
const endpoint = process.env.AWS_ENDPOINT_URL_S3;
const region = process.env.AWS_REGION;
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
