import { PutObjectCommand } from "@aws-sdk/client-s3";

import { hasR2Env, r2 } from "@/backend/r2/client";

export async function uploadToR2(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
  if (!hasR2Env || !r2 || !process.env.R2_BUCKET_NAME || !process.env.R2_PUBLIC_URL) {
    throw new Error(
      "Cloudflare R2 is not configured. Add R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_URL."
    );
  }

  const key = `songs/${Date.now()}-${filename.replace(/\s+/g, "-")}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: mimeType
    })
  );

  return `${process.env.R2_PUBLIC_URL}/${key}`;
}
