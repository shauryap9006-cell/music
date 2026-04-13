import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: ['audio/mpeg', 'audio/flac', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/mp4'],
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
