"use client";

import { Slider } from "@/frontend/components/ui/Slider";
import { formatDuration } from "@/frontend/lib/utils";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (value: number) => void;
}

export function ProgressBar({ currentTime, duration, onSeek }: ProgressBarProps) {
  return (
    <div className="space-y-3">
      <Slider
        max={duration || 0}
        min={0}
        onChange={(event) => onSeek(Number(event.target.value))}
        step={0.1}
        value={Number.isFinite(currentTime) ? currentTime : 0}
      />
      <div className="flex items-center justify-between font-mono text-xs tracking-[0.18em] text-[var(--text-dim)]">
        <span>{formatDuration(currentTime)}</span>
        <span>{formatDuration(duration)}</span>
      </div>
    </div>
  );
}

