import { NextRequest, NextResponse } from "next/server";
import { parseBuffer } from "music-metadata";
import { put } from "@vercel/blob";

import { hasSupabaseEnv, supabase } from "@/backend/supabase/client";

const allowedAudioMimeTypes = new Set([
  "audio/mpeg",
  "audio/flac",
  "audio/wav",
  "audio/ogg",
  "audio/aac",
  "audio/mp4"
]);

function isPrivateIpv4(hostname: string) {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    return false;
  }
  const octets = hostname.split(".").map((part) => Number.parseInt(part, 10));
  if (octets.some((value) => Number.isNaN(value) || value < 0 || value > 255)) {
    return false;
  }
  return (
    octets[0] === 10 ||
    octets[0] === 127 ||
    (octets[0] === 169 && octets[1] === 254) ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168)
  );
}

function isAllowedBlobUrl(rawUrl: string) {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }

  if (parsed.protocol !== "https:") {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost") || isPrivateIpv4(hostname)) {
    return false;
  }

  const configuredBaseUrl = process.env.NEXT_PUBLIC_BLOB_BASE_URL;
  if (configuredBaseUrl) {
    try {
      const configuredHost = new URL(configuredBaseUrl).hostname.toLowerCase();
      if (hostname === configuredHost) {
        return true;
      }
    } catch {
      // Ignore invalid env format and continue with default host checks.
    }
  }

  return hostname.endsWith(".vercel-storage.com") || hostname === "vercel-storage.com";
}

function cleanTitle(filename: string) {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/_spotdown\.org/gi, "")
    .replace(/\s*\(\d+\)$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(req: NextRequest) {
  if (!hasSupabaseEnv || !supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON payload" }, { status: 400 });
  }

  const payload = body as {
    url?: unknown;
    filename?: unknown;
    mimeType?: unknown;
    size?: unknown;
  };
  const url = typeof payload.url === "string" ? payload.url : "";
  const filename = typeof payload.filename === "string" ? payload.filename.trim() : "";
  const mimeType =
    typeof payload.mimeType === "string" && payload.mimeType.trim()
      ? payload.mimeType.trim().toLowerCase()
      : "audio/mpeg";
  const size = typeof payload.size === "number" && Number.isFinite(payload.size) ? payload.size : undefined;

  if (!url || !filename) {
    return NextResponse.json({ error: "url and filename required" }, { status: 400 });
  }
  if (!isAllowedBlobUrl(url)) {
    return NextResponse.json({ error: "untrusted upload URL" }, { status: 400 });
  }
  if (!allowedAudioMimeTypes.has(mimeType)) {
    return NextResponse.json({ error: "unsupported mime type" }, { status: 400 });
  }

  // Fetch the uploaded blob from Vercel's Blob storage directly into the server's memory.
  // This bypasses the 4.5MB Incoming Payload Limit of Vercel Serverless Functions
  // because the fetch happens internally!
  const response = await fetch(url);
  if (!response.ok) {
    return NextResponse.json({ error: "failed to fetch uploaded file" }, { status: 400 });
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  let parsedMetadata = null;

  try {
    parsedMetadata = await parseBuffer(
      buffer,
      {
        mimeType: mimeType || "audio/mpeg",
        size: size
      },
      { duration: true }
    );
  } catch (e) {
    console.error("Metadata parse error:", e);
  }

  const title = parsedMetadata?.common.title?.trim() || cleanTitle(filename);
  const artist = parsedMetadata?.common.artist?.trim() ||
    parsedMetadata?.common.artists?.filter(Boolean).join(", ") ||
    "Unknown Artist";

  // --- DUPLICATE CHECK ---
  const { data: existingSong } = await supabase
    .from("songs")
    .select("id")
    .eq("title", title)
    .eq("artist", artist)
    .maybeSingle();

  if (existingSong) {
    return NextResponse.json(
      { error: `This song ("${title}" by ${artist}) is already in your library.` },
      { status: 409 }
    );
  }

  const album = parsedMetadata?.common.album?.trim() || null;
  const genre = parsedMetadata?.common.genre?.[0] || null;
  const duration = parsedMetadata?.format.duration != null ? Math.round(parsedMetadata.format.duration) : null;

  try {
    // 1. Upload Artwork to Vercel Blob (if exists)
    let posterUrl = null;
    const cover = parsedMetadata?.common.picture?.[0];
    if (cover) {
      const coverBlob = await put(`artwork/${Date.now()}-${filename}.jpg`, Buffer.from(cover.data), {
        access: "public",
        contentType: cover.format || "image/jpeg"
      });
      posterUrl = coverBlob.url;
    }

    // 2. Insert into Supabase
    const { data, error: dbError } = await supabase
      .from("songs")
      .insert({
        title,
        artist,
        album,
        genre,
        duration,
        audio_url: url, // Use the original URL which is already hosted
        poster_url: posterUrl,
        file_size: size,
        source: "uploaded"
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

