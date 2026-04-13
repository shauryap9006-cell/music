"use client";

import { Pause, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";

import { Badge } from "@/frontend/components/ui/Badge";
import { GlassCard } from "@/frontend/components/ui/GlassCard";
import { usePlayerStore } from "@/frontend/store/player.store";
import { useAudioController } from "@/frontend/components/providers/AudioProvider";
import { formatDuration } from "@/frontend/lib/utils";

function MiniWave() {
  return (
    <div className="flex h-8 items-end gap-1">
      {[0, 1, 2, 3, 4].map((bar) => (
        <motion.span
          animate={{
            height: ["0.4rem", `${1.2 + bar * 0.12}rem`, "0.55rem"]
          }}
          className="w-1 rounded-full bg-white/70"
          key={bar}
          transition={{
            duration: 1.1,
            ease: "easeInOut",
            repeat: Infinity,
            delay: bar * 0.08
          }}
        />
      ))}
    </div>
  );
}

export function PreviewStrip() {
  const songs = usePlayerStore((state) => state.songs);
  const setSongs = usePlayerStore((state) => state.setSongs);
  const { currentSong, isPlaying, play, togglePlayback } = useAudioController();

  const previewTracks = useMemo(
    () => songs.filter((song) => song.folder === "Preview Songs").slice(0, 6),
    [songs]
  );

  const handlePlayTrack = (index: number) => {
    // Find the actual index in the full songs array
    const track = previewTracks[index];
    const globalIndex = songs.findIndex((s) => s.id === track.id);

    if (currentSong?.id === track.id) {
      togglePlayback();
      return;
    }

    play(globalIndex);
  };

  return (
    <section className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-6 py-10 md:px-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-white/20">
            Ready to play
          </p>
          <h2 className="mt-2 font-display text-3xl text-white">Pick a track</h2>
        </div>
        <Badge className="border-white/6 bg-white/[0.03] text-white/35">
          {previewTracks.length || 0} tracks
        </Badge>
      </div>

      {previewTracks.length > 0 ? (
        <div className="flex snap-x gap-5 overflow-x-auto pb-4">
          {previewTracks.map((track, index) => {
            const isActive = currentSong?.id === track.id;
            const isCurrentlyPlaying = isActive && isPlaying;
            return (
              <motion.div
                className="min-w-[280px] snap-start"
                initial={{ opacity: 0, y: 30 }}
                key={track.id}
                transition={{ delay: index * 0.08, duration: 0.6 }}
                viewport={{ once: true, amount: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <GlassCard className="group relative h-full overflow-hidden p-5 cursor-pointer">
                  <div
                    className="absolute inset-0 opacity-60 transition duration-500 group-hover:scale-110"
                    style={{
                      backgroundImage: track.poster_url
                        ? `linear-gradient(180deg, rgba(9,9,11,0.15), rgba(9,9,11,0.92)), url(${track.poster_url})`
                        : `linear-gradient(135deg, ${track.dominantColor}, rgba(9,9,11,0.92))`,
                      backgroundPosition: "center",
                      backgroundSize: "cover"
                    }}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05),rgba(9,9,11,0.92))]" />

                  <div className="relative flex h-full flex-col justify-between gap-5">
                    <div className="space-y-4">
                      <div className="flex h-44 items-end justify-between rounded-[22px] border border-white/6 bg-black/30 p-4">
                        <Badge className="bg-black/30 text-white/50 border-white/6">
                          {track.genre ?? "Preview"}
                        </Badge>
                        {isCurrentlyPlaying ? <MiniWave /> : null}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{track.title}</h3>
                        <p className="mt-1 text-sm text-white/35">{track.artist}</p>
                        <p className="mt-1 font-mono text-[11px] text-white/20">
                          {formatDuration(track.duration)}
                        </p>
                      </div>
                    </div>

                    <button
                      className={`flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-medium transition cursor-pointer ${
                        isCurrentlyPlaying
                          ? "bg-white text-zinc-950"
                          : "bg-white/8 text-white hover:bg-white/12 border border-white/8"
                      }`}
                      onClick={() => handlePlayTrack(index)}
                      type="button"
                    >
                      {isCurrentlyPlaying ? (
                        <>
                          <Pause className="h-4 w-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Play
                        </>
                      )}
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <GlassCard className="p-8 text-center text-white/35">
          Drop audio files into <code className="text-white/50">/public/preview-songs</code> and they will appear here automatically.
        </GlassCard>
      )}
    </section>
  );
}
