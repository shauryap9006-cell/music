"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Maximize2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ListMusic
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { useAudioController } from "@/frontend/components/providers/AudioProvider";
import { Slider } from "@/frontend/components/ui/Slider";
import { formatDuration } from "@/frontend/lib/utils";
import { usePlayerStore } from "@/frontend/store/player.store";

export function BottomPlayer() {
  const {
    songs,
    currentSong,
    currentIndex,
    isPlaying,
    progress,
    duration,
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
    seek,
    play
  } = useAudioController();

  const [showQueue, setShowQueue] = useState(false);
  const pathname = usePathname();

  if (songs.length === 0 || currentIndex < 0 || pathname === "/player") return null;

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;
  const RepeatIcon = repeatMode === "one" ? Repeat1 : Repeat;

  return (
    <>
      {/* Floating Liquid Glass Player Pod */}
      <AnimatePresence>
        <motion.div
          initial={{ y: 50, x: "-50%", opacity: 0 }}
          animate={{ y: 0, x: "-50%", opacity: 1 }}
          exit={{ y: 50, x: "-50%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
          className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2.5rem)] md:w-auto md:min-w-[580px] max-w-3xl overflow-hidden rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
        >
          {/* Liquid Glass Background */}
          <div className="absolute inset-0 bg-white/[0.001] backdrop-blur-[3px] border border-white/[0.06] rounded-[36px]" />

          <div className="relative flex items-center justify-between gap-5 px-5 py-3.5">
            {/* Left Side: Track Info */}
            <Link
              className="flex items-center gap-4 min-w-0 pr-2 group"
              href="/player"
            >
              <div
                className="h-14 w-14 shrink-0 rounded-2xl border border-white/10 shadow-lg transition-transform group-hover:scale-105"
                style={{
                  backgroundImage: currentSong?.artUrl
                    ? `url(${currentSong.artUrl})`
                    : `linear-gradient(135deg, ${currentSong?.dominantColor ?? "#1e293b"}, rgba(255,255,255,0.04))`,
                  backgroundPosition: "center",
                  backgroundSize: "cover"
                }}
              />
              <div className="min-w-0">
                <h3 className="line-clamp-1 text-sm font-semibold text-white/95 tracking-tight">
                  {currentSong?.title ?? "No track"}
                </h3>
                <p className="line-clamp-1 text-xs text-white/45 font-medium mt-0.5">
                  {currentSong?.artist ?? "Unknown"}
                </p>
              </div>
            </Link>

            {/* Center/Rightish: Controls */}
            <div className="flex items-center gap-2">
              <button
                className="rounded-full p-2.5 text-white/40 transition hover:text-white/90 hover:bg-white/5 active:scale-95 cursor-pointer"
                onClick={previous}
                type="button"
              >
                <SkipBack className="h-4.5 w-4.5" />
              </button>

              <button
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white shadow-inner transition hover:bg-white/20 active:scale-90 cursor-pointer border border-white/5"
                onClick={togglePlayback}
                type="button"
              >
                {isPlaying ? <Pause className="h-5 w-5 fill-white" /> : <Play className="h-5 w-5 fill-white ml-0.5" />}
              </button>

              <button
                className="rounded-full p-2.5 text-white/40 transition hover:text-white/90 hover:bg-white/5 active:scale-95 cursor-pointer"
                onClick={next}
                type="button"
              >
                <SkipForward className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Far Right: Actions */}
            <div className="flex items-center gap-1 border-l border-white/10 pl-4 ml-1">
              <button
                onClick={() => setShowQueue(!showQueue)}
                className={`rounded-full p-2.5 transition active:scale-95 cursor-pointer ${showQueue ? "text-[#7dd3fc] bg-white/5" : "text-white/30 hover:text-white/60"}`}
              >
                <ListMusic className="h-5 w-5" />
              </button>
              <Link
                className="rounded-full p-2.5 text-white/30 transition hover:text-white/60 active:scale-95 cursor-pointer"
                href="/player"
              >
                <ChevronUp className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Bottom-Linked Progress Line (Liquid Style) */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/[0.03]">
            <motion.div
              className="h-full bg-gradient-to-r from-[#7dd3fc]/40 via-white/60 to-[#7dd3fc]/40 shadow-[0_0_12px_rgba(125,211,252,0.3)]"
              style={{ width: `${progressPercent}%` }}
              layout
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
