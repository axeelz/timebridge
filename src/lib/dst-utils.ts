export enum DSTStatus {
  SUMMER = "summer",
  STANDARD = "standard",
  NONE = "none",
}

export const dstLabels = {
  [DSTStatus.SUMMER]: "Daylight Saving Time",
  [DSTStatus.STANDARD]: "Standard Time",
  [DSTStatus.NONE]: "No Daylight Saving Time",
} as const;

export const dstVariants = {
  [DSTStatus.SUMMER]: "default",
  [DSTStatus.STANDARD]: "white",
  [DSTStatus.NONE]: "outline",
} as const;

export function getDSTStatus(timezone: string, date: Date = new Date()): DSTStatus {
  try {
    const janDate = new Date(date.getFullYear(), 0, 1); // January 1st
    const julDate = new Date(date.getFullYear(), 6, 1); // July 1st

    const janOffset = getTimeZoneOffsetInMinutes(janDate, timezone);
    const julOffset = getTimeZoneOffsetInMinutes(julDate, timezone);

    // If offsets are the same year-round, there is no DST
    if (janOffset === julOffset) {
      return DSTStatus.NONE;
    }

    // DST moves clocks forward, which increases the numeric UTC offset
    // (e.g., -300 -> -240 in US, +600 -> +660 in AU).
    const dstOffset = Math.max(janOffset, julOffset);
    const currentOffset = getTimeZoneOffsetInMinutes(date, timezone);

    if (currentOffset === dstOffset) {
      return DSTStatus.SUMMER;
    }

    return DSTStatus.STANDARD;
  } catch (error) {
    console.warn(`Failed to determine DST status for ${timezone}:`, error);
    return DSTStatus.NONE;
  }
}

/**
 * Computes the UTC offset, in minutes, for a given Date in a specific IANA time zone.
 * Positive values are east of UTC, negative values are west of UTC.
 */
function getTimeZoneOffsetInMinutes(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const partMap: Record<string, string> = Object.create(null);
  for (const part of parts) {
    partMap[part.type] = part.value;
  }

  const year = Number(partMap.year);
  const month = Number(partMap.month) - 1; // JS months are 0-based
  const day = Number(partMap.day);
  const hour = Number(partMap.hour);
  const minute = Number(partMap.minute);
  const second = Number(partMap.second);

  const asUTC = Date.UTC(year, month, day, hour, minute, second);
  // Difference between the wall time in the target zone and the actual UTC time
  // Positive when the zone is ahead of UTC, negative when behind
  return Math.round((asUTC - date.getTime()) / 60000);
}
