// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PrayerTimesOut } from "@/api/gen";
import PrayerTimesGrid from "../../prayer-times-grid";
import PrayerCard from "./PrayerCard";

const state = vi.hoisted(() => ({
	isManual: false,
	navigate: vi.fn(),
	nextPrayerName: "dhuhr",
	nextPrayerIsTomorrow: false,
	fixedTime: "12:05",
	iqamas: [] as Array<{
		prayer: string;
		weekday: string;
		type: string;
		fixed_time: string;
	}>,
}));

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => state.navigate,
}));

vi.mock("@/contexts/screen-config-context", () => ({
	useScreenConfig: () => state,
}));

vi.mock("@/contexts", () => ({
	useNextPrayer: () => ({
		nextPrayerName: state.nextPrayerName,
		nextPrayerTime: state.fixedTime,
		nextPrayerIsTomorrow: state.nextPrayerIsTomorrow,
	}),
}));

vi.mock("@/hooks/usePrayerIqama", () => ({
	default: () => ({
		prayerIqama: { mode: "fixed", fixed_time: state.fixedTime },
		data: state.iqamas,
	}),
}));

vi.mock("@/utils/time-utils", () => ({
	nowTime: () => new Date(),
	timeUntilTomorrow: (time: string) => {
		const now = new Date();
		const [hours, minutes] = time.split(":").map(Number);
		const target = new Date(now);
		target.setDate(target.getDate() + 1);
		target.setHours(hours, minutes, 0, 0);
		return target.getTime() - now.getTime();
	},
}));

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date(2026, 10, 5, 12, 5));
	state.isManual = false;
	state.navigate.mockReset();
	state.nextPrayerName = "dhuhr";
	state.nextPrayerIsTomorrow = false;
	state.fixedTime = "12:05";
	state.iqamas = [];
});

it("features tomorrow's Fajr and its weekday iqama without activating today's Fajr card", () => {
	vi.setSystemTime(new Date(2026, 10, 6, 20));
	state.nextPrayerName = "fajr";
	state.nextPrayerIsTomorrow = true;
	state.fixedTime = "06:07";
	state.iqamas = [
		{ prayer: "fajr", weekday: "friday", type: "fixed", fixed_time: "06:10" },
		{ prayer: "fajr", weekday: "saturday", type: "fixed", fixed_time: "06:30" },
	];
	const { container } = render(
		<PrayerTimesGrid prayerTimes={{ fajr: "06:00" } as PrayerTimesOut} />,
	);
	const featured = container.querySelector(".prayer-featured");
	expect(featured?.textContent).toContain("Morgen");
	expect(featured?.textContent).toContain("06:07");
	expect(featured?.textContent).toContain("06:30");
	expect(featured?.textContent).not.toContain("06:10");
	expect(featured?.textContent).toContain("Bis Adhan");
	expect(featured?.querySelector('[role="timer"]')?.textContent).toBe(
		"10:07:00",
	);
	expect(
		container.querySelector('.prayer-card[aria-current="true"]'),
	).toBeNull();
	expect(state.navigate).not.toHaveBeenCalled();
});

it("always shows six prayers and Friday iqamas, without a second navigation owner", () => {
	vi.setSystemTime(new Date(2026, 10, 6, 12, 5));
	state.nextPrayerName = "jumah";
	state.iqamas = [
		{
			prayer: "jumuah",
			weekday: "friday",
			type: "fixed",
			fixed_time: "12:05:00",
		},
		{
			prayer: "jumuah",
			weekday: "friday",
			type: "fixed",
			fixed_time: "13:00:00",
		},
	];
	const times = { dhuhr: "12:00", jumah: "" } as unknown as PrayerTimesOut;
	const view = render(<PrayerTimesGrid prayerTimes={times} />);
	expect(
		view.container.querySelectorAll(".prayer-grid__cards .prayer-card"),
	).toHaveLength(6);
	expect(state.navigate).toHaveBeenCalledTimes(1);
	expect(screen.getAllByText("13:00")).toHaveLength(2);
	state.nextPrayerName = "asr";
	state.fixedTime = "15:00";
	view.rerender(<PrayerTimesGrid prayerTimes={times} />);
	expect(view.container.querySelector(".prayer-featured h2")?.textContent).toBe(
		"Asr",
	);
	state.nextPrayerName = null as unknown as string;
	view.rerender(<PrayerTimesGrid prayerTimes={times} />);
	expect(screen.getByText("Nächste Gebetszeit nicht verfügbar")).toBeTruthy();
});

