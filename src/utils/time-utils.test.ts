import { afterEach, describe, expect, it, vi } from "vitest";
import { nextCalendarDate } from "./calendar-date";
import { setDisplayTimezone, timeUntilTomorrow } from "./time-utils";

afterEach(() => {
	setDisplayTimezone(undefined);
	vi.useRealTimers();
});

describe("tomorrow's prayer time", () => {
	it.each([
		["2026-03-28T19:00:00Z", 9],
		["2026-10-24T18:00:00Z", 11],
	])(
		"accounts for the Berlin daylight-saving change after %s",
		(now, hours) => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date(now));
			setDisplayTimezone("Europe/Berlin");
			expect(timeUntilTomorrow("06:00")).toBe(hours * 60 * 60 * 1000);
		},
	);

	it("advances dates across month, leap-year, and year boundaries", () => {
		expect(nextCalendarDate("2028-02-28")).toBe("2028-02-29");
		expect(nextCalendarDate("2026-12-31")).toBe("2027-01-01");
	});
});
