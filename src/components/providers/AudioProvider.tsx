"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

import { useAudio } from "@/frontend/hooks/useAudio";
import { useEqualizer } from "@/frontend/hooks/useEqualizer";

type AudioContextValue = ReturnType<typeof useAudio> & ReturnType<typeof useEqualizer>;

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const audio = useAudio();
  const equalizer = useEqualizer();

  return <AudioContext.Provider value={{ ...audio, ...equalizer }}>{children}</AudioContext.Provider>;
}

export function useAudioController() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudioController must be used within AudioProvider");
  }

  return context;
}

