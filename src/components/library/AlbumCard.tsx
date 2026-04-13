"use client";

import { ChevronDown, Play } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/frontend/components/ui/Button";
import { GlassCard } from "@/frontend/components/ui/GlassCard";
import { formatDuration } from "@/frontend/lib/utils";
import type { AlbumGroup } from "@/frontend/types";

interface AlbumCardProps {
  album: AlbumGroup;
  expanded: boolean;
  onToggle: () => void;
  onPlaySong: (songId: string) => void;
}

export function AlbumCard({ album, expanded, onToggle, onPlaySong }: AlbumCardProps) {
  return (
    <GlassCard className="overflow-hidden p-4">
      <button className="w-full text-left" onClick={onToggle} type="button">
        <div className="flex items-start gap-4">
          <div
            className="h-24 w-24 rounded-[22px] border border-white/10"
            style={{
              backgroundImage: album.artUrl
                ? `url(${album.artUrl})`
                : `linear-gradient(135deg, ${album.dominantColor}, rgba(255,255,255,0.04))`,
              backgroundPosition: "center",
              backgroundSize: "cover"
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="font-display text-2xl text-white">{album.name}</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{album.artist}</p>
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              {album.songs.length} tracks · {formatDuration(album.duration)}
            </p>
          </div>
          <ChevronDown
            className={`mt-1 h-5 w-5 shrink-0 text-[var(--text-muted)] transition ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            className="overflow-hidden"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
          >
            <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
              {album.songs.map((song) => (
                <div
                  className="flex items-center justify-between gap-4 rounded-2xl bg-white/4 px-4 py-3"
                  key={song.id}
                >
                  <div className="min-w-0">
                    <p className="line-clamp-1 font-medium text-white">{song.title}</p>
                    <p className="line-clamp-1 text-sm text-[var(--text-muted)]">
                      {song.artist} · {formatDuration(song.duration)}
                    </p>
                  </div>
                  <Button
                    icon={<Play className="h-4 w-4" />}
                    onClick={() => onPlaySong(song.id)}
                    type="button"
                  >
                    Play
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </GlassCard>
  );
}

