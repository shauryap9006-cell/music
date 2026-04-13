"use client";

import { RefObject, useEffect } from "react";

import { audioEngine } from "@/frontend/lib/audio";

interface UseVisualizerOptions {
  canvasRef: RefObject<HTMLCanvasElement>;
  active: boolean;
}

export function useVisualizer({ canvasRef, active }: UseVisualizerOptions) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const analyser = audioEngine.getAnalyser();

    if (!canvas || !analyser) {
      return undefined;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return undefined;
    }

    const ratio = window.devicePixelRatio || 1;
    const bars = 64;
    const buffer = new Uint8Array(analyser.frequencyBinCount);
    let frameId = 0;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const render = () => {
      resize();
      analyser.getByteFrequencyData(buffer);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const barWidth = width / bars;

      context.clearRect(0, 0, width, height);
      const gradient = context.createLinearGradient(0, height, width, 0);
      gradient.addColorStop(0, "#A78BFA");
      gradient.addColorStop(1, "#F472B6");

      for (let index = 0; index < bars; index += 1) {
        const value = buffer[index] ?? 0;
        const normalized = value / 255;
        const barHeight = Math.max(6, normalized * height);
        const x = index * barWidth + 2;
        const y = height - barHeight;

        context.fillStyle = gradient;
        context.beginPath();
        context.roundRect(x, y, Math.max(barWidth - 4, 4), barHeight, 999);
        context.fill();
      }

      frameId = window.requestAnimationFrame(render);
    };

    const drawIdle = () => {
      resize();
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      context.clearRect(0, 0, width, height);
      const gradient = context.createLinearGradient(0, height, width, 0);
      gradient.addColorStop(0, "rgba(167, 139, 250, 0.35)");
      gradient.addColorStop(1, "rgba(244, 114, 182, 0.25)");

      for (let index = 0; index < bars; index += 1) {
        const barHeight = 8 + (index % 6) * 2;
        const x = index * (width / bars) + 2;
        const y = height - barHeight;
        context.fillStyle = gradient;
        context.beginPath();
        context.roundRect(x, y, Math.max(width / bars - 4, 4), barHeight, 999);
        context.fill();
      }
    };

    if (active) {
      render();
    } else {
      drawIdle();
    }

    const onResize = () => {
      if (!active) {
        drawIdle();
      }
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
    };
  }, [active, canvasRef]);
}

