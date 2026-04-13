"use client";

import { LoaderCircle, Music4 } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

import { useAudioController } from "@/frontend/components/providers/AudioProvider";

import { useLyrics } from "@/frontend/hooks/useLyrics";
import { LyricLine } from "@/frontend/components/lyrics/LyricLine";

const VISIBLE_LINES = 5; // Show 5 lines at a time
const CENTER_OFFSET = 2; // Active line is 3rd (index 2) in the window

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

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
    <div 
      className="relative flex h-full flex-col overflow-hidden p-6 rounded-3xl"
      style={{
        background: "#0b0a0aff",
        boxShadow: "0 4px 60px rgba(0,0,0,0.8), inset 0 -1px 0 rgba(0,0,0,0.7)",
      }}
    >
      {/* noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-3xl"
        style={{
          backgroundImage: NOISE_SVG,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
          mixBlendMode: "overlay",
          opacity: 0.5,
        }}
      />
      {/* inner border highlight */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-3xl"
        style={{ border: "1px solid rgba(0, 0, 0, 0.04)" }}
      />

     

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
    </div>
  );
}
