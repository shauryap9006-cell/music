"use client";

import { LoaderCircle, Music4 } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

import { useAudioController } from "@/frontend/components/providers/AudioProvider";
import { GlassCard } from "@/frontend/components/ui/GlassCard";
import { useLyrics } from "@/frontend/hooks/useLyrics";
import { LyricLine } from "@/frontend/components/lyrics/LyricLine";

const VISIBLE_LINES = 5; // Show 5 lines at a time
const CENTER_OFFSET = 2; // Active line is 3rd (index 2) in the window

export function LyricsPanel() {
  const { currentSong, progress } = useAudioController();
  const { payload, isLoading, activeIndex } = useLyrics(currentSong, progress);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lineRefs = useRef<Array<HTMLDivElement | null>>([]);

  const plainLines = useMemo(
    () =>
      payload?.plainText
        ? payload.plainText
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
        : [],
    [payload?.plainText]
  );

  // Auto-scroll to keep active line centered
  useEffect(() => {
    if (activeIndex < 0) return;
    const activeLine = lineRefs.current[activeIndex];
    if (!activeLine || !containerRef.current) return;

    const container = containerRef.current;
    const lineTop = activeLine.offsetTop;
    const lineHeight = activeLine.offsetHeight;
    const containerHeight = container.clientHeight;

    // Scroll so the active line is centered
    const scrollTo = lineTop - containerHeight / 2 + lineHeight / 2;
    container.scrollTo({
      top: scrollTo,
      behavior: "smooth"
    });
  }, [activeIndex]);

  return (
    <GlassCard className="relative flex h-full flex-col overflow-hidden p-5">
      {/* Ambient background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0 blur-3xl"
          style={{
            background: currentSong?.artUrl
              ? `center / cover no-repeat url(${currentSong.artUrl})`
              : `radial-gradient(circle, ${currentSong?.dominantColor ?? "#1e293b"}, transparent 70%)`
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,9,11,0.3),rgba(9,9,11,0.96))]" />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-3xl text-white">Lyrics</p>
          <p className="mt-1 text-sm text-white/35">
            {currentSong ? `${currentSong.artist} · ${currentSong.title}` : "Nothing selected"}
          </p>
        </div>
      </div>

      {/* Lyrics window — shows only ~5 lines with fade mask */}
      <div
        ref={containerRef}
        className="relative mt-5 min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-2 lyrics-mask"
        style={{ scrollbarWidth: "none" }}
      >
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-white/35">
            <LoaderCircle className="h-5 w-5 animate-spin" />
          </div>
        ) : null}

        {/* Synced lyrics — windowed view */}
        {!isLoading && payload?.synced.length ? (
          <div className="space-y-1 py-16">
            {payload.synced.map((line, index) => {
              const distance = Math.abs(index - activeIndex);
              // Only render lines within a reasonable range for performance
              const shouldRender = activeIndex < 0 || distance <= 8;

              return (
                <div
                  key={`${line.timestamp}-${index}`}
                  ref={(element) => {
                    lineRefs.current[index] = element;
                  }}
                  style={{
                    // Hide lines that are too far away
                    visibility: shouldRender ? "visible" : "hidden",
                    height: shouldRender ? "auto" : "3rem"
                  }}
                >
                  {shouldRender && (
                    <LyricLine
                      active={index === activeIndex}
                      past={index < activeIndex}
                      text={line.text}
                      distance={activeIndex < 0 ? 0 : distance}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Plain text lyrics — also windowed style */}
        {!isLoading && !payload?.synced.length && plainLines.length > 0 ? (
          <div className="space-y-3 py-16 text-base leading-8 text-white/50">
            {plainLines.map((line, index) => (
              <p className="rounded-2xl bg-white/[0.03] px-4 py-3" key={`${line}-${index}`}>
                {line}
              </p>
            ))}
          </div>
        ) : null}

        {/* No lyrics */}
        {!isLoading && !payload?.synced.length && plainLines.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/6 bg-white/4">
              <Music4 className="h-7 w-7 text-white/40" />
            </div>
            <p className="font-display text-2xl text-white">Lyrics not available</p>
            <p className="max-w-sm text-sm leading-7 text-white/30">
              No synced or plain lyrics were found for this track.
            </p>
          </div>
        ) : null}
      </div>
    </GlassCard>
  );
}
