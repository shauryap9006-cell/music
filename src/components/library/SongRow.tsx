"use client";

import { Play } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/frontend/components/ui/Button";
import { cn, formatDuration } from "@/frontend/lib/utils";
import type { Song } from "@/frontend/types";

interface SongRowProps {
  song: Song;
  onPlay: () => void;
  active?: boolean;
  trailing?: ReactNode;
}

export function SongRow({ song, onPlay, active = false, trailing }: SongRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-[24px] border border-white/8 px-4 py-4 transition",
        active ? "bg-white/10 shadow-glow" : "bg-white/4 hover:bg-white/8"
      )}
    >
      <div
        className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(167,139,250,0.28),rgba(244,114,182,0.22))] text-lg font-display uppercase text-white"
        style={{
          backgroundImage: song.artUrl
            ? `url(${song.artUrl})`
            : `linear-gradient(135deg, ${song.dominantColor}, rgba(255,255,255,0.04))`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        {!song.artUrl ? song.title.slice(0, 2) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 font-medium text-white">{song.title}</p>
        <p className="line-clamp-1 text-sm text-[var(--text-muted)]">
          {song.artist} · {song.album}
        </p>
      </div>

      <div className="hidden text-sm text-[var(--text-muted)] md:block">
        {formatDuration(song.duration)}
      </div>

      {trailing}

      <Button icon={<Play className="h-4 w-4" />} onClick={onPlay} type="button">
        Play
      </Button>
    </div>
  );
}

