"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import {
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";

import type { Song } from "@/frontend/types";
import { formatDuration } from "@/frontend/lib/utils";

/* ─── noise texture (inline SVG data URI) ─── */
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

/* ─── types ─── */
interface VinylPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  progressPercent: number;
  shuffle: boolean;
  repeatMode: "none" | "one" | "all";
  volume: number;
  muted: boolean;
  onPrevious: () => void;
  onTogglePlayback: () => void;
  onNext: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onSeek: (time: number) => void;
}

/* ─── groove ring generator (SVG circles for realistic vinyl) ─── */
function GrooveRings() {
  const rings: JSX.Element[] = [];
  // Outer grooves: from radius 49% down to ~28%
  for (let i = 0; i < 36; i++) {
    const r = 49 - i * 0.58;
    const opacity = 0.06 + Math.random() * 0.08;
    rings.push(
      <circle
        key={`groove-${i}`}
        cx="50%"
        cy="50%"
        r={`${r}%`}
        fill="none"
        stroke="white"
        strokeWidth={Math.random() > 0.7 ? "0.6" : "0.3"}
        opacity={opacity}
      />
    );
  }
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 400 400"
      style={{ borderRadius: "50%" }}
    >
      {rings}
    </svg>
  );
}

/* ─── tonearm SVG ─── */
function Tonearm({ 
  angle,
  onPointerDown,
  onPointerMove,
  onPointerUp
}: { 
  angle: number;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerMove?: (e: React.PointerEvent) => void;
  onPointerUp?: (e: React.PointerEvent) => void;
}) {
  return (
    <motion.div
      className="absolute z-20"
      style={{
        top: "-2%",
        right: "8%",
        width: "40%",
        height: "60%",
        transformOrigin: "85% 8%",
        pointerEvents: "none",
      }}
      animate={{ rotate: angle }}
      transition={{ type: "spring", stiffness: 40, damping: 20 }}
    >
      <svg viewBox="0 0 200 300" fill="none" className="w-full h-full drop-shadow-xl">
        {/* pivot base */}
        <circle cx="170" cy="24" r="14" fill="#1a1a1a" stroke="#333" strokeWidth="2" />
        <circle cx="170" cy="24" r="6" fill="#2a2a2a" />

        {/* arm shaft */}
        <line x1="170" y1="28" x2="50" y2="240" stroke="#888" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="170" y1="28" x2="50" y2="240" stroke="url(#arm-highlight)" strokeWidth="2" strokeLinecap="round" />

        {/* headshell */}
        <rect x="38" y="235" width="24" height="40" rx="3" fill="#222" stroke="#444" strokeWidth="1" transform="rotate(-10 50 255)" />
        {/* cartridge */}
        <rect x="45" y="258" width="10" height="14" rx="1" fill="#333" transform="rotate(-10 50 265)" />
        {/* stylus */}
        <line x1="50" y1="273" x2="50" y2="280" stroke="#ccc" strokeWidth="1.5" transform="rotate(-10 50 276)" />

        {/* INTERACTION AREA for grab */}
        <rect 
          x="20" y="220" width="60" height="80" 
          fill="transparent" 
          cursor="grab"
          pointerEvents="all"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          transform="rotate(-10 50 255)"
          className="active:cursor-grabbing"
        />

        {/* arm highlight gradient */}
        <defs>
          <linearGradient id="arm-highlight" x1="170" y1="28" x2="50" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white" stopOpacity="0.25" />
            <stop offset="50%" stopColor="white" stopOpacity="0.08" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}

/* ─── draggable progress bar ─── */
function VinylProgressBar({
  currentTime,
  duration,
  onSeek,
}: {
  currentTime: number;
  duration: number;
  onSeek: (t: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const fraction = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

  const handlePointerInteraction = useCallback(
    (clientX: number) => {
      if (!trackRef.current || !duration) return;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      onSeek(ratio * duration);
    },
    [duration, onSeek]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handlePointerInteraction(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    handlePointerInteraction(e.clientX);
  };

  const handlePointerUp = () => {
    setDragging(false);
  };

  return (
    <div className="w-full space-y-2">
      <div
        ref={trackRef}
        className="relative h-[6px] w-full cursor-pointer rounded-full"
        style={{ background: "rgba(255,255,255,0.08)" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* filled track */}
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            width: `${fraction * 100}%`,
            background: "linear-gradient(90deg, rgba(255,255,255,0.35), rgba(255,255,255,0.6))",
          }}
        />
        {/* draggable dot */}
        <motion.div
          className="absolute top-1/2"
          style={{
            left: `${fraction * 100}%`,
            translateX: "-50%",
            translateY: "-50%",
          }}
          animate={{ scale: dragging ? 1.4 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <div
            className="rounded-full"
            style={{
              width: 16,
              height: 16,
              background: "radial-gradient(circle at 35% 35%, #fff, #bbb)",
              boxShadow: "0 0 8px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.5)",
            }}
          />
        </motion.div>
      </div>
      <div className="flex justify-between font-mono text-[11px] tracking-[0.18em] text-white/25">
        <span>{formatDuration(currentTime)}</span>
        <span>{formatDuration(duration)}</span>
      </div>
    </div>
  );
}

/* ─── main component ─── */
export function VinylPlayer({
  currentSong,
  isPlaying,
  progress,
  duration,
  progressPercent,
  shuffle,
  repeatMode,
  onPrevious,
  onTogglePlayback,
  onNext,
  onToggleShuffle,
  onCycleRepeat,
  onSeek,
}: VinylPlayerProps) {
  const RepeatIcon = repeatMode === "one" ? Repeat1 : Repeat;

  // Deck and Dragging State
  const deckRef = useRef<HTMLDivElement>(null);
  const [draggingTonearm, setDraggingTonearm] = useState(false);
  const [dragAngle, setDragAngle] = useState(0);
  const dragData = useRef({ startAngle: 0, startMouseAngle: 0 });

  // Resting at -45° when paused/no song (off the record), sweeps from -25° to 2° with progress.
  const targetAngle = !currentSong || !isPlaying
    ? -45
    : -35 + (progressPercent / 100) * 27;

  const currentAngle = draggingTonearm ? dragAngle : targetAngle;

  const getMouseAngle = useCallback((clientX: number, clientY: number) => {
    if (!deckRef.current) return 0;
    const rect = deckRef.current.getBoundingClientRect();
    const pivotX = rect.left + rect.width * 0.86;
    const pivotY = rect.top + rect.height * 0.028;
    const dx = clientX - pivotX;
    const dy = clientY - pivotY;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  }, []);

  const handleTonearmPointerDown = useCallback((e: React.PointerEvent) => {
    if (!currentSong) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    setDraggingTonearm(true);
    const mAngle = getMouseAngle(e.clientX, e.clientY);
    setDragAngle(targetAngle);
    dragData.current = { startAngle: targetAngle, startMouseAngle: mAngle };
  }, [currentSong, getMouseAngle, targetAngle]);

  const handleTonearmPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingTonearm) return;
    const mAngle = getMouseAngle(e.clientX, e.clientY);
    let delta = mAngle - dragData.current.startMouseAngle;
    
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    let newAngle = dragData.current.startAngle + delta;
    if (newAngle < -45) newAngle = -45; // Constrain to new resting angle
    if (newAngle > 5) newAngle = 5;

    setDragAngle(newAngle);
  }, [draggingTonearm, getMouseAngle]);

  const handleTonearmPointerUp = useCallback((e: React.PointerEvent) => {
    if (!draggingTonearm) return;
    setDraggingTonearm(false);
    (e.target as Element).releasePointerCapture(e.pointerId);

    // Map drag angle back to progress using the user's [-35 to -8] range
    let seekProgress = (dragAngle + 35) / 27;
    if (seekProgress < 0) seekProgress = 0;
    if (seekProgress > 1) seekProgress = 1;
    
    onSeek(seekProgress * duration);
  }, [draggingTonearm, dragAngle, duration, onSeek]);

  // Calculate live preview time to update progress bar while dragging tonearm
  const dragProgressRaw = (dragAngle + 35) / 27;
  const clampedDragProgress = Math.max(0, Math.min(1, dragProgressRaw));
  const displayTime = draggingTonearm ? clampedDragProgress * duration : progress;

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl"
      style={{
        background: "#0a0909ff",
        boxShadow:
          "0 4px 60px rgba(0,0,0,2), inset 0 -1px 0 rgba(0,0,0,2)",
      }}
    >
      {/* noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-30 rounded-3xl"
        style={{
          backgroundImage: NOISE_SVG,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
          mixBlendMode: "overlay",
          opacity: 0.5,
        }}
      />

      {/* inner subtle border highlight */}
      <div
        className="pointer-events-none absolute inset-0 z-20 rounded-3xl"
        style={{
          border: "1px solid rgba(255,255,255,0.04)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 py-8 md:px-10 md:py-10">
        {/* Header */}
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/15">
          Now Playing
        </p>

        {/* turntable deck */}
        <div ref={deckRef} className="relative w-full max-w-[420px] aspect-square">
          {/* platter base shadow */}
          <div
            className="absolute inset-[4%] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(20,20,20,1) 0%, rgba(8,8,8,1) 100%)",
              boxShadow:
                "0 0 0 3px rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.8), inset 0 2px 8px rgba(255,255,255,0.02)",
            }}
          />

          {/* spinning vinyl disc */}
          <motion.div
            className="absolute inset-[5%] rounded-full"
            style={{
              background:
                "radial-gradient(circle, #111 0%, #0a0a0a 30%, #080808 60%, #111 100%)",
              boxShadow: "inset 0 0 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)",
            }}
            animate={
              isPlaying
                ? { rotate: 360 }
                : {}
            }
            transition={
              isPlaying
                ? {
                    repeat: Infinity,
                    duration: 3,
                    ease: "linear",
                  }
                : { type: "spring", stiffness: 30, damping: 20 }
            }
          >
            {/* groove rings */}
            <GrooveRings />

            {/* outer rim shine */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.03) 10%, transparent 20%, rgba(255,255,255,0.02) 40%, transparent 55%, rgba(255,255,255,0.04) 70%, transparent 85%)",
              }}
            />

            {/* center label with album art */}
            <div
              className="absolute rounded-full overflow-hidden"
              style={{
                top: "30%",
                left: "30%",
                width: "40%",
                height: "40%",
                boxShadow:
                  "inset 0 2px 6px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.06)",
              }}
            >
              {currentSong?.artUrl ? (
                <img
                  src={currentSong.artUrl}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              ) : (
                <div
                  className="flex items-center justify-center w-full h-full text-3xl font-bold text-white/30"
                  style={{
                    background: currentSong
                      ? `linear-gradient(135deg, ${currentSong.dominantColor}, rgba(30,30,30,0.9))`
                      : "linear-gradient(135deg, #1a1a1a, #0d0d0d)",
                  }}
                >
                  {currentSong?.title?.slice(0, 2)?.toUpperCase() ?? "♪"}
                </div>
              )}
              {/* label spindle hole */}
              <div
                className="absolute rounded-full"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "12%",
                  height: "12%",
                  background: "radial-gradient(circle, #1a1a1a, #0c0c0c)",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)",
                }}
              />
            </div>
          </motion.div>

          {/* tonearm */}
          <Tonearm 
            angle={currentAngle}
            onPointerDown={handleTonearmPointerDown}
            onPointerMove={handleTonearmPointerMove}
            onPointerUp={handleTonearmPointerUp}
          />
        </div>

        {/* song info */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSong?.id ?? "empty"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-1"
          >
            <h1 className="font-display text-3xl md:text-4xl text-white tracking-tight">
              {currentSong?.title ?? "Select a track"}
            </h1>
            <p className="text-sm text-white/30">
              {currentSong
                ? `${currentSong.artist} · ${currentSong.album}`
                : "Pick a song from the queue"}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* progress bar */}
        <div className="w-full max-w-md">
          <VinylProgressBar currentTime={displayTime} duration={duration} onSeek={onSeek} />
        </div>

        {/* controls */}
        <div className="flex items-center justify-center gap-3">
          {/* shuffle */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            className="rounded-full p-3 transition-colors cursor-pointer"
            style={{
              background: shuffle ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)",
              color: shuffle ? "#fff" : "rgba(255,255,255,0.3)",
            }}
            onClick={onToggleShuffle}
            type="button"
            aria-label="Shuffle"
          >
            <Shuffle className="h-4 w-4" />
          </motion.button>

          {/* previous */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            className="rounded-full p-3 cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.03)",
              color: "rgba(255,255,255,0.45)",
            }}
            onClick={onPrevious}
            type="button"
            aria-label="Previous"
          >
            <SkipBack className="h-5 w-5" />
          </motion.button>

          {/* convex play/pause button */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            whileHover={{ scale: 1.05 }}
            className="relative flex items-center justify-center rounded-full cursor-pointer"
            style={{
              width: 68,
              height: 68,
              background:
                "linear-gradient(145deg, #ffffff 0%, #e0e0e0 50%, #c0c0c0 100%)",
              boxShadow:
                "0 6px 20px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.1)",
            }}
            onClick={onTogglePlayback}
            type="button"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {/* specular highlight overlay */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                top: "8%",
                left: "15%",
                width: "45%",
                height: "35%",
                background:
                  "radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.9), transparent)",
                filter: "blur(2px)",
              }}
            />
            {isPlaying ? (
              <Pause className="h-7 w-7 text-zinc-900 relative z-10" />
            ) : (
              <Play className="h-7 w-7 text-zinc-900 relative z-10 ml-0.5" />
            )}
          </motion.button>

          {/* next */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            className="rounded-full p-3 cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.03)",
              color: "rgba(255,255,255,0.45)",
            }}
            onClick={onNext}
            type="button"
            aria-label="Next"
          >
            <SkipForward className="h-5 w-5" />
          </motion.button>

          {/* repeat */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            className="rounded-full p-3 transition-colors cursor-pointer"
            style={{
              background: repeatMode !== "none" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)",
              color: repeatMode !== "none" ? "#fff" : "rgba(255,255,255,0.3)",
            }}
            onClick={onCycleRepeat}
            type="button"
            aria-label="Repeat"
          >
            <RepeatIcon className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
