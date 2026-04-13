"use client";

import { motion } from "framer-motion";

import type { Song } from "@/frontend/types";

export function AlbumArt({ song, playing }: { song: Song | null; playing: boolean }) {
  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      <motion.div
        animate={playing ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        className="absolute inset-0 rounded-full blur-2xl"
        style={{
          background: `radial-gradient(circle, ${song?.dominantColor ?? "#1e293b"}40, transparent 65%)`
        }}
        transition={{ repeat: Infinity, duration: 2.8 }}
      />
      <motion.div
        animate={playing ? { rotate: 360 } : { rotate: 0 }}
        className="relative aspect-square rounded-full border border-white/10 p-4 album-shadow"
        transition={{
          repeat: playing ? Infinity : 0,
          duration: 20,
          ease: "linear"
        }}
      >
        <div
          className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-white/8 bg-zinc-900 text-6xl font-display uppercase text-white"
          style={{
            backgroundImage: song?.artUrl
              ? `url(${song.artUrl})`
              : `linear-gradient(135deg, ${song?.dominantColor ?? "#1e293b"}, rgba(255,255,255,0.04))`,
            backgroundPosition: "center",
            backgroundSize: "cover"
          }}
        >
          {!song?.artUrl ? song?.title.slice(0, 2) : null}
        </div>
      </motion.div>
    </div>
  );
}
