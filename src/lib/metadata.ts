import { createArtworkCacheKey } from "@/frontend/lib/artwork";
import type { AudioExtension, Song } from "@/frontend/types";
import { hashToColor, stripFileDecorators } from "@/frontend/lib/utils";

const supportedExtensions = new Set<AudioExtension>(["mp3", "flac", "wav", "ogg"]);

let parseBlobLoader: (typeof import("music-metadata"))["parseBlob"] | null = null;

async function getParseBlob() {
  if (!parseBlobLoader) {
    const module = await import("music-metadata");
    parseBlobLoader = module.parseBlob;
  }
  return parseBlobLoader;
}

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() as AudioExtension | undefined;
}

export async function extractDominantColor(imageUrl: string | undefined, fallback: string) {
  if (!imageUrl || typeof window === "undefined") {
    return fallback;
  }

  return new Promise<string>((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) {
          resolve(fallback);
          return;
        }

        const sampleSize = 32;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        context.drawImage(image, 0, 0, sampleSize, sampleSize);
        const { data } = context.getImageData(0, 0, sampleSize, sampleSize);

        let red = 0;
        let green = 0;
        let blue = 0;
        let count = 0;

        for (let index = 0; index < data.length; index += 16) {
          red += data[index] ?? 0;
          green += data[index + 1] ?? 0;
          blue += data[index + 2] ?? 0;
          count += 1;
        }

        if (count === 0) {
          resolve(fallback);
          return;
        }

        resolve(`rgb(${Math.round(red / count)}, ${Math.round(green / count)}, ${Math.round(blue / count)})`);
      } catch {
        resolve(fallback);
      }
    };
    image.onerror = () => resolve(fallback);
    image.src = imageUrl;
  });
}

export async function parseMetadataFromUrl(audioUrl: string) {
  try {
    const parseBlob = await getParseBlob();
    const response = await fetch(audioUrl);
    const blob = await response.blob();
    const metadata = await parseBlob(blob);

    const cover = metadata.common.picture?.[0];
    const coverUrl = cover
      ? URL.createObjectURL(new Blob([new Uint8Array(cover.data)], { type: cover.format }))
      : null;

    return {
      title: metadata.common.title ?? null,
      artist: metadata.common.artist ?? null,
      album: metadata.common.album ?? null,
      genre: metadata.common.genre?.[0] ?? null,
      duration: metadata.format.duration ?? null,
      coverUrl
    };
  } catch {
    return null;
  }
}

export async function parseSongFiles(fileInput: FileList | File[]) {
  const files = Array.from(fileInput).filter((file) => {
    const extension = getExtension(file.name);
    return extension ? supportedExtensions.has(extension) : false;
  });

  const songs = await Promise.all(
    files.map(async (file, index) => {
      const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
      const folderName = relativePath.includes("/") ? relativePath.split("/")[0] : "Local library";
      const fallbackTitle = stripFileDecorators(file.name);

      let metadata:
        | Awaited<ReturnType<(typeof import("music-metadata"))["parseBlob"]>>
        | undefined;

      try {
        const parseBlob = await getParseBlob();
        metadata = await parseBlob(file, { duration: true });
      } catch {
        metadata = undefined;
      }

      const picture = metadata?.common.picture?.[0];
      const artUrl = picture
        ? URL.createObjectURL(
            new Blob([new Uint8Array(picture.data)], { type: picture.format || "image/jpeg" })
          )
        : undefined;
      const dominantColor = await extractDominantColor(
        artUrl,
        hashToColor(`${relativePath}-${metadata?.common.artist ?? "aura"}`)
      );
      const objectUrl = URL.createObjectURL(file);

      const title = metadata?.common.title?.trim() || fallbackTitle;
      const artist =
        metadata?.common.artist?.trim() ||
        metadata?.common.artists?.filter(Boolean).join(", ") ||
        "Unknown artist";
      const album = metadata?.common.album?.trim() || "Unknown album";
      const year = metadata?.common.year ? String(metadata.common.year) : undefined;
      const genre = metadata?.common.genre?.[0];
      const duration = metadata?.format.duration ?? 0;

      const song: Song = {
        id: `${relativePath}-${file.lastModified}-${index}`,
        audio_url: objectUrl,
        title,
        artist,
        album,
        year,
        genre,
        duration,
        poster_url: artUrl ?? null,
        source: "local",
        uploaded_at: null,
        play_count: 0,
        src: objectUrl,
        fileName: file.name,
        mimeType: file.type || `audio/${getExtension(file.name) ?? "mpeg"}`,
        folder: folderName,
        relativePath,
        artUrl,
        artworkSource: artUrl ? "embedded" : undefined,
        artworkCacheKey: createArtworkCacheKey({
          artist,
          title,
          album,
          duration
        }),
        addedAt: file.lastModified || Date.now(),
        playCount: 0,
        dominantColor
      };

      return song;
    })
  );

  const folderName = files[0]
    ? ((files[0] as File & { webkitRelativePath?: string }).webkitRelativePath?.split("/")?.[0] ?? null)
    : null;

  return {
    songs,
    folderName
  };
}

export function revokeSongAssets(songs: Song[]) {
  songs.forEach((song) => {
    if (song.src.startsWith("blob:")) {
      URL.revokeObjectURL(song.src);
    }
    if (song.artUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(song.artUrl);
    }
  });
}

