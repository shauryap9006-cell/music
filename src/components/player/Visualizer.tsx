"use client";

import { useRef } from "react";

import { useVisualizer } from "@/frontend/hooks/useVisualizer";

export function Visualizer({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useVisualizer({
    canvasRef,
    active
  });

  return (
    <div className="rounded-[28px] border border-white/10 bg-black/20 p-4">
      <canvas className="h-36 w-full" ref={canvasRef} />
    </div>
  );
}

