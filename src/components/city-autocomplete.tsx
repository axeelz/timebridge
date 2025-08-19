"use client";

import { useState, useEffect, useId, useDeferredValue } from "react";
import type { FocusEvent as ReactFocusEvent, KeyboardEvent as ReactKeyboardEvent, RefObject } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import cityTimezones, { type CityData } from "city-timezones";

interface CityAutocompleteProps {
  onCitySelect: (city: CityData) => void;
  onSelectionComplete?: () => void;
  placeholder?: string;
  ref?: RefObject<HTMLInputElement | null>;
}

const CITY_DATA = cityTimezones.cityMapping;

export default function CityAutocomplete({
  onCitySelect,
  onSelectionComplete,
  placeholder = "Search for a city...",
  ref,
}: CityAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<CityData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const listboxId = useId();
  const deferredQuery = useDeferredValue(query);

  const handleContainerBlur = (event: ReactFocusEvent<HTMLDivElement>) => {
    const nextFocusedElement = event.relatedTarget as Node | null;
    const isFocusStillInside = event.currentTarget.contains(nextFocusedElement);
    if (!isFocusStillInside) {
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const searchCities = (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const cities = CITY_DATA.filter((city) => city.city.toLowerCase().startsWith(searchQuery.toLowerCase()))
        .sort((a, b) => (b.pop || 0) - (a.pop || 0))
        .slice(0, 15);
      setSuggestions(cities);
    } catch (error) {
      console.error("Error filtering cities:", error);
      setSuggestions([]);
    }
  };

  useEffect(() => {
    searchCities(deferredQuery);
  }, [deferredQuery]);

  const handleCitySelect = (city: CityData) => {
    setQuery(city.city);
    setShowSuggestions(false);
    onCitySelect(city);
    onSelectionComplete?.();
  };

  return (
    <div className="relative" onBlur={handleContainerBlur} onKeyDown={handleKeyDown}>
      <Input
        ref={ref}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={(e) => {
          e.target.select();
          setShowSuggestions(true);
        }}
        placeholder={placeholder}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showSuggestions}
        aria-controls={listboxId}
        aria-label={placeholder}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        className="w-full"
      />

      {showSuggestions && suggestions.length > 0 && (
        <Card
          id={listboxId}
          role="listbox"
          className="absolute top-full left-0 right-0 z-10 mt-1 max-h-60 overflow-y-auto">
          <div className="p-2">
            {suggestions.map((city, index) => (
              <button
                key={index}
                onMouseDown={(e) => {
                  // Prevent input blur
                  e.preventDefault();
                }}
                onClick={() => {
                  handleCitySelect(city);
                }}
                role="option"
                type="button"
                className="w-full text-left p-3 hover:bg-muted rounded-md transition-colors flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">{city.city}</div>
                  <div className="text-sm text-muted-foreground">
                    {city.country} • {city.timezone}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {showSuggestions && query.length >= 2 && suggestions.length === 0 && (
        <Card className="absolute top-full left-0 right-0 z-10 mt-1">
          <div className="p-4 text-center text-muted-foreground">No cities found</div>
        </Card>
      )}
    </div>
  );
}
