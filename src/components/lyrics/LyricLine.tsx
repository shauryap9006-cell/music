"use client";

import { motion } from "framer-motion";

import { cn } from "@/frontend/lib/utils";

interface LyricLineProps {
  text: string;
  active: boolean;
  past: boolean;
  distance: number; // 0 = active, 1 = adjacent, 2+ = far
}

export function LyricLine({ text, active, past, distance }: LyricLineProps) {
  const opacity = active ? 1 : distance <= 1 ? 0.4 : 0.15;
  const scale = active ? 1.04 : 1;
  const blur = distance >= 3 ? "blur-[1px]" : "";

  return (
    <motion.div
      className={cn(
        "rounded-2xl px-4 py-3 transition-all duration-300",
        active && "bg-white/10 shadow-[0_0_30px_-5px_rgba(255,255,255,0.15)]",
        blur
      )}
      animate={{ opacity, scale }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      layout
    >
      <p
        className={cn(
          "text-lg leading-8 transition-all duration-300",
          active && "font-bold text-white [text-shadow:_0_0_15px_rgb(255_255_255_/_80%)]",
          past && !active && "text-white/30",
          !past && !active && "text-white/20"
        )}
      >
        {text || "…"}
      </p>
    </motion.div>
  );
}