it("displays Friday Jumuah iqamas on weekdays without triggering Jumuah navigation", () => {
	vi.setSystemTime(new Date(2026, 10, 5, 12, 5));
	state.nextPrayerName = "dhuhr";
	state.iqamas = [
		{
			prayer: "jumuah",
			weekday: "friday",
			type: "fixed",
			fixed_time: "13:00:00",
		},
	];
	render(
		<PrayerTimesGrid prayerTimes={{ dhuhr: "12:00" } as PrayerTimesOut} />,
	);
	expect(screen.getByText("13:00")).toBeTruthy();
	expect(state.navigate).toHaveBeenCalledTimes(1);
	expect(state.navigate).toHaveBeenCalledWith({
		to: "/no-phone/$countdown",
		params: { countdown: "7" },
	});
});

afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

describe("Iqama navigation", () => {
	it("preserves the no-phone transition in automatic mode", () => {
		render(<PrayerCard prayerName="dhuhr" prayerTime="12:00" />);
		expect(state.navigate).toHaveBeenCalledWith({
			to: "/no-phone/$countdown",
			params: { countdown: "7" },
		});
	});

	it("does not leave prayer times in manual mode", () => {
		state.isManual = true;
		render(<PrayerCard prayerName="dhuhr" prayerTime="12:00" />);
		expect(state.navigate).not.toHaveBeenCalled();
	});

	it("resumes the Iqama transition when manual mode ends", () => {
		state.isManual = true;
		const { rerender } = render(
			<PrayerCard prayerName="dhuhr" prayerTime="12:00" />,
		);
		expect(state.navigate).not.toHaveBeenCalled();
		state.isManual = false;
		rerender(<PrayerCard prayerName="dhuhr" prayerTime="12:00" />);
		expect(state.navigate).toHaveBeenCalledWith({
			to: "/no-phone/$countdown",
			params: { countdown: "7" },
		});
	});

	it("counts down to fixed Jumuah iqama without inventing an adhan", () => {
		vi.setSystemTime(new Date(2026, 10, 6, 12, 4, 58));
		state.nextPrayerName = "jumah";
		render(<PrayerCard prayerName="jumah" />);
		expect(screen.queryByText("--:--")).toBeNull();
		expect(screen.getByText("12:05")).toBeTruthy();
		expect(screen.getByText("Jumuah 1 / الجمعة 1")).toBeTruthy();
		expect(screen.getByText("Bis Iqama")).toBeTruthy();
		act(() => vi.advanceTimersByTime(2000));
		expect(state.navigate).toHaveBeenCalledWith({
			to: "/no-phone/$countdown",
			params: { countdown: "15" },
		});
	});

	it("numbers Jumuah services chronologically instead of labelling them iqama", () => {
		state.iqamas = [
			{
				prayer: "jumuah",
				weekday: "friday",
				type: "fixed",
				fixed_time: "13:00:00",
			},
			{
				prayer: "jumuah",
				weekday: "friday",
				type: "fixed",
				fixed_time: "12:30:00",
			},
		];
		const { container } = render(<PrayerCard prayerName="jumah" />);
		const rows = container.querySelectorAll(".prayer-time");
		expect(rows).toHaveLength(2);
		expect(rows[0].textContent).toBe("Jumuah 1 / الجمعة 112:30");
		expect(rows[1].textContent).toBe("Jumuah 2 / الجمعة 213:00");
	});

	it("keeps the current prayer highlighted without pulsing", () => {
		vi.setSystemTime(new Date(2026, 10, 5, 12, 4, 58));
		const { container } = render(
			<PrayerCard prayerName="dhuhr" prayerTime="12:05" />,
		);
		expect(container.querySelector(".prayer-card--active")).toBeTruthy();
		expect(container.querySelector(".animate-pulse")).toBeNull();
		act(() => vi.advanceTimersByTime(1000));
		expect(container.querySelector(".prayer-card--active")).toBeTruthy();
		expect(container.querySelector(".animate-pulse")).toBeNull();
	});
});
