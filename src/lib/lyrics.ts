import type { LyricLine, LyricsPayload } from "@/frontend/types";

const lyricsCache = new Map<string, LyricsPayload | null>();

export function parseLrc(rawLrc: string) {
  const lines = rawLrc.split("\n");
  const lyricLines: LyricLine[] = [];

  lines.forEach((line) => {
    const matches = [...line.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)];
    const text = line.replace(/\[(\d+):(\d+(?:\.\d+)?)\]/g, "").trim();

    matches.forEach((match) => {
      const minutes = Number(match[1]);
      const seconds = Number(match[2]);
      if (Number.isNaN(minutes) || Number.isNaN(seconds)) {
        return;
      }

      lyricLines.push({
        timestamp: minutes * 60 + seconds,
        text,
        raw: line
      });
    });
  });

  return lyricLines.sort((left, right) => left.timestamp - right.timestamp);
}

export async function fetchLyrics(artist: string, track: string) {
  const cacheKey = `${artist}::${track}`;
  if (lyricsCache.has(cacheKey)) {
    return lyricsCache.get(cacheKey) ?? null;
  }

  const url = new URL("https://lrclib.net/api/get");
  url.searchParams.set("artist_name", artist);
  url.searchParams.set("track_name", track);

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      lyricsCache.set(cacheKey, null);
      return null;
    }

    const payload = (await response.json()) as {
      syncedLyrics?: string;
      plainLyrics?: string;
    };

    const parsed: LyricsPayload = {
      synced: payload.syncedLyrics ? parseLrc(payload.syncedLyrics) : [],
      plainText: payload.plainLyrics ?? null,
      rawLrc: payload.syncedLyrics ?? null
    };

    lyricsCache.set(cacheKey, parsed);
    return parsed;
  } catch {
    lyricsCache.set(cacheKey, null);
    return null;
  }
}

