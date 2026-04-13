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

  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let parsedMetadata = null;

  try {
    parsedMetadata = await parseBuffer(
      buffer,
      {
        mimeType: file.type || "audio/mpeg",
        size: file.size
      },
      { duration: true }
    );
  } catch (e) {
    console.error("Metadata parse error:", e);
  }

  const title = parsedMetadata?.common.title?.trim() || cleanTitle(file.name);
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
      const coverBlob = await put(`artwork/${Date.now()}-${file.name}.jpg`, Buffer.from(cover.data), {
        access: "public",
        contentType: cover.format || "image/jpeg"
      });
      posterUrl = coverBlob.url;
    }

    // 2. Upload Audio to Vercel Blob
    const audioBlob = await put(`library/${Date.now()}-${file.name}`, buffer, {
      access: "public",
      contentType: file.type || "audio/mpeg"
    });

    // 3. Insert into Supabase
    const { data, error: dbError } = await supabase
      .from("songs")
      .insert({
        title,
        artist,
        album,
        genre,
        duration,
        audio_url: audioBlob.url,
        poster_url: posterUrl,
        file_size: file.size,
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

