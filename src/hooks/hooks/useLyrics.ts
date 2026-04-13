"use client";

import { useEffect, useState } from "react";

import { fetchLyrics } from "@/frontend/lib/lyrics";
import type { LyricsPayload, Song } from "@/frontend/types";

export function useLyrics(song: Song | null, currentTime: number) {
  const [payload, setPayload] = useState<LyricsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (!song) {
      setPayload(null);
      setActiveIndex(-1);
      return;
    }

    let active = true;
    setIsLoading(true);
    setActiveIndex(-1);

    fetchLyrics(song.artist, song.title)
      .then((result) => {
        if (!active) {
          return;
        }

        setPayload(result);
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [song?.artist, song?.title]);

  useEffect(() => {
    if (!payload?.synced.length) {
      setActiveIndex(-1);
      return undefined;
    }

    const interval = window.setInterval(() => {
      let nextIndex = -1;
      payload.synced.forEach((line, index) => {
        if (currentTime >= line.timestamp) {
          nextIndex = index;
        }
      });
      setActiveIndex(nextIndex);
    }, 250);

    return () => window.clearInterval(interval);
  }, [currentTime, payload?.synced]);

  return {
    payload,
    isLoading,
    activeIndex
  };
}

