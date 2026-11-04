import { S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.AWS_ENDPOINT_URL_S3;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!endpoint || !accessKeyId || !secretAccessKey) {
  throw new Error("Neon Object Storage is not configured");
}

export const storageBucket = process.env.NEON_STORAGE_BUCKET || "smarttrade-private";

export const storageClient = new S3Client({
  region: process.env.AWS_REGION || "eu-central-1",
  endpoint,
  forcePathStyle: true,
  credentials: { accessKeyId, secretAccessKey },
});
