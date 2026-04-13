"use client";

import { useAudioController } from "@/frontend/components/providers/AudioProvider";
import { EQPresets } from "@/frontend/components/equalizer/EQPresets";
import { EQSlider } from "@/frontend/components/equalizer/EQSlider";


const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

export function EQPanel() {
  const { currentSong, bands, presetNames, activePreset, applyPreset, setBandGain } = useAudioController();

  return (
    <div 
      className="relative flex flex-col overflow-hidden p-6 rounded-3xl"
      style={{
        background: "#0c0c0cff",
        boxShadow: "0 4px 60px rgba(0,0,0,0.8), inset 0 -1px 0 rgba(0,0,0,0.7)",
      }}
    >
      {/* noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-3xl"
        style={{
          backgroundImage: NOISE_SVG,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
          mixBlendMode: "overlay",
          opacity: 0.5,
        }}
      />
      {/* inner border highlight */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-3xl"
        style={{ border: "1px solid rgba(255,255,255,0.04)" }}
      />

      {/* Ambient background blur */}
      

      <div className="relative z-20 flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-3xl text-white">Equalizer</p>
          <p className="mt-1 text-sm text-white/35">
            Five-band EQ with animated preset controls.
          </p>
        </div>
      </div>

      <div className="relative z-20 mt-6 space-y-5 border-t border-white/10 pt-6">
        <EQPresets activePreset={activePreset} onApply={applyPreset} presets={presetNames} />
        <div className="grid gap-4 xl:grid-cols-5">
          {bands.map((band) => (
            <div 
              key={band.key}
              className="rounded-[20px] border border-white/[0.01] bg-black/20 p-4 transition-all"
              style={{
                boxShadow: "inset 0 4px 10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.03)"
              }}
            >
              <EQSlider
                band={band}
                onChange={(gain) => setBandGain(band.key, gain)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

