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
  const blur = distance >= 3 ? "blur-[0px]" : "";

  return (
    <motion.div
      className={cn(
        "relative rounded-[24px] px-6 py-5 transition-all duration-300",
        active && "bg-black",
        blur
      )}
      style={{
        boxShadow: "none",
        border: "none"
      }}
      animate={{ opacity, scale }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      layout
    >
      <p
        className={cn(
          "text-[19px] leading-8 font-medium transition-all duration-300",
          active && "font-bold text-white/90",
          past && !active && "text-white/30",
          !past && !active && "text-white/20"
        )}
      >
        {text || "…"}
      </p>
    </motion.div>
  );
}
