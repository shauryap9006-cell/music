import { S3Client } from "@aws-sdk/client-s3";

const r2Endpoint = process.env.R2_ENDPOINT;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

export const hasR2Env = Boolean(r2Endpoint && r2AccessKeyId && r2SecretAccessKey);

export const r2 = hasR2Env
  ? new S3Client({
      region: "auto",
      endpoint: r2Endpoint!,
      credentials: {
        accessKeyId: r2AccessKeyId!,
        secretAccessKey: r2SecretAccessKey!
      }
    })
  : null;
