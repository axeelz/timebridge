"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Clock, Settings, Globe } from "lucide-react";
import CityAutocomplete from "./city-autocomplete";
import TimelineView from "./timeline-view";
import SettingsPanel from "./settings-panel";
import type { CityData } from "city-timezones";
import type { TimeSettings } from "@/types";

export default function App() {
  const [city1, setCity1] = useState<CityData | null>(null);
  const [city2, setCity2] = useState<CityData | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [showSettings, setShowSettings] = useState(false);
  const [timeSettings, setTimeSettings] = useState<TimeSettings>({ minHour: 7, maxHour: 24 });

  const city2Ref = useRef<HTMLInputElement | null>(null);
  const settingsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeFormatter1 = useMemo(
    () =>
      city1
        ? new Intl.DateTimeFormat("en-US", {
            timeZone: city1.timezone,
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : null,
    [city1?.timezone]
  );

  const timeFormatter2 = useMemo(
    () =>
      city2
        ? new Intl.DateTimeFormat("en-US", {
            timeZone: city2.timezone,
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : null,
    [city2?.timezone]
  );

  const currentTime1 = timeFormatter1 ? timeFormatter1.format(now) : "";
  const currentTime2 = timeFormatter2 ? timeFormatter2.format(now) : "";

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Globe className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-serif font-bold text-foreground">TimeBridge</h1>
        </div>
        <p className="text-muted-foreground text-lg">Find common daytime hours between two cities</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <div className="space-y-4">
            <Label className="text-sm font-medium text-foreground">First City</Label>
            <CityAutocomplete
              onCitySelect={setCity1}
              onSelectionComplete={() => city2Ref.current?.focus()}
              placeholder="Search for a city..."
            />
            {city1 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-serif font-bold text-foreground">{currentTime1}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {city1.city}, {city1.country}
                </p>
                <p className="text-xs text-muted-foreground">{city1.timezone}</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <Label className="text-sm font-medium text-foreground">Second City</Label>
            <CityAutocomplete
              ref={city2Ref}
              onCitySelect={setCity2}
              onSelectionComplete={() => {
                city2Ref.current?.blur();
                setTimeout(() => settingsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
              }}
              placeholder="Search for another city..."
            />
            {city2 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-serif font-bold text-foreground">{currentTime2}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {city2.city}, {city2.country}
                </p>
                <p className="text-xs text-muted-foreground">{city2.timezone}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="flex justify-center mb-6 scroll-mt-4" ref={settingsRef}>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onPointerDown={() => setShowSettings(!showSettings)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setShowSettings(!showSettings);
            }
          }}>
          <Settings className="h-4 w-4" />
          Daytime Settings
        </Button>
      </div>

      {showSettings && (
        <div className="mb-8">
          <SettingsPanel settings={timeSettings} onSettingsChange={setTimeSettings} />
        </div>
      )}

      {city1 && city2 && (
        <Card className="p-6">
          <h2 className="text-xl font-serif font-bold text-foreground mb-4">Common Daytime Hours</h2>
          <TimelineView city1={city1} city2={city2} settings={timeSettings} />
        </Card>
      )}

      {(!city1 || !city2) && (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Select two cities above to see their common daytime hours</p>
        </Card>
      )}
    </div>
  );
}
