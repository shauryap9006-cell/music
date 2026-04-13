"use client";

import { useAudioController } from "@/frontend/components/providers/AudioProvider";
import { EQPresets } from "@/frontend/components/equalizer/EQPresets";
import { EQSlider } from "@/frontend/components/equalizer/EQSlider";
import { GlassCard } from "@/frontend/components/ui/GlassCard";

export function EQPanel() {
  const { bands, presetNames, activePreset, applyPreset, setBandGain } = useAudioController();

  return (
    <GlassCard className="overflow-hidden p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-3xl text-white">Equalizer</p>
          <p className="mt-1 text-sm text-white/35">
            Five-band EQ with animated preset controls.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-5 border-t border-white/6 pt-5">
        <EQPresets activePreset={activePreset} onApply={applyPreset} presets={presetNames} />
        <div className="grid gap-4 xl:grid-cols-5">
          {bands.map((band) => (
            <EQSlider
              band={band}
              key={band.key}
              onChange={(gain) => setBandGain(band.key, gain)}
            />
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

