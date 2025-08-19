"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { TimeSettings } from "@/types";

interface SettingsPanelProps {
  settings: TimeSettings;
  onSettingsChange: (settings: TimeSettings) => void;
}

export default function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const formatHour = (hour: number) => {
    const h = ((hour % 24) + 24) % 24;
    const hh = h.toString().padStart(2, "0");
    return `${hh}:00`;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-serif font-bold text-foreground mb-4">Daytime Hours Settings</h3>
      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">
            Start of Daytime: {formatHour(settings.minHour)}
          </Label>
          <Slider
            value={[settings.minHour]}
            onValueChange={([value]) => onSettingsChange({ ...settings, minHour: value ?? settings.minHour })}
            max={13}
            min={4}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">
            End of Daytime: {formatHour(settings.maxHour)}
            {settings.maxHour >= 24 || settings.maxHour <= settings.minHour ? " (next day)" : ""}
          </Label>
          <Slider
            value={[settings.maxHour]}
            onValueChange={([value]) => onSettingsChange({ ...settings, maxHour: value ?? settings.maxHour })}
            max={28}
            min={18}
            step={1}
            className="w-full"
          />
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            Daytime window: {formatHour(settings.minHour)} - {formatHour(settings.maxHour)}
          </p>
          <p>Duration: {(settings.maxHour - settings.minHour + 24) % 24} hours</p>
        </div>
      </div>
    </Card>
  );
}
