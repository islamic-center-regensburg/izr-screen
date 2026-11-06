// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ScreenConfig } from "@/api/screen-config";
import AutomaticDashboard from "./automatic-dashboard";

const state = vi.hoisted(() => ({
	config: undefined as ScreenConfig | undefined,
	isManual: false,
	now: 0,
	lastDashboardAt: 0,
	openDashboard: vi.fn(),
	nextPrayerName: "asr",
	nextPrayerTime: "15:00",
}));

vi.mock("@/contexts/screen-config-context", () => ({
	useScreenConfig: () => state,
}));

vi.mock("@/contexts", () => ({
	useNextPrayer: () => state,
}));

vi.mock("@/utils/time-utils", () => ({
	nowTime: () => new Date(),
}));

const config: ScreenConfig = {
	id: "screen",
	mode: "automatic",
	manual_view: "prayer_times",
	dashboard_url: "https://iz-regensburg.de/dashboard",
	dashboard_enabled: true,
	dashboard_interval_minutes: 15,
	dashboard_duration_seconds: 90,
	manual_expires_at: null,
	date_updated: null,
};

const prayerTimes = {
	fajr: "06:00",
	dhuhr: "12:00",
	asr: "15:00",
	maghrib: "17:00",
	isha: "19:00",
};

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date(2026, 10, 6, 14));
	state.config = config;
	state.isManual = false;
	state.now = Date.now();
	state.lastDashboardAt = state.now - 15 * 60_000;
	state.nextPrayerName = "asr";
	state.nextPrayerTime = "15:00";
	state.openDashboard.mockReset();
});

afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

describe("automatic dashboard scheduling", () => {
	it("opens a dashboard at the exact configured interval", () => {
		render(<AutomaticDashboard prayerTimes={prayerTimes} />);
		expect(state.openDashboard).toHaveBeenCalledOnce();
	});

	it("does not open even one millisecond before the configured interval", () => {
		state.now -= 1;
		render(<AutomaticDashboard prayerTimes={prayerTimes} />);
		expect(state.openDashboard).not.toHaveBeenCalled();
	});

	it("does not schedule dashboard visits during manual mode", () => {
		state.isManual = true;
		render(<AutomaticDashboard prayerTimes={prayerTimes} />);
		expect(state.openDashboard).not.toHaveBeenCalled();
	});

	it("does not visit if the dashboard is disabled", () => {
		state.config = { ...config, dashboard_enabled: false };
		render(<AutomaticDashboard prayerTimes={prayerTimes} />);
		expect(state.openDashboard).not.toHaveBeenCalled();
	});

	it("does not visit without valid config or prayer times", () => {
		state.config = undefined;
		const { rerender } = render(
			<AutomaticDashboard prayerTimes={prayerTimes} />,
		);
		expect(state.openDashboard).not.toHaveBeenCalled();
		state.config = config;
		rerender(<AutomaticDashboard prayerTimes={null} />);
		expect(state.openDashboard).not.toHaveBeenCalled();
	});

	it("defers a due visit until after the Adhan-to-Iqama window", () => {
		vi.setSystemTime(new Date(2026, 10, 6, 15, 5));
		state.nextPrayerTime = "15:15";
		const { rerender } = render(
			<AutomaticDashboard prayerTimes={prayerTimes} />,
		);
		expect(state.openDashboard).not.toHaveBeenCalled();
		vi.setSystemTime(new Date(2026, 10, 6, 15, 25));
		state.nextPrayerName = "maghrib";
		state.nextPrayerTime = "17:00";
		state.now = Date.now();
		rerender(<AutomaticDashboard prayerTimes={prayerTimes} />);
		expect(state.openDashboard).toHaveBeenCalledOnce();
	});
});
