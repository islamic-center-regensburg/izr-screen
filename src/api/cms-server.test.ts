import { beforeEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => ({
	readSingleItemsPrayerTimes: vi.fn(),
	readItemsIqamaTimes: vi.fn(),
	readItemsScreenConfig: vi.fn(),
}));
vi.mock("./generated/sdk.gen", () => sdk);
vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => ({
		inputValidator: (validate: (value: string) => string) => ({
			handler:
				(handler: (arg: { data: string }) => unknown) =>
				({ data }: { data: string }) =>
					handler({ data: validate(data) }),
		}),
		handler: (handler: () => unknown) => handler,
	}),
}));

import { iqamaTimesQueryOptions as iqamaQueryOptions } from "./collections/iqama-times/queries";
import { prayerTimesDetailQueryOptions as prayerTimesQueryOptions } from "./collections/prayer-times/queries";
import { screenConfigQueryOptions as screenSettingsQueryOptions } from "./collections/screen-config/queries";

beforeEach(() => vi.resetAllMocks());

describe("CMS query options", () => {
	it("reads a date-keyed prayer record and rejects malformed dates", async () => {
		const row = { date: "2026-11-22", fajr: "06:00" };
		sdk.readSingleItemsPrayerTimes.mockResolvedValue({ data: { data: row } });
		const query = prayerTimesQueryOptions("2026-11-22");
		expect(await query.queryFn!({} as never)).toEqual(row);
		expect(sdk.readSingleItemsPrayerTimes).toHaveBeenCalledWith({
			path: { id: "2026-11-22" },
			throwOnError: true,
		});
		await expect(async () =>
			prayerTimesQueryOptions("../other").queryFn!({} as never),
		).rejects.toThrow("Invalid date");
	});
	it("reads iqamas and screen singleton with errors propagated", async () => {
		sdk.readItemsIqamaTimes.mockResolvedValue({ data: { data: [] } });
		sdk.readItemsScreenConfig.mockRejectedValue(new Error("CMS unavailable"));
		expect(await iqamaQueryOptions().queryFn!({} as never)).toEqual([]);
		expect(sdk.readItemsIqamaTimes).toHaveBeenCalledWith({
			query: { limit: -1, sort: ["id"] },
			throwOnError: true,
		});
		await expect(
			screenSettingsQueryOptions().queryFn!({} as never),
		).rejects.toThrow("CMS unavailable");
	});
});
