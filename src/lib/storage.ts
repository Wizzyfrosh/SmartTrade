import { S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.AWS_ENDPOINT_URL_S3;
const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
export const bucketName = process.env.SMARTTRADE_STORAGE_BUCKET;

if (!endpoint || !region || !accessKeyId || !secretAccessKey || !bucketName) {
  throw new Error("Neon object storage environment variables are required");
}

export const storageClient = new S3Client({
  endpoint,
  region,
  forcePathStyle: true,
  credentials: { accessKeyId, secretAccessKey },
});
