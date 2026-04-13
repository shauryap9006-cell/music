"use client";

import { useEffect, useMemo, useState } from "react";

import { audioEngine, eqFrequencies } from "@/frontend/lib/audio";
import type { EQBand, EQBandKey } from "@/frontend/types";

const presetGains: Record<string, Record<EQBandKey, number>> = {
  Flat: {
    subBass: 0,
    bass: 0,
    midrange: 0,
    presence: 0,
    brilliance: 0
  },
  "Bass Boost": {
    subBass: 6,
    bass: 4,
    midrange: -1,
    presence: 0,
    brilliance: 1
  },
  Vocal: {
    subBass: -2,
    bass: -1,
    midrange: 3,
    presence: 4,
    brilliance: 2
  },
  Electronic: {
    subBass: 4,
    bass: 2,
    midrange: 0,
    presence: 2,
    brilliance: 4
  },
  Classical: {
    subBass: -1,
    bass: 1,
    midrange: 2,
    presence: 3,
    brilliance: 2
  }
};

const defaultBands: EQBand[] = [
  { key: "subBass", label: "Sub Bass", frequency: eqFrequencies.subBass, gain: 0 },
  { key: "bass", label: "Bass", frequency: eqFrequencies.bass, gain: 0 },
  { key: "midrange", label: "Midrange", frequency: eqFrequencies.midrange, gain: 0 },
  { key: "presence", label: "Presence", frequency: eqFrequencies.presence, gain: 0 },
  { key: "brilliance", label: "Brilliance", frequency: eqFrequencies.brilliance, gain: 0 }
];

export function useEqualizer() {
  const [bands, setBands] = useState<EQBand[]>(defaultBands);
  const [activePreset, setActivePreset] = useState("Flat");

  useEffect(() => {
    audioEngine.initialize();
  }, []);

  const setBandGain = (bandKey: EQBandKey, gain: number) => {
    audioEngine.setBandGain(bandKey, gain);
    setBands((currentBands) =>
      currentBands.map((band) => (band.key === bandKey ? { ...band, gain } : band))
    );
    setActivePreset("Custom");
  };

  const applyPreset = (presetName: string) => {
    const gains = presetGains[presetName];
    if (!gains) {
      return;
    }

    setBands((currentBands) =>
      currentBands.map((band) => {
        const gain = gains[band.key] ?? 0;
        audioEngine.setBandGain(band.key, gain);
        return {
          ...band,
          gain
        };
      })
    );
    setActivePreset(presetName);
  };

  const presetNames = useMemo(() => Object.keys(presetGains), []);

  return {
    bands,
    activePreset,
    presetNames,
    setBandGain,
    applyPreset
  };
}

