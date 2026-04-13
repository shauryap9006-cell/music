import { NextRequest, NextResponse } from "next/server";
import { parseBuffer } from "music-metadata";
import { put } from "@vercel/blob";

import { hasSupabaseEnv, supabase } from "@/backend/supabase/client";

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

  const { url, filename, mimeType, size } = await req.json();

  if (!url || !filename) {
    return NextResponse.json({ error: "url and filename required" }, { status: 400 });
  }

  // Fetch the uploaded blob from Vercel's Blob storage directly into the server's memory.
  // This bypasses the 4.5MB Incoming Payload Limit of Vercel Serverless Functions
  // because the fetch happens internally!
  const response = await fetch(url);
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

