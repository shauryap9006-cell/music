import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { parseFile } from "music-metadata";

function resolveDirectory(scope: string | null) {
  if (scope === "preview") {
    return path.join(process.cwd(), "public", "preview-songs");
  }

  return path.join(process.cwd(), "songs");
}

export async function GET(request: NextRequest) {
  const fileName = request.nextUrl.searchParams.get("name");
  if (!fileName) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const scope = request.nextUrl.searchParams.get("scope");
  const safeFileName = path.basename(fileName);
  const filePath = path.join(resolveDirectory(scope), safeFileName);

  try {
    const metadata = await parseFile(filePath);
    const picture = metadata.common.picture?.[0];

    if (!picture) {
      return NextResponse.json({ error: "artwork not found" }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(picture.data), {
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Type": picture.format || "image/jpeg"
      }
    });
  } catch {
    return NextResponse.json({ error: "artwork not found" }, { status: 404 });
  }
}
