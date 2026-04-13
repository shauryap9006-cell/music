import { readFile, stat } from "fs/promises";
import path from "path";
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
    const buffer = await readFile(filePath);
    const contentType = mimeByExtension[extension] ?? "application/octet-stream";
    const range = request.headers.get("range");

    if (range) {
      const match = /bytes=(\d+)-(\d*)/.exec(range);
      if (match) {
        const start = Number.parseInt(match[1] ?? "0", 10);
        const requestedEnd = match[2] ? Number.parseInt(match[2], 10) : fileStats.size - 1;
        const end = Math.min(requestedEnd, fileStats.size - 1);

        if (start <= end && start < fileStats.size) {
          const chunk = buffer.subarray(start, end + 1);
          return new NextResponse(chunk, {
            status: 206,
            headers: {
              "Accept-Ranges": "bytes",
              "Cache-Control": "public, max-age=3600",
              "Content-Length": String(chunk.length),
              "Content-Range": `bytes ${start}-${end}/${fileStats.size}`,
              "Content-Type": contentType
            }
          });
        }
      }
    }

    return new NextResponse(buffer, {
      headers: {
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600",
        "Content-Length": String(fileStats.size),
        "Content-Type": contentType
      }
    });
  } catch {
    return NextResponse.json({ error: "file not found" }, { status: 404 });
  }
}
