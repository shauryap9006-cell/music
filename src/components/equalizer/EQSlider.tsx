"use client";

import { motion } from "framer-motion";

import { Slider } from "@/frontend/components/ui/Slider";
import type { EQBand } from "@/frontend/types";

interface EQSliderProps {
  band: EQBand;
  onChange: (gain: number) => void;
}

export function EQSlider({ band, onChange }: EQSliderProps) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-white">{band.label}</p>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--text-dim)]">
            {band.frequency >= 1000 ? `${band.frequency / 1000} kHz` : `${band.frequency} Hz`}
          </p>
        </div>
        <motion.span
          animate={{ scale: [1, 1.08, 1] }}
          className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-[var(--text-muted)]"
          transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY }}
        >
          {band.gain > 0 ? "+" : ""}
          {band.gain} dB
        </motion.span>
      </div>
      <div className="mt-4">
        <Slider
          max={12}
          min={-12}
          onChange={(event) => onChange(Number(event.target.value))}
          step={1}
          value={band.gain}
        />
      </div>
    </div>
  );
}

