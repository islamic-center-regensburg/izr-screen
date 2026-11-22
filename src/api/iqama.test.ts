import { describe, expect, it } from "vitest";
import { selectIqama } from "./iqama";

describe("CMS iqama selection", () => {
	it("selects by weekday and maps Friday prayer without using inactive fields", () => {
		const rows = [
			{
				prayer: "jumuah",
				weekday: "friday",
				type: "offset",
				offset_minutes: 0,
				fixed_time: "13:00",
			},
			{
				prayer: "jumuah",
				weekday: "saturday",
				type: "fixed",
				fixed_time: "14:00",
			},
		];
		expect(selectIqama(rows, "jumah", new Date(2026, 10, 6))).toEqual(rows[0]);
		expect(selectIqama(rows, "jumah", new Date(2026, 10, 8))).toBeUndefined();
	});
});
