"use client";

import { useEffect, useRef } from "react";
import { Reorder } from "framer-motion";

import { formatFolderLabel } from "@/frontend/lib/utils";
import { usePlayerStore } from "@/frontend/store/player.store";
import { SongItem } from "@/frontend/components/sidebar/SongItem";
import { useAudioController } from "@/frontend/components/providers/AudioProvider";

/* inline noise SVG (matches VinylPlayer) */
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

export function Playlist() {
  const reorderSongs = usePlayerStore((state) => state.reorderSongs);
  const { songs, currentIndex, currentSong, isPlaying, play, folderName } = useAudioController();
  const activeItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [currentIndex]);

  const preloadedCount = songs.filter((song) => song.source === "preloaded").length;
  const uploadedCount = songs.filter((song) => song.source === "uploaded").length;

  return (
    <div
      className="relative flex h-full flex-col gap-3 overflow-hidden rounded-3xl p-4"
      style={{
        background: "#0c0c0c",
        boxShadow:
          "0 2px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.6)",
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
        style={{ border: "1px solid rgba(255,255,255,0.04)" }}
      />

      {/* header */}
      <div className="relative z-20 flex items-center justify-between px-1">
        <div>
          <p className="font-display text-xl tracking-[0.14em] text-white">Aura</p>
          <p className="text-[10px] text-white/25 uppercase tracking-wider">
            {songs.length > 0
              ? (folderName ? formatFolderLabel(folderName) : "Library")
              : "Empty"}
          </p>
        </div>
        <div className="text-[10px] text-white/15 font-mono tracking-wider">
          {songs.length} TRACKS
        </div>
      </div>

      {/* song list */}
      <div
        className="relative z-20 min-h-0 flex-1 overflow-hidden rounded-2xl p-1.5"
        style={{
          background: "rgba(0,0,0,0.3)",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)",
        }}
      >
        {songs.length > 0 ? (
          <Reorder.Group
            axis="y"
            className="flex h-full flex-col gap-1 overflow-y-auto pr-1"
            onReorder={reorderSongs}
            values={songs}
          >
            {songs.map((song, index) => (
              <SongItem
                active={currentSong?.id === song.id}
                key={song.id}
                onSelect={() => play(index)}
                playing={isPlaying}
                song={song}
                ref={currentSong?.id === song.id ? activeItemRef : null}
              />
            ))}
          </Reorder.Group>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl p-6 text-center text-[10px] leading-relaxed text-white/15 uppercase tracking-widest"
            style={{
              border: "1px dashed rgba(255,255,255,0.06)",
            }}
          >
            No tracks found
          </div>
        )}
      </div>

      {/* footer stats */}
      <div
        className="relative z-20 rounded-2xl p-2.5 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.015)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 0 0 1px rgba(255,255,255,0.03)",
        }}
      >
        <div className="flex flex-col">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/12">Position</span>
          <span className="text-[11px] font-medium text-white/35">
            {currentIndex >= 0 ? `${currentIndex + 1} / ${songs.length}` : "—"}
          </span>
        </div>
        <div className="flex flex-col text-right">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/12">Source</span>
          <span className="text-[10px] text-white/20">
            {preloadedCount}P / {uploadedCount}U
          </span>
        </div>
      </div>
    </div>
  );
}
