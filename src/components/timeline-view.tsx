"use client";

import type { TimeSettings } from "@/types";
import type { CityData } from "city-timezones";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TimelineViewProps {
  city1: CityData;
  city2: CityData;
  settings: TimeSettings;
}

export default function TimelineView({ city1, city2, settings }: TimelineViewProps) {
  const timeDifference = useMemo(() => {
    const now = new Date();
    const city1Time = new Date(now.toLocaleString("en-US", { timeZone: city1.timezone }));
    const city2Time = new Date(now.toLocaleString("en-US", { timeZone: city2.timezone }));

    const diffMs = city2Time.getTime() - city1Time.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));

    return diffHours;
  }, [city1.timezone, city2.timezone]);

  const currentLocalHour = useMemo(() => {
    const now = new Date();
    return now.getHours();
  }, []);

  const timelineData = useMemo(() => {
    const hours = [];
    const now = new Date();

    const isInRange = (hourValue: number, min: number, max: number) => {
      if (max > 24) {
        const wrapMax = max - 24;
        return hourValue >= min || hourValue < wrapMax;
      }
      if (max > min) return hourValue >= min && hourValue < max;
      if (max < min) return hourValue >= min || hourValue < max;
      return false;
    };

    const fmt1 = new Intl.DateTimeFormat("en-US", { timeZone: city1.timezone, hour: "2-digit", hour12: false });
    const fmt2 = new Intl.DateTimeFormat("en-US", { timeZone: city2.timezone, hour: "2-digit", hour12: false });

    for (let hour = 0; hour < 24; hour++) {
      const testDate = new Date(now);
      testDate.setHours(hour, 0, 0, 0);

      const city1Hour = Number.parseInt(fmt1.format(testDate));
      const city2Hour = Number.parseInt(fmt2.format(testDate));

      const city1InRange = isInRange(city1Hour, settings.minHour, settings.maxHour);
      const city2InRange = isInRange(city2Hour, settings.minHour, settings.maxHour);

      hours.push({
        hour,
        city1Hour,
        city2Hour,
        city1InRange,
        city2InRange,
        bothInRange: city1InRange && city2InRange,
      });
    }

    return hours;
  }, [city1, city2, settings]);

  const commonHours = timelineData.filter((h) => h.bothInRange);
  const formatHour = (hour: number) => {
    const h = hour % 24;
    const hh = h.toString().padStart(2, "0");
    return `${hh}:00`;
  };

  const cellClass = (inRange: boolean, both: boolean) =>
    inRange ? (both ? "bg-emerald-700 text-white" : "bg-orange-200 text-slate-800") : "bg-muted text-muted-foreground";

  type HourRow = (typeof timelineData)[number];

  const CityColumn = ({
    cityName,
    selectHour,
    selectInRange,
  }: {
    cityName: string;
    selectHour: (row: HourRow) => number;
    selectInRange: (row: HourRow) => boolean;
  }) => (
    <div className="flex flex-col gap-1">
      {timelineData.map((row, i) => {
        const inRange = selectInRange(row);
        const both = row.bothInRange;
        const hour = selectHour(row);
        return (
          <div
            key={i}
            className={`h-6 rounded-sm flex items-center justify-center text-[10px] ${cellClass(inRange, both)}`}
            title={`${formatHour(i)} (${formatHour(hour)} in ${cityName})`}>
            {inRange || both ? formatHour(hour) : ""}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center p-4 bg-muted rounded-lg">
        <p className="text-lg font-medium text-foreground">
          {commonHours.length > 0 ? (
            <>
              <span className="text-primary font-bold">{commonHours.length} hours</span> of overlapping daytime
            </>
          ) : (
            <span className="text-destructive">No overlapping daytime hours</span>
          )}
        </p>
        <div className="mt-2 flex justify-center">
          <Badge variant={timeDifference === 0 ? "default" : "outline"} className="text-xs">
            {timeDifference === 0
              ? "Same timezone"
              : `${city2.city} is ${Math.abs(timeDifference)} hour${Math.abs(timeDifference) !== 1 ? "s" : ""} ${timeDifference > 0 ? "ahead of" : "behind"} ${city1.city}`}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-[40px_1fr_1fr] gap-3">
        <div />
        <div className="text-xs font-medium text-foreground text-center">{city1.city}</div>
        <div className="text-xs font-medium text-foreground text-center">{city2.city}</div>

        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          {Array.from({ length: 24 }, (_, i) => {
            return (
              <div
                key={i}
                className={cn(
                  "h-6 flex items-center justify-end pr-1",
                  i === currentLocalHour && "font-serif font-bold text-foreground bg-blue-300/10 rounded-sm px-1"
                )}>
                {formatHour(i)}
              </div>
            );
          })}
        </div>

        <CityColumn cityName={city1.city} selectHour={(r) => r.city1Hour} selectInRange={(r) => r.city1InRange} />
        <CityColumn cityName={city2.city} selectHour={(r) => r.city2Hour} selectInRange={(r) => r.city2InRange} />
      </div>

      <div className="flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-700 border rounded-sm shrink-0" />
          <span>Common daytime</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-200 border rounded-sm shrink-0" />
          <span>Unilateral daytime</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-muted border rounded-sm shrink-0" />
          <span>Nighttime</span>
        </div>
      </div>
    </div>
  );
}
