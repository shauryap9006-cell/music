"use client";

import { useEffect, useMemo, useState } from "react";

import { createArtworkCacheKey } from "@/frontend/lib/artwork";
import type { ArtworkResult, Song } from "@/frontend/types";

const artworkCache = new Map<string, ArtworkResult>();
const inflightArtwork = new Map<string, Promise<ArtworkResult | null>>();

function buildArtworkQuery(song: Pick<Song, "title" | "artist" | "album" | "genre" | "duration">) {
  const searchParams = new URLSearchParams({
    title: song.title
  });

  if (song.artist) {
    searchParams.set("artist", song.artist);
  }

  if (song.album) {
    searchParams.set("album", song.album);
  }

  if (song.genre) {
    searchParams.set("genre", song.genre);
  }

  if (song.duration) {
    searchParams.set("duration", String(song.duration));
  }

  return searchParams.toString();
}

export function primeArtworkCache(result: ArtworkResult) {
  artworkCache.set(result.cacheKey, result);
}

export async function resolveSongArtwork(
  song: Pick<
    Song,
    "title" | "artist" | "album" | "genre" | "duration" | "artUrl" | "artworkSource" | "artworkPrompt" | "artworkCacheKey"
  >
) {
  const cacheKey =
    song.artworkCacheKey ||
    createArtworkCacheKey({
      artist: song.artist,
      title: song.title,
      album: song.album,
      duration: song.duration
    });

  if (song.artUrl) {
    const embeddedArtwork: ArtworkResult = {
      cacheKey,
      imageUrl: song.artUrl,
      source: song.artworkSource ?? "embedded",
      prompt: song.artworkPrompt
    };

    primeArtworkCache(embeddedArtwork);
    return embeddedArtwork;
  }

  const cachedArtwork = artworkCache.get(cacheKey);
  if (cachedArtwork) {
    return cachedArtwork;
  }

  const inflightRequest = inflightArtwork.get(cacheKey);
  if (inflightRequest) {
    return inflightRequest;
  }

  const request = fetch(`/api/artwork?${buildArtworkQuery(song)}`)
    .then(async (response) => {
      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as ArtworkResult;
      const resolvedArtwork = {
        ...payload,
        cacheKey: payload.cacheKey || cacheKey
      };

      primeArtworkCache(resolvedArtwork);
      return resolvedArtwork;
    })
    .catch(() => null)
    .finally(() => {
      inflightArtwork.delete(cacheKey);
    });

  inflightArtwork.set(cacheKey, request);
  return request;
}

export async function hydrateSongsArtwork(
  songs: Song[],
  onResolved: (song: Song, result: ArtworkResult) => Promise<void> | void,
  concurrency = 4
) {
  const queue = songs.filter((song) => !song.artUrl);
  let cursor = 0;

  const worker = async () => {
    while (cursor < queue.length) {
      const currentSong = queue[cursor];
      cursor += 1;

      if (!currentSong) {
        continue;
      }

      const result = await resolveSongArtwork(currentSong);
      if (result) {
        await onResolved(currentSong, result);
      }
    }
  };

  const workerCount = Math.min(concurrency, queue.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
}

export function useArtwork(song: Song | null) {
  const embeddedArtwork = useMemo<ArtworkResult | null>(() => {
    if (!song?.artUrl) {
      return null;
    }

    return {
      cacheKey: song.artworkCacheKey,
      imageUrl: song.artUrl,
      source: song.artworkSource ?? "embedded",
      prompt: song.artworkPrompt
    };
  }, [song?.artUrl, song?.artworkCacheKey, song?.artworkPrompt, song?.artworkSource]);

  const [artwork, setArtwork] = useState<ArtworkResult | null>(embeddedArtwork);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setArtwork(embeddedArtwork);
    setIsLoading(false);
  }, [embeddedArtwork]);

  useEffect(() => {
    if (!song || song.artUrl) {
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);

    void resolveSongArtwork(song).then((result) => {
      if (!active) {
        return;
      }

      setArtwork(result);
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [song]);

  return {
    artwork,
    isLoading
  };
}

