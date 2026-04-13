"use client";

import { Button } from "@/frontend/components/ui/Button";

interface EQPresetsProps {
  presets: string[];
  activePreset: string;
  onApply: (preset: string) => void;
}

export function EQPresets({ presets, activePreset, onApply }: EQPresetsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((preset) => (
        <Button
          className="px-4 py-2 text-xs"
          key={preset}
          onClick={() => onApply(preset)}
          type="button"
          variant={activePreset === preset ? "primary" : "secondary"}
        >
          {preset}
        </Button>
      ))}
    </div>
  );
}

