"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ListMusic, Mic2, SlidersHorizontal } from "lucide-react";

import { EQPanel } from "@/frontend/components/equalizer/EQPanel";
import { LyricsPanel } from "@/frontend/components/lyrics/LyricsPanel";
import { useAudioController } from "@/frontend/components/providers/AudioProvider";
import { VinylPlayer } from "@/frontend/components/player/VinylPlayer";
import { Playlist } from "@/frontend/components/sidebar/Playlist";
import { UploadButton } from "@/frontend/components/upload/UploadButton";
import { useLibrarySync } from "@/frontend/hooks/useLibrarySync";

const navigationItems: Array<{ href: Route; label: string }> = [
  { href: "/", label: "Home" },
  { href: "/library", label: "Library" },
  { href: "/search", label: "Search" }
];

export default function PlayerPage() {
  useLibrarySync();
  const pathname = usePathname();

  const {
    currentSong,
    isPlaying,
    progress,
    duration,
    progressPercent,
    shuffle,
    repeatMode,
    volume,
    muted,
    previous,
    togglePlayback,
    next,
    toggleShuffle,
    cycleRepeatMode,
    setVolume,
    toggleMute,
    seek
  } = useAudioController();

  const [activePanel, setActivePanel] = useState<"lyrics" | "eq" | null>(null);

  const togglePanel = (panel: "lyrics" | "eq") => {
    setActivePanel((current) => (current === panel ? null : panel));
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* LAYER 0: Background video — extreme back */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="pointer-events-none fixed inset-0 h-full w-full object-cover"
        style={{ zIndex: 0 }}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4"
      />

      {/* LAYER 1: Dark overlay for readability */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.65) 70%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* LAYER 2: Page content — above the video */}
      <motion.main
        className="relative mx-auto flex flex-col items-center w-full max-w-4xl px-6 py-6 md:px-10 gap-8"
        style={{ zIndex: 2 }}
      >
        {/* Header */}
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {navigationItems.map((item) => (
              <Link
                className={`rounded-full border px-4 py-2 text-sm transition cursor-pointer backdrop-blur-sm ${pathname === item.href
                    ? "border-white/14 bg-white/8 text-white"
                    : "border-white/6 bg-white/[0.03] text-white/35 hover:border-white/10 hover:text-white/60"
                  }`}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <UploadButton />
        </div>

        {/* Skeuomorphic Vinyl Record Player */}
        <VinylPlayer
          currentSong={currentSong}
          isPlaying={isPlaying}
          progress={progress}
          duration={duration}
          progressPercent={progressPercent}
          shuffle={shuffle}
          repeatMode={repeatMode}
          volume={volume}
          muted={muted}
          onPrevious={previous}
          onTogglePlayback={togglePlayback}
          onNext={next}
          onToggleShuffle={toggleShuffle}
          onCycleRepeat={cycleRepeatMode}
          onSeek={seek}
        />

        {/* Toggle Buttons */}
        <div className="flex w-full justify-center gap-4">
          <button
            onClick={() => togglePanel("lyrics")}
            className={`group flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition cursor-pointer backdrop-blur-sm ${activePanel === "lyrics"
                ? "bg-white text-zinc-950"
                : "bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white"
              }`}
            type="button"
          >
            <Mic2 className={`h-4 w-4 ${activePanel === "lyrics" ? "text-zinc-950" : "text-white/40 group-hover:text-white/80"}`} />
            Lyrics
          </button>
          <button
            onClick={() => togglePanel("eq")}
            className={`group flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition cursor-pointer backdrop-blur-sm ${activePanel === "eq"
                ? "bg-white text-zinc-950"
                : "bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white"
              }`}
            type="button"
          >
            <SlidersHorizontal className={`h-4 w-4 ${activePanel === "eq" ? "text-zinc-950" : "text-white/40 group-hover:text-white/80"}`} />
            Equalizer
          </button>
        </div>

        {/* Expandable Panels */}
        <div className="w-full flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {activePanel === "lyrics" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full overflow-hidden"
                key="lyrics-panel"
              >
                <div className="h-[500px]">
                  <LyricsPanel />
                </div>
              </motion.div>
            )}

            {activePanel === "eq" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full overflow-hidden"
                key="eq-panel"
              >
                <div className="min-h-[400px] w-full">
                  <EQPanel />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Playlist / Queue Section */}
        <div className="w-full space-y-4">
          <div className="flex items-center gap-3">
            <ListMusic className="h-5 w-5 text-white/40" />
            <h2 className="font-display text-2xl text-white">Up Next</h2>
          </div>
          <div className="h-[500px] w-full">
            <Playlist />
          </div>
        </div>
      </motion.main>
    </div>
  );
}
