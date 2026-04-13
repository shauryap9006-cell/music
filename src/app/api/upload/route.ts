import { NextRequest, NextResponse } from "next/server";
import { parseBuffer } from "music-metadata";

import { hasSupabaseEnv, supabase } from "@/backend/supabase/client";
import { getPoster } from "@/frontend/lib/poster";

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
      { error: "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY." },
      { status: 503 }
    );
  }

  const form = await req.formData();

  const file = form.get("file") as File | null;
  const fallbackTitle = form.get("title") as string | null;
  const fallbackArtist = (form.get("artist") as string | null) || null;
  const fallbackAlbum = (form.get("album") as string | null) || null;
  const fallbackGenre = (form.get("genre") as string | null) || null;
  const fallbackDurationValue = form.get("duration");

  if (!file) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let parsedMetadata:
    | Awaited<ReturnType<typeof parseBuffer>>
    | null = null;

  try {
    parsedMetadata = await parseBuffer(
      buffer,
      {
        mimeType: file.type || "audio/mpeg",
        size: file.size
      },
      { duration: true }
    );
  } catch {
    parsedMetadata = null;
  }

  const title =
    parsedMetadata?.common.title?.trim() ||
    fallbackTitle?.trim() ||
    cleanTitle(file.name);
  const artist =
    parsedMetadata?.common.artist?.trim() ||
    parsedMetadata?.common.artists?.filter(Boolean).join(", ") ||
    fallbackArtist;
  const album = parsedMetadata?.common.album?.trim() || fallbackAlbum;
  const genre = parsedMetadata?.common.genre?.[0] || fallbackGenre;
  const duration =
    parsedMetadata?.format.duration != null
      ? Math.round(parsedMetadata.format.duration)
      : typeof fallbackDurationValue === "string" && fallbackDurationValue.trim()
        ? Math.round(Number(fallbackDurationValue))
        : null;

  const timestamp = Date.now();
  const fileExtension = file.name.split(".").pop() || "mp3";
  const safeFilename = `${title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${timestamp}.${fileExtension}`;
  const storageFilePath = `audio/${safeFilename}`;

  // Upload Audio to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("songs")
    .upload(storageFilePath, buffer, {
      contentType: file.type || "audio/mpeg",
      upsert: false
    });

  if (uploadError) {
    return NextResponse.json(
      { error: `Storage Upload Error: ${uploadError.message}` },
      { status: 500 }
    );
  }

  const audioUrl = supabase.storage.from("songs").getPublicUrl(storageFilePath).data.publicUrl;

  // Upload Poster to Supabase Storage (if cover exists)
  let posterUrl: string;
  const cover = parsedMetadata?.common.picture?.[0];

  if (cover) {
    const coverExtension = (cover.format || "image/jpeg").split("/").pop();
    const coverStoragePath = `covers/${safeFilename.replace(`.${fileExtension}`, "")}-cover.${coverExtension}`;

    const { error: coverUploadError } = await supabase.storage
      .from("songs")
      .upload(coverStoragePath, Buffer.from(cover.data), {
        contentType: cover.format || "image/jpeg",
        upsert: false
      });

    if (!coverUploadError) {
      posterUrl = supabase.storage.from("songs").getPublicUrl(coverStoragePath).data.publicUrl;
    } else {
      posterUrl = await getPoster({
        title,
        artist: artist ?? "",
        genre: genre ?? ""
      });
    }
  } else {
    posterUrl = await getPoster({
      title,
      artist: artist ?? "",
      genre: genre ?? ""
    });
  }

  // Insert Record into Database
  const { data, error } = await supabase
    .from("songs")
    .insert({
      title,
      artist,
      album,
      genre,
      duration,
      audio_url: audioUrl,
      poster_url: posterUrl,
      file_size: file.size,
      source: "uploaded"
    })
    .select()
    .single();

  if (error) {
    // Attempt rollback of file if DB insert fails
    await supabase.storage.from("songs").remove([storageFilePath]);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
