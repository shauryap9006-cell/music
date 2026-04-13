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
        "group relative flex items-center gap-4 rounded-[20px] px-4 py-3 transition-all duration-300",
        active 
          ? "bg-white/[0.04] border border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.6),_inset_0_1px_0_rgba(255,255,255,0.1),_inset_0_-1px_0_rgba(0,0,0,0.3)]" 
          : "bg-black/20 border border-white/[0.01] shadow-[inset_0_4px_10px_rgba(0,0,0,0.5),_inset_0_1px_1px_rgba(0,0,0,0.8),_0_1px_1px_rgba(255,255,255,0.03)] hover:bg-black/30 hover:border-white/5 cursor-pointer"
      )}
      onClick={!active ? onPlay : undefined}
    >
      {/* Active Indicator Bar */}
      {active && (
        <div className="absolute left-0 top-1/2 -ml-1 h-8 w-1.5 -translate-y-1/2 rounded-full bg-white/70 shadow-[0_0_8px_1px_rgba(255,255,255,0.5)]" />
      )}

      {/* Album Art with Glossy Bezel */}
      <div
        className="relative flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-black/40 shadow-[0_4px_12px_rgba(0,0,0,0.7)] text-lg font-display uppercase text-white"
        style={{
          backgroundImage: song.artUrl
            ? `url(${song.artUrl})`
            : `linear-gradient(135deg, ${song.dominantColor}, rgba(255,255,255,0.02))`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        {/* Specular glass highlight ring */}
        <div 
          className="absolute inset-0 pointer-events-none rounded-[14px]" 
          style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.35), inset 0 -1px 2px rgba(0,0,0,0.5)" }} 
        />
        {!song.artUrl ? song.title.slice(0, 2) : null}
      </div>

      <div className="min-w-0 flex-1 py-1">
        <p className={cn(
          "line-clamp-1 font-medium transition-colors", 
          active ? "text-white text-[15px] drop-shadow-sm" : "text-white/80 group-hover:text-white"
        )}>
          {song.title}
        </p>
        <p className="line-clamp-1 text-[13px] font-medium text-white/40 mt-0.5">
          {song.artist}
        </p>
      </div>

      <div className="hidden text-[12px] font-mono tracking-widest text-[#666] md:block pr-2 transition-colors group-hover:text-white/50">
        {formatDuration(song.duration)}
      </div>

      {trailing}

      {/* Modern Skeuomorphic Hover Play Button */}
      {!active && (
        <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <button 
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-white to-zinc-400 shadow-[0_4px_10px_rgba(0,0,0,0.6),_inset_0_2px_4px_rgba(255,255,255,0.9)] active:scale-95 text-black hover:scale-105"
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
          >
            <Play className="h-4 w-4 fill-black" style={{ marginLeft: "2px" }} />
          </button>
        </div>
      )}
    </div>
  );
}

