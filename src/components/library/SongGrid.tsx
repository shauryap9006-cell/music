"use client";

import { Play } from "lucide-react";
import { motion } from "framer-motion";

import { Badge } from "@/frontend/components/ui/Badge";
import { GlassCard } from "@/frontend/components/ui/GlassCard";
import { formatDuration } from "@/frontend/lib/utils";
import type { Song } from "@/frontend/types";

interface SongGridProps {
  songs: Song[];
  activeSongId?: string | null;
  onPlay: (index: number) => void;
}

export function SongGrid({ songs, activeSongId, onPlay }: SongGridProps) {
  return (
    <div className="grid gap-6 grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {songs.map((song, index) => {
        const active = activeSongId === song.id;
        return (
          <motion.button
            className="text-left group"
            initial={{ opacity: 0, scale: 0.95 }}
            key={song.id}
            onClick={() => onPlay(index)}
            transition={{ delay: index * 0.03, duration: 0.4 }}
            type="button"
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            whileInView={{ opacity: 1, scale: 1 }}
          >
            <div className="relative mb-3 aspect-square overflow-hidden rounded-[28px] border border-white/10 shadow-2xl transition-all group-hover:border-white/20 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]">
              <div
                className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{
                  backgroundImage: song.artUrl
                    ? `url(${song.artUrl})`
                    : `linear-gradient(135deg, ${song.dominantColor}, rgba(255,255,255,0.05))`
                }}
              />
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
                 <div className="bg-white/90 p-4 rounded-full scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                   <Play className="h-6 w-6 fill-black text-black" />
                 </div>
              </div>
              {active && (
                <div className="absolute top-4 right-4 z-20">
                   <Badge className="bg-white text-black animate-pulse">Playing</Badge>
                </div>
              )}
            </div>
            
            <div className="px-1">
              <h3 className="line-clamp-1 font-display text-xl text-white group-hover:text-[#7dd3fc] transition-colors">{song.title}</h3>
              <p className="line-clamp-1 text-sm text-white/40 mt-0.5 tracking-wide">{song.artist}</p>
              <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold tracking-widest text-[#7dd3fc] uppercase">{song.genre ?? "Local"}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-[10px] font-bold text-white/30 uppercase">{formatDuration(song.duration)}</span>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

