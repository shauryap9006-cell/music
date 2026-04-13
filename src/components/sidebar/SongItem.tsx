"use client";

import { forwardRef } from "react";
import { Reorder, motion } from "framer-motion";

import { cn, formatDuration } from "@/frontend/lib/utils";
import type { Song } from "@/frontend/types";

interface SongItemProps {
  song: Song;
  active: boolean;
  playing: boolean;
  onSelect: () => void;
}

function ActiveBars() {
  return (
    <div className="flex h-4 items-end gap-[2px] pr-1">
      {[0, 1, 2].map((bar) => (
        <motion.span
          animate={{ height: ["0.2rem", "0.8rem", "0.3rem"] }}
          className="w-[3px] rounded-full shadow-[0_0_6px_rgba(255,255,255,0.8)]"
          style={{ background: "rgba(255,255,255,0.9)" }}
          key={bar}
          transition={{ repeat: Infinity, duration: 0.8, delay: bar * 0.08 }}
        />
      ))}
    </div>
  );
}

export const SongItem = forwardRef<HTMLDivElement, SongItemProps>(
  ({ song, active, playing, onSelect }, ref) => {
    return (
      <Reorder.Item value={song} className="list-none">
        <div ref={ref}>
          <motion.button
            whileTap={{ scale: 0.98 }}
            className={cn(
              "group relative flex w-full items-center gap-3 rounded-[16px] px-3 py-2.5 text-left transition-all duration-300 cursor-pointer overflow-hidden",
              !active && "hover:bg-black/30 hover:border-white/5"
            )}
            style={{
              background: active
                ? "rgba(255,255,255,0.04)"
                : "rgba(0,0,0,0.2)",
              boxShadow: active
                ? "0 8px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.3)"
                : "inset 0 4px 10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.03)",
              border: active
                ? "1px solid rgba(255,255,255,0.05)"
                : "1px solid rgba(255,255,255,0.01)",
            }}
            onClick={onSelect}
            type="button"
          >
            {/* Active Indicator Bar */}
            {active && (
              <div className="absolute left-0 top-1/2 -ml-[2px] h-6 w-[3px] -translate-y-1/2 rounded-full bg-white/70 shadow-[0_0_8px_1px_rgba(255,255,255,0.5)]" />
            )}

            {/* album art thumbnail with Glossy Bezel */}
            <div
              className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-black/40 shadow-[0_4px_10px_rgba(0,0,0,0.7)] text-[10px] font-display uppercase text-white"
              style={{
                backgroundImage: song.artUrl
                  ? `url(${song.artUrl})`
                  : `linear-gradient(135deg, ${song.dominantColor}, rgba(255,255,255,0.02))`,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
            >
              {/* Specular glass highlight ring */}
              <div 
                className="absolute inset-0 pointer-events-none rounded-[10px]" 
                style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.35), inset 0 -1px 2px rgba(0,0,0,0.5)" }} 
              />
              {!song.artUrl ? song.title.slice(0, 2) : null}
            </div>

            {/* title / artist */}
            <div className="min-w-0 flex-1 py-0.5">
              <p className={cn(
                "line-clamp-1 text-[14px] font-medium transition-colors",
                active ? "text-white drop-shadow-sm" : "text-white/80 group-hover:text-white"
              )}>
                {song.title}
              </p>
              <p className="line-clamp-1 mt-0.5 text-[12px] font-medium text-white/40">
                {song.artist}
              </p>
            </div>

            {/* duration + active bars */}
            <div className="flex flex-col items-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
              <span className="font-mono text-[11px] font-medium text-white/50 tracking-wider">
                {formatDuration(song.duration)}
              </span>
              {active && playing ? <ActiveBars /> : null}
            </div>
          </motion.button>
        </div>
      </Reorder.Item>
    );
  }
);

SongItem.displayName = "SongItem";
