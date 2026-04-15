import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { NextRequest, NextResponse } from "next/server";

const mimeByExtension: Record<string, string> = {
  mp3: "audio/mpeg",
  flac: "audio/flac",
  wav: "audio/wav",
  ogg: "audio/ogg"
};

export async function GET(request: NextRequest) {
  const fileName = request.nextUrl.searchParams.get("name");
  if (!fileName) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const safeFileName = path.basename(fileName);
  const filePath = path.join(process.cwd(), "songs", safeFileName);
  const extension = safeFileName.split(".").pop()?.toLowerCase() ?? "";

  try {
    const fileStats = await stat(filePath);
    const contentType = mimeByExtension[extension] ?? "application/octet-stream";
    const range = request.headers.get("range");
    const cacheControl = "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400";

    if (range) {
      const match = /bytes=(\d+)-(\d*)/.exec(range);
      if (match) {
        const start = Number.parseInt(match[1] ?? "0", 10);
        const requestedEnd = match[2] ? Number.parseInt(match[2], 10) : fileStats.size - 1;
        const end = Math.min(requestedEnd, fileStats.size - 1);

        if (start <= end && start < fileStats.size) {
          const stream = createReadStream(filePath, { start, end });
          return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
            status: 206,
            headers: {
              "Accept-Ranges": "bytes",
              "Cache-Control": cacheControl,
              "Content-Length": String(end - start + 1),
              "Content-Range": `bytes ${start}-${end}/${fileStats.size}`,
              "Content-Type": contentType
            }
          });
        }
      }
      return new NextResponse(null, {
        status: 416,
        headers: {
          "Accept-Ranges": "bytes",
          "Cache-Control": cacheControl,
          "Content-Range": `bytes */${fileStats.size}`,
          "Content-Type": contentType
        }
      });
    }

    const stream = createReadStream(filePath);
    return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
      headers: {
        "Accept-Ranges": "bytes",
        "Cache-Control": cacheControl,
        "Content-Length": String(fileStats.size),
        "Content-Type": contentType
      }
    });
  } catch {
    return NextResponse.json({ error: "file not found" }, { status: 404 });
  }
}
