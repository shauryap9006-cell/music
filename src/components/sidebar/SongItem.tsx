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
    <div className="flex h-5 items-end gap-[3px]">
      {[0, 1, 2].map((bar) => (
        <motion.span
          animate={{ height: ["0.25rem", "0.9rem", "0.35rem"] }}
          className="w-[3px] rounded-full"
          style={{ background: "rgba(255,255,255,0.6)" }}
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
      <Reorder.Item value={song}>
        <div ref={ref}>
          <motion.button
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition cursor-pointer",
              active
                ? "shadow-[0_0_12px_rgba(255,255,255,0.04)]"
                : ""
            )}
            style={{
              background: active
                ? "rgba(255,255,255,0.06)"
                : "rgba(255,255,255,0.015)",
              boxShadow: active
                ? "inset 0 1px 0 rgba(255,255,255,0.06), 0 0 12px rgba(255,255,255,0.03)"
                : "inset 0 1px 0 rgba(255,255,255,0.02)",
              border: active
                ? "1px solid rgba(255,255,255,0.08)"
                : "1px solid rgba(255,255,255,0.03)",
            }}
            onClick={onSelect}
            type="button"
          >
            {/* album art thumbnail */}
            <div
              className="h-12 w-12 shrink-0 rounded-xl overflow-hidden"
              style={{
                backgroundImage: song.artUrl
                  ? `url(${song.artUrl})`
                  : `linear-gradient(135deg, ${song.dominantColor}, rgba(20,20,20,0.9))`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
              }}
            />

            {/* title / artist */}
            <div className="min-w-0 flex-1">
              <p className={cn(
                "line-clamp-1 font-medium",
                active ? "text-white" : "text-white/75"
              )}>
                {song.title}
              </p>
              <p className="line-clamp-1 text-xs text-white/25">
                {song.artist}
              </p>
            </div>

            {/* duration + active bars */}
            <div className="flex flex-col items-end gap-1">
              <span className="font-mono text-[11px] text-white/15">
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
