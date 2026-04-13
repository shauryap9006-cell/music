import { Howler } from "howler";

import type { EQBandKey } from "@/frontend/types";

const bandFrequencies: Record<EQBandKey, number> = {
  subBass: 60,
  bass: 250,
  midrange: 1000,
  presence: 4000,
  brilliance: 12000
};

class AudioEngine {
  private analyser: AnalyserNode | null = null;

  private filters: Partial<Record<EQBandKey, BiquadFilterNode>> = {};

  private chainReady = false;

  initialize() {
    const context = Howler.ctx;
    const masterGain = Howler.masterGain;

    if (typeof window === "undefined" || !context || !masterGain) {
      return null;
    }

    if (!this.analyser) {
      this.analyser = context.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.85;
    }

    if (!this.filters.subBass) {
      (Object.keys(bandFrequencies) as EQBandKey[]).forEach((bandKey) => {
        const filter = context.createBiquadFilter();
        filter.type = "peaking";
        filter.frequency.value = bandFrequencies[bandKey];
        filter.Q.value = 1;
        filter.gain.value = 0;
        this.filters[bandKey] = filter;
      });
    }

    if (!this.chainReady) {
      try {
        masterGain.disconnect();
      } catch {
        // no-op
      }

      let previousNode: AudioNode = masterGain;
      (Object.keys(bandFrequencies) as EQBandKey[]).forEach((bandKey) => {
        const filter = this.filters[bandKey];
        if (!filter) {
          return;
        }

        previousNode.connect(filter);
        previousNode = filter;
      });

      previousNode.connect(this.analyser);
      this.analyser.connect(context.destination);
      this.chainReady = true;
    }

    return {
      analyser: this.analyser,
      filters: this.filters as Record<EQBandKey, BiquadFilterNode>
    };
  }

  getAnalyser() {
    return this.initialize()?.analyser ?? null;
  }

  setBandGain(bandKey: EQBandKey, gain: number) {
    const node = this.initialize()?.filters[bandKey];
    if (node) {
      node.gain.value = gain;
    }
  }

  resetBands() {
    (Object.keys(bandFrequencies) as EQBandKey[]).forEach((bandKey) => {
      this.setBandGain(bandKey, 0);
    });
  }
}

export const audioEngine = new AudioEngine();
export const eqFrequencies = bandFrequencies;

