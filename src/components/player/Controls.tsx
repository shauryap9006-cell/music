"use client";

import {
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX
} from "lucide-react";

import { Slider } from "@/frontend/components/ui/Slider";

interface ControlsProps {
  isPlaying: boolean;
  shuffle: boolean;
  repeatMode: "none" | "one" | "all";
  volume: number;
  muted: boolean;
  onPrevious: () => void;
  onTogglePlayback: () => void;
  onNext: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onVolumeChange: (value: number) => void;
  onToggleMute: () => void;
}

export function Controls({
  isPlaying,
  shuffle,
  repeatMode,
  volume,
  muted,
  onPrevious,
  onTogglePlayback,
  onNext,
  onToggleShuffle,
  onCycleRepeat,
  onVolumeChange,
  onToggleMute
}: ControlsProps) {
  const RepeatIcon = repeatMode === "one" ? Repeat1 : Repeat;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-3">
        <button
          className={`rounded-full p-3 transition cursor-pointer ${
            shuffle ? "bg-white/10 text-[#7dd3fc]" : "bg-white/4 text-white/40 hover:text-white/60"
          }`}
          onClick={onToggleShuffle}
          type="button"
          aria-label="Shuffle"
        >
          <Shuffle className="h-4 w-4" />
        </button>
        <button
          className="rounded-full bg-white/4 p-3 text-white/50 transition hover:text-white cursor-pointer"
          onClick={onPrevious}
          type="button"
          aria-label="Previous"
        >
          <SkipBack className="h-4 w-4" />
        </button>
        <button
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white p-0 text-zinc-950 transition hover:bg-white/90 cursor-pointer"
          onClick={onTogglePlayback}
          type="button"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
        </button>
        <button
          className="rounded-full bg-white/4 p-3 text-white/50 transition hover:text-white cursor-pointer"
          onClick={onNext}
          type="button"
          aria-label="Next"
        >
          <SkipForward className="h-4 w-4" />
        </button>
        <button
          className={`rounded-full p-3 transition cursor-pointer ${
            repeatMode !== "none" ? "bg-white/10 text-[#7dd3fc]" : "bg-white/4 text-white/40 hover:text-white/60"
          }`}
          onClick={onCycleRepeat}
          type="button"
          aria-label="Repeat"
        >
          <RepeatIcon className="h-4 w-4" />
        </button>
      </div>

    </div>
  );
}
