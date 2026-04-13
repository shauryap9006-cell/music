import { readdir, readFile } from "fs/promises";
import { parseBuffer } from "music-metadata";
import path from "path";
import { NextResponse } from "next/server";

const audioPattern = /\.(mp3|flac|wav|ogg)$/i;
const supportedExtensions = new Set(["mp3", "flac", "wav", "ogg"]);

function cleanTitle(filename: string) {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/_spotdown\.org/gi, "")
    .replace(/\s*\(\d+\)$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function getAudioFiles(directory: string) {
  try {
    return (await readdir(directory)).filter((file) => {
      const extension = file.split(".").pop()?.toLowerCase();
      return extension ? supportedExtensions.has(extension) : false;
    });
  } catch {
    return [];
  }
}

async function buildSongPayload({
  directory,
  filename,
  id,
  audioUrl,
  folder,
  scope
}: {
  directory: string;
  filename: string;
  id: string;
  audioUrl: string;
  folder: string;
  scope: "preview" | "library";
}) {
  const filePath = path.join(directory, filename);

  try {
    const buffer = await readFile(filePath);
    const metadata = await parseBuffer(buffer);
    const picture = metadata.common.picture?.[0];

    return {
      id,
      audio_url: audioUrl,
      title: metadata.common.title?.trim() || cleanTitle(filename),
      artist:
        metadata.common.artist?.trim() ||
        metadata.common.artists?.filter(Boolean).join(", ") ||
        "Unknown Artist",
      album: metadata.common.album?.trim() || null,
      genre: metadata.common.genre?.[0] ?? null,
      duration: metadata.format.duration ? Math.round(metadata.format.duration) : null,
      poster_url: picture
        ? `/api/songs/artwork?scope=${scope}&name=${encodeURIComponent(filename)}`
        : null,
      source: "preloaded",
      folder,
      uploaded_at: null,
      play_count: 0
    };
  } catch {
    return {
      id,
      audio_url: audioUrl,
      title: cleanTitle(filename),
      artist: "Unknown Artist",
      album: null,
      genre: null,
      duration: null,
      poster_url: null,
      source: "preloaded",
      folder,
      uploaded_at: null,
      play_count: 0
    };
  }
}

export async function GET() {
  const previewDirectory = path.join(process.cwd(), "public", "preview-songs");
  const libraryDirectory = path.join(process.cwd(), "songs");

  const previewFiles = await getAudioFiles(previewDirectory);
  const libraryFiles = await getAudioFiles(libraryDirectory);

  const previewSongs = await Promise.all(
    previewFiles
      .filter((file) => audioPattern.test(file))
      .map((filename, index) =>
        buildSongPayload({
          directory: previewDirectory,
          filename,
          id: `preloaded-${index}-${filename}`,
          audioUrl: `/preview-songs/${filename}`,
          folder: "Preview Songs",
          scope: "preview"
        })
      )
  );

  const librarySongs = await Promise.all(
    libraryFiles
      .filter((file) => audioPattern.test(file))
      .map((filename, index) =>
        buildSongPayload({
          directory: libraryDirectory,
          filename,
          id: `library-${index}-${filename}`,
          audioUrl: `/api/songs/file?name=${encodeURIComponent(filename)}`,
          folder: "Songs Library",
          scope: "library"
        })
      )
  );

  return NextResponse.json([...previewSongs, ...librarySongs]);
}
