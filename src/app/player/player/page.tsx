"use client";

import { AnimatePresence, motion } from "framer-motion";

import { EQPanel } from "@/frontend/components/equalizer/EQPanel";
import { LyricsPanel } from "@/frontend/components/lyrics/LyricsPanel";
import { useAudioController } from "@/frontend/components/providers/AudioProvider";
import { AlbumArt } from "@/frontend/components/player/AlbumArt";
import { Controls } from "@/frontend/components/player/Controls";
import { ProgressBar } from "@/frontend/components/player/ProgressBar";
import { Visualizer } from "@/frontend/components/player/Visualizer";
import { Playlist } from "@/frontend/components/sidebar/Playlist";
import { GlassCard } from "@/frontend/components/ui/GlassCard";

export default function PlayerPage() {
  const {
    currentSong,
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
    seek
  } = useAudioController();

  return (
    <motion.main
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-[1480px] px-6 py-6 md:px-10"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.55 }}
    >
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_380px]">
        <div className="xl:h-[calc(100vh-14rem)]">
          <Playlist />
        </div>

        <GlassCard className="relative overflow-hidden p-6 md:p-8 xl:h-[calc(100vh-14rem)]">
          <div
            className="absolute inset-0 opacity-35 blur-3xl"
            style={{
              background: currentSong?.dominantColor ?? "#A78BFA"
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,4,15,0.28),rgba(6,4,15,0.92))]" />

          <div className="relative flex h-full flex-col gap-8">
            <div className="text-center">
              <p className="font-mono text-xs uppercase tracking-[0.32em] text-[var(--text-dim)]">
                Main Player
              </p>
            </div>

            <AlbumArt playing={isPlaying} song={currentSong} />

            <AnimatePresence mode="wait">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 text-center"
                initial={{ opacity: 0, y: 14 }}
                key={currentSong?.id ?? "empty"}
                transition={{ duration: 0.35 }}
              >
                <h1 className="font-display text-4xl text-white">
                  {currentSong?.title ?? "Load a folder to begin"}
                </h1>
                <p className="text-lg text-[var(--text-muted)]">
                  {currentSong ? `${currentSong.artist} - ${currentSong.album}` : "Local playback only"}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="space-y-6">
              <ProgressBar currentTime={progress} duration={duration} onSeek={seek} />
              <Controls
                isPlaying={isPlaying}
                muted={muted}
                onCycleRepeat={cycleRepeatMode}
                onNext={next}
                onPrevious={previous}
                onToggleMute={toggleMute}
                onTogglePlayback={togglePlayback}
                onToggleShuffle={toggleShuffle}
                onVolumeChange={setVolume}
                repeatMode={repeatMode}
                shuffle={shuffle}
                volume={volume}
              />
            </div>

            <Visualizer active={isPlaying} />
          </div>
        </GlassCard>

        <div className="xl:h-[calc(100vh-14rem)]">
          <LyricsPanel />
        </div>
      </div>

      <div className="mt-6">
        <EQPanel />
      </div>
    </motion.main>
  );
}

