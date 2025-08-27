import { describe, test, expect } from "bun:test";
import { getDSTStatus, DSTStatus } from "./dst-utils";

describe("getDSTStatus", () => {
  const julDate = new Date(2024, 6, 15);
  const janDate = new Date(2024, 0, 15);

  test("US cities with DST", () => {
    // New York
    expect(getDSTStatus("America/New_York", julDate)).toBe(DSTStatus.SUMMER);
    expect(getDSTStatus("America/New_York", janDate)).toBe(DSTStatus.STANDARD);

    // Los Angeles
    expect(getDSTStatus("America/Los_Angeles", julDate)).toBe(DSTStatus.SUMMER);
    expect(getDSTStatus("America/Los_Angeles", janDate)).toBe(DSTStatus.STANDARD);

    // Chicago
    expect(getDSTStatus("America/Chicago", julDate)).toBe(DSTStatus.SUMMER);
    expect(getDSTStatus("America/Chicago", janDate)).toBe(DSTStatus.STANDARD);
  });

  test("European cities with DST", () => {
    // London
    expect(getDSTStatus("Europe/London", julDate)).toBe(DSTStatus.SUMMER);
    expect(getDSTStatus("Europe/London", janDate)).toBe(DSTStatus.STANDARD);

    // Paris
    expect(getDSTStatus("Europe/Paris", julDate)).toBe(DSTStatus.SUMMER);
    expect(getDSTStatus("Europe/Paris", janDate)).toBe(DSTStatus.STANDARD);

    // Berlin
    expect(getDSTStatus("Europe/Berlin", julDate)).toBe(DSTStatus.SUMMER);
    expect(getDSTStatus("Europe/Berlin", janDate)).toBe(DSTStatus.STANDARD);
  });

  test("Cities without DST", () => {
    // Arizona (most of it)
    expect(getDSTStatus("America/Phoenix", julDate)).toBe(DSTStatus.NONE);
    expect(getDSTStatus("America/Phoenix", janDate)).toBe(DSTStatus.NONE);

    // Japan
    expect(getDSTStatus("Asia/Tokyo", julDate)).toBe(DSTStatus.NONE);
    expect(getDSTStatus("Asia/Tokyo", janDate)).toBe(DSTStatus.NONE);

    // China
    expect(getDSTStatus("Asia/Shanghai", julDate)).toBe(DSTStatus.NONE);
    expect(getDSTStatus("Asia/Shanghai", janDate)).toBe(DSTStatus.NONE);

    // Hawaii - always standard time
    expect(getDSTStatus("Pacific/Honolulu", julDate)).toBe(DSTStatus.NONE);
    expect(getDSTStatus("Pacific/Honolulu", janDate)).toBe(DSTStatus.NONE);

    // Middle East / Asia - year-round standard time
    expect(getDSTStatus("Asia/Dubai", julDate)).toBe(DSTStatus.NONE);
    expect(getDSTStatus("Asia/Dubai", janDate)).toBe(DSTStatus.NONE);

    expect(getDSTStatus("Asia/Kolkata", julDate)).toBe(DSTStatus.NONE);
    expect(getDSTStatus("Asia/Kolkata", janDate)).toBe(DSTStatus.NONE);

    // Africa - most don't observe DST
    expect(getDSTStatus("Africa/Lagos", julDate)).toBe(DSTStatus.NONE);
    expect(getDSTStatus("Africa/Lagos", janDate)).toBe(DSTStatus.NONE);

    // UTC - always standard
    expect(getDSTStatus("UTC", julDate)).toBe(DSTStatus.NONE);
    expect(getDSTStatus("UTC", janDate)).toBe(DSTStatus.NONE);
  });

  test("Southern hemisphere DST behavior", () => {
    // Australia (Sydney) observes DST: January is DST, July is Standard
    expect(getDSTStatus("Australia/Sydney", janDate)).toBe(DSTStatus.SUMMER); // January (AU summer)
    expect(getDSTStatus("Australia/Sydney", julDate)).toBe(DSTStatus.STANDARD); // July (AU winter)

    // New Zealand (Auckland) observes DST similarly
    expect(getDSTStatus("Pacific/Auckland", janDate)).toBe(DSTStatus.SUMMER); // January
    expect(getDSTStatus("Pacific/Auckland", julDate)).toBe(DSTStatus.STANDARD); // July

    // Chile (Santiago) observes DST: January is DST, July is Standard
    expect(getDSTStatus("America/Santiago", janDate)).toBe(DSTStatus.SUMMER); // January
    expect(getDSTStatus("America/Santiago", julDate)).toBe(DSTStatus.STANDARD); // July

    // Queensland (Brisbane) does not observe DST
    expect(getDSTStatus("Australia/Brisbane", janDate)).toBe(DSTStatus.NONE);
    expect(getDSTStatus("Australia/Brisbane", julDate)).toBe(DSTStatus.NONE);
  });

  test("DST transitions around typical changeover dates (2024)", () => {
    // US (New York) DST: starts Mar 10, 2024; ends Nov 3, 2024
    const nyStandard = new Date(2024, 2, 1); // Mar 1
    const nySummer = new Date(2024, 3, 15); // Apr 15
    const nyLateSummer = new Date(2024, 9, 15); // Oct 15
    const nyLateStandard = new Date(2024, 10, 15); // Nov 15
    expect(getDSTStatus("America/New_York", nyStandard)).toBe(DSTStatus.STANDARD);
    expect(getDSTStatus("America/New_York", nySummer)).toBe(DSTStatus.SUMMER);
    expect(getDSTStatus("America/New_York", nyLateSummer)).toBe(DSTStatus.SUMMER);
    expect(getDSTStatus("America/New_York", nyLateStandard)).toBe(DSTStatus.STANDARD);

    // UK (London) DST: starts Mar 31, 2024; ends Oct 27, 2024
    const ukStandard = new Date(2024, 2, 15); // Mar 15
    const ukSummer = new Date(2024, 3, 15); // Apr 15
    const ukLateSummer = new Date(2024, 9, 15); // Oct 15
    const ukLateStandard = new Date(2024, 10, 15); // Nov 15
    expect(getDSTStatus("Europe/London", ukStandard)).toBe(DSTStatus.STANDARD);
    expect(getDSTStatus("Europe/London", ukSummer)).toBe(DSTStatus.SUMMER);
    expect(getDSTStatus("Europe/London", ukLateSummer)).toBe(DSTStatus.SUMMER);
    expect(getDSTStatus("Europe/London", ukLateStandard)).toBe(DSTStatus.STANDARD);

    // Australia (Sydney) DST: ends Apr 7, 2024; starts Oct 6, 2024
    const auSummer = new Date(2024, 0, 15); // Jan 15
    const auStandard = new Date(2024, 6, 15); // Jul 15
    const auSpringDST = new Date(2024, 9, 15); // Oct 15
    expect(getDSTStatus("Australia/Sydney", auSummer)).toBe(DSTStatus.SUMMER);
    expect(getDSTStatus("Australia/Sydney", auStandard)).toBe(DSTStatus.STANDARD);
    expect(getDSTStatus("Australia/Sydney", auSpringDST)).toBe(DSTStatus.SUMMER);
  });

  test("edge cases", () => {
    // Invalid timezone
    expect(getDSTStatus("Invalid/Timezone")).toBe(DSTStatus.NONE);

    // Should not throw with current date
    expect(() => getDSTStatus("America/New_York")).not.toThrow();
  });
});
