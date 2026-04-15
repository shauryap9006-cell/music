import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

const allowedContentTypes = ['audio/mpeg', 'audio/flac', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/mp4'];
const allowedPathPrefix = "library/";

function isSafeUploadPath(pathname: string) {
  return (
    pathname.startsWith(allowedPathPrefix) &&
    pathname.length <= 220 &&
    !pathname.includes("..") &&
    !pathname.includes("\\")
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "invalid JSON payload" }, { status: 400 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!isSafeUploadPath(pathname)) {
          throw new Error("Invalid upload pathname.");
        }
        return {
          allowedContentTypes,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // We intentionally do not process the upload here because this webhook
        // cannot reach localhost during local development. 
        // Instead, the client waits for the upload to complete and then POSTs
        // the final blob.url to our /api/upload processing endpoint.
        console.log("Vercel Blob Client Upload completed:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 } // The webhook will retry 5 times waiting for a 200
    );
  }
}
