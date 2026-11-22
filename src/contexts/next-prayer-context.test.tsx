// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextPrayerProvider, useNextPrayer } from "./next-prayer-context";

const data = vi.hoisted(() => ({
	rows: [
		{ prayer: "jumuah", weekday: "friday", type: "fixed", fixed_time: "13:00" },
	],
}));
vi.mock("@tanstack/react-query", () => ({
	useQuery: () => ({ data: data.rows }),
	queryOptions: (value: unknown) => value,
}));
vi.mock("@/api/iqama", async (importOriginal) => {
	const original = await importOriginal<typeof import("@/api/iqama")>();
	return { ...original, iqamaQueryOptions: () => ({}) };
});
const times = {
	fajr: "06:00",
	dhuhr: "12:00",
	jumah: "",
	asr: "15:00",
	maghrib: "17:00",
	isha: "19:00",
};
function Result() {
	const value = useNextPrayer();
	return (
		<div>
			{value.nextPrayerName}:{value.nextPrayerTime}
			{value.nextPrayerIsTomorrow ? ":tomorrow" : ""}
		</div>
	);
}
beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date(2026, 10, 6, 12, 59, 59));
});

describe("next prayer after Isha", () => {
	it("keeps Isha through iqama, then selects tomorrow's Fajr and rolls over at midnight", () => {
		data.rows = [
			{ prayer: "isha", weekday: "friday", type: "fixed", fixed_time: "19:15" },
		];
		vi.setSystemTime(new Date(2026, 10, 6, 19, 10));
		render(
			<NextPrayerProvider
				prayerTimes={{ ...times, gregorian_date: "2026-11-06" }}
				tomorrowPrayerTimes={{
					...times,
					fajr: "06:07",
					gregorian_date: "2026-11-07",
				}}
			>
				<Result />
			</NextPrayerProvider>,
		);
		expect(screen.getByText("isha:19:15")).toBeTruthy();
		act(() => vi.advanceTimersByTime(5 * 60_000 + 2000));
		expect(screen.getByText("fajr:06:07:tomorrow")).toBeTruthy();
		vi.setSystemTime(new Date(2026, 10, 7, 0, 0));
		act(() => vi.advanceTimersByTime(1000));
		expect(screen.getByText("fajr:06:07")).toBeTruthy();
		data.rows = [
			{
				prayer: "jumuah",
				weekday: "friday",
				type: "fixed",
				fixed_time: "13:00",
			},
		];
	});

	it("does not present today's Fajr as tomorrow's when tomorrow is unavailable", () => {
		vi.setSystemTime(new Date(2026, 10, 6, 21));
		render(
			<NextPrayerProvider prayerTimes={times}>
				<Result />
			</NextPrayerProvider>,
		);
		expect(screen.getByText(":")).toBeTruthy();
	});
});
afterEach(() => {
	cleanup();
	vi.useRealTimers();
});
describe("next prayer without Jumuah reference", () => {
	it("selects fixed iqama, retains it at the target, then advances", () => {
		render(
			<NextPrayerProvider prayerTimes={times}>
				<Result />
			</NextPrayerProvider>,
		);
		expect(screen.getByText("jumah:13:00")).toBeTruthy();
		act(() => vi.advanceTimersByTime(2000));
		expect(screen.getByText("jumah:13:00")).toBeTruthy();
		act(() => vi.advanceTimersByTime(1000));
		expect(screen.getByText("asr:15:00")).toBeTruthy();
	});
	it("does not use offset iqama without a reference time", () => {
		data.rows[0] = {
			prayer: "jumuah",
			weekday: "friday",
			type: "offset",
			fixed_time: "13:00",
		};
		render(
			<NextPrayerProvider prayerTimes={times}>
				<Result />
			</NextPrayerProvider>,
		);
		expect(screen.getByText("asr:15:00")).toBeTruthy();
		data.rows[0] = {
			prayer: "jumuah",
			weekday: "friday",
			type: "fixed",
			fixed_time: "13:00",
		};
	});
});
